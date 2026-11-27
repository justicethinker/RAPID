import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { one, query } from "./db";
import { ApiError, readJson } from "./http";
import { generateBrief, draftFindings, draftStudy, getResearchBrief } from "./ai";

const SERVICE_KEYS = new Set(["idea_validation", "product_testing", "customer_research"]);
const PROJECT_STATUSES = new Set(["draft", "under_review", "awaiting_payment", "recruiting", "running", "reviewing", "completed", "cancelled", "on_hold"]);
const STEP_TYPES = new Set(["single_choice", "multiple_choice", "scale", "short_answer", "image_prompt", "link_task"]);
const RULE_TYPES = new Set(["country", "age_band", "situation", "interest", "industry", "screener"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function staffProjectStatus(status: string): string {
  switch (status) {
    case "requested": return "draft";
    case "scoping": return "under_review";
    case "recruiting": return "recruiting";
    case "fielding": return "running";
    case "findings": return "reviewing";
    case "published": return "completed";
    case "cancelled": return "cancelled";
    case "closed": return "cancelled";
    default: return "draft";
  }
}

function bad(fields: Record<string, string>): never {
  throw new ApiError(400, "bad_request", fields);
}

async function requireTestOwner(founderId: string, testId: string) {
  const test = await one<{ id: string }>(`select id from tests where id = $1 and founder_id = $2`, [testId, founderId]);
  if (!test) throw new ApiError(404, "not_found");
  return test;
}

async function requireStaffTest(staffId: string, testId: string) {
  const staff = await one<{ person_id: string }>(`select person_id from staff_members where person_id = $1`, [staffId]);
  if (!staff) throw new ApiError(404, "not_found");
  const test = await one<{ id: string }>(`select id from tests where id = $1`, [testId]);
  if (!test) throw new ApiError(404, "not_found");
  return test;
}

function arrayOf(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export async function createIntakeBrief(founderId: string, request: Request) {
  const body = await readJson<{ brief?: Record<string, unknown>; serviceKey?: string }>(request);
  const serviceKey = typeof body.serviceKey === "string" && SERVICE_KEYS.has(body.serviceKey) ? body.serviceKey : "idea_validation";
  const row = await one<{ id: string }>(
    `insert into research_briefs (founder_id, brief)
     values ($1, $2) returning id`,
    [founderId, JSON.stringify({ serviceKey, ...(body.brief ?? {}) })],
  );
  if (!row) throw new ApiError(500, "server");
  await query(
    `insert into intake_messages (brief_id, founder_id, role, content) values ($1, $2, 'assistant', $3)`,
    [row.id, founderId, "What are you building, in one sentence?"],
  );
  return getResearchBrief(row.id);
}

export async function getFounderIntake(founderId: string, briefId: string) {
  const brief = await getResearchBrief(briefId);
  if (!brief || brief.founder_id !== founderId) throw new ApiError(404, "not_found");
  return brief;
}

export async function messageIntake(founderId: string, briefId: string, request: Request) {
  const brief = await getResearchBrief(briefId);
  if (!brief || brief.founder_id !== founderId) throw new ApiError(404, "not_found");
  const body = await readJson<{ message?: string }>(request);
  const message = (body.message ?? "").trim();
  if (message.length < 5 || message.length > 1000) bad({ message: "Write between 5 and 1,000 characters." });
  await query(
    `insert into intake_messages (brief_id, founder_id, role, content) values ($1, $2, 'founder', $3)`,
    [briefId, founderId, message],
  );
  const existing = (brief.brief ?? {}) as Record<string, unknown>;
  const normalized = {
    productSummary: typeof existing.productSummary === "string" ? existing.productSummary : undefined,
    targetCustomer: typeof existing.targetCustomer === "string" ? existing.targetCustomer : undefined,
    problem: typeof existing.problem === "string" ? existing.problem : undefined,
    hypothesis: typeof existing.hypothesis === "string" ? existing.hypothesis : undefined,
    goal: typeof existing.goal === "string" ? existing.goal : undefined,
    suggestedTest: typeof existing.suggestedTest === "string" ? existing.suggestedTest : undefined,
    missingDetails: Array.isArray(existing.missingDetails) ? existing.missingDetails : undefined,
    risks: Array.isArray(existing.risks) ? existing.risks : undefined,
  };
  const result = await generateBrief(founderId, briefId, normalized, message);
  const updated = await getResearchBrief(briefId);
  return { ...updated, assistant: result.assistant, aiUsed: result.aiUsed };
}

export async function confirmIntakeBrief(founderId: string, briefId: string, request: Request) {
  const brief = await getResearchBrief(briefId);
  if (!brief || brief.founder_id !== founderId) throw new ApiError(404, "not_found");
  const body = await readJson<{ brief?: Record<string, unknown>; serviceKey?: string }>(request);
  const patch = body.brief ?? {};
  const merged = { ...((brief.brief ?? {}) as Record<string, unknown>), ...patch };
  const missing = ["productSummary", "targetCustomer", "problem", "goal"].filter((key) => !String(merged[key] ?? "").trim());
  if (missing.length) bad({ brief: `Missing: ${missing.join(", ")}` });
  const serviceKey = typeof body.serviceKey === "string" && SERVICE_KEYS.has(body.serviceKey) ? body.serviceKey : ((brief.brief as Record<string, unknown>)?.serviceKey as string) || "idea_validation";

  let testId = brief.test_id as string | null;
  if (!testId) {
    const question = `${String(merged.productSummary ?? "")} — ${String(merged.problem ?? "")}`.slice(0, 500);
    const row = await one<{ id: string }>(
      `insert into tests (founder_id, title, question, audience_code, audience_description, terms, status, service_key, project_status, brief_id)
       values ($1, $2, $3, $4, $5, '', 'requested', $6, 'draft', $7) returning id`,
      [founderId, String(merged.productSummary ?? "Research brief").slice(0, 120), question, null, String(merged.targetCustomer ?? "").slice(0, 300) || null, serviceKey, briefId],
    );
    testId = row?.id ?? null;
    if (!testId) throw new ApiError(500, "server");
    await query(`update research_briefs set test_id = $2 where id = $1`, [briefId, testId]);
  }

  await query(
    `update research_briefs set brief = $2, status = 'confirmed', version = version + 1, updated_at = now() where id = $1`,
    [briefId, JSON.stringify({ ...merged, serviceKey })],
  );
  await query(`update tests set brief_id = $2, service_key = $3, project_status = 'under_review', status = 'scoping', title = $4, question = $5, audience_description = $6 where id = $1`,
    [testId, briefId, serviceKey, String(merged.productSummary ?? "Research brief").slice(0, 120), String(merged.goal ?? merged.problem ?? "").slice(0, 500), String(merged.targetCustomer ?? "").slice(0, 300) || null]);
  return { id: testId };
}

export async function listTemplates() {
  return query<{ service_key: string; name: string; description: string; steps: unknown }>(
    `select service_key, name, description, steps from study_templates order by name`,
  );
}

export async function getStudyDefinition(staffId: string, testId: string) {
  await requireStaffTest(staffId, testId);
  const steps = await query<{ id: string; position: number; step_type: string; prompt: string; options: unknown; required: boolean; metadata: unknown }>(
    `select id, position, step_type, prompt, options, required, metadata from study_steps where test_id = $1 order by position`,
    [testId],
  );
  const rules = await query<{ id: string; rule_type: string; operator: string; value: unknown }>(
    `select id, rule_type, operator, value from eligibility_rules where test_id = $1 order by created_at`,
    [testId],
  );
  const screeners = await query<{ id: string; position: number; question: string; options: unknown; required: boolean }>(
    `select id, position, question, options, required from study_screeners where test_id = $1 order by position`,
    [testId],
  );
  return {
    steps: steps.map((step) => ({ ...step, stepType: step.step_type, metadata: step.metadata ?? {}, options: arrayOf(step.options) })),
    rules: rules.map((rule) => ({ ...rule, ruleType: rule.rule_type, value: rule.value ?? {} })),
    screeners,
  };
}

export async function copyTemplate(staffId: string, testId: string, request: Request) {
  await requireStaffTest(staffId, testId);
  const body = await readJson<{ serviceKey?: string }>(request);
  const serviceKey = body.serviceKey ?? "";
  if (!SERVICE_KEYS.has(serviceKey)) bad({ serviceKey: "Choose a valid service." });
  const template = await one<{ steps: unknown }>(`select steps from study_templates where service_key = $1`, [serviceKey]);
  if (!template) throw new ApiError(404, "not_found");
  const steps = Array.isArray(template.steps) ? template.steps : [];
  await query(`delete from study_steps where test_id = $1`, [testId]);
  for (const entry of steps as Array<Record<string, unknown>>) {
    const position = Number(entry.position ?? 0);
    const stepType = String(entry.stepType ?? entry.step_type ?? "short_answer");
    if (!STEP_TYPES.has(stepType)) continue;
    await query(
      `insert into study_steps (test_id, position, step_type, prompt, options, required, metadata)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (test_id, position) do nothing`,
      [testId, position, stepType, String(entry.prompt ?? "Question").slice(0, 1000), JSON.stringify(arrayOf(entry.options)), Boolean(entry.required ?? true), JSON.stringify(entry.metadata ?? {})],
    );
  }
  await query(`update tests set service_key = $2 where id = $1`, [testId, serviceKey]);
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'study.template_copied', 'test', $2, $3)`, [staffId, testId, JSON.stringify({ serviceKey })]);
  return getStudyDefinition(staffId, testId);
}

export async function saveStudyStep(staffId: string, testId: string, request: Request) {
  await requireStaffTest(staffId, testId);
  const body = await readJson<{ stepId?: string; position?: number; stepType?: string; prompt?: string; options?: string[]; required?: boolean; metadata?: Record<string, unknown> }>(request);
  const stepType = body.stepType ?? "";
  if (!STEP_TYPES.has(stepType)) bad({ stepType: "Choose a valid step type." });
  const prompt = (body.prompt ?? "").trim();
  if (prompt.length < 5 || prompt.length > 1000) bad({ prompt: "Write a prompt between 5 and 1,000 characters." });
  const position = Math.max(0, Math.floor(Number(body.position ?? 0) || 0));
  const options = Array.isArray(body.options) ? body.options.map(String).slice(0, 20) : [];
  if ((stepType === "single_choice" || stepType === "multiple_choice") && options.length < 2) bad({ options: "Provide at least two options." });

  let stepId = body.stepId ?? null;
  if (stepId) {
    await query(`update study_steps set position = $2, step_type = $3, prompt = $4, options = $5, required = $6, metadata = $7 where id = $1 and test_id = $8`,
      [stepId, position, stepType, prompt, JSON.stringify(options), Boolean(body.required ?? true), JSON.stringify(body.metadata ?? {}), testId]);
  } else {
    const row = await one<{ id: string }>(
      `insert into study_steps (test_id, position, step_type, prompt, options, required, metadata)
       values ($1, $2, $3, $4, $5, $6, $7) returning id`,
      [testId, position, stepType, prompt, JSON.stringify(options), Boolean(body.required ?? true), JSON.stringify(body.metadata ?? {})],
    );
    stepId = row?.id ?? null;
  }
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'study.step_saved', 'test', $2, $3)`, [staffId, testId, JSON.stringify({ stepId, stepType })]);
  return getStudyDefinition(staffId, testId);
}

export async function deleteStudyStep(staffId: string, testId: string, stepId: string) {
  await requireStaffTest(staffId, testId);
  await query(`delete from study_steps where id = $1 and test_id = $2`, [stepId, testId]);
  return getStudyDefinition(staffId, testId);
}

export async function saveEligibilityRule(staffId: string, testId: string, request: Request) {
  await requireStaffTest(staffId, testId);
  const body = await readJson<{ ruleType?: string; operator?: string; value?: Record<string, unknown> }>(request);
  if (!body.ruleType || !RULE_TYPES.has(body.ruleType)) bad({ ruleType: "Choose a valid rule type." });
  const value = body.value ?? {};
  if (body.ruleType === "screener" && (!value.screenerId || !value.answer)) bad({ value: "Screener rules need a screener and answer." });
  await one<{ id: string }>(
    `insert into eligibility_rules (test_id, rule_type, operator, value) values ($1, $2, $3, $4) returning id`,
    [testId, body.ruleType, body.operator === "is" ? "is" : "in", JSON.stringify(value)],
  );
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'study.rule_saved', 'test', $2, $3)`, [staffId, testId, JSON.stringify({ ruleType: body.ruleType })]);
  return getStudyDefinition(staffId, testId);
}

export async function deleteEligibilityRule(staffId: string, testId: string, ruleId: string) {
  await requireStaffTest(staffId, testId);
  await query(`delete from eligibility_rules where id = $1 and test_id = $2`, [ruleId, testId]);
  return getStudyDefinition(staffId, testId);
}

export async function saveScreener(staffId: string, testId: string, request: Request) {
  await requireStaffTest(staffId, testId);
  const body = await readJson<{ screenerId?: string; position?: number; question?: string; options?: string[]; required?: boolean }>(request);
  const question = (body.question ?? "").trim();
  if (question.length < 5 || question.length > 1000) bad({ question: "Write a screener question between 5 and 1,000 characters." });
  const options = Array.isArray(body.options) ? body.options.map(String).slice(0, 20) : [];
  if (options.length < 2) bad({ options: "Provide at least two options." });
  const position = Math.max(0, Math.floor(Number(body.position ?? 0) || 0));
  if (body.screenerId) {
    await query(`update study_screeners set position = $2, question = $3, options = $4, required = $5 where id = $1 and test_id = $6`,
      [body.screenerId, position, question, JSON.stringify(options), Boolean(body.required ?? true), testId]);
  } else {
    await query(`insert into study_screeners (test_id, position, question, options, required) values ($1, $2, $3, $4, $5)`,
      [testId, position, question, JSON.stringify(options), Boolean(body.required ?? true)]);
  }
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'study.screener_saved', 'test', $2, '{}'::jsonb)`, [staffId, testId]);
  return getStudyDefinition(staffId, testId);
}

