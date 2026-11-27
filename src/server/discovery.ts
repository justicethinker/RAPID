import { one, query } from './db';
import { ApiError, readJson } from './http';
import { optionalPerson } from './auth';
import { mediaUrl } from './media';
import { notify } from './notify';
import { clientIp, enforceRateLimit, hashKey } from './rate-limit';
import { STARTUP_CATEGORIES } from '../lib/startup-options';

interface FeedRow {
  id: string;
  title: string;
  body: string;
  kind: string;
  published_at: Date;
  created_at: Date;
  images: { id: string; altText: string | null }[] | null;
  startup_id: string;
  startup_name: string;
  startup_slug: string;
  startup_description: string;
  startup_category: string;
  startup_stage: string | null;
  startup_website_url: string | null;
  logo_media_id: string | null;
  cover_media_id: string | null;
  feedback_count: number;
  follower_count: number;
  following: boolean;
  is_owner: boolean;
}

interface FeedbackRow {
  id: string;
  body: string;
  status: 'visible' | 'hidden';
  created_at: Date;
  post_id: string;
  post_title: string;
  author_name: string;
}

interface ReportRow {
  id: string;
  target_type: 'post' | 'feedback' | 'startup';
  target_id: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: Date;
  resolved_at: Date | null;
  reporter_id: string;
  reporter_name: string;
  post_title: string | null;
  post_body: string | null;
  feedback_body: string | null;
  feedback_author: string | null;
  startup_name: string | null;
  startup_description: string | null;
}

interface ModerationPostRow {
  id: string;
  title: string;
  status: string;
  moderated_at: Date;
  moderated_by_name: string | null;
  startup_name: string;
}

interface ModerationStartupRow {
  id: string;
  name: string;
  slug: string;
  moderated_at: Date;
  moderated_by_name: string | null;
}

const imagesSelect = `(select coalesce(
  json_agg(
    json_build_object('id', m.id, 'altText', m.alt_text)
    order by m.created_at, m.id
  ),
  '[]'::json
)
from media_assets m
where m.post_id = p.id and m.purpose = 'post_image') as images`;

const logoSelect = `(select m.id from media_assets m
  where m.startup_id = s.id and m.purpose = 'logo' limit 1) as logo_media_id`;

const coverSelect = `(select m.id from media_assets m
  where m.startup_id = s.id and m.purpose = 'cover' limit 1) as cover_media_id`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function iso(value: Date | string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function asFeedItem(row: FeedRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    publishedAt: iso(row.published_at)!,
    createdAt: iso(row.created_at)!,
    images: (row.images ?? []).map((image) => ({
      id: image.id,
      url: mediaUrl(image.id),
      altText: image.altText ?? null,
    })),
    feedbackCount: Number(row.feedback_count ?? 0),
    following: Boolean(row.following),
    isOwner: Boolean(row.is_owner),
    startup: {
      id: row.startup_id,
      name: row.startup_name,
      slug: row.startup_slug,
      description: row.startup_description,
      category: row.startup_category,
      stage: row.startup_stage,
      websiteUrl: row.startup_website_url,
      logoUrl: row.logo_media_id ? mediaUrl(row.logo_media_id) : null,
      coverUrl: row.cover_media_id ? mediaUrl(row.cover_media_id) : null,
      followers: Number(row.follower_count ?? 0),
    },
  };
}

function decodeCursor(raw: string | null): { publishedAt: string; id: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf8'),
    ) as { publishedAt?: unknown; id?: unknown };
    if (
      typeof parsed.publishedAt !== 'string' ||
      typeof parsed.id !== 'string' ||
      !UUID_RE.test(parsed.id) ||
      Number.isNaN(new Date(parsed.publishedAt).getTime())
    ) {
      throw new Error('invalid cursor');
    }
    return { publishedAt: parsed.publishedAt, id: parsed.id };
  } catch {
    throw new ApiError(400, 'bad_request', {
      cursor: 'That page link is no longer valid. Start from the first page.',
    });
  }
}

function encodeCursor(row: FeedRow): string {
  return Buffer.from(
    JSON.stringify({ publishedAt: iso(row.published_at), id: row.id }),
  ).toString('base64url');
}

