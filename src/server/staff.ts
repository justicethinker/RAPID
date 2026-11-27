import type { PoolClient } from "pg";
import { getPool, one, query } from "./db";
import { sendEmail } from "./email";
import { ApiError, readJson } from "./http";
import { notify } from "./notify";
import { FOUNDER_AUDIENCES } from "../content/pilot";

const APPLICATION_STATUSES = new Set([
  "received",
  "under_review",
  "approved",
  "waitlisted",
  "declined",
  "withdrawn",
]);

const TEST_STATUSES = new Set([
  "requested",
  "scoping",
  "recruiting",
  "fielding",
  "findings",
  "published",
  "closed",
  "cancelled",
]);

// A research request may move forward or back one planning step, but it cannot
// jump from requested to published or be revived after closing. `published` is
// reached only through the findings endpoint, which performs the review gate.
const PAYMENT_STATUSES = new Set([
  "not_required",
  "awaiting_payment",
  "processing",
  "paid",
  "failed",
  "refunded",
  "waived",
]);
const PROJECT_STATUSES = new Set([
  "draft",
  "under_review",
  "awaiting_payment",
  "recruiting",
  "running",
  "reviewing",
  "completed",
  "cancelled",
  "on_hold",
]);

function paymentStatusValue(value: unknown, current: string): string {
  return typeof value === "string" && PAYMENT_STATUSES.has(value) ? value : current;
}

function projectStatusValue(value: unknown, current: string): string {
  if (typeof value === "string" && PROJECT_STATUSES.has(value)) return value;
  return current;
}

const TEST_TRANSITIONS: Record<string, Set<string>> = {
  requested: new Set(["scoping", "cancelled"]),
  scoping: new Set(["requested", "recruiting", "cancelled"]),
  recruiting: new Set(["scoping", "fielding", "cancelled"]),
  fielding: new Set(["recruiting", "findings", "cancelled"]),
  findings: new Set(["fielding", "cancelled"]),
  published: new Set(["closed"]),
  closed: new Set([]),
  cancelled: new Set([]),
};

interface StaffApplicationRow {
  person_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  submission_id: string;
  country_code: string | null;
  city: string | null;
  age_band: string | null;
  situation: string | null;
  other_activities: string[];
  industry: string | null;
  interests: string[];
  frustration: string | null;
  whatsapp: string | null;
  application_status: string;
  applied_at: string;
  review_note: string | null;
}

function mapApplication(row: StaffApplicationRow) {
  return {
    personId: row.person_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    reference: row.submission_id,
    country: row.country_code,
    city: row.city,
    ageBand: row.age_band,
    situation: row.situation,
    otherActivities: row.other_activities,
    industry: row.industry,
    interests: row.interests,
    frustration: row.frustration,
    whatsapp: row.whatsapp,
    status: row.application_status,
    appliedAt: row.applied_at,
    note: row.review_note,
  };
}

export async function staffApplications(request: Request) {
  const params = new URL(request.url).searchParams;
  const status = params.get("status")?.trim() ?? "";
  const q = params.get("q")?.trim().toLowerCase() ?? "";

  const rows = await query<StaffApplicationRow>(
    `select p.id as person_id, p.full_name, p.email, p.phone,
            tp.submission_id, tp.country_code, tp.city, tp.age_band, tp.situation,
            tp.other_activities, tp.industry, tp.interests, tp.frustration, tp.whatsapp,
            tp.application_status, tp.applied_at, tp.review_note
       from tester_profiles tp
       join people p on p.id = tp.person_id
      where ($1 = '' or tp.application_status = $1)
        and ($2 = '' or lower(p.email) like $2 or lower(p.full_name) like $2)
      order by tp.applied_at desc
      limit 200`,
    [status, q ? `%${q}%` : ""],
  );

  return rows.map(mapApplication);
}

export async function staffApplication(personId: string) {
  const row = await one<StaffApplicationRow>(
    `select p.id as person_id, p.full_name, p.email, p.phone,
            tp.submission_id, tp.country_code, tp.city, tp.age_band, tp.situation,
            tp.other_activities, tp.industry, tp.interests, tp.frustration, tp.whatsapp,
            tp.application_status, tp.applied_at, tp.review_note
       from tester_profiles tp
       join people p on p.id = tp.person_id
      where p.id = $1`,
    [personId],
  );
  if (!row) throw new ApiError(404, "not_found");
  return mapApplication(row);
}

const DECISION_COPY: Record<
  string,
  { subject: string; title: string; body: string }
> = {
  approved: {
    subject: "You are approved for the RAPID tester pool",
    title: "Application approved",
    body: "You are approved. When a test matches your experience, an invitation will appear in your account.",
  },
  waitlisted: {
    subject: "Your RAPID application is on the waitlist",
    title: "On the waitlist",
    body: "You are on the waitlist. We will invite you when a test matches your experience.",
  },
  declined: {
    subject: "Your RAPID application",
    title: "Application not selected",
    body: "The team cannot offer you a place in the pilot right now. Reply to this email if you think this was a mistake.",
  },
  under_review: {
    subject: "Your RAPID application is under review",
    title: "Under review",
    body: "The team is reviewing your application. We will email you when there is a decision.",
  },
};