export async function deleteScreener(staffId: string, testId: string, screenerId: string) {
  await requireStaffTest(staffId, testId);
  await query(`delete from study_screeners where id = $1 and test_id = $2`, [screenerId, testId]);
  return getStudyDefinition(staffId, testId);
}

export async function aiDraftStudy(staffId: string, testId: string, request: Request) {
  await requireStaffTest(staffId, testId);
  const body = await readJson<{ question?: string }>(request);
  const test = await one<{ service_key: string; question: string; method: string | null }>(`select service_key, question, method from tests where id = $1`, [testId]);
  if (!test) throw new ApiError(404, "not_found");
  const draft = await draftStudy(staffId, test.service_key, (body.question ?? "").trim() || test.method || test.question);
  for (const [index, step] of draft.steps.entries()) {
    await query(
      `insert into study_steps (test_id, position, step_type, prompt, options, required, metadata)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (test_id, position) do nothing`,
      [testId, index, step.stepType, step.prompt.slice(0, 1000), JSON.stringify(step.options), step.required, JSON.stringify({ aiDraft: draft.aiGenerated })],
    );
  }
  return { ...draft, definition: await getStudyDefinition(staffId, testId) };
}

export async function saveTesterStepAnswer(personId: string, invitationId: string, request: Request) {
  const body = await readJson<{ stepId?: string; answer?: unknown }>(request);
  if (!body.stepId || !UUID_RE.test(body.stepId)) bad({ stepId: "Choose a valid step." });
  const invitation = await one<{ id: string; status: string }>(`select id, status from invitations where id = $1 and tester_id = $2`, [invitationId, personId]);
  if (!invitation) throw new ApiError(404, "not_found");
  if (invitation.status !== "accepted") throw new ApiError(409, "conflict", { answer: "Accept the invitation before answering." });
  const step = await one<{ id: string; test_id: string }>(`select id, test_id from study_steps where id = $1`, [body.stepId]);
  if (!step) throw new ApiError(404, "not_found");
  const answer = body.answer === undefined ? null : body.answer;
  const stringified = JSON.stringify(answer);
  if (stringified.length > 2000) bad({ answer: "Keep each answer under 2,000 characters." });
  await query(
    `insert into response_answers (invitation_id, step_id, answer) values ($1, $2, $3)
     on conflict (invitation_id, step_id) do update set answer = excluded.answer`,
    [invitationId, body.stepId, stringified],
  );
  return { ok: true };
}

