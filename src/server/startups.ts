import { randomUUID } from 'node:crypto';
import { one, query } from './db';
import { ApiError, readJson } from './http';
import { optionalPerson } from './auth';
import { mediaUrl } from './media';
import { notify } from './notify';
import { clientIp, enforceRateLimit, hashKey } from './rate-limit';
import {
  STARTUP_CATEGORIES,
  STARTUP_STAGES,
  type StartupCategory,
  type StartupStage,
  type StartupVisibility,
} from '../lib/startup-options';

interface StartupRow {
  id: string;
  founder_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  stage: string | null;
  website_url: string | null;
  visibility: StartupVisibility;
  created_at: Date;
  updated_at: Date;
  post_count?: number;
  published_post_count?: number;
  waitlist_count?: number;
  logo_media_id?: string | null;
  cover_media_id?: string | null;
  follower_count?: number;
  following?: boolean;
  is_owner?: boolean;
}

interface PostRow {
  id: string;
  title: string;
  body: string;
  kind: string;
  status: 'draft' | 'published' | 'archived';
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  moderated_at?: Date | null;
  test_id?: string | null;
  eligibility?: string | null;
  closes_at?: Date | null;
  test_title?: string | null;
  test_status?: string | null;
  images?: { id: string; altText: string | null }[] | null;
}

const postImagesSelect = `(select coalesce(
  json_agg(
    json_build_object('id', m.id, 'altText', m.alt_text)
    order by m.created_at, m.id
  ),
  '[]'::json
)
from media_assets m
where m.post_id = p.id and m.purpose = 'post_image') as images`;

const postLinkSelect = `p.test_id, p.eligibility, p.closes_at,
  (select t.title from tests t where t.id = p.test_id) as test_title,
  (select t.status from tests t where t.id = p.test_id) as test_status`;

const POST_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface WaitlistRow {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: Date;
}

interface AudienceFeedbackRow {
  id: string;
  body: string;
  status: 'visible' | 'hidden';
  created_at: Date;
  post_id: string;
  post_title: string;
  author_name: string;
}

interface AudiencePostRow {
  id: string;
  title: string;
  published_at: Date | null;
  feedback_count: number;
  impressions: number;
  opens: number;
}

interface AnalyticsSummaryRow {
  profile_views: number;
  post_impressions: number;
  post_opens: number;
  unique_visitors: number;
}

interface AnalyticsSourceRow {
  source: string;
  count: number;
}

interface AnalyticsDayRow {
  date: string;
  profile_views: number;
  post_impressions: number;
  post_opens: number;
}

interface StartupInput {
  name: string;
  description: string;
  category: StartupCategory;
  stage: StartupStage | null;
  websiteUrl: string | null;
  visibility: StartupVisibility;
}

interface PostInput {
  title: string;
  body: string;
  kind: 'showcase' | 'validation';
  testId: string | null;
  eligibility: string | null;
  closesAt: Date | null;
}

function asIso(value: Date | string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

function asStartup(row: StartupRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    stage: row.stage,
    websiteUrl: row.website_url,
    visibility: row.visibility,
    createdAt: asIso(row.created_at)!,
    updatedAt: asIso(row.updated_at)!,
    logoUrl: row.logo_media_id ? mediaUrl(row.logo_media_id) : null,
    coverUrl: row.cover_media_id ? mediaUrl(row.cover_media_id) : null,
    counts: {
      posts: Number(row.post_count ?? 0),
      publishedPosts: Number(row.published_post_count ?? 0),
      waitlist: Number(row.waitlist_count ?? 0),
    },
  };
}

function asPost(row: PostRow) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    status: row.status,
    publishedAt: asIso(row.published_at),
    createdAt: asIso(row.created_at)!,
    updatedAt: asIso(row.updated_at)!,
    moderatedAt: asIso(row.moderated_at ?? null),
    testId: row.test_id ?? null,
    eligibility: row.eligibility ?? null,
    closesAt: asIso(row.closes_at ?? null),
    linkedTest: row.test_id
      ? {
          id: row.test_id,
          title: row.test_title ?? null,
          status: row.test_status ?? null,
        }
      : null,
    images: (row.images ?? []).map((image) => ({
      id: image.id,
      url: mediaUrl(image.id),
      altText: image.altText ?? null,
    })),
  };
}

function asWaitlistEntry(row: WaitlistRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    source: row.source,
    createdAt: asIso(row.created_at)!,
  };
}