/**
 * The discovery feed reads published posts joined to published startups. A
 * moderated post is excluded before any filter runs, so it cannot reappear by
 * changing the search or category.
 */
export async function discoveryFeed(
  params: URLSearchParams,
  viewerId: string | null,
) {
  const q = text(params.get('q'), 80);
  const rawCategory = text(params.get('category'), 30);
  const rawType = text(params.get('type'), 20);
  const rawLimit = Number(params.get('limit') ?? '12');
  const limit = Number.isFinite(rawLimit)
    ? Math.min(30, Math.max(1, Math.trunc(rawLimit)))
    : 12;

  if (
    rawCategory &&
    !STARTUP_CATEGORIES.some((category) => category.value === rawCategory)
  ) {
    throw new ApiError(400, 'bad_request', { category: 'Choose a valid category.' });
  }
  if (rawType && rawType !== 'showcase' && rawType !== 'validation') {
    throw new ApiError(400, 'bad_request', { type: 'Choose a valid post type.' });
  }

  const cursor = decodeCursor(params.get('cursor'));
  const values: unknown[] = [viewerId];
  const conditions = [
    `p.status = 'published'`,
    `p.published_at is not null`,
    `p.moderated_at is null`,
    `s.visibility = 'published'`,
  ];

  if (q) {
    values.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
    const index = values.length;
    conditions.push(
      `(p.title ilike $${index} or p.body ilike $${index} or s.name ilike $${index} or s.description ilike $${index})`,
    );
  }
  if (rawCategory) {
    values.push(rawCategory);
    conditions.push(`s.category = $${values.length}`);
  }
  if (rawType) {
    values.push(rawType);
    conditions.push(`p.kind = $${values.length}`);
  }
  if (cursor) {
    values.push(cursor.publishedAt);
    const publishedIndex = values.length;
    values.push(cursor.id);
    conditions.push(
      `(p.published_at, p.id) < ($${publishedIndex}::timestamptz, $${values.length}::uuid)`,
    );
  }

  values.push(limit + 1);
  const limitIndex = values.length;

  const rows = await query<FeedRow>(
    `select p.id, p.title, p.body, p.kind, p.published_at, p.created_at,
            ${imagesSelect},
            s.id as startup_id, s.name as startup_name, s.slug as startup_slug,
            s.description as startup_description, s.category as startup_category,
            s.stage as startup_stage, s.website_url as startup_website_url,
            ${logoSelect}, ${coverSelect},
            (select count(*)::int from post_feedback f
              where f.post_id = p.id and f.status = 'visible') as feedback_count,
            (select count(*)::int from startup_follows f
              where f.startup_id = s.id) as follower_count,
            (case when $1::uuid is null then false else exists(
              select 1 from startup_follows f
               where f.startup_id = s.id and f.person_id = $1::uuid
            ) end) as following,
            (s.founder_id = $1::uuid) as is_owner
       from posts p
       join startups s on s.id = p.startup_id
      where ${conditions.join(' and ')}
      order by p.published_at desc, p.id desc
      limit $${limitIndex}`,
    values,
  );

  const page = rows.slice(0, limit);
  return {
    items: page.map(asFeedItem),
    nextCursor:
      rows.length > limit && page.length > 0
        ? encodeCursor(page[page.length - 1]!)
        : null,
  };
}

export async function setStartupFollow(
  personId: string,
  startupId: string,
  follow: boolean,
) {
  if (!UUID_RE.test(startupId)) throw new ApiError(404, 'not_found');

  const startup = await one<{ id: string; founder_id: string; name: string }>(
    `select id, founder_id, name from startups
      where id = $1 and visibility = 'published'`,
    [startupId],
  );
  if (!startup) throw new ApiError(404, 'not_found');
  if (startup.founder_id === personId) {
    throw new ApiError(409, 'conflict', {
      follow: 'You cannot follow your own startup.',
    });
  }

  await enforceRateLimit(`follow:person:${personId}`, 60, 60);
  if (follow) {
    const inserted = await query<{ person_id: string }>(
      `insert into startup_follows (person_id, startup_id)
       values ($1, $2)
       on conflict (person_id, startup_id) do nothing
       returning person_id`,
      [personId, startupId],
    );
    // A repeat follow is not a new event, so it must not notify twice.
    if (inserted[0]) {
      await notify(
        startup.founder_id,
        'new_follower',
        'New follower',
        `Someone started following ${startup.name}.`,
        '/app/founder/audience',
      );
    }
  } else {
    await query(
      'delete from startup_follows where person_id = $1 and startup_id = $2',
      [personId, startupId],
    );
  }

  const count = await one<{ count: number }>(
    'select count(*)::int as count from startup_follows where startup_id = $1',
    [startupId],
  );
  return { following: follow, followers: Number(count?.count ?? 0) };
}

