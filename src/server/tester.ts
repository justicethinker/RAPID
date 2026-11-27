import { one, query } from "./db";
import { ApiError, readJson } from "./http";
import { notify } from "./notify";
import { normalisePhone } from "../lib/submission-schema";

interface InvitationRow {
  id: string;
  status: string;
  invited_at: string;
  responded_at: string | null;
  completed_at: string | null;
  reward_status: string;
  reward_sent_at: string | null;
  test_id: string;
  title: string;
  question: string;
  terms: string;
  method: string | null;
  reward_note: string | null;
  test_status: string;
  service_key: string;
  project_status: string;
  reward_amount: string | null;
  task_requires_return: boolean;
  task_url: string | null;
}

const INVITATION_SELECT = `
  select i.id, i.status, i.invited_at, i.responded_at, i.completed_at,
         i.reward_status, i.reward_sent_at,
         t.id as test_id, t.title, t.question, t.terms, t.method, t.reward_note,
         t.status as test_status, t.service_key, t.project_status,
         t.reward_amount::text as reward_amount, t.task_requires_return, t.task_url
    from invitations i
    join tests t on t.id = i.test_id
`;

function mapInvitation(row: InvitationRow) {
  return {
    id: row.id,
    status: row.status,
    invitedAt: row.invited_at,
    respondedAt: row.responded_at,
    completedAt: row.completed_at,
    rewardStatus: row.reward_status,
    rewardSentAt: row.reward_sent_at,
    test: {
      id: row.test_id,
      title: row.title,
      question: row.question,
      terms: row.terms,
      method: row.method,
      rewardNote: row.reward_note,
      status: row.test_status,
      serviceKey: row.service_key,
      projectStatus: row.project_status,
      rewardAmount: row.reward_amount ? Number(row.reward_amount) : null,
      taskRequiresReturn: row.task_requires_return,
      taskUrl: row.task_url,
    },
  };
}

async function loadProfile(personId: string) {
  const profile = await one<{
    submission_id: string;
    city: string | null;
    age_band: string | null;
    situation: string | null;
    interests: string[];
    frustration: string | null;
    whatsapp: string | null;
    whatsapp_reminders: boolean;
    application_status: string;
    applied_at: string;
  }>(
    `select submission_id, city, age_band, situation, interests, frustration,
            whatsapp, whatsapp_reminders, application_status, applied_at
       from tester_profiles where person_id = $1`,
    [personId],
  );
  if (!profile) throw new ApiError(404, "not_found");
  return profile;
}

export async function testerOverview(personId: string) {
  const profile = await loadProfile(personId);

  const [counts, recent] = await Promise.all([
    one<{ total: number; active: number; completed: number }>(
      `select count(*)::int as total,
              count(*) filter (where status in ('invited','accepted'))::int as active,
              count(*) filter (where status = 'completed')::int as completed
         from invitations where tester_id = $1`,
      [personId],
    ),
    query<InvitationRow>(
      `${INVITATION_SELECT}
        where i.tester_id = $1
        order by i.invited_at desc
        limit 3`,
      [personId],
    ),
  ]);

  const active = counts?.active ?? 0;
  const nextAction =
    profile.application_status === "received"
      ? "Wait for the team to review your application. We aim to reply within three business days."
      : profile.application_status === "under_review"
        ? "No action needed. The team is reviewing your application."
        : active > 0
          ? "You have an invitation waiting. Open it to read the terms and respond."
          : profile.application_status === "approved"
            ? "You are approved. Invitations appear here when a test matches your experience."
            : "No action needed right now. We will email you when the status changes.";

  return {
    application: {
      status: profile.application_status,
      reference: profile.submission_id,
      appliedAt: profile.applied_at,
      city: profile.city,
      ageBand: profile.age_band,
      situation: profile.situation,
      interests: profile.interests,
      whatsapp: profile.whatsapp,
      whatsappReminders: profile.whatsapp_reminders,
    },
    counts: {
      invitations: counts?.total ?? 0,
      active,
      completed: counts?.completed ?? 0,
    },
    nextAction,
    recent: recent.map(mapInvitation),
  };
}

export async function listTesterInvitations(personId: string) {
  const rows = await query<InvitationRow>(
    `${INVITATION_SELECT}
      where i.tester_id = $1
      order by i.invited_at desc`,
    [personId],
  );
  return rows.map(mapInvitation);
}