function validationError(fields: Record<string, string>): never {
  throw new ApiError(400, 'validation', fields);
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function safeWebsiteUrl(value: unknown): string | null {
  const raw = text(value, 300);
  if (!raw) return null;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
    if (!url.hostname || url.hostname.includes(' ')) throw new Error('invalid host');
    return url.toString();
  } catch {
    validationError({ websiteUrl: 'Enter a full website address, like https://example.com.' });
  }
}

async function readStartupInput(request: Request): Promise<StartupInput> {
  const body = await readJson<Record<string, unknown>>(request);
  const name = text(body.name, 80);
  const description = text(body.description, 500);
  const category = text(body.category, 30);
  const stage = text(body.stage, 30);
  const fields: Record<string, string> = {};

  if (name.length < 2) fields.name = 'Enter your startup name (at least 2 characters).';
  if (description.length < 20) {
    fields.description = 'Write a short description of at least 20 characters.';
  }
  if (!STARTUP_CATEGORIES.some((item) => item.value === category)) {
    fields.category = 'Choose a category.';
  }
  if (stage && !STARTUP_STAGES.some((item) => item.value === stage)) {
    fields.stage = 'Choose a valid stage.';
  }

  let websiteUrl: string | null = null;
  try {
    websiteUrl = safeWebsiteUrl(body.websiteUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      Object.assign(fields, error.fields);
    } else {
      throw error;
    }
  }

  if (Object.keys(fields).length) validationError(fields);

  return {
    name,
    description,
    category: category as StartupCategory,
    stage: (stage || null) as StartupStage | null,
    websiteUrl,
    visibility: body.publish === true || body.visibility === 'published'
      ? 'published'
      : 'draft',
  };
}

async function readPostInput(
  request: Request,
  personId: string,
): Promise<PostInput> {
  const body = await readJson<Record<string, unknown>>(request);
  const title = text(body.title, 120);
  const bodyText = typeof body.body === 'string' ? body.body.trim().slice(0, 4000) : '';
  const rawKind = text(body.kind, 20);
  const fields: Record<string, string> = {};

  if (title.length < 3) fields.title = 'Give your post a title (at least 3 characters).';
  if (bodyText.length < 20) {
    fields.body = 'Write at least 20 characters so readers know what you are sharing.';
  }
  if (rawKind && rawKind !== 'showcase' && rawKind !== 'validation') {
    fields.kind = 'Choose showcase or validation.';
  }

  const kind: 'showcase' | 'validation' =
    rawKind === 'validation' ? 'validation' : 'showcase';
  let testId: string | null = null;
  let eligibility: string | null = null;
  let closesAt: Date | null = null;

  // Only validation posts carry participation context. Switching a post back
  // to showcase clears the link so a public post cannot keep stale rules.
  if (kind === 'validation') {
    const rawTestId = text(body.testId, 40);
    if (rawTestId) {
      if (!POST_UUID_RE.test(rawTestId)) {
        fields.testId = 'Choose one of your own tests.';
      } else {
        const owned = await one(
          'select id from tests where id = $1 and founder_id = $2',
          [rawTestId, personId],
        );
        if (!owned) fields.testId = 'Choose one of your own tests.';
        else testId = rawTestId;
      }
    }

    eligibility = text(body.eligibility, 500) || null;

    const rawClose = text(body.closesAt, 40);
    if (rawClose) {
      const parsed = /^\d{4}-\d{2}-\d{2}$/.test(rawClose)
        ? new Date(`${rawClose}T23:59:59.999Z`)
        : new Date(rawClose);
      if (Number.isNaN(parsed.getTime())) {
        fields.closesAt = 'Enter a valid closing date.';
      } else {
        closesAt = parsed;
      }
    }
  }

  if (Object.keys(fields).length) validationError(fields);

  return { title, body: bodyText, kind, testId, eligibility, closesAt };
}

function baseSlug(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'startup';
}

