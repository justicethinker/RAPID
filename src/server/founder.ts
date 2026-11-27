import { one, query } from './db';
import { ApiError, readJson } from './http';
import { notify, notifyStaff } from './notify';
import { FOUNDER_AUDIENCES } from '../content/pilot';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505'
  );
}

interface TestRow {
  id: string;
  title: string;
  question: string;
  audience_code: string | null;
  audience_description: string | null;
  terms: string;
  reward_note: string | null;
  status: string;
  founder_decision: string | null;
  decided_at: string | null;
  created_at: string;
  published_at: string | null;
  startup_id: string | null;
  startup_name: string | null;
  method: string | null;
  sample_target: number | null;
  report_due_at: string | null;
  submission_id: string | null;
  service_key: string;
  project_status: string;
  payment_status: string;
  price_amount: string | null;
  price_currency: string | null;
  task_url: string | null;
  task_requires_return: boolean;
  reward_amount: string | null;
  brief_id: string | null;
  invited: number;
  accepted: number;
  declined: number;
  completed: number;
  responses: number;
}

const TEST_SELECT = `
  select t.id, t.title, t.question, t.audience_code, t.audience_description,
         t.terms, t.reward_note, t.status, t.founder_decision, t.decided_at,
         t.created_at, t.published_at, t.startup_id, s.name as startup_name,
         t.method, t.sample_target, t.report_due_at, t.submission_id,
         t.service_key, t.project_status, t.payment_status, t.price_amount::text as price_amount,
         t.price_currency, t.task_url, t.task_requires_return, t.reward_amount::text as reward_amount, t.brief_id,
         (select count(*) from invitations i where i.test_id = t.id)::int as invited,
         (select count(*) from invitations i where i.test_id = t.id and i.status in ('accepted','completed'))::int as accepted,
         (select count(*) from invitations i where i.test_id = t.id and i.status = 'declined')::int as declined,
         (select count(*) from invitations i where i.test_id = t.id and i.status = 'completed')::int as completed,
         (select count(*) from responses r join invitations i on i.id = r.invitation_id where i.test_id = t.id)::int as responses
    from tests t
    left join startups s on s.id = t.startup_id
`;

function mapTest(row: TestRow) {
  return {
    id: row.id,
    title: row.title,
    question: row.question,
    audienceCode: row.audience_code,
    audienceDescription: row.audience_description,
    terms: row.terms,
    rewardNote: row.reward_note,
    status: row.status,
    decision: row.founder_decision,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    startupId: row.startup_id,
    startupName: row.startup_name,
    method: row.method,
    sampleTarget: row.sample_target,
    reportDueAt: row.report_due_at,
    submissionId: row.submission_id,
    serviceKey: row.service_key,
    projectStatus: row.project_status,
    paymentStatus: row.payment_status,
    priceAmount: row.price_amount ? Number(row.price_amount) : null,
    priceCurrency: row.price_currency,
    taskUrl: row.task_url,
    taskRequiresReturn: row.task_requires_return,
    rewardAmount: row.reward_amount ? Number(row.reward_amount) : null,
    briefId: row.brief_id,
    counts: {
      invited: row.invited,
      accepted: row.accepted,
      declined: row.declined,
      completed: row.completed,
      responses: row.responses,
      responseRate:
        row.accepted > 0 ? Math.round((row.responses / row.accepted) * 100) : null,
    },
  };
}

export async function founderTests(founderId: string) {
  const rows = await query<TestRow>(
    `${TEST_SELECT} where t.founder_id = $1 order by t.created_at desc`,
    [founderId],
  );
  return rows.map(mapTest);
}