export async function saveScreenerAnswers(personId: string, invitationId: string, request: Request) {
  const body = await readJson<{ answers?: Array<{ screenerId?: string; answer?: unknown }> }>(request);
  const answers = Array.isArray(body.answers) ? body.answers : [];
  const invitation = await one<{ id: string; status: string; test_id: string }>(`select id, status, test_id from invitations where id = $1 and tester_id = $2`, [invitationId, personId]);
  if (!invitation) throw new ApiError(404, "not_found");
  if (invitation.status === "invited") {
    await query(`update invitations set status = 'accepted', responded_at = now() where id = $1 and status = 'invited'`, [invitationId]);
  } else if (invitation.status !== "accepted") {
    throw new ApiError(409, "conflict", { answers: "This invitation cannot be screened." });
  }
  for (const entry of answers) {
    if (!entry.screenerId || !UUID_RE.test(entry.screenerId)) continue;
    const screener = await one<{ id: string }>(`select id from study_screeners where id = $1 and test_id = $2`, [entry.screenerId, invitation.test_id]);
    if (!screener) continue;
    await query(
      `insert into screener_answers (invitation_id, screener_id, answer) values ($1, $2, $3)
       on conflict (invitation_id, screener_id) do update set answer = excluded.answer`,
      [invitationId, entry.screenerId, JSON.stringify(entry.answer === undefined ? null : entry.answer)],
    );
  }
  return { ok: true };
}