async function uniqueSlug(name: string): Promise<string> {
  const base = baseSlug(name);
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const taken = await one('select id from startups where slug = $1', [candidate]);
    if (!taken) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 6)}`;
}

async function startupForFounder(personId: string): Promise<StartupRow | null> {
  return one<StartupRow>(
    `select s.*,
            (select count(*)::int from posts p
              where p.startup_id = s.id and p.status <> 'archived') as post_count,
            (select count(*)::int from posts p
              where p.startup_id = s.id and p.status = 'published') as published_post_count,
            (select count(*)::int from waitlist_entries w where w.startup_id = s.id) as waitlist_count,
            (select m.id from media_assets m
              where m.startup_id = s.id and m.purpose = 'logo' limit 1) as logo_media_id,
            (select m.id from media_assets m
              where m.startup_id = s.id and m.purpose = 'cover' limit 1) as cover_media_id
       from startups s
      where s.founder_id = $1`,
    [personId],
  );
}

export async function founderStartup(personId: string) {
  const startup = await startupForFounder(personId);
  return { startup: startup ? asStartup(startup) : null };
}

export async function createFounderStartup(personId: string, request: Request) {
  const existing = await one('select id from startups where founder_id = $1', [personId]);
  if (existing) {
    throw new ApiError(409, 'conflict', {
      startup: 'You already have a startup profile. Edit it instead.',
    });
  }

  const input = await readStartupInput(request);

  // Creating a startup is the act that makes someone a founder. This keeps a
  // new account from being stranded between sign-up and the dashboard while
  // still requiring a real authenticated account.
  await query(
    `insert into founder_profiles (person_id) values ($1)
     on conflict (person_id) do nothing`,
    [personId],
  );

  const slug = await uniqueSlug(input.name);
  const rows = await query<StartupRow>(
    `insert into startups
       (founder_id, name, slug, description, category, stage, website_url, visibility)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      personId,
      input.name,
      slug,
      input.description,
      input.category,
      input.stage,
      input.websiteUrl,
      input.visibility,
    ],
  );
  const startup = rows[0];
  if (!startup) throw new ApiError(500, 'server');

  // Fill the summary fields without another ownership lookup.
  startup.post_count = 0;
  startup.published_post_count = 0;
  startup.waitlist_count = 0;
  return { startup: asStartup(startup) };
}

export async function updateFounderStartup(personId: string, request: Request) {
  const existing = await one<StartupRow>(
    'select * from startups where founder_id = $1',
    [personId],
  );
  if (!existing) throw new ApiError(404, 'not_found');

  const input = await readStartupInput(request);
  const rows = await query<StartupRow>(
    `update startups
        set name = $2,
            description = $3,
            category = $4,
            stage = $5,
            website_url = $6,
            visibility = $7
      where id = $1 and founder_id = $8
      returning *`,
    [
      existing.id,
      input.name,
      input.description,
      input.category,
      input.stage,
      input.websiteUrl,
      input.visibility,
      personId,
    ],
  );
  const startup = rows[0];
  if (!startup) throw new ApiError(404, 'not_found');

  const summary = await startupForFounder(personId);
  return { startup: summary ? asStartup(summary) : asStartup(startup) };
}

export async function founderPosts(personId: string) {
  const startup = await one<{ id: string; name: string; slug: string; visibility: StartupVisibility }>(
    'select id, name, slug, visibility from startups where founder_id = $1',
    [personId],
  );
  if (!startup) return { startup: null, posts: [] };

  const posts = await query<PostRow>(
    `select p.id, p.title, p.body, p.kind, p.status, p.published_at,
            p.created_at, p.updated_at, p.moderated_at,
            ${postLinkSelect},
            ${postImagesSelect}
       from posts p
      where p.startup_id = $1
      order by p.created_at desc`,
    [startup.id],
  );

  return {
    startup: {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      visibility: startup.visibility,
    },
    posts: posts.map(asPost),
  };
}

export async function createFounderPost(personId: string, request: Request) {
  const startup = await one<{ id: string }>(
    'select id from startups where founder_id = $1',
    [personId],
  );
  if (!startup) {
    throw new ApiError(409, 'conflict', {
      startup: 'Create your startup profile before publishing a post.',
    });
  }

  const input = await readPostInput(request, personId);
  const rows = await query<PostRow>(
    `insert into posts
       (startup_id, author_id, kind, title, body, status,
        test_id, eligibility, closes_at)
     values ($1, $2, $3, $4, $5, 'draft', $6, $7, $8)
     returning id, title, body, kind, status, published_at, created_at, updated_at`,
    [
      startup.id,
      personId,
      input.kind,
      input.title,
      input.body,
      input.testId,
      input.eligibility,
      input.closesAt,
    ],
  );
  const post = rows[0];
  if (!post) throw new ApiError(500, 'server');
  return { post: asPost(post) };
}