export async function submitFeedback(
  personId: string,
  postId: string,
  request: Request,
) {
  if (!UUID_RE.test(postId)) throw new ApiError(404, 'not_found');

  const post = await one<{
    id: string;
    title: string;
    founder_id: string;
    startup_name: string;
    visibility: string;
    status: string;
    moderated_at: Date | null;
  }>(
    `select p.id, p.title, s.founder_id, s.name as startup_name,
            s.visibility, p.status, p.moderated_at
       from posts p
       join startups s on s.id = p.startup_id
      where p.id = $1`,
    [postId],
  );
  if (
    !post ||
    post.status !== 'published' ||
    post.moderated_at ||
    post.visibility !== 'published'
  ) {
    throw new ApiError(404, 'not_found');
  }
  if (post.founder_id === personId) {
    throw new ApiError(409, 'conflict', {
      body: 'You cannot leave feedback on your own post.',
    });
  }

  const body = await readJson<{ body?: unknown }>(request);
  const message = text(body.body, 1000);
  if (message.length < 10) {
    throw new ApiError(400, 'validation', {
      body: 'Write at least 10 characters so the founder can use your feedback.',
    });
  }

  const ip = clientIp(request);
  await enforceRateLimit(`feedback:person:${personId}`, 10, 600);
  if (ip) await enforceRateLimit(`feedback:ip:${hashKey(ip)}`, 20, 600);

  const rows = await query<{
    id: string;
    body: string;
    status: 'visible';
    created_at: Date;
  }>(
    `insert into post_feedback (post_id, author_id, body)
     values ($1, $2, $3)
     returning id, body, status, created_at`,
    [postId, personId, message],
  );
  const feedback = rows[0];
  if (!feedback) throw new ApiError(500, 'server');

  await notify(
    post.founder_id,
    'new_feedback',
    'New feedback',
    `Someone left feedback on "${post.title}".`,
    '/app/founder/audience',
  );

  return {
    feedback: {
      id: feedback.id,
      body: feedback.body,
      status: feedback.status,
      createdAt: iso(feedback.created_at)!,
    },
  };
}