export async function getInvitationSteps(personId: string, invitationId: string) {
  const invitation = await one<{ id: string; test_id: string }>(`select id, test_id from invitations where id = $1 and tester_id = $2`, [invitationId, personId]);
  if (!invitation) throw new ApiError(404, "not_found");
  const steps = await query<{ id: string; position: number; step_type: string; prompt: string; options: unknown; required: boolean; metadata: unknown; answer: unknown }>(
    `select s.id, s.position, s.step_type, s.prompt, s.options, s.required, s.metadata, a.answer
       from study_steps s left join response_answers a on a.step_id = s.id and a.invitation_id = $1
      where s.test_id = $2 order by s.position`,
    [invitationId, invitation.test_id],
  );
  const screeners = await query<{ id: string; position: number; question: string; options: unknown; required: boolean; answer: unknown }>(
    `select s.id, s.position, s.question, s.options, s.required, a.answer
       from study_screeners s left join screener_answers a on a.screener_id = s.id and a.invitation_id = $1
      where s.test_id = $2 order by s.position`,
    [invitationId, invitation.test_id],
  );
  const action = await one<{ state: string; self_reported_outcome: string | null; reason: string | null; verified_at: string | null; opened_at: string | null; opened_count: number }>(
    `select state, self_reported_outcome, reason, verified_at, opened_at, opened_count from task_actions where invitation_id = $1`,
    [invitationId],
  );
  return {
    steps: steps.map((step) => ({ ...step, stepType: step.step_type, options: arrayOf(step.options), metadata: step.metadata ?? {} })),
    screeners: screeners.map((screener) => ({ ...screener, options: arrayOf(screener.options) })),
    action: action ?? { state: "not_applicable", self_reported_outcome: null, reason: null, verified_at: null, opened_at: null, opened_count: 0 },
  };
}