export async function publishFounderPost(personId: string, postId: string) {
  const rows = await query<PostRow>(
    `update posts p
        set status = 'published',
            published_at = coalesce(p.published_at, now())
       from startups s
      where p.id = $1
        and p.startup_id = s.id
        and s.founder_id = $2
        and p.status in ('draft', 'published')
        and p.moderated_at is null
      returning p.id, p.title, p.body, p.kind, p.status, p.published_at,
                p.created_at, p.updated_at`,
    [postId, personId],
  );
  const post = rows[0];
  if (!post) throw new ApiError(404, 'not_found');
  return { post: asPost(post) };
}

export async function updateFounderPost(
  personId: string,
  postId: string,
  request: Request,
) {
  const input = await readPostInput(request, personId);
  const rows = await query<PostRow>(
    `update posts p
        set title = $3,
            body = $4,
            kind = $5,
            test_id = $6,
            eligibility = $7,
            closes_at = $8
       from startups s
      where p.id = $1
        and p.startup_id = s.id
        and s.founder_id = $2
        and p.status in ('draft', 'published')
        and p.moderated_at is null
      returning p.id, p.title, p.body, p.kind, p.status, p.published_at,
                p.created_at, p.updated_at`,
    [
      postId,
      personId,
      input.title,
      input.body,
      input.kind,
      input.testId,
      input.eligibility,
      input.closesAt,
    ],
  );
  const post = rows[0];
  if (!post) throw new ApiError(404, 'not_found');
  return { post: asPost(post) };
}

export async function archiveFounderPost(personId: string, postId: string) {
  const rows = await query<PostRow>(
    `update posts p
        set status = 'archived'
       from startups s
      where p.id = $1
        and p.startup_id = s.id
        and s.founder_id = $2
        and p.status in ('draft', 'published')
      returning p.id, p.title, p.body, p.kind, p.status, p.published_at,
                p.created_at, p.updated_at`,
    [postId, personId],
  );
  const post = rows[0];
  if (!post) throw new ApiError(404, 'not_found');
  return { post: asPost(post) };
}

export async function restoreFounderPost(personId: string, postId: string) {
  const rows = await query<PostRow>(
    `update posts p
        set status = 'draft',
            published_at = null
       from startups s
      where p.id = $1
        and p.startup_id = s.id
        and s.founder_id = $2
        and p.status = 'archived'
      returning p.id, p.title, p.body, p.kind, p.status, p.published_at,
                p.created_at, p.updated_at`,
    [postId, personId],
  );
  const post = rows[0];
  if (!post) throw new ApiError(404, 'not_found');
  return { post: asPost(post) };
}