export async function reportContent(
  personId: string,
  request: Request,
) {
  const body = await readJson<{
    targetType?: unknown;
    targetId?: unknown;
    reason?: unknown;
  }>(request);
  const targetType = text(body.targetType, 20);
  const targetId = text(body.targetId, 40);
  const reason = text(body.reason, 500);

  if (
    targetType !== 'post' &&
    targetType !== 'feedback' &&
    targetType !== 'startup'
  ) {
    throw new ApiError(400, 'bad_request');
  }
  if (!UUID_RE.test(targetId)) throw new ApiError(404, 'not_found');
  if (reason.length < 10) {
    throw new ApiError(400, 'validation', {
      reason: 'Tell us what is wrong in at least 10 characters.',
    });
  }

  if (targetType === 'post') {
    const post = await one<{ founder_id: string }>(
      `select s.founder_id
         from posts p join startups s on s.id = p.startup_id
        where p.id = $1
          and p.status = 'published'
          and p.moderated_at is null
          and s.visibility = 'published'`,
      [targetId],
    );
    if (!post) throw new ApiError(404, 'not_found');
    if (post.founder_id === personId) {
      throw new ApiError(409, 'conflict', { report: 'You cannot report your own post.' });
    }
  } else if (targetType === 'feedback') {
    const feedback = await one<{ author_id: string }>(
      `select f.author_id
         from post_feedback f
         join posts p on p.id = f.post_id
         join startups s on s.id = p.startup_id
        where f.id = $1
          and f.status = 'visible'
          and p.status = 'published'
          and p.moderated_at is null
          and s.visibility = 'published'`,
      [targetId],
    );
    if (!feedback) throw new ApiError(404, 'not_found');
    if (feedback.author_id === personId) {
      throw new ApiError(409, 'conflict', { report: 'You cannot report your own feedback.' });
    }
  } else {
    const startup = await one<{ founder_id: string }>(
      `select founder_id from startups
        where id = $1 and visibility = 'published'`,
      [targetId],
    );
    if (!startup) throw new ApiError(404, 'not_found');
    if (startup.founder_id === personId) {
      throw new ApiError(409, 'conflict', {
        report: 'You cannot report your own startup.',
      });
    }
  }

  await enforceRateLimit(`report:person:${personId}`, 10, 3600);
  await query(
    `insert into content_reports (reporter_id, target_type, target_id, reason)
     values ($1, $2, $3, $4)
     on conflict (reporter_id, target_type, target_id) do update
       set reason = excluded.reason`,
    [personId, targetType, targetId, reason],
  );

  return { reported: true };
}

export async function trackDemoClick(startupId: string, request: Request) {
  if (!UUID_RE.test(startupId)) throw new ApiError(404, 'not_found');

  const startup = await one<{ id: string }>(
    `select id from startups
      where id = $1 and visibility = 'published' and website_url is not null`,
    [startupId],
  );
  if (!startup) throw new ApiError(404, 'not_found');

  const body = await readJson<{ source?: unknown }>(request);
  const source = text(body.source, 80) || 'startup_page';
  const person = await optionalPerson(request);
  const ip = clientIp(request);
  if (ip) await enforceRateLimit(`demo-click:ip:${hashKey(ip)}`, 120, 60);

  await query(
    `insert into startup_demo_clicks (startup_id, person_id, source)
     values ($1, $2, $3)`,
    [startup.id, person?.id ?? null, source],
  );
  return { ok: true };
}

/**
 * Participation is gated here, not only in the UI. The post is public, but the
 * linked test only opens for an invited tester while the test is accepting
 * participation and the post's optional closing date has not passed.
 */
export async function openLinkedTest(personId: string, postId: string) {
  if (!UUID_RE.test(postId)) throw new ApiError(404, 'not_found');

  const post = await one<{
    id: string;
    founder_id: string;
    visibility: string;
    status: string;
    moderated_at: Date | null;
    test_id: string | null;
    test_status: string | null;
    closes_at: Date | null;
  }>(
    `select p.id, s.founder_id, s.visibility, p.status, p.moderated_at,
            p.test_id, t.status as test_status, p.closes_at
       from posts p
       join startups s on s.id = p.startup_id
       left join tests t
         on t.id = p.test_id and t.founder_id = s.founder_id
      where p.id = $1`,
    [postId],
  );

  if (
    !post ||
    post.status !== 'published' ||
    post.moderated_at ||
    post.visibility !== 'published' ||
    !post.test_id
  ) {
    throw new ApiError(404, 'not_found');
  }

  if (post.founder_id === personId) {
    throw new ApiError(403, 'forbidden', {
      test: 'You cannot take part in your own test.',
    });
  }

  if (post.test_status !== 'recruiting' && post.test_status !== 'fielding') {
    throw new ApiError(409, 'conflict', {
      test: 'This test is not accepting participation right now.',
    });
  }

  if (post.closes_at && new Date(post.closes_at).getTime() <= Date.now()) {
    throw new ApiError(409, 'conflict', { test: 'This test has closed.' });
  }

  const invitation = await one<{ id: string; status: string }>(
    `select id, status from invitations
      where test_id = $1 and tester_id = $2
        and status in ('invited', 'accepted')`,
    [post.test_id, personId],
  );

  if (!invitation) {
    const tester = await one(
      'select person_id from tester_profiles where person_id = $1',
      [personId],
    );
    throw new ApiError(403, 'forbidden', {
      test: tester
        ? 'This test is invitation-only, and there is no open invitation on your account.'
        : 'Only approved RAPID testers can take part. Join the tester pool first.',
    });
  }

  const test = await one<{
    id: string;
    title: string;
    question: string;
    terms: string;
    method: string | null;
    reward_note: string | null;
  }>(
    `select id, title, question, terms, method, reward_note
       from tests where id = $1`,
    [post.test_id],
  );
  if (!test) throw new ApiError(404, 'not_found');

  return {
    invitationId: invitation.id,
    invitationStatus: invitation.status,
    test: {
      id: test.id,
      title: test.title,
      question: test.question,
      terms: test.terms,
      method: test.method,
      rewardNote: test.reward_note,
      status: post.test_status,
      closesAt: iso(post.closes_at),
    },
  };
}