export async function decideApplication(
  staffId: string,
  personId: string,
  request: Request,
  origin: string,
) {
  const body = await readJson<{ status?: string; note?: string }>(request);
  const status = body.status ?? "";
  if (!APPLICATION_STATUSES.has(status)) {
    throw new ApiError(400, "bad_request", {
      status: "Choose a valid decision.",
    });
  }
  const note = (body.note ?? "").trim();
  if (note.length > 1000) {
    throw new ApiError(400, "bad_request", {
      note: "Keep the note under 1,000 characters.",
    });
  }

  const person = await one<{ id: string; email: string; full_name: string }>(
    `select p.id, p.email, p.full_name
       from people p join tester_profiles tp on tp.person_id = p.id
      where p.id = $1`,
    [personId],
  );
  if (!person) throw new ApiError(404, "not_found");

  await query(
    `update tester_profiles
        set application_status = $2, review_note = $3, reviewed_at = now(), reviewed_by = $4
      where person_id = $1`,
    [personId, status, note || null, staffId],
  );
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'application.decision', 'tester', $2, $3)`,
    [staffId, personId, JSON.stringify({ status })],
  );

  const copy = DECISION_COPY[status];
  if (copy) {
    await notify(
      personId,
      "application_decision",
      copy.title,
      copy.body,
      "/app/tester",
    );
    if (
      !person.email.endsWith("@rapid.invalid") &&
      !person.email.endsWith(".rapid.local")
    ) {
      await sendEmail({
        personId,
        to: person.email,
        kind: `application_${status}`,
        subject: copy.subject,
        text: [
          `Hello ${person.full_name || "there"},`,
          "",
          copy.body,
          "",
          `Sign in: ${origin}/sign-in`,
        ].join("\n"),
      });
    }
  }

  return { ok: true };
}

interface StaffTestRow {
  id: string;
  title: string;
  question: string;
  audience_code: string | null;
  audience_description: string | null;
  terms: string;
  reward_note: string | null;
  method: string | null;
  sample_target: number | null;
  report_due_at: string | null;
  status: string;
  service_key: string;
  project_status: string;
  payment_status: string;
  price_amount: string | null;
  price_currency: string | null;
  task_url: string | null;
  task_requires_return: boolean;
  reward_amount: string | null;
  brief_id: string | null;
  created_at: string;
  founder_id: string;
  founder_name: string;
  founder_email: string;
  founder_whatsapp: string | null;
  invited: number;
  accepted: number;
  completed: number;
  responses: number;
}

const STAFF_TEST_SELECT = `
  select t.id, t.title, t.question, t.audience_code, t.audience_description,
         t.terms, t.reward_note, t.method, t.sample_target, t.report_due_at,
         t.status, t.service_key, t.project_status, t.payment_status, t.price_amount::text as price_amount,
         t.price_currency, t.task_url, t.task_requires_return, t.reward_amount::text as reward_amount, t.brief_id, t.created_at,
         p.id as founder_id, p.full_name as founder_name, p.email as founder_email,
         fp.whatsapp as founder_whatsapp,
         (select count(*) from invitations i where i.test_id = t.id)::int as invited,
         (select count(*) from invitations i where i.test_id = t.id and i.status in ('accepted','completed'))::int as accepted,
         (select count(*) from invitations i where i.test_id = t.id and i.status = 'completed')::int as completed,
         (select count(*) from responses r join invitations i on i.id = r.invitation_id where i.test_id = t.id)::int as responses
    from tests t
    join people p on p.id = t.founder_id
    left join founder_profiles fp on fp.person_id = p.id