export async function testerInvitation(personId: string, id: string) {
  const row = await one<InvitationRow>(
    `${INVITATION_SELECT} where i.id = $1 and i.tester_id = $2`,
    [id, personId],
  );
  if (!row) throw new ApiError(404, "not_found");

  const response = await one<{
    outcome: string;
    note: string;
    consent_to_quote: boolean;
    submitted_at: string;
  }>(
    `select outcome, note, consent_to_quote, submitted_at
       from responses where invitation_id = $1`,
    [id],
  );

  const steps = await query<{ id: string; position: number; step_type: string; prompt: string; options: unknown; required: boolean; metadata: unknown; answer: unknown }>(
    `select s.id, s.position, s.step_type, s.prompt, s.options, s.required, s.metadata, a.answer
       from study_steps s left join response_answers a on a.step_id = s.id and a.invitation_id = $1
      where s.test_id = $2 order by s.position`,
    [id, row.test_id],
  );
  const screeners = await query<{ id: string; position: number; question: string; options: unknown; required: boolean; answer: unknown }>(
    `select s.id, s.position, s.question, s.options, s.required, a.answer
       from study_screeners s left join screener_answers a on a.screener_id = s.id and a.invitation_id = $1
      where s.test_id = $2 order by s.position`,
    [id, row.test_id],
  );
  const actionRow = await one<{ state: string; self_reported_outcome: string | null; reason: string | null; verified_at: string | null; opened_at: string | null; opened_count: number }>(
    `select state, self_reported_outcome, reason, verified_at, opened_at, opened_count from task_actions where invitation_id = $1`,
    [id],
  );

  return {
    ...mapInvitation(row),
    response: response
      ? {
          outcome: response.outcome,
          note: response.note,
          consentToQuote: response.consent_to_quote,
          submittedAt: response.submitted_at,
        }
      : null,
    steps: steps.map((step) => ({ id: step.id, position: step.position, stepType: step.step_type, prompt: step.prompt, options: Array.isArray(step.options) ? step.options.map(String) : [], required: step.required, metadata: step.metadata ?? {}, answer: step.answer ?? null })),
    screeners: screeners.map((screener) => ({ id: screener.id, position: screener.position, question: screener.question, options: Array.isArray(screener.options) ? screener.options.map(String) : [], required: screener.required, answer: screener.answer ?? null })),
    action: actionRow ? { state: actionRow.state, selfReportedOutcome: actionRow.self_reported_outcome, reason: actionRow.reason, verifiedAt: actionRow.verified_at, openedAt: actionRow.opened_at, openedCount: actionRow.opened_count } : { state: row.task_url ? "not_opened" : "not_applicable", selfReportedOutcome: null, reason: null, verifiedAt: null, openedAt: null, openedCount: 0 },
  };
}

