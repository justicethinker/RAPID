// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

try {
  process.loadEnvFile('.env.local');
} catch {
  // CI may provide DATABASE_URL directly, or skip these tests.
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeDb = hasDatabase ? describe : describe.skip;

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const slug = `integration-${stamp}`;
const founderEmail = `integration.${stamp}.founder@rapid.invalid`;
const testerEmail = `integration.${stamp}.tester@rapid.invalid`;
const strangerEmail = `integration.${stamp}.stranger@rapid.invalid`;
const staffEmail = `integration.${stamp}.staff@rapid.invalid`;
const waitlistEmail = `integration.${stamp}.waitlist@rapid.invalid`;
const analyticsVisitorKey = `analytics-session-${stamp}`;

let db!: typeof import('./db');
let discovery!: typeof import('./discovery');
let founderApi!: typeof import('./founder');
let startups!: typeof import('./startups');
let staffApi!: typeof import('./staff');

let founderId = '';
let testerId = '';
let strangerId = '';
let staffId = '';
let startupId = '';
let showcasePostId = '';
let validationPostId = '';
let testId = '';
let invitationId = '';

function request(body: unknown): Request {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describeDb('discovery, reporting and notifications', () => {
  beforeAll(async () => {
    db = await import('./db');
    discovery = await import('./discovery');
    founderApi = await import('./founder');
    startups = await import('./startups');
    staffApi = await import('./staff');

    const founder = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name)
       values ($1, true, 'Integration Founder') returning id`,
      [founderEmail],
    );
    const tester = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name)
       values ($1, true, 'Integration Tester') returning id`,
      [testerEmail],
    );
    const stranger = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name)
       values ($1, true, 'Integration Stranger') returning id`,
      [strangerEmail],
    );
    const staff = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name)
       values ($1, true, 'Integration Staff') returning id`,
      [staffEmail],
    );
    if (!founder || !tester || !stranger || !staff) {
      throw new Error('Could not create integration people');
    }
    founderId = founder.id;
    testerId = tester.id;
    strangerId = stranger.id;
    staffId = staff.id;

    await db.query(
      `insert into tester_profiles
         (person_id, submission_id, application_status, privacy_version, schema_version)
       values ($1, $2, 'approved', '2026-10-20', '2026-10-20')`,
      [testerId, `integration-tester-${stamp}`],
    );

    const startup = await db.one<{ id: string }>(
      `insert into startups
         (founder_id, name, slug, description, category, visibility)
       values ($1, $2, $3, $4, 'consumer', 'published')
       returning id`,
      [
        founderId,
        `Integration Startup ${stamp}`,
        slug,
        'A temporary startup created only for the discovery integration tests.',
      ],
    );
    if (!startup) throw new Error('Could not create integration startup');
    startupId = startup.id;

    const test = await db.one<{ id: string }>(
      `insert into tests
         (founder_id, title, question, terms, status)
       values ($1, $2, 'Will you use this next month?',
               'Take part and tell us what you think.', 'fielding')
       returning id`,
      [founderId, `Integration test ${stamp}`],
    );
    if (!test) throw new Error('Could not create integration test');
    testId = test.id;

    const invitation = await db.one<{ id: string }>(
      `insert into invitations (test_id, tester_id, status)
       values ($1, $2, 'invited') returning id`,
      [testId, testerId],
    );
    if (!invitation) throw new Error('Could not create integration invitation');
    invitationId = invitation.id;

    const showcase = await db.one<{ id: string }>(
      `insert into posts
         (startup_id, author_id, kind, title, body, status, published_at)
       values ($1, $2, 'showcase', $3, $4, 'published', now())
       returning id`,
      [
        startupId,
        founderId,
        `Integration showcase ${stamp}`,
        'This published post exists so the feed and feedback paths can be tested.',
      ],
    );
    const validation = await db.one<{ id: string }>(
      `insert into posts
         (startup_id, author_id, kind, title, body, status, published_at,
          test_id, closes_at)
       values ($1, $2, 'validation', $3, $4, 'published', now(),
               $5, now() + interval '7 days')
       returning id`,
      [
        startupId,
        founderId,
        `Integration validation ${stamp}`,
        'This validation post links the tester invitation used by the participation gate.',
        testId,
      ],
    );
    if (!showcase || !validation) {
      throw new Error('Could not create integration posts');
    }
    showcasePostId = showcase.id;
    validationPostId = validation.id;
  });

  afterAll(async () => {
    if (!db) return;
    const ids = [founderId, testerId, strangerId, staffId].filter(Boolean);
    if (ids.length) {
      await db.query('delete from content_reports where reporter_id = any($1::uuid[])', [
        ids,
      ]);
      await db.query('delete from notifications where person_id = any($1::uuid[])', [ids]);
      await db.query('delete from audit_events where actor_id = any($1::uuid[])', [ids]);
    }
    if (testId) {
      await db.query('delete from findings where test_id = $1', [testId]);
      await db.query('delete from invitations where test_id = $1', [testId]);
      await db.query('delete from tests where id = $1', [testId]);
    }
    if (startupId) {
      await db.query('delete from startups where id = $1', [startupId]);
    }
    if (testerId) {
      await db.query('delete from tester_profiles where person_id = $1', [testerId]);
    }
    if (founderId) {
      await db.query('delete from founder_profiles where person_id = $1', [founderId]);
    }
    for (const id of ids) {
      await db.query('delete from rate_limits where bucket like $1', [`%${id}%`]);
      await db.query('delete from people where id = $1', [id]);
    }
    await db.closePool();
  });

  it('records a public profile-view event without sign-in', async () => {
    const { handleRequest } = await import('./router');
    const response = await handleRequest(
      new Request('http://localhost/api/analytics/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          startupId,
          eventType: 'profile_view',
          visitorKey: analyticsVisitorKey,
          source: 'direct',
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ recorded: true });
  });

  it('deduplicates daily post events and reports them by period', async () => {
    const { handleRequest } = await import('./router');
    const send = (eventType: 'post_impression' | 'post_open') =>
      handleRequest(
        new Request('http://localhost/api/analytics/events', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            startupId,
            postId: showcasePostId,
            eventType,
            visitorKey: analyticsVisitorKey,
            source: 'discover',
          }),
        }),
      );

    expect((await send('post_impression')).status).toBe(201);
    expect((await send('post_impression')).status).toBe(201);
    expect((await send('post_open')).status).toBe(201);

    const audience = await startups.founderAudience(founderId, 7);
    expect(audience.analytics).toMatchObject({
      rangeDays: 7,
      profileViews: 1,
      postImpressions: 1,
      postOpens: 1,
      uniqueVisitors: 1,
    });
    expect(audience.analytics.daily).toHaveLength(7);
    expect(audience.analytics.sources).toEqual([{ source: 'direct', count: 1 }]);
    expect(
      audience.posts.find((post) => post.id === showcasePostId),
    ).toMatchObject({ impressions: 1, opens: 1 });
  });

  it('rejects an unsupported analytics event type', async () => {
    const { handleRequest } = await import('./router');
    const response = await handleRequest(
      new Request('http://localhost/api/analytics/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          startupId,
          eventType: 'purchase',
          visitorKey: analyticsVisitorKey,
          source: 'direct',
        }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it('shows only published, unmoderated posts in the feed', async () => {
    const params = new URLSearchParams({ q: `Integration Startup ${stamp}` });

    const visible = await discovery.discoveryFeed(params, null);
    expect(visible.items.map((item) => item.id)).toContain(showcasePostId);

    await db.query('update posts set moderated_at = now() where id = $1', [
      showcasePostId,
    ]);
    const hidden = await discovery.discoveryFeed(params, null);
    expect(hidden.items.map((item) => item.id)).not.toContain(showcasePostId);

    await db.query('update posts set moderated_at = null where id = $1', [
      showcasePostId,
    ]);
  });

  it('deduplicates follows and notifies the founder once', async () => {
    const first = await discovery.setStartupFollow(testerId, startupId, true);
    expect(first).toEqual({ following: true, followers: 1 });

    const second = await discovery.setStartupFollow(testerId, startupId, true);
    expect(second).toEqual({ following: true, followers: 1 });

    await expect(
      discovery.setStartupFollow(founderId, startupId, true),
    ).rejects.toMatchObject({ status: 409 });

    const notices = await db.query<{ title: string }>(
      `select title from notifications
        where person_id = $1 and kind = 'new_follower'`,
      [founderId],
    );
    expect(notices).toHaveLength(1);
  });

  it('persists feedback, refuses the owner, and notifies the founder', async () => {
    const result = await discovery.submitFeedback(
      testerId,
      showcasePostId,
      request({ body: 'The value is clear, but I need to know what happens after sign-up.' }),
    );
    expect(result.feedback.body).toContain('what happens after sign-up');

    await expect(
      discovery.submitFeedback(
        founderId,
        showcasePostId,
        request({ body: 'Owners must not be able to leave feedback on their own post.' }),
      ),
    ).rejects.toMatchObject({ status: 409 });

    const notices = await db.query<{ title: string }>(
      `select title from notifications
        where person_id = $1 and kind = 'new_feedback'`,
      [founderId],
    );
    expect(notices).toHaveLength(1);
  });

  it('records a consented waitlist join and notifies the founder', async () => {
    const result = await startups.joinWaitlist(
      slug,
      request({
        email: waitlistEmail,
        name: 'Waitlist Person',
        consent: true,
        source: 'integration',
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.alreadyJoined).toBe(false);

    const notices = await db.query<{ body: string }>(
      `select body from notifications
        where person_id = $1 and kind = 'waitlist_join'`,
      [founderId],
    );
    expect(notices).toHaveLength(1);
    expect(notices[0]?.body).toContain('from integration');
  });

  it('resolves a startup report and hides the profile', async () => {
    await discovery.reportContent(
      testerId,
      request({
        targetType: 'startup',
        targetId: startupId,
        reason: 'Integration test report against the startup profile.',
      }),
    );

    const report = await db.one<{ id: string }>(
      `select id from content_reports
        where reporter_id = $1 and target_type = 'startup' and target_id = $2`,
      [testerId, startupId],
    );
    expect(report).not.toBeNull();

    await discovery.decideReport(
      staffId,
      report!.id,
      request({ action: 'hide' }),
    );

    const hidden = await db.one<{ visibility: string }>(
      'select visibility from startups where id = $1',
      [startupId],
    );
    expect(hidden?.visibility).toBe('draft');
    await expect(startups.publicStartup(slug)).rejects.toMatchObject({
      status: 404,
    });

    const notices = await db.query<{ title: string }>(
      `select title from notifications
        where person_id = $1 and kind = 'moderation' and title = 'Startup hidden'`,
      [founderId],
    );
    expect(notices).toHaveLength(1);

    const queue = await discovery.staffModeration();
    expect(queue.moderatedStartups.map((item) => item.id)).toContain(startupId);

    // Restore so the linked-test test below can read the public startup.
    await discovery.setStartupModeration(
      staffId,
      startupId,
      request({ action: 'restore' }),
    );
    const restored = await db.one<{ visibility: string }>(
      'select visibility from startups where id = $1',
      [startupId],
    );
    expect(restored?.visibility).toBe('published');
    await expect(startups.publicStartup(slug)).resolves.toBeTruthy();
  });

  it('refuses to publish a startup that moderation never hid', async () => {
    let otherFounderId = '';
    let otherStartupId = '';
    try {
      const otherFounder = await db.one<{ id: string }>(
        `insert into people (email, email_verified, full_name)
         values ($1, true, 'Unmoderated Founder') returning id`,
        [`integration.${stamp}.unmoderated@rapid.invalid`],
      );
      if (!otherFounder) throw new Error('Could not create unmoderated founder');
      otherFounderId = otherFounder.id;

      const otherStartup = await db.one<{ id: string }>(
        `insert into startups
           (founder_id, name, slug, description, category, visibility)
         values ($1, $2, $3, $4, 'consumer', 'draft')
         returning id`,
        [
          otherFounderId,
          `Unmoderated Startup ${stamp}`,
          `unmoderated-${stamp}`,
          'This draft startup has never been the subject of a moderation report.',
        ],
      );
      if (!otherStartup) throw new Error('Could not create unmoderated startup');
      otherStartupId = otherStartup.id;

      await expect(
        discovery.setStartupModeration(
          staffId,
          otherStartupId,
          request({ action: 'restore' }),
        ),
      ).rejects.toMatchObject({ status: 409 });

      const startup = await db.one<{ visibility: string }>(
        'select visibility from startups where id = $1',
        [otherStartupId],
      );
      expect(startup?.visibility).toBe('draft');
    } finally {
      if (otherStartupId) {
        await db.query('delete from startups where id = $1', [otherStartupId]);
      }
      if (otherFounderId) {
        await db.query('delete from people where id = $1', [otherFounderId]);
      }
    }
  });

  it('resolves a post report without the old unreferenced-parameter failure', async () => {
    await discovery.reportContent(
      strangerId,
      request({
        targetType: 'post',
        targetId: showcasePostId,
        reason: 'Integration test report against a public showcase post.',
      }),
    );
    const report = await db.one<{ id: string }>(
      `select id from content_reports
        where reporter_id = $1 and target_type = 'post' and target_id = $2`,
      [strangerId, showcasePostId],
    );

    await discovery.decideReport(
      staffId,
      report!.id,
      request({ action: 'hide' }),
    );

    const post = await db.one<{ moderated_at: Date | null }>(
      'select moderated_at from posts where id = $1',
      [showcasePostId],
    );
    expect(post?.moderated_at).not.toBeNull();

    await discovery.setPostModeration(
      staffId,
      showcasePostId,
      request({ action: 'restore' }),
    );
    const restored = await db.one<{ moderated_at: Date | null }>(
      'select moderated_at from posts where id = $1',
      [showcasePostId],
    );
    expect(restored?.moderated_at).toBeNull();
  });

  it('requires verified payment before staff recruit for a priced test', async () => {
    await db.query("update tests set status = 'scoping', price_amount = 5000, payment_status = 'awaiting_payment' where id = $1", [testId]);
    const invite = () => staffApi.inviteTesters(staffId, testId, request({ testerIds: [strangerId] }), 'http://localhost');
    try {
      await expect(invite()).rejects.toMatchObject({ status: 409 });
      expect(await db.one('select id from invitations where test_id = $1 and tester_id = $2', [testId, strangerId])).toBeNull();
      await expect(staffApi.updateStaffTest(staffId, testId, request({ status: 'recruiting', paymentStatus: 'paid' })))
        .rejects.toMatchObject({ status: 409 });
      await expect(staffApi.updateStaffTest(staffId, testId, request({ projectStatus: 'recruiting' })))
        .rejects.toMatchObject({ status: 409 });
      await db.query("update tests set payment_status = 'paid' where id = $1", [testId]);
      // Older staff scopes could carry a paid flag without a provider receipt.
      await expect(invite()).rejects.toMatchObject({ status: 409 });
      await db.query(
        `insert into payments (test_id, founder_id, provider_reference, idempotency_key, amount_kobo, currency, status, provider_status, paid_at)
         values ($1, $2, $3, $3, 5000, 'NGN', 'paid', 'success', now())`,
        [testId, founderId, stamp],
      );
      expect(await invite()).toEqual({ invited: 1 });
      expect(await invite()).toEqual({ invited: 0 });
    } finally {
      await db.query('delete from payments where test_id = $1', [testId]);
      await db.query('delete from invitations where test_id = $1 and tester_id = $2', [testId, strangerId]);
      await db.query("update tests set status = 'fielding', price_amount = null, payment_status = 'not_required' where id = $1", [testId]);
    }
  });

  it('enforces research transitions, audits the staff actor and prepares a report', async () => {
    await expect(
      staffApi.updateStaffTest(
        staffId,
        testId,
        request({ status: 'closed' }),
      ),
    ).rejects.toMatchObject({ status: 409 });

    await staffApi.updateStaffTest(
      staffId,
      testId,
      request({ status: 'findings' }),
    );

    const audit = await db.one<{ actor_id: string }>(
      `select actor_id from audit_events
        where action = 'test.updated' and entity = 'test' and entity_id = $1
        order by created_at desc limit 1`,
      [testId],
    );
    expect(audit?.actor_id).toBe(staffId);

    const notice = await db.one<{ title: string }>(
      `select title from notifications
        where person_id = $1 and kind = 'research_status'
        order by created_at desc limit 1`,
      [founderId],
    );
    expect(notice?.title).toBe('Research update');

    await staffApi.saveFindings(
      staffId,
      testId,
      request({
        headline: 'Integration finding',
        summary: 'A plain-language summary for the report download test.',
        limits: 'Small sample; directional only.',
        recommendation: 'Test the onboarding step next.',
        learnings: [
          { label: 'Signal', detail: 'Participants understood the value.' },
        ],
      }),
    );
    await staffApi.publishFindings(staffId, testId, 'http://localhost');

    const publishedNotice = await db.one<{ title: string }>(
      `select title from notifications
        where person_id = $1 and kind = 'findings_published'
        order by created_at desc limit 1`,
      [founderId],
    );
    expect(publishedNotice?.title).toBe('Findings published');

    const report = await founderApi.founderReport(founderId, testId);
    expect(report.filename).toMatch(/^rapid-report-.*\.md$/);
    expect(report.markdown).toContain('# Integration finding');
    expect(report.markdown).toContain('Report version: 1');
    expect(report.markdown).toContain('## Limitations');
    expect(report.markdown).toContain('## Recommended next step');
    expect(report.markdown).not.toContain(testerEmail);

    await expect(
      founderApi.founderReport(strangerId, testId),
    ).rejects.toMatchObject({ status: 404 });

    await staffApi.saveFindings(staffId, testId, request({
      headline: 'A revised headline',
      summary: 'A revised summary awaiting explicit republication.',
      learnings: [{ label: 'New', detail: 'An unpublished learning.' }],
    }));
    expect((await founderApi.founderTest(founderId, testId)).findings?.headline)
      .toBe('Integration finding');
    expect((await founderApi.founderReport(founderId, testId)).markdown).toBe(report.markdown);
    await staffApi.publishFindings(staffId, testId, 'http://localhost');
    expect((await founderApi.founderTest(founderId, testId)).findings)
      .toMatchObject({ headline: 'A revised headline', version: 2 });

    // The linked-test test below needs the test to accept participation again.
    await db.query("update tests set status = 'fielding' where id = $1", [testId]);
  });

  it('enforces linked-test participation rules', async () => {
    await db.query("update tests set status = 'fielding' where id = $1", [testId]);

    await expect(
      discovery.openLinkedTest(strangerId, validationPostId),
    ).rejects.toMatchObject({ status: 403 });

    const opened = await discovery.openLinkedTest(testerId, validationPostId);
    expect(opened.invitationId).toBe(invitationId);

    await db.query("update tests set status = 'findings' where id = $1", [testId]);
    await expect(
      discovery.openLinkedTest(testerId, validationPostId),
    ).rejects.toMatchObject({ status: 409 });
    await db.query("update tests set status = 'fielding' where id = $1", [testId]);

    await db.query(
      "update posts set closes_at = now() - interval '1 day' where id = $1",
      [validationPostId],
    );
    await expect(
      discovery.openLinkedTest(testerId, validationPostId),
    ).rejects.toMatchObject({ status: 409 });
  });
});