`;

function mapTest(row: StaffTestRow) {
  return {
    id: row.id,
    title: row.title,
    question: row.question,
    audienceCode: row.audience_code,
    audienceDescription: row.audience_description,
    terms: row.terms,
    rewardNote: row.reward_note,
    method: row.method,
    sampleTarget: row.sample_target,
    reportDueAt: row.report_due_at,
    status: row.status,
    serviceKey: row.service_key,
    projectStatus: row.project_status,
    paymentStatus: row.payment_status,
    priceAmount: row.price_amount ? Number(row.price_amount) : null,
    priceCurrency: row.price_currency,
    taskUrl: row.task_url,
    taskRequiresReturn: row.task_requires_return,
    rewardAmount: row.reward_amount ? Number(row.reward_amount) : null,
    briefId: row.brief_id,
    createdAt: row.created_at,
    founder: {
      id: row.founder_id,
      name: row.founder_name,
      email: row.founder_email,
      whatsapp: row.founder_whatsapp,
    },
    counts: {
      invited: row.invited,
      accepted: row.accepted,
      completed: row.completed,
      responses: row.responses,
    },
  };
}

export async function staffTests(request: Request) {
  const params = new URL(request.url).searchParams;
  const status = params.get("status")?.trim() ?? "";
  const rows = await query<StaffTestRow>(
    `${STAFF_TEST_SELECT}
      where ($1 = '' or t.status = $1)
      order by t.created_at desc
      limit 200`,
    [status],
  );
  return rows.map(mapTest);
}

export async function staffTest(id: string) {
  const row = await one<StaffTestRow>(`${STAFF_TEST_SELECT} where t.id = $1`, [
    id,
  ]);
  if (!row) throw new ApiError(404, "not_found");

  const invitations = await query<{
    id: string;
    status: string;
    invited_at: string;
    responded_at: string | null;
    completed_at: string | null;
    reward_status: string;
    tester_id: string;
    full_name: string;
    email: string;
    outcome: string | null;
    note: string | null;
    consent_to_quote: boolean | null;
    submitted_at: string | null;
  }>(
    `select i.id, i.status, i.invited_at, i.responded_at, i.completed_at, i.reward_status,
            p.id as tester_id, p.full_name, p.email,
            r.outcome, r.note, r.consent_to_quote, r.submitted_at
       from invitations i
       join people p on p.id = i.tester_id
       left join responses r on r.invitation_id = i.id
      where i.test_id = $1
      order by i.invited_at desc`,
    [id],
  );

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
       from findings where test_id = $1`,
    [id],
  );

  return {
    ...mapTest(row),
    invitations: invitations.map((invitation) => ({
      id: invitation.id,
      status: invitation.status,
      invitedAt: invitation.invited_at,
      respondedAt: invitation.responded_at,
      completedAt: invitation.completed_at,
      rewardStatus: invitation.reward_status,
      tester: {
        id: invitation.tester_id,
        name: invitation.full_name,
        email: invitation.email,
      },
      response: invitation.outcome
        ? {
            outcome: invitation.outcome,
            note: invitation.note,
            consentToQuote: invitation.consent_to_quote,
            submittedAt: invitation.submitted_at,
          }
        : null,
    })),
    findings: findings
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

export async function updateStaffTest(
  staffId: string,
  id: string,
  request: Request,
) {
  const body = await readJson<{
    title?: string;
    question?: string;
    terms?: string;
    rewardNote?: string;
    audienceCode?: string;
    audienceDescription?: string;
    method?: string;
    sampleTarget?: number | string | null;
    reportDueAt?: string | null;
    status?: string;
    serviceKey?: string;
    projectStatus?: string;
    paymentStatus?: string;
    priceAmount?: number | string | null;
    priceCurrency?: string;
    taskUrl?: string | null;
    taskRequiresReturn?: boolean;
    rewardAmount?: number | string | null;
  }>(request);

  const current = await one<{
    title: string;
    question: string;
    terms: string;
    reward_note: string | null;
    audience_code: string | null;
    audience_description: string | null;
    method: string | null;
    sample_target: number | null;
    report_due_at: string | null;
    status: string;
    founder_id: string;
    service_key: string;
    project_status: string;
    payment_status: string;
    price_amount: string | null;
    price_currency: string | null;
    task_url: string | null;
    task_requires_return: boolean;
    reward_amount: string | null;
  }>(
    `select title, question, terms, reward_note, audience_code, audience_description,
            method, sample_target, report_due_at, status, founder_id,
            service_key, project_status, payment_status, price_amount::text as price_amount,
            price_currency, task_url, task_requires_return, reward_amount::text as reward_amount
       from tests where id = $1`,
    [id],
  );
  if (!current) throw new ApiError(404, "not_found");

  const question = body.question?.trim() ?? current.question;
  if (question.length < 20 || question.length > 1000) {
    throw new ApiError(400, "bad_request", {
      question: "Keep the question between 20 and 1,000 characters.",
    });
  }
  const status = body.status ?? current.status;
  if (!TEST_STATUSES.has(status)) {
    throw new ApiError(400, "bad_request", {
      status: "Choose a valid test status.",
    });
  }
  if (status === "published" && current.status !== "published") {
    throw new ApiError(409, "conflict", {
      status: "Publish the report from the findings panel instead.",
    });
  }
  if (
    status !== current.status &&
    !TEST_TRANSITIONS[current.status]?.has(status)
  ) {
    throw new ApiError(409, "conflict", {
      status: `A ${current.status} test cannot move directly to ${status}.`,
    });
  }
  const terms = body.terms?.trim() ?? current.terms;
  if (terms.length > 4000) {
    throw new ApiError(400, "bad_request", {
      terms: "Keep the terms under 4,000 characters.",
    });
  }

  const method = body.method?.trim() ?? current.method;
  if (method && method.length > 500) {
    throw new ApiError(400, "bad_request", {
      method: "Keep the method under 500 characters.",
    });
  }

  let sampleTarget = current.sample_target;
  if (body.sampleTarget !== undefined) {
    if (body.sampleTarget === null || body.sampleTarget === "") {
      sampleTarget = null;
    } else {
      const parsed = Number(body.sampleTarget);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
        throw new ApiError(400, "bad_request", {
          sampleTarget: "Enter a whole-number target between 1 and 1,000.",
        });
      }
      sampleTarget = parsed;
    }
  }

  let reportDueAt = current.report_due_at;
  if (body.reportDueAt !== undefined) {
    if (!body.reportDueAt) {
      reportDueAt = null;
    } else {
      const date = new Date(body.reportDueAt);
      if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, "bad_request", {
          reportDueAt: "Choose a valid report date.",
        });
      }
      reportDueAt = date.toISOString();
    }
  }

  const serviceKey = body.serviceKey === undefined
    ? current.service_key
    : ['idea_validation', 'product_testing', 'customer_research'].includes(body.serviceKey) ? body.serviceKey : current.service_key;
  let priceAmount = current.price_amount ? Number(current.price_amount) : null;
  if (body.priceAmount !== undefined) {
    if (body.priceAmount === null || body.priceAmount === '') priceAmount = null;
    else {
      const parsed = Number(body.priceAmount);
      if (!Number.isInteger(parsed) || parsed < 0) throw new ApiError(400, 'bad_request', { priceAmount: 'Enter a non-negative integer price in kobo.' });
      priceAmount = parsed;
    }
  }
  let rewardAmount = current.reward_amount ? Number(current.reward_amount) : null;
  if (body.rewardAmount !== undefined) {
    if (body.rewardAmount === null || body.rewardAmount === '') rewardAmount = null;
    else {
      const parsed = Number(body.rewardAmount);
      if (!Number.isInteger(parsed) || parsed < 0) throw new ApiError(400, 'bad_request', { rewardAmount: 'Enter a non-negative integer reward in kobo.' });
      rewardAmount = parsed;
    }
  }
  const paymentStatus = paymentStatusValue(body.paymentStatus, current.payment_status);
  if (paymentStatus === 'paid' && current.payment_status !== 'paid') {
    throw new ApiError(409, 'conflict', { payment: 'Only a verified payment can mark this test paid.' });
  }
  const priceCurrency = (body.priceCurrency?.trim() || current.price_currency || "NGN").toUpperCase();
  const projectStatus = projectStatusValue(body.projectStatus, current.project_status);
  if (['recruiting', 'fielding', 'findings'].includes(status) ||
      ['recruiting', 'running', 'reviewing'].includes(projectStatus)) {
    await requireRecruitmentPayment(id, priceAmount, priceCurrency, paymentStatus);
  }
  const audienceCode =
    body.audienceCode === undefined
      ? current.audience_code
      : body.audienceCode?.trim() || null;
  if (
    audienceCode &&
    !FOUNDER_AUDIENCES.some((audience) => audience.code === audienceCode)
  ) {
    throw new ApiError(400, "bad_request", {
      audienceCode: "Choose a valid audience.",
    });
  }

  const updated = await one(
    `update tests
        set title = $2, question = $3, terms = $4, reward_note = $5,
            audience_code = $6, audience_description = $7, status = $8,
            method = $9, sample_target = $10, report_due_at = $11,
            service_key = $12, project_status = $13, payment_status = $14,
            price_amount = $15, price_currency = $16, task_url = $17,
            task_requires_return = $18, reward_amount = $19
      where id = $1 and payment_status = $20 and status = $21
        and price_amount is not distinct from $22 and project_status = $23
      returning id`,
    [
      id,
      (body.title?.trim() || current.title || question.slice(0, 80)).slice(0, 120),
      question,
      terms,
      body.rewardNote?.trim() ?? current.reward_note,
      audienceCode,
      body.audienceDescription?.trim() ?? current.audience_description,
      status,
      method,
      sampleTarget,
      reportDueAt,
      serviceKey,
      projectStatus,
      paymentStatus,
      priceAmount,
      priceCurrency,
      body.taskUrl?.trim() || null,
      Boolean(body.taskRequiresReturn ?? current.task_requires_return),
      rewardAmount,
      current.payment_status, current.status, current.price_amount, current.project_status,
    ],
  );

  if (!updated) throw new ApiError(409, 'conflict', { status: 'The project changed. Refresh before saving.' });

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'test.updated', 'test', $2, $3)`,
    [staffId, id, JSON.stringify({ from: current.status, status })],
  );

  if (status !== current.status) {
    await notify(
      current.founder_id,
      "research_status",
      "Research update",
      `Your test "${current.title || "Untitled test"}" moved to ${status}.`,
      `/app/founder/tests/${id}`,
    );
  }

  return { ok: true };
}

export async function staffCandidates(testId: string, request: Request) {
  const params = new URL(request.url).searchParams;
  const country = params.get("country")?.trim() ?? "";
  const situation = params.get("situation")?.trim() ?? "";
  const interest = params.get("interest")?.trim() ?? "";
  const q = params.get("q")?.trim().toLowerCase() ?? "";

  const rows = await query<{
    person_id: string;
    full_name: string;
    email: string;
    city: string | null;
    country_code: string | null;
    situation: string | null;
    interests: string[];
    age_band: string | null;
    industry: string | null;
    application_status: string;
  }>(
    `select p.id as person_id, p.full_name, p.email,
            tp.city, tp.country_code, tp.situation, tp.interests, tp.age_band, tp.industry, tp.application_status
       from tester_profiles tp
       join people p on p.id = tp.person_id
      where tp.application_status = 'approved'
        and p.state = 'active'
        and not exists (
          select 1 from invitations i where i.test_id = $1 and i.tester_id = p.id
        )
        and ($2 = '' or tp.country_code = $2)
        and ($3 = '' or tp.situation = $3)
        and ($4 = '' or $4 = any(tp.interests))
        and ($5 = '' or lower(p.email) like $5 or lower(p.full_name) like $5)
      order by tp.applied_at
      limit 200`,
    [testId, country, situation, interest, q ? `%${q}%` : ""],
  );

  const rules = await query<{ rule_type: string; operator: string; value: Record<string, unknown> }>(
    `select rule_type, operator, value from eligibility_rules where test_id = $1`,
    [testId],
  );
  const eligible = rows.filter((row) => rules.every((rule) => {
    const values = Array.isArray(rule.value?.values) ? rule.value.values.map(String) : Array.isArray(rule.value?.value) ? rule.value.value.map(String) : [];
    const single = typeof rule.value?.value === "string" ? rule.value.value : typeof rule.value?.values === "string" ? rule.value.values : "";
    const candidates = values.length ? values : single ? [single] : [];
    if (!candidates.length) return true;
    switch (rule.rule_type) {
      case "country": return row.country_code !== null && candidates.includes(row.country_code);
      case "age_band": return row.age_band !== null && candidates.includes(row.age_band);
      case "situation": return row.situation !== null && candidates.includes(row.situation);
      case "interest": return row.interests.some((interest) => candidates.includes(interest));
      case "industry": return row.industry !== null && candidates.includes(row.industry);
      case "screener": return true;
      default: return true;
    }
  }));

  return eligible.map((row) => ({
    id: row.person_id,
    name: row.full_name,
    email: row.email,
    city: row.city,
    country: row.country_code,
    situation: row.situation,
    interests: row.interests,
    ageBand: row.age_band,
    industry: row.industry,
    matchReasons: rules.filter((rule) => rule.rule_type !== "screener").map((rule) => rule.rule_type),
  }));
}

async function requireRecruitmentPayment(
  testId: string,
  price: number | null,
  currency: string,
  paymentStatus: string,
  client: Pick<PoolClient, 'query'> = getPool(),
) {
  if (!price) return;
  if (paymentStatus === 'paid') {
    const receipt = await client.query(
      `select 1 from payments where test_id = $1 and amount_kobo = $2 and currency = $3
       and status = 'paid' and provider_status = 'success' and paid_at is not null limit 1`,
      [testId, price, currency],
    );
    if (receipt.rowCount) return;
  }
  throw new ApiError(409, 'conflict', { payment: 'Payment must be verified before recruitment.' });
}

export async function inviteTesters(
  staffId: string,
  testId: string,
  request: Request,
  origin: string,
) {
  const body = await readJson<{ testerIds?: string[] }>(request);
  const testerIds = Array.isArray(body.testerIds)
    ? [
        ...new Set(
          body.testerIds.filter((id): id is string => typeof id === "string"),
        ),
      ]
    : [];
  if (!testerIds.length || testerIds.length > 100) {
    throw new ApiError(400, "bad_request", {
      testerIds: "Choose between 1 and 100 testers.",
    });
  }

  const client = await getPool().connect();
  let test;
  let invited;
  try {
    await client.query('begin');
    const result = await client.query<{
      title: string; terms: string; method: string | null; reward_note: string | null;
      status: string; founder_id: string; price_amount: string | null; price_currency: string; payment_status: string;
    }>(
      `select title, terms, method, reward_note, status, founder_id, price_amount, price_currency, payment_status
       from tests where id = $1 for update`, [testId],
    );
    test = result.rows[0];
    if (!test) throw new ApiError(404, 'not_found');
    await requireRecruitmentPayment(testId, Number(test.price_amount), test.price_currency, test.payment_status, client);
    const inserted = await client.query<{ testerId: string; invitationId: string }>(
      `insert into invitations (test_id, tester_id, invited_by)
       select $1, tester_id, $3 from unnest($2::uuid[]) as tester_id
       on conflict (test_id, tester_id) do nothing
       returning tester_id as "testerId", id as "invitationId"`,
      [testId, testerIds, staffId],
    );
    invited = inserted.rows;
    if (invited.length && (test.status === 'requested' || test.status === 'scoping')) {
      await client.query("update tests set status = 'recruiting' where id = $1", [testId]);
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }

  if (invited.length) {
    const recipients = await query<{
      id: string;
      email: string;
      full_name: string;
    }>(`select id, email, full_name from people where id = any($1::uuid[])`, [
      invited.map((entry) => entry.testerId),
    ]);
    const invitationByTester = new Map(
      invited.map((entry) => [entry.testerId, entry.invitationId]),
    );

    for (const person of recipients) {
      await notify(
        person.id,
        "invitation",
        `Invitation: ${test.title || "a RAPID test"}`,
        test.terms ||
          "Open the invitation to read the task and choose whether to take part.",
        `/app/tester/invitations/${invitationByTester.get(person.id)}`,
      );
      if (
        !person.email.endsWith("@rapid.invalid") &&
        !person.email.endsWith(".rapid.local")
      ) {
        await sendEmail({
          personId: person.id,
          to: person.email,
          kind: "invitation",
          subject: `You are invited: ${test.title || "a RAPID test"}`,
          text: [
            `Hello ${person.full_name || "there"},`,
            "",
            "You have a new invitation from RAPID.",
            "",
            test.terms || "Open your account to read the task and decide.",
            test.method ? `How to take part: ${test.method}` : "",
            test.reward_note ? `Reward: ${test.reward_note}` : "",
            "",
            `Read it and respond: ${origin}/app/tester/invitations`,
          ]
            .filter((line) => line !== "")
            .join("\n"),
        });
      }
    }

    await query(
      `insert into audit_events (actor_id, action, entity, entity_id, meta)
       values ($1, 'invitations.created', 'test', $2, $3)`,
      [staffId, testId, JSON.stringify({ count: invited.length })],
    );

    if (test.status === "requested" || test.status === "scoping") {
      await notify(
        test.founder_id,
        "research_status",
        "Research update",
        `Your test "${test.title || "Untitled test"}" moved to recruiting.`,
        `/app/founder/tests/${testId}`,
      );
    }
  }

  return { invited: invited.length };
}

export async function saveFindings(
  staffId: string,
  testId: string,
  request: Request,
) {
  const body = await readJson<{
    headline?: string;
    summary?: string;
    limits?: string;
    recommendation?: string;
    learnings?: { label?: string; detail?: string }[];
  }>(request);

  const headline = (body.headline ?? "").trim();
  const summary = (body.summary ?? "").trim();
  const limits = (body.limits ?? "").trim();
  const recommendation = (body.recommendation ?? "").trim();
  if (headline.length < 3 || headline.length > 160) {
    throw new ApiError(400, "bad_request", {
      headline: "Write a headline (3–160 characters).",
    });
  }
  if (summary.length < 20 || summary.length > 5000) {
    throw new ApiError(400, "bad_request", {
      summary: "Write a summary (20–5,000 characters).",
    });
  }
  if (limits.length > 2000) {
    throw new ApiError(400, "bad_request", {
      limits: "Keep limits under 2,000 characters.",
    });
  }
  if (recommendation.length > 1000) {
    throw new ApiError(400, "bad_request", {
      recommendation: "Keep the recommended next step under 1,000 characters.",
    });
  }

  const learnings = (body.learnings ?? [])
    .map((item) => ({
      label: (item.label ?? "").trim().slice(0, 120),
      detail: (item.detail ?? "").trim().slice(0, 1000),
    }))
    .filter((item) => item.label || item.detail)
    .slice(0, 12);
  if (!learnings.length) {
    throw new ApiError(400, "bad_request", {
      learnings: "Add at least one learning.",
    });
  }

  const test = await one<{
    id: string;
    founder_id: string;
    title: string;
    status: string;
  }>("select id, founder_id, title, status from tests where id = $1", [testId]);
  if (!test) throw new ApiError(404, "not_found");

  await query(
    `insert into findings
       (test_id, headline, summary, learnings, limits, recommendation, authored_by)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (test_id) do update
       set headline = excluded.headline,
           summary = excluded.summary,
           learnings = excluded.learnings,
           limits = excluded.limits,
           recommendation = excluded.recommendation,
           authored_by = excluded.authored_by,
           version = findings.version + 1`,
    [
      testId,
      headline,
      summary,
      JSON.stringify(learnings),
      limits,
      recommendation,
      staffId,
    ],
  );

  // Saving the report draft is the natural point to move a fielded test into
  // review. Publishing remains a separate, explicit action.
  await query(
    `update tests
        set status = 'findings'
      where id = $1 and status not in ('published', 'closed', 'cancelled')`,
    [testId],
  );

  if (!['findings', 'published', 'closed', 'cancelled'].includes(test.status)) {
    await notify(
      test.founder_id,
      "research_status",
      "Research update",
      `Your test "${test.title || "Untitled test"}" moved to findings.`,
      `/app/founder/tests/${testId}`,
    );
  }

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'findings.saved', 'test', $2, '{}'::jsonb)`,
    [staffId, testId],
  );

  return { ok: true };
}