export async function respondToInvitation(
  personId: string,
  id: string,
  request: Request,
) {
  const body = await readJson<{ action?: string }>(request);
  if (body.action !== "accept" && body.action !== "decline") {
    throw new ApiError(400, "bad_request", {
      action: "Choose accept or decline.",
    });
  }

  const updated = await query<{ id: string }>(
    `update invitations
        set status = $3, responded_at = now()
      where id = $1 and tester_id = $2 and status = 'invited'
      returning id`,
    [id, personId, body.action === "accept" ? "accepted" : "declined"],
  );

  if (!updated.length) {
    const existing = await one<{ status: string }>(
      "select status from invitations where id = $1 and tester_id = $2",
      [id, personId],
    );
    if (!existing) throw new ApiError(404, "not_found");
    throw new ApiError(409, "conflict", {
      action: "This invitation has already been answered.",
    });
  }

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, $2, 'invitation', $3, $4)`,
    [
      personId,
      body.action === "accept" ? "invitation.accepted" : "invitation.declined",
      id,
      JSON.stringify({}),
    ],
  );

  return testerInvitation(personId, id);
}

const OUTCOMES = new Set(["tried", "booked_call", "collaborated", "no_action"]);

export async function submitTesterResponse(
  personId: string,
  id: string,
  request: Request,
) {
  const body = await readJson<{
    outcome?: string;
    note?: string;
    consentToQuote?: boolean;
  }>(request);

  if (!body.outcome || !OUTCOMES.has(body.outcome)) {
    throw new ApiError(400, "bad_request", {
      outcome: "Select what happened.",
    });
  }
  const note = (body.note ?? "").trim();
  if (note.length < 20 || note.length > 1000) {
    throw new ApiError(400, "bad_request", {
      note: "Write between 20 and 1,000 characters.",
    });
  }

  const invitation = await one<{
    id: string;
    status: string;
    reward_note: string | null;
    test_id: string;
    invited_at: string;
  }>(
    `select i.id, i.status, t.reward_note, i.test_id, i.invited_at
       from invitations i join tests t on t.id = i.test_id
      where i.id = $1 and i.tester_id = $2`,
    [id, personId],
  );
  if (!invitation) throw new ApiError(404, "not_found");
  if (invitation.status !== "accepted") {
    throw new ApiError(409, "conflict", {
      note: "Accept the invitation before submitting a response.",
    });
  }

  const existing = await one(
    "select id from responses where invitation_id = $1",
    [id],
  );
  if (existing)
    throw new ApiError(409, "conflict", { note: "A response already exists." });

  await query(
    `insert into responses (invitation_id, outcome, note, consent_to_quote, schema_version)
     values ($1, $2, $3, $4, '2026-10-20')`,
    [id, body.outcome, note, body.consentToQuote === true],
  );

  const durationSeconds = Math.max(0, Math.round((Date.now() - new Date(invitation.invited_at).getTime()) / 1000));
  if (durationSeconds < 10) {
    await query(`insert into response_flags (invitation_id, flag_type, detail) values ($1, 'too_fast', $2)`, [id, JSON.stringify({ durationSeconds })]);
  }
  // Copy-pasted answers are a moderation signal, so a repeated note from the
  // same test is flagged for a human to review. Comparison happens on the
  // normalised text because responses store the note, not a hash of it.
  const previous = await query<{ id: string; note: string }>(
    `select r.id, r.note from responses r
       join invitations i on i.id = r.invitation_id
      where i.test_id = $1 and r.invitation_id <> $2`,
    [invitation.test_id, id],
  );
  const normaliseNote = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();
  const duplicate = previous.find(
    (row) => normaliseNote(row.note) === normaliseNote(note),
  );
  if (duplicate) {
    await query(`insert into response_flags (invitation_id, flag_type, detail) values ($1, 'duplicate_note', $2)`, [id, JSON.stringify({ duplicateResponseId: duplicate.id })]);
  }

  await query(
    `update invitations
        set status = 'completed', completed_at = now(),
            reward_status = case when $2 then 'pending' else 'not_applicable' end
      where id = $1`,
    [id, Boolean(invitation.reward_note)],
  );

  await query(
    `insert into audit_events (actor_id, action, entity, entity_id, meta)
     values ($1, 'response.submitted', 'invitation', $2, $3)`,
    [personId, id, JSON.stringify({ testId: invitation.test_id })],
  );

  await notify(
    personId,
    "invitation",
    "Response received",
    "Thanks. The team will review your response before the findings are shared.",
    `/app/tester/invitations/${id}`,
  );

  return testerInvitation(personId, id);
}

export async function testerHistory(personId: string) {
  const rows = await query<
    InvitationRow & {
      outcome: string | null;
      note: string | null;
      submitted_at: string | null;
    }
  >(
    `select i.id, i.status, i.invited_at, i.responded_at, i.completed_at,
            i.reward_status, i.reward_sent_at,
            t.id as test_id, t.title, t.question, t.terms, t.reward_note,
            t.status as test_status,
            r.outcome, r.note, r.submitted_at
       from invitations i
       join tests t on t.id = i.test_id
       left join responses r on r.invitation_id = i.id
      where i.tester_id = $1 and i.status in ('completed','declined','withdrawn')
      order by i.invited_at desc`,
    [personId],
  );

  return rows.map((row) => ({
    ...mapInvitation(row),
    outcome: row.outcome,
    note: row.note,
    submittedAt: row.submitted_at,
  }));
}

export async function updateTesterProfile(personId: string, request: Request) {
  const body = await readJson<{
    fullName?: string;
    phone?: string;
    whatsapp?: string;
    whatsappReminders?: boolean;
  }>(request);

  const fullName = (body.fullName ?? "").trim();
  if (fullName.length < 2 || fullName.length > 100) {
    throw new ApiError(400, "bad_request", {
      fullName: "Enter your full name (2–100 characters).",
    });
  }

  const phone = body.phone ? normalisePhone(body.phone) : null;
  const whatsapp = body.whatsapp ? normalisePhone(body.whatsapp) : null;
  if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new ApiError(400, "bad_request", {
      phone: "Enter a valid number with a country code.",
    });
  }
  if (whatsapp && !/^\+[1-9]\d{7,14}$/.test(whatsapp)) {
    throw new ApiError(400, "bad_request", {
      whatsapp: "Enter a valid number with a country code.",
    });
  }

  await query(
    "update people set full_name = $2, phone = $3, updated_at = now() where id = $1",
    [personId, fullName, phone],
  );
  await query(
    `update tester_profiles
        set whatsapp = $2, whatsapp_reminders = $3
      where person_id = $1`,
    [personId, whatsapp, body.whatsappReminders === true],
  );

  return { ok: true };
}