export async function getTaskLink(personId: string, invitationId: string) {
  const invitation = await one<{ id: string; status: string; test_id: string; task_url: string | null; task_requires_return: boolean }>(
    `select i.id, i.status, i.test_id, t.task_url, t.task_requires_return from invitations i join tests t on t.id = i.test_id where i.id = $1 and i.tester_id = $2`,
    [invitationId, personId],
  );
  if (!invitation) throw new ApiError(404, "not_found");
  if (!invitation.task_url) throw new ApiError(409, "conflict", { task: "This project has no external task link." });
  if (invitation.status !== "accepted" && invitation.status !== "completed") throw new ApiError(409, "conflict", { task: "Accept the invitation before opening the task." });
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHmac("sha256", process.env.TASK_LINK_SECRET?.trim() || process.env.DEV_AUTH_SECRET?.trim() || "rapid-local-task-link-secret").update(token).digest("hex");
  let domain = "";
  try { domain = new URL(invitation.task_url).hostname; } catch { throw new ApiError(400, "bad_request", { task: "Task link is not a valid URL." }); }
  const targetUrlHash = createHmac("sha256", tokenHash).update(invitation.task_url).digest("hex");
  await query(
    `insert into task_actions (invitation_id, token_hash, target_url_hash, target_domain, state)
     values ($1, $2, $3, $4, 'assigned')
     on conflict (invitation_id) do update set token_hash = excluded.token_hash, target_url_hash = excluded.target_url_hash, target_domain = excluded.target_domain, updated_at = now()`,
    [invitationId, tokenHash, targetUrlHash, domain],
  );
  return { url: `/api/task-links/${token}`, token };
}

