import { one, query } from "./db";

export type AiPurpose = "intake" | "findings" | "study_draft";

export interface Brief {
  productSummary?: string;
  targetCustomer?: string;
  problem?: string;
  hypothesis?: string;
  goal?: string;
  suggestedTest?: string;
  missingDetails?: string[];
  risks?: string[];
}

export interface FindingsDraft {
  headline: string;
  summary: string;
  learnings: { label: string; detail: string }[];
  limits: string;
  recommendation: string;
  aiGenerated: boolean;
  sampleSize: number;
}

export interface StudyDraft {
  steps: Array<{
    stepType: string;
    prompt: string;
    options: string[];
    required: boolean;
  }>;
  aiGenerated: boolean;
}

interface AiResponse {
  data: unknown;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCostUsd?: number;
  status: "ok" | "fallback" | "failed";
}

const AI_BASE = process.env.AI_API_BASE?.trim() || process.env.ZAI_API_BASE?.trim() || "https://api.openai.com/v1";
const AI_KEY = process.env.AI_API_KEY?.trim() || process.env.ZAI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
const DEFAULT_MODEL = process.env.AI_MODEL?.trim() || process.env.ZAI_MODEL?.trim() || "gpt-6-luna";
const ESCALATION_MODEL = process.env.AI_ESCALATION_MODEL?.trim() || "gpt-6.1-sol";
const COST_PER_1M: Record<string, { input: number; output: number }> = {
  "gpt-6-luna": { input: 0.10, output: 0.50 },
  "gpt-6.1-sol": { input: 2.00, output: 10.00 },
};

function estimateCost(model: string, input?: number, output?: number): number | undefined {
  const rate = COST_PER_1M[model];
  if (!rate || input === undefined || output === undefined) return undefined;
  return Number(((input * rate.input + output * rate.output) / 1_000_000).toFixed(6));
}