export async function publishFindings(
  staffId: string,
  testId: string,
  origin: string,
) {
  const test = await one<{
    founder_id: string;
    title: string;
    founder_email: string;
    founder_name: string;
  }>(
    `select t.founder_id, t.title, p.email as founder_email, p.full_name as founder_name
       from tests t join people p on p.id = t.founder_id
      where t.id = $1`,
    [testId],
  );
  if (!test) throw new ApiError(404, "not_found");

  const published = await one<{ id: string }>(
    `with revision as (
       update findings set published_at = now() where test_id = $1
       returning test_id, headline, summary, learnings, limits, recommendation, version, published_at
     ), snapshot as (
       insert into published_findings (test_id, headline, summary, learnings, limits, recommendation, version, published_at)
       select test_id, headline, summary, learnings, limits, recommendation, version, published_at from revision
       on conflict (test_id) do update
       set (headline, summary, learnings, limits, recommendation, version, published_at) =
           (excluded.headline, excluded.summary, excluded.learnings, excluded.limits, excluded.recommendation, excluded.version, excluded.published_at)
       returning test_id, published_at
     )
     update tests t set status = 'published', published_at = coalesce(t.published_at, snapshot.published_at)
     from snapshot where t.id = snapshot.test_id returning t.id`,
    [testId],
  );
  if (!published) throw new ApiError(409, "conflict", { findings: "Save findings first." });
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'findings.published', 'test', $2, '{}'::jsonb)`,
    [staffId, testId],
  );

  await notify(
    test.founder_id,
    "findings_published",
    "Findings published",
    `Findings for "${test.title || "your test"}" are ready to read.`,
    `/app/founder/tests/${testId}`,
  );

  if (
    !test.founder_email.endsWith("@rapid.invalid") &&
    !test.founder_email.endsWith(".rapid.local")
  ) {
    await sendEmail({
      personId: test.founder_id,
      to: test.founder_email,
      kind: "findings_published",
      subject: "Your RAPID findings are ready",
      text: [
        `Hello ${test.founder_name || "there"},`,
        "",
        `Findings for "${test.title || "your test"}" are published.`,
        `Read them and record your decision: ${origin}/app/founder/tests/${testId}`,
      ].join("\n"),
    });
  }

  return { ok: true };
}

export async function sentReward(staffId: string, invitationId: string, request?: Request) {
  const body = request ? await readJson<{ amount?: number; method?: string; reference?: string }>(request) : {};
  const invitation = await one<{
    id: string;
    tester_id: string;
    status: string;
    test_title: string;
    reward_amount: string | null;
  }>(
    `select i.id, i.tester_id, i.status, t.title as test_title, t.reward_amount::text as reward_amount
       from invitations i join tests t on t.id = i.test_id
      where i.id = $1`,
    [invitationId],
  );
  if (!invitation) throw new ApiError(404, "not_found");
  if (invitation.status !== "completed") {
    throw new ApiError(409, "conflict", {
      reward: "A reward can only be marked after the response is submitted.",
    });
  }

  const amount = body.amount !== undefined ? Math.max(0, Math.floor(Number(body.amount) || 0)) : invitation.reward_amount ? Number(invitation.reward_amount) : 0;
  if (amount > 0) {
    await query(
      `insert into reward_ledger (invitation_id, tester_id, amount_kobo, method, status, reference, created_by, paid_by, paid_at)
       values ($1, $2, $3, $4, 'paid', $5, $6, $6, now())
       on conflict (invitation_id, status) do nothing`,
      [invitationId, invitation.tester_id, amount, (body.method ?? 'manual').trim() || 'manual', (body.reference ?? '').trim() || null, staffId],
    );
  }
  await query(
    `update invitations set reward_status = 'sent', reward_sent_at = now() where id = $1`,
    [invitationId],
  );
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'reward.sent', 'invitation', $2, '{}'::jsonb)`,
    [staffId, invitationId],
  );
  await notify(
    invitation.tester_id,
    "reward_sent",
    "Reward sent",
    `The reward for "${invitation.test_title || "your test"}" has been marked as sent.`,
    "/app/tester/history",
  );

  return { ok: true };
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  const neutralised = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${neutralised.replaceAll('"', '""')}"`;
}