export async function staffModeration() {
  const [reports, feedback, moderatedPosts, moderatedStartups] =
    await Promise.all([
    query<ReportRow>(
      `select r.id, r.target_type, r.target_id, r.reason, r.status,
              r.created_at, r.resolved_at, r.reporter_id,
              coalesce(nullif(reporter.full_name, ''), 'RAPID member') as reporter_name,
              p.title as post_title, p.body as post_body,
              f.body as feedback_body,
              coalesce(nullif(fa.full_name, ''), 'RAPID member') as feedback_author,
              st.name as startup_name, st.description as startup_description
         from content_reports r
         join people reporter on reporter.id = r.reporter_id
         left join posts p on r.target_type = 'post' and p.id = r.target_id
         left join post_feedback f on r.target_type = 'feedback' and f.id = r.target_id
         left join people fa on fa.id = f.author_id
         left join startups st on r.target_type = 'startup' and st.id = r.target_id
        where r.status = 'open'
        order by r.created_at asc
        limit 100`,
    ),
    query<FeedbackRow>(
      `select f.id, f.body, f.status, f.created_at, p.id as post_id,
              p.title as post_title,
              coalesce(nullif(author.full_name, ''), 'RAPID member') as author_name
         from post_feedback f
         join posts p on p.id = f.post_id
         join people author on author.id = f.author_id
        order by f.created_at desc
        limit 100`,
    ),
    query<ModerationPostRow>(
      `select p.id, p.title, p.status, p.moderated_at,
              coalesce(nullif(moderator.full_name, ''), 'Staff') as moderated_by_name,
              s.name as startup_name
         from posts p
         join startups s on s.id = p.startup_id
         left join people moderator on moderator.id = p.moderated_by
        where p.moderated_at is not null
        order by p.moderated_at desc
        limit 50`,
    ),
    query<ModerationStartupRow>(
      `select s.id, s.name, s.slug, r.resolved_at as moderated_at,
              coalesce(nullif(moderator.full_name, ''), 'Staff') as moderated_by_name
         from startups s
         join lateral (
           select resolved_at, resolved_by
             from content_reports
            where target_type = 'startup'
              and target_id = s.id
              and status = 'resolved'
            order by resolved_at desc nulls last
            limit 1
         ) r on true
         left join people moderator on moderator.id = r.resolved_by
        where s.visibility = 'draft'
        order by r.resolved_at desc
        limit 50`,
    ),
  ]);

  return {
    reports: reports.map((report) => ({
      id: report.id,
      targetType: report.target_type,
      targetId: report.target_id,
      reason: report.reason,
      status: report.status,
      createdAt: iso(report.created_at)!,
      reporterName: report.reporter_name,
      target: {
        title:
          report.target_type === 'post'
            ? report.post_title
            : report.target_type === 'feedback'
              ? report.feedback_body
              : report.startup_name,
        detail:
          report.target_type === 'post'
            ? report.post_body
            : report.target_type === 'feedback'
              ? report.feedback_author
                ? `Feedback from ${report.feedback_author}`
                : null
              : report.startup_description,
      },
    })),
    feedback: feedback.map((item) => ({
      id: item.id,
      body: item.body,
      status: item.status,
      createdAt: iso(item.created_at)!,
      post: { id: item.post_id, title: item.post_title },
      authorName: item.author_name,
    })),
    moderatedPosts: moderatedPosts.map((post) => ({
      id: post.id,
      title: post.title,
      status: post.status,
      moderatedAt: iso(post.moderated_at)!,
      moderatedByName: post.moderated_by_name,
      startupName: post.startup_name,
    })),
    moderatedStartups: moderatedStartups.map((startup) => ({
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      moderatedAt: iso(startup.moderated_at)!,
      moderatedByName: startup.moderated_by_name,
    })),
  };
}