async function logUsage(personId: string | null, purpose: AiPurpose, result: AiResponse, metadata: Record<string, unknown> = {}) {
  const cost = result.estimatedCostUsd ?? estimateCost(result.model, result.promptTokens, result.completionTokens);
  await query(
    `insert into ai_usage_logs (person_id, purpose, model, prompt_tokens, completion_tokens, estimated_cost_usd, status, metadata)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [personId, purpose, result.model, result.promptTokens ?? null, result.completionTokens ?? null, cost ?? null, result.status, JSON.stringify(metadata)],
  );
}

async function callAi(personId: string | null, purpose: AiPurpose, system: string, user: string, metadata: Record<string, unknown> = {}): Promise<AiResponse | null> {
  if (!AI_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${AI_BASE.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 900,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      await logUsage(personId, purpose, { data: null, model: DEFAULT_MODEL, status: "failed" }, { ...metadata, error: text.slice(0, 300) });
      return null;
    }
    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const raw = payload.choices?.[0]?.message?.content ?? "{}";
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = {}; }
    const result: AiResponse = {
      data,
      model: DEFAULT_MODEL,
      promptTokens: payload.usage?.prompt_tokens,
      completionTokens: payload.usage?.completion_tokens,
      status: "ok",
    };
    await logUsage(personId, purpose, result, metadata);
    return result;
  } catch (error) {
    await logUsage(personId, purpose, { data: null, model: DEFAULT_MODEL, status: "failed" }, { ...metadata, error: String(error).slice(0, 300) });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const MISSING_FIELDS: Array<{ key: "productSummary" | "targetCustomer" | "problem" | "goal" | "suggestedTest"; label: string; question: string; patterns: RegExp }> = [
  { key: "productSummary", label: "product summary", question: "What are you building, in one sentence?", patterns: /(build|app|platform|product|service|tool|website|software)/i },
  { key: "targetCustomer", label: "target customer", question: "Who is this for, specifically?", patterns: /(for|audience|customer|users?|people|founders?|students?|businesses|teams?)/i },
  { key: "problem", label: "problem", question: "What problem does it solve?", patterns: /(problem|struggle|hard|difficult|frustrat|pain|issue)/i },
  { key: "goal", label: "research goal", question: "What do you need to learn before your next decision?", patterns: /(learn|need to know|decide|test|validate|understand)/i },
  { key: "suggestedTest", label: "suggested test", question: "What task or question should testers answer first?", patterns: /(test|task|survey|prototype|link|try|use)/i },
];

export function nextBriefQuestion(brief: Brief): string {
  for (const field of MISSING_FIELDS) {
    if (!brief[field.key] || String(brief[field.key]).trim().length < 10) return field.question;
  }
  if (!brief.hypothesis) return "What do you currently believe is true, and what evidence would change your mind?";
  return "Thanks — I have enough to save a draft brief. You can review and edit it before the team scopes the study.";
}

export function updateBriefFromMessage(brief: Brief, message: string): { brief: Brief; missing: string[]; risks: string[] } {
  const next = { ...brief };
  const text = message.trim();
  for (const field of MISSING_FIELDS) {
    if ((!next[field.key] || String(next[field.key]).trim().length < 10) && field.patterns.test(text)) {
      next[field.key] = text;
    }
  }
  if (!next.goal && /(learn|decide|test|validate)/i.test(text)) next.goal = text;
  const missing = MISSING_FIELDS.filter((field) => !next[field.key] || String(next[field.key]).trim().length < 10).map((field) => field.label);
  const risks = /guarantee|100%|everyone|definitely|will definitely/i.test(text)
    ? ["Founder wording contains absolute claims; admin should review before publication."]
    : [];
  return { brief: { ...next, missingDetails: missing, risks }, missing, risks };
}

export async function generateBrief(personId: string, briefId: string, existing: Brief, message: string) {
  const messages = await query<{ role: string; content: string }>(
    `select role, content from intake_messages where brief_id = $1 order by created_at asc limit 30`,
    [briefId],
  );
  const transcript = messages.map((entry) => `${entry.role}: ${entry.content}`).join("\n");
  const result = await callAi(
    personId,
    "intake",
    "You are RAPID's research intake assistant. Collect only what is needed for a study. Return JSON with keys productSummary,targetCustomer,problem,hypothesis,goal,suggestedTest,missingDetails,risks.",
    `${transcript}\nLatest founder message: ${message}`,
    { briefId },
  );

  let next: Brief;
  if (result && typeof result.data === "object" && result.data !== null) {
    const data = result.data as Record<string, unknown>;
    next = {
      productSummary: stringField(data.productSummary),
      targetCustomer: stringField(data.targetCustomer),
      problem: stringField(data.problem),
      hypothesis: stringField(data.hypothesis),
      goal: stringField(data.goal),
      suggestedTest: stringField(data.suggestedTest),
      missingDetails: stringArray(data.missingDetails),
      risks: stringArray(data.risks),
    };
  } else {
    next = updateBriefFromMessage(existing, message).brief;
  }

  const missing = stringArray(next.missingDetails).length ? stringArray(next.missingDetails) : updateBriefFromMessage(next, "").missing;
  const risks = stringArray(next.risks).length ? stringArray(next.risks) : updateBriefFromMessage(existing, message).risks;
  const nextBrief: Brief = { ...next, missingDetails: missing, risks };
  const assistant = result ? nextBriefQuestion(nextBrief) : nextBriefQuestion(nextBrief);
  await query(
    `update research_briefs set brief = $2, missing_details = $3, risks = $4, updated_at = now() where id = $1`,
    [briefId, JSON.stringify(nextBrief), JSON.stringify(missing), JSON.stringify(risks)],
  );
  await query(
    `insert into intake_messages (brief_id, founder_id, role, content, metadata) values ($1, $2, 'assistant', $3, $4)`,
    [briefId, personId, assistant, JSON.stringify({ source: result ? "ai" : "manual" })],
  );
  return { brief: nextBrief, missing, risks, assistant, aiUsed: Boolean(result) };
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 1000) : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.slice(0, 200)) : [];
}

export async function draftFindings(personId: string, testId: string): Promise<FindingsDraft> {
  const rows = await query<{ outcome: string; count: number; note: string }>(
    `select r.outcome, count(*)::int as count, max(r.note) as note
       from responses r join invitations i on i.id = r.invitation_id
      where i.test_id = $1
      group by r.outcome order by count desc`,
    [testId],
  );
  const sampleSize = rows.reduce((sum, row) => sum + Number(row.count), 0);
  const prompt = `Summarize these RAPID research results as a draft. Do not claim verified demand or product-market fit. Returned JSON must match {headline,summary,learnings:[{label,detail}],limits,recommendation}. Outcomes: ${JSON.stringify(rows)}`;
  const result = await callAi(personId, "findings", "You draft research findings. Stay grounded in the provided counts and notes. Return JSON only.", prompt, { testId });

  if (result && typeof result.data === "object" && result.data !== null) {
    const data = result.data as Record<string, unknown>;
    const learnings = Array.isArray(data.learnings)
      ? data.learnings.map((item, index) => {
          if (typeof item !== "object" || item === null) return null;
          const record = item as Record<string, unknown>;
          return { label: stringField(record.label) ?? `Finding ${index + 1}`, detail: stringField(record.detail) ?? "" };
        }).filter((item): item is { label: string; detail: string } => Boolean(item && item.detail))
      : [];
    return {
      headline: stringField(data.headline) ?? "Draft finding",
      summary: stringField(data.summary) ?? "A draft summary of the observed responses.",
      learnings: learnings.length ? learnings : [{ label: "Evidence", detail: "No additional findings were generated." }],
      limits: stringField(data.limits) ?? "Sample is small. This is directional only.",
      recommendation: stringField(data.recommendation) ?? "Continue with a larger or more targeted test.",
      aiGenerated: true,
      sampleSize,
    };
  }

  const top = rows[0];
  return {
    headline: top ? `${top.outcome.replaceAll("_", " ")} was the most common outcome` : "No responses yet",
    summary: sampleSize
      ? `${sampleSize} response${sampleSize === 1 ? "" : "s"} were recorded. The most common outcome was ${top?.outcome ?? "none"}.`
      : "No responses have been collected yet.",
    learnings: rows.map((row) => ({ label: row.outcome.replaceAll("_", " "), detail: `${row.count} response${Number(row.count) === 1 ? "" : "s"}` })),
    limits: "Sample is small and self-reported unless an external action was verified. This draft needs admin review.",
    recommendation: "Continue recruiting or clarify the next smallest experiment before making a product decision.",
    aiGenerated: false,
    sampleSize,
  };
}

export async function draftStudy(personId: string, serviceKey: string, question: string): Promise<StudyDraft> {
  const result = await callAi(
    personId,
    "study_draft",
    `Draft study steps for ${serviceKey}. Return JSON only: {steps:[{stepType,prompt,options,required}]}. Allowed stepType: single_choice, multiple_choice, scale, short_answer, image_prompt, link_task.`,
    question,
    { serviceKey },
  );
  if (result && typeof result.data === "object" && result.data !== null) {
    const data = result.data as Record<string, unknown>;
    const steps = Array.isArray(data.steps)
      ? data.steps.map((item) => {
          if (typeof item !== "object" || item === null) return null;
          const record = item as Record<string, unknown>;
          const stepType = stringField(record.stepType);
          const prompt = stringField(record.prompt);
          if (!stepType || !prompt) return null;
          return { stepType, prompt, options: stringArray(record.options), required: record.required !== false };
        }).filter((item): item is { stepType: string; prompt: string; options: string[]; required: boolean } => Boolean(item))
      : [];
    if (steps.length) return { steps, aiGenerated: true };
  }
  return {
    steps: [
      { stepType: "short_answer", prompt: question, options: [], required: true },
      { stepType: "single_choice", prompt: "How confident are you in your answer?", options: ["Confident", "Somewhat confident", "Not confident"], required: true },
    ],
    aiGenerated: false,
  };
}

export async function getResearchBrief(briefId: string) {
  const brief = await one<{ id: string; founder_id: string; test_id: string | null; status: string; brief: unknown; missing_details: unknown; risks: unknown; version: number }>(
    `select id, founder_id, test_id, status, brief, missing_details, risks, version from research_briefs where id = $1`,
    [briefId],
  );
  if (!brief) return null;
  const messages = await query<{ id: string; role: string; content: string; created_at: string }>(
    `select id, role, content, created_at from intake_messages where brief_id = $1 order by created_at asc`,
    [briefId],
  );
  return { ...brief, brief: brief.brief ?? {}, missingDetails: brief.missing_details ?? [], risks: brief.risks ?? [], messages };
}

export function escalationModel(): string {
  return ESCALATION_MODEL;
}