function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");
}

export async function exportCsv(type: string) {
  const date = new Date().toISOString().slice(0, 10);

  if (type === "testers") {
    const rows = await query<{
      full_name: string;
      email: string;
      phone: string | null;
      country_code: string | null;
      city: string | null;
      age_band: string | null;
      situation: string | null;
      interests: string[];
      application_status: string;
      applied_at: string;
    }>(
      `select p.full_name, p.email, p.phone, tp.country_code, tp.city, tp.age_band,
              tp.situation, tp.interests, tp.application_status, tp.applied_at
         from tester_profiles tp join people p on p.id = tp.person_id
        order by tp.applied_at`,
    );
    return {
      filename: `rapid-testers-${date}.csv`,
      csv: toCsv(
        [
          "Name",
          "Email",
          "Phone",
          "Country",
          "City",
          "Age band",
          "Situation",
          "Interests",
          "Status",
          "Applied",
        ],
        rows.map((row) => [
          row.full_name,
          row.email,
          row.phone,
          row.country_code,
          row.city,
          row.age_band,
          row.situation,
          row.interests.join("; "),
          row.application_status,
          row.applied_at,
        ]),
      ),
    };
  }

  if (type === "founders") {
    const rows = await query<{
      full_name: string;
      email: string;
      whatsapp: string | null;
      organisation: string | null;
      tests: number;
    }>(
      `select p.full_name, p.email, fp.whatsapp, fp.organisation,
              (select count(*) from tests t where t.founder_id = p.id)::int as tests
         from founder_profiles fp join people p on p.id = fp.person_id
        order by p.created_at`,
    );
    return {
      filename: `rapid-founders-${date}.csv`,
      csv: toCsv(
        ["Name", "Email", "WhatsApp", "Organisation", "Requests"],
        rows.map((row) => [
          row.full_name,
          row.email,
          row.whatsapp,
          row.organisation,
          row.tests,
        ]),
      ),
    };
  }

  if (type === "invitations") {
    const rows = await query<{
      test_title: string;
      full_name: string;
      email: string;
      status: string;
      reward_status: string;
      invited_at: string;
      completed_at: string | null;
    }>(
      `select t.title as test_title, p.full_name, p.email, i.status, i.reward_status,
              i.invited_at, i.completed_at
         from invitations i
         join tests t on t.id = i.test_id
         join people p on p.id = i.tester_id
        order by i.invited_at desc`,
    );
    return {
      filename: `rapid-invitations-${date}.csv`,
      csv: toCsv(
        [
          "Test",
          "Tester",
          "Email",
          "Invitation",
          "Reward",
          "Invited",
          "Completed",
        ],
        rows.map((row) => [
          row.test_title,
          row.full_name,
          row.email,
          row.status,
          row.reward_status,
          row.invited_at,
          row.completed_at,
        ]),
      ),
    };
  }

  throw new ApiError(400, "bad_request", {
    type: "Choose testers, founders or invitations.",
  });
}