export async function decideReport(
  staffId: string,
  reportId: string,
  request: Request,
) {
  if (!UUID_RE.test(reportId)) throw new ApiError(404, 'not_found');
  const body = await readJson<{ action?: unknown; note?: unknown }>(request);
  const action = text(body.action, 20);
  if (action !== 'hide' && action !== 'dismiss') {
    throw new ApiError(400, 'bad_request');
  }

  const report = await one<{
    id: string;
    target_type: 'post' | 'feedback' | 'startup';
    target_id: string;
    status: string;
  }>(
    `select id, target_type, target_id, status
       from content_reports where id = $1`,
    [reportId],
  );
  if (!report) throw new ApiError(404, 'not_found');
  if (report.status !== 'open') {
    throw new ApiError(409, 'conflict', {
      report: 'This report has already been reviewed.',
    });
  }

  const note = text(body.note, 500) || null;
  if (action === 'hide') {
    if (report.target_type === 'post') {
      const target = await one<{ title: string; founder_id: string }>(
        `select p.title, s.founder_id
           from posts p join startups s on s.id = p.startup_id
          where p.id = $1`,
        [report.target_id],
      );
      await query(
        `update posts
            set moderated_at = now(), moderated_by = $2
          where id = $1 and moderated_at is null`,
        [report.target_id, staffId],
      );
      if (target) {
        await notify(
          target.founder_id,
          'moderation',
          'Post hidden',
          `"${target.title}" was hidden after a content review.`,
          '/app/founder/posts',
        );
      }
    } else if (report.target_type === 'feedback') {
      const target = await one<{ title: string; founder_id: string }>(
        `select p.title, s.founder_id
           from post_feedback f
           join posts p on p.id = f.post_id
           join startups s on s.id = p.startup_id
          where f.id = $1`,
        [report.target_id],
      );
      await query(
        `update post_feedback
            set status = 'hidden', hidden_at = now(), hidden_by = $2
          where id = $1`,
        [report.target_id, staffId],
      );
      if (target) {
        await notify(
          target.founder_id,
          'moderation',
          'Feedback hidden',
          `Feedback on "${target.title}" was hidden after a content review.`,
          '/app/founder/audience',
        );
      }
    } else {
      const target = await one<{ name: string; founder_id: string }>(
        'select name, founder_id from startups where id = $1',
        [report.target_id],
      );
      await query(
        "update startups set visibility = 'draft' where id = $1",
        [report.target_id],
      );
      if (target) {
        await notify(
          target.founder_id,
          'moderation',
          'Startup hidden',
          `${target.name} was hidden from public view after a content review.`,
          '/app/founder/startup',
        );
      }
    }
  }

  await query(
    `update content_reports
        set status = $1,
            resolved_at = now(),
            resolved_by = $2,
            resolution_note = $3
      where target_type = $4
        and target_id = $5
        and status = 'open'`,
    [
      action === 'hide' ? 'resolved' : 'dismissed',
      staffId,
      note,
      report.target_type,
      report.target_id,
    ],
  );

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, $2, $3, $4, $5)`,
    [
      staffId,
      action === 'hide' ? 'moderation.hide' : 'moderation.dismiss',
      report.target_type,
      report.target_id,
      JSON.stringify({ reportId: report.id, note }),
    ],
  );

  return { ok: true };
}

export async function setFeedbackModeration(
  staffId: string,
  feedbackId: string,
  request: Request,
) {
  if (!UUID_RE.test(feedbackId)) throw new ApiError(404, 'not_found');
  const body = await readJson<{ action?: unknown }>(request);
  const action = text(body.action, 20);
  if (action !== 'hide' && action !== 'restore') {
    throw new ApiError(400, 'bad_request');
  }

  const target = await one<{ title: string; founder_id: string }>(
    `select p.title, s.founder_id
       from post_feedback f
       join posts p on p.id = f.post_id
       join startups s on s.id = p.startup_id
      where f.id = $1`,
    [feedbackId],
  );

  const rows = await query<{ id: string }>(
    `update post_feedback
        set status = $2::text,
            hidden_at = case when $2::text = 'hidden' then now() else null end,
            hidden_by = case when $2::text = 'hidden' then $3::uuid else null end
      where id = $1
      returning id`,
    [feedbackId, action === 'hide' ? 'hidden' : 'visible', staffId],
  );
  if (!rows[0]) throw new ApiError(404, 'not_found');

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id)
     values ($1, $2, 'feedback', $3)`,
    [staffId, `moderation.feedback.${action}`, feedbackId],
  );

  if (action === 'hide' && target) {
    await notify(
      target.founder_id,
      'moderation',
      'Feedback hidden',
      `Feedback on "${target.title}" was hidden after a content review.`,
      '/app/founder/audience',
    );
  }
  return { ok: true };
}