export async function founderTest(founderId: string, id: string) {
  const row = await one<TestRow>(
    `${TEST_SELECT} where t.id = $1 and t.founder_id = $2`,
    [id, founderId],
  );
  if (!row) throw new ApiError(404, 'not_found');

  const findings = await one<{
    headline: string;
    summary: string;
    learnings: { label: string; detail: string }[];
    limits: string;
    recommendation: string;
    published_at: string | null;
    version: number;
  }>(
    `select headline, summary, learnings, limits, recommendation, published_at, version
       from published_findings where test_id = $1`,
    [id],
  );

  const published = Boolean(findings?.published_at);

  const outcomes = await query<{ outcome: string; count: number }>(
    `select r.outcome, count(*)::int as count
       from responses r join invitations i on i.id = r.invitation_id
      where i.test_id = $1
      group by r.outcome`,
    [id],
  );

  const quotes = published
    ? await query<{ note: string; outcome: string }>(
        `select r.note, r.outcome
           from responses r join invitations i on i.id = r.invitation_id
          where i.test_id = $1 and r.consent_to_quote = true
          order by r.submitted_at
          limit 10`,
        [id],
      )
    : [];

  const actionCounts = await one<{ assigned: number; link_opened: number; self_reported: number; verified: number }>(
    `select count(*) filter (where state in ('assigned','link_opened','self_reported','verified'))::int as assigned,
            count(*) filter (where state in ('link_opened','self_reported','verified'))::int as link_opened,
            count(*) filter (where state in ('self_reported','verified'))::int as self_reported,
            count(*) filter (where state = 'verified')::int as verified
       from task_actions ta join invitations i on i.id = ta.invitation_id where i.test_id = $1`,
    [id],
  );
  const actionReasons = await query<{ reason: string; count: number }>(
    `select coalesce(reason, 'Not stated') as reason, count(*)::int as count
       from task_actions ta join invitations i on i.id = ta.invitation_id
      where i.test_id = $1 and ta.self_reported_outcome is not null
      group by coalesce(reason, 'Not stated') order by count desc`,
    [id],
  );
  const audienceBreakdown = await query<{ label: string; count: number }>(
    `select coalesce(tp.situation, 'unknown') as label, count(*)::int as count
       from invitations i join tester_profiles tp on tp.person_id = i.tester_id
      where i.test_id = $1 and i.status in ('accepted','completed')
      group by coalesce(tp.situation, 'unknown') order by count desc`,
    [id],
  );
  const payments = await query<{ id: string; provider: string; provider_reference: string; amount_kobo: string; currency: string; status: string; paid_at: string | null }>(`select id, provider, provider_reference, amount_kobo::text as amount_kobo, currency, status, paid_at from payments where test_id = $1 order by created_at desc`, [id]);
  const brief = row.brief_id ? await one<{ id: string; status: string; brief: unknown; missing_details: unknown; risks: unknown; version: number }>(`select id, status, brief, missing_details, risks, version from research_briefs where id = $1`, [row.brief_id]) : null;

  return {
    ...mapTest(row),
    outcomes,
    actionCounts: actionCounts ?? { assigned: 0, link_opened: 0, self_reported: 0, verified: 0 },
    actionReasons,
    audienceBreakdown,
    payments: payments.map((payment) => ({ ...payment, amountKobo: Number(payment.amount_kobo) })),
    brief: brief ? { id: brief.id, status: brief.status, brief: brief.brief ?? {}, missingDetails: brief.missing_details ?? [], risks: brief.risks ?? [], version: brief.version } : null,
    quotes,
    findings:
      findings && published
        ? {
            headline: findings.headline,
            summary: findings.summary,
            learnings: findings.learnings,
            limits: findings.limits,
            recommendation: findings.recommendation,
            publishedAt: findings.published_at,
            version: findings.version,
          }
        : null,
  };
}