export async function openTaskLink(token: string) {
  if (!/^[0-9a-f]{64}$/i.test(token)) throw new ApiError(404, "not_found");
  const tokenHash = createHmac("sha256", process.env.TASK_LINK_SECRET?.trim() || process.env.DEV_AUTH_SECRET?.trim() || "rapid-local-task-link-secret").update(token).digest("hex");
  const action = await one<{ invitation_id: string; test_id: string; task_url: string | null }>(
    `select ta.invitation_id, i.test_id, t.task_url from task_actions ta join invitations i on i.id = ta.invitation_id join tests t on t.id = i.test_id where ta.token_hash = $1`,
    [tokenHash],
  );
  const found = action ?? await one<{ invitation_id: string; test_id: string; task_url: string | null }>(
    `select ta.invitation_id, i.test_id, t.task_url from task_actions ta join invitations i on i.id = ta.invitation_id join tests t on t.id = i.test_id where ta.token_hash = $1`,
    [tokenHash],
  );
  if (!found?.task_url) throw new ApiError(404, "not_found");
  await query(
    `update task_actions set state = case when state = 'assigned' then 'link_opened' else state end, opened_at = coalesce(opened_at, now()), opened_count = opened_count + 1, updated_at = now() where invitation_id = $1`,
    [found.invitation_id],
  );
  return found.task_url;
}

export async function reportTaskAction(personId: string, invitationId: string, request: Request) {
  const body = await readJson<{ outcome?: string; reason?: string }>(request);
  const outcome = body.outcome ?? "";
  if (!["completed", "could_not_complete", "chose_not"].includes(outcome)) bad({ outcome: "Choose completed, could not complete or chose not." });
  const reason = (body.reason ?? "").trim().slice(0, 1000);
  const invitation = await one<{ id: string }>(`select id from invitations where id = $1 and tester_id = $2`, [invitationId, personId]);
  if (!invitation) throw new ApiError(404, "not_found");
  const placeholderToken = createHmac("sha256", "rapid-task-action").update(`${invitationId}:${Date.now()}`).digest("hex");
  await query(
    `insert into task_actions (invitation_id, token_hash, target_url_hash, target_domain, state, self_reported_outcome, reason)
     values ($1, $4, '', '', 'self_reported', $2, $3)
     on conflict (invitation_id) do update set state = case when task_actions.state = 'verified' then 'verified' else 'self_reported' end, self_reported_outcome = excluded.self_reported_outcome, reason = excluded.reason, updated_at = now()`,
    [invitationId, outcome, reason || null, placeholderToken],
  );
  return getInvitationSteps(personId, invitationId);
}