export async function setPostModeration(
  staffId: string,
  postId: string,
  request: Request,
) {
  if (!UUID_RE.test(postId)) throw new ApiError(404, 'not_found');
  const body = await readJson<{ action?: unknown }>(request);
  const action = text(body.action, 20);
  if (action !== 'hide' && action !== 'restore') {
    throw new ApiError(400, 'bad_request');
  }

  const target = await one<{ title: string; founder_id: string }>(
    `select p.title, s.founder_id
       from posts p join startups s on s.id = p.startup_id
      where p.id = $1`,
    [postId],
  );

  const rows = await query<{ id: string }>(
    `update posts
        set moderated_at = case when $2::text = 'hide' then now() else null end,
            moderated_by = case when $2::text = 'hide' then $3::uuid else null end
      where id = $1
      returning id`,
    [postId, action, staffId],
  );
  if (!rows[0]) throw new ApiError(404, 'not_found');

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id)
     values ($1, $2, 'post', $3)`,
    [staffId, `moderation.post.${action}`, postId],
  );

  if (action === 'hide' && target) {
    await notify(
      target.founder_id,
      'moderation',
      'Post hidden',
      `"${target.title}" was hidden after a content review.`,
      '/app/founder/posts',
    );
  }
  return { ok: true };
}

export async function setStartupModeration(
  staffId: string,
  startupId: string,
  request: Request,
) {
  if (!UUID_RE.test(startupId)) throw new ApiError(404, 'not_found');
  const body = await readJson<{ action?: unknown }>(request);
  const action = text(body.action, 20);
  if (action !== 'hide' && action !== 'restore') {
    throw new ApiError(400, 'bad_request');
  }

  const target = await one<{ name: string; founder_id: string }>(
    'select name, founder_id from startups where id = $1',
    [startupId],
  );
  if (!target) throw new ApiError(404, 'not_found');

  // Restoring must not publish a startup the founder never made public. Only
  // profiles hidden by a resolved moderation report can be restored here.
  if (action === 'restore') {
    const moderated = await one(
      `select 1 from content_reports
        where target_type = 'startup' and target_id = $1 and status = 'resolved'
        limit 1`,
      [startupId],
    );
    if (!moderated) {
      throw new ApiError(409, 'conflict', {
        moderation: 'This startup was not hidden by moderation.',
      });
    }
  }

  await query('update startups set visibility = $2 where id = $1', [
    startupId,
    action === 'hide' ? 'draft' : 'published',
  ]);
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id)
     values ($1, $2, 'startup', $3)`,
    [staffId, `moderation.startup.${action}`, startupId],
  );

  await notify(
    target.founder_id,
    'moderation',
    action === 'hide' ? 'Startup hidden' : 'Startup restored',
    action === 'hide'
      ? `${target.name} was hidden from public view after a content review.`
      : `${target.name} is public again after a content review.`,
    '/app/founder/startup',
  );

  return { ok: true };
}