/*
 * Staff access. There is no public admin sign-up: the first admin comes from
 * the STAFF_EMAILS allowlist, and every later one is invited here by an admin.
 * An invite is claimed the first time the invited address loads its account.
 */

export async function staffTeam() {
  const members = await query<{
    person_id: string;
    full_name: string;
    email: string;
    granted_at: string;
  }>(
    `select p.id as person_id, p.full_name, p.email, sm.granted_at
       from staff_members sm
       join people p on p.id = sm.person_id
      where p.state = 'active'
      order by sm.granted_at`,
  );

  const invites = await query<{
    email: string;
    created_at: string;
    invited_by_name: string | null;
  }>(
    `select si.email, si.created_at, p.full_name as invited_by_name
       from staff_invites si
       left join people p on p.id = si.invited_by
      where si.accepted_at is null
      order by si.created_at desc`,
  );

  return {
    members: members.map((row) => ({
      personId: row.person_id,
      name: row.full_name,
      email: row.email,
      grantedAt: row.granted_at,
    })),
    invites: invites.map((row) => ({
      email: row.email,
      invitedAt: row.created_at,
      invitedBy: row.invited_by_name,
    })),
  };
}

export async function inviteStaff(
  staffId: string,
  request: Request,
  origin: string,
) {
  const body = await readJson<{ email?: string }>(request);
  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new ApiError(400, "validation", {
      email: "Enter a valid email address, like name@example.com.",
    });
  }

  const existing = await one<{ id: string }>(
    `select p.id
       from people p join staff_members sm on sm.person_id = p.id
      where lower(p.email) = $1`,
    [email],
  );
  if (existing) {
    throw new ApiError(400, "validation", {
      email: "That address already has staff access.",
    });
  }

  await query(
    `insert into staff_invites (email, invited_by)
     values ($1, $2)
     on conflict (email) do update
       set invited_by = excluded.invited_by,
           created_at = now(),
           accepted_at = null`,
    [email, staffId],
  );
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'staff.invited', 'person', $2, '{}'::jsonb)`,
    [staffId, email],
  );

  await sendEmail({
    to: email,
    kind: "staff_invite",
    subject: "You have RAPID admin access",
    text: [
      "You have been invited to run the RAPID pilot.",
      "",
      "Create an account with this email address. Staff access is granted",
      "automatically once you sign in.",
      "",
      `Open admin access: ${origin}/admin`,
      "",
      "If you were not expecting this, ignore this email and tell the team.",
    ].join("\n"),
  });

  return { ok: true };
}

export async function revokeStaffInvite(staffId: string, email: string) {
  const removed = await query<{ email: string }>(
    "delete from staff_invites where lower(email) = lower($1) returning email",
    [email],
  );
  if (!removed[0]) throw new ApiError(404, "not_found");

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'staff.invite.revoked', 'person', $2, '{}'::jsonb)`,
    [staffId, removed[0].email],
  );
  return { ok: true };
}