export async function founderAudience(personId: string, range = 30) {
  const rangeDays = [7, 30, 90].includes(range) ? range : 30;
  const startup = await one<{ id: string; name: string; slug: string; visibility: StartupVisibility }>(
    'select id, name, slug, visibility from startups where founder_id = $1',
    [personId],
  );
  if (!startup) {
    return {
      startup: null,
      count: 0,
      recent: [],
      followers: { count: 0, trend: [] },
      feedback: { count: 0, items: [] },
      demoClicks: 0,
      posts: [],
      analytics: {
        rangeDays,
        profileViews: 0,
        postImpressions: 0,
        postOpens: 0,
        uniqueVisitors: 0,
        sources: [],
        daily: [],
      },
    };
  }

  const [
    countRow,
    rows,
    followerCount,
    followerTrend,
    feedbackCount,
    feedbackRows,
    demoClicks,
    posts,
    analyticsSummary,
    analyticsSources,
    analyticsDaily,
  ] = await Promise.all([
    one<{ count: number }>(
      'select count(*)::int as count from waitlist_entries where startup_id = $1',
      [startup.id],
    ),
    query<WaitlistRow>(
      `select id, email, name, source, created_at
         from waitlist_entries
        where startup_id = $1
        order by created_at desc
        limit 20`,
      [startup.id],
    ),
    one<{ count: number }>(
      'select count(*)::int as count from startup_follows where startup_id = $1',
      [startup.id],
    ),
    query<{ date: string; count: number }>(
      `with days as (
         select generate_series(
           current_date - interval '13 days',
           current_date,
           interval '1 day'
         )::date as day
       )
       select to_char(days.day, 'YYYY-MM-DD') as date,
              count(f.person_id)::int as count
         from days
         left join startup_follows f
           on f.startup_id = $1 and f.created_at::date = days.day
        group by days.day
        order by days.day`,
      [startup.id],
    ),
    one<{ count: number }>(
      `select count(*)::int as count
         from post_feedback f
         join posts p on p.id = f.post_id
        where p.startup_id = $1 and f.status = 'visible'
          and p.moderated_at is null`,
      [startup.id],
    ),
    query<AudienceFeedbackRow>(
      `select f.id, f.body, f.status, f.created_at,
              p.id as post_id, p.title as post_title,
              coalesce(nullif(author.full_name, ''), 'RAPID member') as author_name
         from post_feedback f
         join posts p on p.id = f.post_id
         join people author on author.id = f.author_id
        where p.startup_id = $1 and f.status = 'visible'
          and p.moderated_at is null
        order by f.created_at desc
        limit 20`,
      [startup.id],
    ),
    one<{ count: number }>(
      'select count(*)::int as count from startup_demo_clicks where startup_id = $1',
      [startup.id],
    ),
    query<AudiencePostRow>(
      `select p.id, p.title, p.published_at,
              (select count(*)::int from post_feedback f
                where f.post_id = p.id and f.status = 'visible') as feedback_count,
              (select count(*)::int from audience_events e
                where e.post_id = p.id and e.event_type = 'post_impression'
                  and e.event_date >= current_date - ($2::int - 1)) as impressions,
              (select count(*)::int from audience_events e
                where e.post_id = p.id and e.event_type = 'post_open'
                  and e.event_date >= current_date - ($2::int - 1)) as opens
         from posts p
        where p.startup_id = $1
          and p.status = 'published'
          and p.moderated_at is null
        order by p.published_at desc nulls last, p.created_at desc
        limit 10`,
      [startup.id, rangeDays],
    ),
    one<AnalyticsSummaryRow>(
      `select
         count(*) filter (where event_type = 'profile_view')::int as profile_views,
         count(*) filter (where event_type = 'post_impression')::int as post_impressions,
         count(*) filter (where event_type = 'post_open')::int as post_opens,
         count(distinct visitor_key)::int as unique_visitors
       from audience_events
      where startup_id = $1
        and event_date >= current_date - ($2::int - 1)`,
      [startup.id, rangeDays],
    ),
    query<AnalyticsSourceRow>(
      `select source, count(*)::int as count
         from audience_events
        where startup_id = $1 and event_type = 'profile_view'
          and event_date >= current_date - ($2::int - 1)
        group by source
        order by count desc, source`,
      [startup.id, rangeDays],
    ),
    query<AnalyticsDayRow>(
      `with days as (
         select generate_series(
           current_date - ($2::int - 1),
           current_date,
           interval '1 day'
         )::date as day
       )
       select to_char(days.day, 'YYYY-MM-DD') as date,
              count(e.id) filter (where e.event_type = 'profile_view')::int as profile_views,
              count(e.id) filter (where e.event_type = 'post_impression')::int as post_impressions,
              count(e.id) filter (where e.event_type = 'post_open')::int as post_opens
         from days
         left join audience_events e
           on e.startup_id = $1 and e.event_date = days.day
        group by days.day
        order by days.day`,
      [startup.id, rangeDays],
    ),
  ]);

  return {
    startup: {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      visibility: startup.visibility,
    },
    count: Number(countRow?.count ?? 0),
    recent: rows.map(asWaitlistEntry),
    followers: {
      count: Number(followerCount?.count ?? 0),
      trend: followerTrend.map((point) => ({
        date: point.date,
        count: Number(point.count ?? 0),
      })),
    },
    feedback: {
      count: Number(feedbackCount?.count ?? 0),
      items: feedbackRows.map((item) => ({
        id: item.id,
        body: item.body,
        status: item.status,
        createdAt: asIso(item.created_at)!,
        post: { id: item.post_id, title: item.post_title },
        authorName: item.author_name,
      })),
    },
    demoClicks: Number(demoClicks?.count ?? 0),
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      publishedAt: asIso(post.published_at),
      feedbackCount: Number(post.feedback_count ?? 0),
      impressions: Number(post.impressions ?? 0),
      opens: Number(post.opens ?? 0),
    })),
    analytics: {
      rangeDays,
      profileViews: Number(analyticsSummary?.profile_views ?? 0),
      postImpressions: Number(analyticsSummary?.post_impressions ?? 0),
      postOpens: Number(analyticsSummary?.post_opens ?? 0),
      uniqueVisitors: Number(analyticsSummary?.unique_visitors ?? 0),
      sources: analyticsSources.map((source) => ({
        source: source.source,
        count: Number(source.count ?? 0),
      })),
      daily: analyticsDaily.map((day) => ({
        date: day.date,
        profileViews: Number(day.profile_views ?? 0),
        postImpressions: Number(day.post_impressions ?? 0),
        postOpens: Number(day.post_opens ?? 0),
      })),
    },
  };
}