export async function createFounderTest(founderId: string, request: Request) {
  const body = await readJson<{
    title?: string;
    question?: string;
    audienceCode?: string;
    audienceDescription?: string;
    rewardNote?: string;
    terms?: string;
    submissionId?: string;
    serviceKey?: string;
  }>(request);

  const question = (body.question ?? '').trim();
  const fields: Record<string, string> = {};
  if (question.length < 20 || question.length > 500) {
    fields.question = 'Describe what you need to learn in 20–500 characters.';
  }

  const audienceCode = body.audienceCode?.trim() || null;
  if (
    audienceCode &&
    !FOUNDER_AUDIENCES.some((audience) => audience.code === audienceCode)
  ) {
    fields.audienceCode = 'Choose a valid audience.';
  }

  const submissionId = body.submissionId?.trim() || null;
  if (submissionId && !UUID_RE.test(submissionId)) {
    fields.submissionId = 'This request reference is not valid.';
  }

  if (Object.keys(fields).length) throw new ApiError(400, 'bad_request', fields);
  const title = (body.title ?? question).trim().slice(0, 80);

  // A retry or a double click with the same request reference returns the same
  // test instead of creating a second request in the staff queue.
  if (submissionId) {
    const existing = await one<{ id: string }>(
      'select id from tests where founder_id = $1 and submission_id = $2',
      [founderId, submissionId],
    );
    if (existing) return { id: existing.id, existing: true };
  }

  const startup = await one<{ id: string }>(
    'select id from startups where founder_id = $1',
    [founderId],
  );

  let test: { id: string } | null;
  try {
    test = await one<{ id: string }>(
      `insert into tests
         (founder_id, startup_id, submission_id, title, question, audience_code,
          audience_description, reward_note, terms, status, service_key)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'requested', $10)
       returning id`,
      [
        founderId,
        startup?.id ?? null,
        submissionId,
        title,
        question,
        audienceCode,
        body.audienceDescription?.trim().slice(0, 300) || null,
        body.rewardNote?.trim().slice(0, 300) || null,
        body.terms?.trim().slice(0, 4000) || '',
        ['idea_validation', 'product_testing', 'customer_research'].includes(body.serviceKey ?? '') ? body.serviceKey : 'idea_validation',
      ],
    );
  } catch (error) {
    // Two concurrent retries can both pass the lookup above. The unique index
    // decides the winner; the loser returns the same request.
    if (submissionId && isUniqueViolation(error)) {
      const concurrent = await one<{ id: string }>(
        'select id from tests where founder_id = $1 and submission_id = $2',
        [founderId, submissionId],
      );
      if (concurrent) return { id: concurrent.id, existing: true };
    }
    throw error;
  }
  if (!test) throw new ApiError(500, 'server');

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'test.requested', 'test', $2, '{}'::jsonb)`,
    [founderId, test.id],
  );
  await notifyStaff(
    'application_received',
    'New test request',
    'A founder added a test request from their account.',
    `/staff/tests/${test.id}`,
  );
  await notify(
    founderId,
    'request_received',
    'Request received',
    `We received "${title}". The team will scope it and follow up.`,
    `/app/founder/tests/${test.id}`,
  );

  return { id: test.id, existing: false };
}

const DECISIONS = new Set(['build', 'iterate', 'pivot']);

export async function founderReport(founderId: string, id: string) {
  const test = await founderTest(founderId, id);
  if (!test.findings) {
    throw new ApiError(409, "conflict", {
      report: "The findings are not published yet.",
    });
  }

  const findings = test.findings;
  const dateOnly = (value: string | Date | null | undefined) =>
    value ? new Date(value).toISOString().slice(0, 10) : null;
  const markdown = [
    `# ${findings.headline}`,
    "",
    `Prepared for ${test.startupName || "the founder"}`,
    `Test: ${test.title || "Untitled test"}`,
    `Question: ${test.question}`,
    test.audienceDescription
      ? `Audience: ${test.audienceDescription}`
      : test.audienceCode
        ? `Audience: ${test.audienceCode}`
        : null,
    test.method ? `Method: ${test.method}` : null,
    test.sampleTarget ? `Target completions: ${test.sampleTarget}` : null,
    test.reportDueAt ? `Report due: ${dateOnly(test.reportDueAt)}` : null,
    `Report version: ${findings.version}`,
    `Published: ${dateOnly(findings.publishedAt)}`,
    "",
    "## Sample",
    `${test.counts.invited} invited, ${test.counts.accepted} accepted, ` +
      `${test.counts.completed} completed, ${test.counts.responses} response${
        test.counts.responses === 1 ? "" : "s"
      }.`,
    "",
    "## Summary",
    findings.summary,
    "",
    "## Key findings",
    ...findings.learnings.map(
      (learning, index) => `${index + 1}. **${learning.label}** — ${learning.detail}`,
    ),
    "",
    "## Limitations",
    findings.limits || "No limitations were recorded.",
    "",
    "## Recommended next step",
    findings.recommendation || "No next step was recorded.",
    "",
    "## Founder decision",
    test.decision
      ? `${test.decision}${test.decidedAt ? ` (${dateOnly(test.decidedAt)})` : ""}`
      : "No decision recorded yet.",
    "",
    "---",
    "This report contains aggregate findings and no tester identity or contact data.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return {
    filename: `rapid-report-${test.id.slice(0, 8)}.md`,
    markdown,
  };
}

export async function recordFounderDecision(
  founderId: string,
  testId: string,
  request: Request,
) {
  const body = await readJson<{ decision?: string }>(request);
  if (!body.decision || !DECISIONS.has(body.decision)) {
    throw new ApiError(400, 'bad_request', {
      decision: 'Choose build, iterate or pivot.',
    });
  }

  const test = await one<{ id: string; published_at: string | null }>(
    `select t.id, f.published_at
       from tests t
       left join published_findings f on f.test_id = t.id
      where t.id = $1 and t.founder_id = $2`,
    [testId, founderId],
  );
  if (!test) throw new ApiError(404, 'not_found');
  if (!test.published_at) {
    throw new ApiError(409, 'conflict', {
      decision: 'Findings must be published before a decision is recorded.',
    });
  }

  await query(
    `update tests set founder_decision = $2, decided_at = now() where id = $1`,
    [testId, body.decision],
  );
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'test.decision', 'test', $2, $3)`,
    [founderId, testId, JSON.stringify({ decision: body.decision })],
  );

  return { ok: true };
}