export async function verifyTaskAction(staffId: string, invitationId: string, request: Request) {
  await requireStaffTest(staffId, (await one<{ test_id: string }>(`select test_id from invitations where id = $1`, [invitationId]))?.test_id ?? "");
  const body = await readJson<{ evidence?: string }>(request);
  const placeholderToken = createHmac("sha256", "rapid-task-action").update(`${invitationId}:verified:${Date.now()}`).digest("hex");
  await query(
    `insert into task_actions (invitation_id, token_hash, target_url_hash, target_domain, state, verified_by, verified_at, evidence_note)
     values ($1, $4, '', '', 'verified', $2, now(), $3)
     on conflict (invitation_id) do update set state = 'verified', verified_by = excluded.verified_by, verified_at = now(), evidence_note = excluded.evidence_note, updated_at = now()`,
    [invitationId, staffId, (body.evidence ?? "").trim().slice(0, 1000) || null, placeholderToken],
  );
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'task_action.verified', 'invitation', $2, '{}'::jsonb)`, [staffId, invitationId]);
  return { ok: true };
}

export async function getFounderActionCounts(founderId: string, testId: string) {
  await requireTestOwner(founderId, testId);
  const counts = await one<{ assigned: number; link_opened: number; self_reported: number; verified: number }>(
    `select count(*) filter (where state in ('assigned','link_opened','self_reported','verified'))::int as assigned,
            count(*) filter (where state in ('link_opened','self_reported','verified'))::int as link_opened,
            count(*) filter (where state in ('self_reported','verified'))::int as self_reported,
            count(*) filter (where state = 'verified')::int as verified
       from task_actions ta join invitations i on i.id = ta.invitation_id where i.test_id = $1`,
    [testId],
  );
  const reasons = await query<{ reason: string; count: number }>(
    `select coalesce(reason, 'Not stated') as reason, count(*)::int as count
       from task_actions ta join invitations i on i.id = ta.invitation_id
      where i.test_id = $1 and ta.self_reported_outcome is not null
      group by coalesce(reason, 'Not stated') order by count desc`,
    [testId],
  );
  const audience = await query<{ label: string; count: number }>(
    `select coalesce(tp.situation, 'unknown') as label, count(*)::int as count
       from invitations i join tester_profiles tp on tp.person_id = i.tester_id
      where i.test_id = $1 and i.status in ('accepted','completed')
      group by coalesce(tp.situation, 'unknown') order by count desc`,
    [testId],
  );
  return { counts: counts ?? { assigned: 0, link_opened: 0, self_reported: 0, verified: 0 }, reasons, audience };
}

const PAYSTACK_BASE = "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY?.trim() || "";
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET?.trim() || PAYSTACK_SECRET;

export function verifyPaystackWebhook(rawBody: string, signature: string | null, secret = PAYSTACK_WEBHOOK_SECRET): boolean {
  if (!secret || !signature || !/^[0-9a-f]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function initializePayment(founderId: string, testId: string, request: Request) {
  await requireTestOwner(founderId, testId);
  const test = await one<{ price_amount: string | null; price_currency: string | null; payment_status: string; founder_id: string }>(
    `select price_amount::text as price_amount, price_currency, payment_status, founder_id from tests where id = $1`,
    [testId],
  );
  if (!test) throw new ApiError(404, "not_found");
  const amount = Number(test.price_amount ?? 0);
  if (!amount || amount < 1) throw new ApiError(409, "conflict", { payment: "Set a project price before payment." });
  const body = await readJson<{ idempotencyKey?: string }>(request);
  const idempotencyKey = body.idempotencyKey?.trim() || `rapid-${testId}-${Date.now()}`;
  const founder = await one<{ email: string }>(`select email from people where id = $1`, [founderId]);
  const reference = `RAPID-${testId.slice(0, 8)}-${Date.now()}`;

  if (!PAYSTACK_SECRET) {
    await query(
      `insert into payments (test_id, founder_id, provider, provider_reference, idempotency_key, amount_kobo, currency, status, provider_status, metadata)
       values ($1, $2, 'paystack', $3, $4, $5, $6, 'failed', 'provider_not_configured', $7)
       on conflict (idempotency_key) do nothing`,
      [testId, founderId, reference, idempotencyKey, amount, test.price_currency ?? "NGN", JSON.stringify({ })],
    );
    throw new ApiError(409, "conflict", { payment: "Payment provider is not configured." });
  }

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: founder?.email,
      amount,
      currency: test.price_currency ?? "NGN",
      reference,
      metadata: { custom_fields: [{ display_name: "RAPID test", variable_name: "test_id", value: testId }] },
      callback_url: `${process.env.VITE_SITE_URL?.trim() ?? ""}/app/founder/tests/${testId}`,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new ApiError(502, "server", { payment: payload.message ?? "Payment provider failed." });
  }

  await query(
    `insert into payments (test_id, founder_id, provider, provider_reference, idempotency_key, amount_kobo, currency, status, provider_status, metadata)
     values ($1, $2, 'paystack', $3, $4, $5, $6, 'initialized', 'initialized', $7)
     on conflict (idempotency_key) do nothing`,
    [testId, founderId, payload.data.reference ?? reference, idempotencyKey, amount, test.price_currency ?? "NGN", JSON.stringify({ authorizationUrl: payload.data.authorization_url })],
  );
  await query(`update tests set payment_status = 'awaiting_payment', project_status = case when project_status = 'awaiting_payment' then 'awaiting_payment' else project_status end where id = $1`, [testId]);
  return { authorizationUrl: payload.data.authorization_url, reference: payload.data.reference ?? reference, paymentStatus: "awaiting_payment" };
}

export async function verifyPayment(founderId: string, testId: string, request: Request) {
  await requireTestOwner(founderId, testId);
  const body = await readJson<{ reference?: string }>(request);
  const reference = (body.reference ?? "").trim();
  if (!reference) bad({ reference: "Provide the payment reference." });
  const payment = await one<{ id: string; amount_kobo: string; currency: string; status: string }>(
    `select id, amount_kobo::text as amount_kobo, currency, status from payments where provider_reference = $1 and test_id = $2 and founder_id = $3`,
    [reference, testId, founderId],
  );
  if (!payment) throw new ApiError(404, "not_found");
  if (payment.status === "paid") return { ok: true, status: "paid" };
  if (!PAYSTACK_SECRET) throw new ApiError(409, "conflict", { payment: "Payment provider is not configured." });

  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  const payload = (await response.json().catch(() => ({}))) as { status?: boolean; data?: { status?: string; amount?: number; currency?: string } };
  if (!payload.status || payload.data?.status !== "success") throw new ApiError(409, "conflict", { payment: "Payment was not successful." });
  await markPaymentPaid(reference, payload.data.amount ?? Number(payment.amount_kobo), payload.data.currency ?? payment.currency);
  return { ok: true, status: "paid" };
}

export async function markPaymentPaid(reference: string, amountKobo: number, currency = "NGN") {
  const payment = await one<{ id: string; test_id: string; amount_kobo: string; currency: string; status: string }>(
    `select id, test_id, amount_kobo::text as amount_kobo, currency, status from payments where provider_reference = $1`,
    [reference],
  );
  if (!payment) throw new ApiError(404, "not_found");
  if (Number(payment.amount_kobo) !== Number(amountKobo) || payment.currency !== currency) {
    await query(`update payments set status = 'failed', provider_status = 'amount_or_currency_mismatch', updated_at = now() where id = $1`, [payment.id]);
    throw new ApiError(409, "conflict", { payment: "Payment amount does not match the project price." });
  }
  await query(`update payments set status = 'paid', provider_status = 'success', paid_at = coalesce(paid_at, now()), updated_at = now() where id = $1`, [payment.id]);
  await query(
    `update tests set payment_status = 'paid', project_status = case when project_status in ('draft','under_review','awaiting_payment') then 'recruiting' else project_status end where id = $1`,
    [payment.test_id],
  );
  return payment;
}

export async function paystackWebhook(request: Request) {
  const rawBody = await request.clone().text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackWebhook(rawBody, signature)) throw new ApiError(401, "unauthorized");
  const event = JSON.parse(rawBody) as { event?: string; data?: { reference?: string; status?: string; amount?: number; currency?: string } };
  if (event.event !== "charge.success" || !event.data?.reference) return { ok: true };
  if (event.data.status !== "success") {
    await query(`update payments set status = 'failed', provider_status = $2, updated_at = now() where provider_reference = $1 and status != 'paid'`, [event.data.reference, event.data.status ?? "failed"]);
    return { ok: true };
  }
  await markPaymentPaid(event.data.reference, event.data.amount ?? 0, event.data.currency ?? "NGN");
  return { ok: true };
}

export async function recordReward(staffId: string, invitationId: string, request: Request) {
  const body = await readJson<{ amount?: number; method?: string; reference?: string }>(request);
  const invitation = await one<{ tester_id: string; test_id: string; status: string; reward_status: string }>(
    `select tester_id, test_id, status, reward_status from invitations where id = $1`,
    [invitationId],
  );
  if (!invitation) throw new ApiError(404, "not_found");
  if (invitation.status !== "completed") throw new ApiError(409, "conflict", { reward: "Reward can only be recorded after completion." });
  const amount = Number(body.amount ?? 0);
  if (!Number.isInteger(amount) || amount < 0) bad({ amount: "Amount must be a non-negative integer in kobo." });
  const method = (body.method ?? "manual").trim() || "manual";
  const reference = (body.reference ?? "").trim() || null;
  if (invitation.reward_status === "sent" && amount > 0) throw new ApiError(409, "conflict", { reward: "Reward already recorded as sent." });

  const ledger = await one<{ id: string }>(
    `insert into reward_ledger (invitation_id, tester_id, amount_kobo, method, status, reference, created_by, paid_by, paid_at)
     values ($1, $2, $3, $4, 'paid', $5, $6, $6, now())
     on conflict (invitation_id, status) do nothing returning id`,
    [invitationId, invitation.tester_id, amount, method, reference, staffId],
  );
  await query(`update invitations set reward_status = 'sent', reward_sent_at = now() where id = $1`, [invitationId]);
  await query(`insert into audit_events (actor_id, action, entity, entity_id, meta) values ($1, 'reward.sent', 'invitation', $2, $3)`, [staffId, invitationId, JSON.stringify({ ledgerId: ledger?.id ?? null, amount })]);
  return { ok: true, ledgerId: ledger?.id ?? null };
}

export async function aiDraftFindingsRoute(staffId: string, testId: string) {
  await requireStaffTest(staffId, testId);
  const draft = await draftFindings(staffId, testId);
  return draft;
}

export function projectStatusForLegacy(status: string): string {
  return staffProjectStatus(status);
}

export function validServiceKey(value: unknown): string {
  return typeof value === "string" && SERVICE_KEYS.has(value) ? value : "idea_validation";
}

export function validProjectStatus(value: unknown): string {
  return typeof value === "string" && PROJECT_STATUSES.has(value) ? value : "draft";
}