export async function removeStaffMember(staffId: string, personId: string) {
  if (personId === staffId) {
    throw new ApiError(409, "conflict", {
      staff: "You cannot remove your own staff access.",
    });
  }

  const member = await one<{ id: string }>(
    `select p.id from people p join staff_members sm on sm.person_id = p.id
      where p.id = $1`,
    [personId],
  );
  if (!member) throw new ApiError(404, "not_found");

  const count = await one<{ count: string }>(
    "select count(*)::text as count from staff_members",
  );
  if (Number(count?.count ?? 0) <= 1) {
    throw new ApiError(409, "conflict", {
      staff: "At least one staff member must keep access.",
    });
  }

  await query("delete from staff_members where person_id = $1", [personId]);
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'staff.removed', 'person', $2, '{}'::jsonb)`,
    [staffId, personId],
  );
  return { ok: true };
}

export async function anonymisePerson(staffId: string, personId: string) {
  const person = await one<{ id: string }>(
    "select id from people where id = $1",
    [personId],
  );
  if (!person) throw new ApiError(404, "not_found");

  await query(
    `update people
        set email = $2, full_name = 'Deleted participant', phone = null,
            state = 'deleted', updated_at = now()
      where id = $1`,
    [personId, `deleted-${personId}@rapid.invalid`],
  );
  await query(
    `update tester_profiles
        set city = null, industry = null, industry_other = null, interests_other = null,
            frustration = null, whatsapp = null, whatsapp_reminders = false,
            hear_about = null, review_note = null, source = '{}'::jsonb,
            application_status = 'withdrawn'
      where person_id = $1`,
    [personId],
  );
  await query(
    `update founder_profiles set whatsapp = null, organisation = null where person_id = $1`,
    [personId],
  );
  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'person.anonymised', 'person', $2, '{}'::jsonb)`,
    [staffId, personId],
  );

  return { ok: true };
}