export async function publicStartup(rawSlug: string, viewerId: string | null = null) {
  const slug = rawSlug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new ApiError(404, 'not_found');
  }

  const startup = await one<StartupRow>(
    `select s.*,
            (select m.id from media_assets m
              where m.startup_id = s.id and m.purpose = 'logo' limit 1) as logo_media_id,
            (select m.id from media_assets m
              where m.startup_id = s.id and m.purpose = 'cover' limit 1) as cover_media_id,
            (select count(*)::int from startup_follows f
              where f.startup_id = s.id) as follower_count,
            (case when $2::uuid is null then false else exists(
              select 1 from startup_follows f
               where f.startup_id = s.id and f.person_id = $2::uuid
            ) end) as following,
            (s.founder_id = $2::uuid) as is_owner
       from startups s
      where s.slug = $1 and s.visibility = 'published'`,
    [slug, viewerId],
  );
  if (!startup) throw new ApiError(404, 'not_found');

  const posts = await query<PostRow>(
    `select p.id, p.title, p.body, p.kind, p.status, p.published_at,
            p.created_at, p.updated_at,
            ${postLinkSelect},
            ${postImagesSelect}
       from posts p
      where p.startup_id = $1
        and p.status = 'published'
        and p.moderated_at is null
      order by p.published_at desc nulls last, p.created_at desc`,
    [startup.id],
  );

  return {
    startup: {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      category: startup.category,
      stage: startup.stage,
      websiteUrl: startup.website_url,
      logoUrl: startup.logo_media_id ? mediaUrl(startup.logo_media_id) : null,
      coverUrl: startup.cover_media_id ? mediaUrl(startup.cover_media_id) : null,
      followers: Number(startup.follower_count ?? 0),
      following: Boolean(startup.following),
      isOwner: Boolean(startup.is_owner),
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        kind: post.kind,
        publishedAt: asIso(post.published_at)!,
        testId: post.test_id ?? null,
        eligibility: post.eligibility ?? null,
        closesAt: asIso(post.closes_at ?? null),
        linkedTest: post.test_id
          ? {
              id: post.test_id,
              title: post.test_title ?? null,
              status: post.test_status ?? null,
            }
          : null,
        images: (post.images ?? []).map((image) => ({
          id: image.id,
          url: mediaUrl(image.id),
          altText: image.altText ?? null,
        })),
      })),
    },
  };
}

export async function joinWaitlist(rawSlug: string, request: Request) {
  const slug = rawSlug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) {
    throw new ApiError(404, 'not_found');
  }

  const body = await readJson<Record<string, unknown>>(request);
  const email = text(body.email, 254).toLowerCase();
  const name = text(body.name, 80) || null;
  const source = text(body.source, 80) || 'startup_page';
  const consent = body.consent === true;
  const fields: Record<string, string> = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = 'Enter a valid email address, like name@example.com.';
  }
  if (!consent) fields.consent = 'Please agree to be contacted about this startup.';
  if (Object.keys(fields).length) validationError(fields);

  const startup = await one<{ id: string; founder_id: string; name: string }>(
    `select id, founder_id, name from startups
      where slug = $1 and visibility = 'published'`,
    [slug],
  );
  if (!startup) throw new ApiError(404, 'not_found');

  await enforceRateLimit(`waitlist:email:${hashKey(email)}`, 5, 600);
  const ip = clientIp(request);
  if (ip) await enforceRateLimit(`waitlist:ip:${hashKey(ip)}`, 20, 600);

  const person = await optionalPerson(request);
  const rows = await query<{ id: string }>(
    `insert into waitlist_entries (startup_id, person_id, email, name, consent, source)
     values ($1, $2, $3, $4, true, $5)
     on conflict (startup_id, email) do nothing
     returning id`,
    [startup.id, person?.id ?? null, email, name, source],
  );

  if (rows[0]) {
    await notify(
      startup.founder_id,
      'waitlist_join',
      'New waitlist sign-up',
      `Someone joined the waitlist for ${startup.name}` +
        (source === 'startup_page' ? '.' : ` from ${source}.`),
      '/app/founder/audience',
    );
  }

  return { ok: true, alreadyJoined: rows.length === 0 };
}
