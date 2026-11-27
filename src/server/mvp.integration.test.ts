// @vitest-environment node
import { createHmac } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile(".env.local");
} catch {
  // CI may provide DATABASE_URL directly, or skip these tests.
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeDb = hasDatabase ? describe : describe.skip;

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const founderEmail = `mvp.${stamp}.founder@rapid.invalid`;
const testerEmail = `mvp.${stamp}.tester@rapid.invalid`;
const staffEmail = `mvp.${stamp}.staff@rapid.invalid`;

let db!: typeof import("./db");
let mvp!: typeof import("./mvp");
let ai!: typeof import("./ai");

let founderId = "";
let testerId = "";
let staffId = "";
let testId = "";
let briefId = "";
let briefTestId = "";
let invitationId = "";
let stepId = "";
let screenerId = "";

function request(body: unknown): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describeDb("MVP alignment", () => {
  beforeAll(async () => {
    db = await import("./db");
    mvp = await import("./mvp");
    ai = await import("./ai");

    const founder = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name) values ($1, true, 'MVP Founder') returning id`,
      [founderEmail],
    );
    const tester = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name) values ($1, true, 'MVP Tester') returning id`,
      [testerEmail],
    );
    const staff = await db.one<{ id: string }>(
      `insert into people (email, email_verified, full_name) values ($1, true, 'MVP Staff') returning id`,
      [staffEmail],
    );
    if (!founder || !tester || !staff) throw new Error("Could not create MVP people");
    founderId = founder.id;
    testerId = tester.id;
    staffId = staff.id;

    await db.query(
      `insert into tester_profiles (person_id, submission_id, application_status, privacy_version, schema_version)
       values ($1, $2, 'approved', '2026-10-20', '2026-10-20')`,
      [testerId, `mvp-tester-${stamp}`],
    );
    await db.query(`insert into staff_members (person_id) values ($1)`, [staffId]);

    const test = await db.one<{ id: string }>(
      `insert into tests (founder_id, title, question, terms, status, service_key, task_url, task_requires_return, price_amount, price_currency, reward_amount)
       values ($1, $2, 'Will you use this next month?', 'Take part and tell us what you think.', 'fielding', 'product_testing', 'https://example.com/product', true, 5000, 'NGN', 1000)
       returning id`,
      [founderId, `MVP test ${stamp}`],
    );
    if (!test) throw new Error("Could not create MVP test");
    testId = test.id;

    const invitation = await db.one<{ id: string }>(
      `insert into invitations (test_id, tester_id, status) values ($1, $2, 'accepted') returning id`,
      [testId, testerId],
    );
    if (!invitation) throw new Error("Could not create MVP invitation");
    invitationId = invitation.id;
  });

  afterAll(async () => {
    if (!db) return;
    const ids = [founderId, testerId, staffId].filter(Boolean);
    if (briefId) {
      await db.query("delete from research_briefs where id = $1", [briefId]);
    }
    if (briefTestId) {
      await db.query("delete from invitations where test_id = $1", [briefTestId]);
      await db.query("delete from payments where test_id = $1", [briefTestId]);
      await db.query("delete from tests where id = $1", [briefTestId]);
    }
    if (testId) {
      await db.query("delete from payments where test_id = $1", [testId]);
      await db.query("delete from reward_ledger where invitation_id in (select id from invitations where test_id = $1)", [testId]);
      await db.query("delete from findings where test_id = $1", [testId]);
      await db.query("delete from invitations where test_id = $1", [testId]);
      await db.query("delete from tests where id = $1", [testId]);
    }
    if (testerId) {
      await db.query("delete from tester_profiles where person_id = $1", [testerId]);
    }
    if (ids.length) {
      await db.query("delete from notifications where person_id = any($1::uuid[])", [ids]);
      await db.query("delete from audit_events where actor_id = any($1::uuid[])", [ids]);
      await db.query("delete from ai_usage_logs where person_id = any($1::uuid[])", [ids]);
      await db.query("delete from staff_members where person_id = any($1::uuid[])", [ids]);
    }
    for (const id of ids) {
      await db.query("delete from people where id = $1", [id]);
    }
    await db.closePool();
  });

  it("creates and confirms a structured founder brief", async () => {
    const created = await mvp.createIntakeBrief(founderId, request({ serviceKey: "product_testing" }));
    expect(created?.id).toBeTruthy();
    briefId = created!.id;

    const updated = await mvp.messageIntake(founderId, briefId, request({
      message: "I am building CheckoutFlow for small shops. They need to learn whether they would test it next month.",
    }));
    expect(updated?.messages?.some((entry) => entry.role === "assistant")).toBe(true);

    const confirmed = await mvp.confirmIntakeBrief(founderId, briefId, request({
      serviceKey: "product_testing",
      brief: {
        productSummary: "CheckoutFlow for small shops",
        targetCustomer: "Small shops in Nigeria",
        problem: "Checkout is slow on mobile",
        goal: "Learn whether shops would test it next month",
        suggestedTest: "Try the checkout task",
      },
    }));
    briefTestId = confirmed.id;
    expect(confirmed.id).not.toBe(testId);

    const test = await db.one<{ brief_id: string; service_key: string; project_status: string }>(
      `select brief_id::text as brief_id, service_key, project_status from tests where id = $1`,
      [briefTestId],
    );
    expect(test?.brief_id).toBe(briefId);
    expect(test?.service_key).toBe("product_testing");
    expect(test?.project_status).toBe("under_review");
  });

  it("copies templates, saves steps, rules and screeners", async () => {
    const copied = await mvp.copyTemplate(staffId, testId, request({ serviceKey: "product_testing" }));
    expect(copied.steps.length).toBeGreaterThan(0);

    const withStep = await mvp.saveStudyStep(staffId, testId, request({
      position: 10,
      stepType: "single_choice",
      prompt: "Would you pay for this flow?",
      options: ["Yes", "No"],
      required: true,
    }));
    stepId = withStep.steps.find((step) => step.prompt === "Would you pay for this flow?")!.id;

    const withRule = await mvp.saveEligibilityRule(staffId, testId, request({
      ruleType: "country",
      operator: "in",
      value: { values: ["NG"] },
    }));
    expect(withRule.rules.some((rule) => rule.ruleType === "country")).toBe(true);

    const withScreener = await mvp.saveScreener(staffId, testId, request({
      position: 0,
      question: "Do you own a shop?",
      options: ["Yes", "No"],
      required: true,
    }));
    screenerId = withScreener.screeners[0]!.id;
  });

  it("keeps one answer per step and records screener answers", async () => {
    await mvp.saveTesterStepAnswer(testerId, invitationId, request({ stepId, answer: "Yes" }));
    await mvp.saveTesterStepAnswer(testerId, invitationId, request({ stepId, answer: "No" }));
    const rows = await db.query("select answer from response_answers where invitation_id = $1 and step_id = $2", [invitationId, stepId]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ answer: "No" });

    await mvp.saveScreenerAnswers(testerId, invitationId, request({ answers: [{ screenerId, answer: "Yes" }] }));
    const screenerRows = await db.query("select answer from screener_answers where invitation_id = $1 and screener_id = $2", [invitationId, screenerId]);
    expect(screenerRows).toHaveLength(1);
  });

  it("opens a signed task link once conceptually and separates outcomes", async () => {
    const link = await mvp.getTaskLink(testerId, invitationId);
    expect(link.url).toMatch(/^\/api\/task-links\/[0-9a-f]+$/);
    expect(link.token).toMatch(/^[0-9a-f]{64}$/);

    const target = await mvp.openTaskLink(link.token);
    expect(target).toBe("https://example.com/product");
    const opened = await db.one<{ state: string; opened_count: number }>(
      `select state, opened_count from task_actions where invitation_id = $1`,
      [invitationId],
    );
    expect(opened?.state).toBe("link_opened");
    expect(Number(opened?.opened_count)).toBe(1);

    await mvp.reportTaskAction(testerId, invitationId, request({ outcome: "completed", reason: "Finished in one page" }));
    let action = await db.one<{ state: string; self_reported_outcome: string }>(
      `select state, self_reported_outcome from task_actions where invitation_id = $1`,
      [invitationId],
    );
    expect(action?.state).toBe("self_reported");
    expect(action?.self_reported_outcome).toBe("completed");

    await mvp.verifyTaskAction(staffId, invitationId, request({ evidence: "Founder evidence checked" }));
    action = await db.one<{ state: string; self_reported_outcome: string }>(
      `select state, self_reported_outcome from task_actions where invitation_id = $1`,
      [invitationId],
    );
    expect(action?.state).toBe("verified");
    expect(action?.self_reported_outcome).toBe("completed");
  });

  it("validates Paystack webhook signatures and payment idempotency", async () => {
    const body = JSON.stringify({ event: "charge.success", data: { reference: `MVP-${stamp}`, status: "success", amount: 5000, currency: "NGN" } });
    const secret = `webhook-${stamp}`;
    const signature = createHmac("sha512", secret).update(body).digest("hex");
    expect(mvp.verifyPaystackWebhook(body, signature, secret)).toBe(true);
    expect(mvp.verifyPaystackWebhook(body, "0".repeat(128), secret)).toBe(false);

    await db.query(
      `insert into payments (test_id, founder_id, provider, provider_reference, idempotency_key, amount_kobo, currency, status)
       values ($1, $2, 'paystack', $3, $4, 5000, 'NGN', 'initialized')`,
      [testId, founderId, `MVP-${stamp}`, `mvp-payment-${stamp}`],
    );
    await mvp.markPaymentPaid(`MVP-${stamp}`, 5000, "NGN");
    await mvp.markPaymentPaid(`MVP-${stamp}`, 5000, "NGN");
    const payment = await db.one<{ status: string }>(`select status from payments where provider_reference = $1`, [`MVP-${stamp}`]);
    expect(payment?.status).toBe("paid");
  });

  it("records rewards once in the ledger", async () => {
    await db.query(`update invitations set status = 'completed' where id = $1`, [invitationId]);
    const first = await mvp.recordReward(staffId, invitationId, request({ amount: 1000, method: "manual", reference: `reward-${stamp}` }));
    expect(first.ledgerId).toBeTruthy();
    await expect(mvp.recordReward(staffId, invitationId, request({ amount: 1000, method: "manual", reference: `reward-${stamp}` }))).rejects.toMatchObject({ status: 409 });
    const rows = await db.query("select id from reward_ledger where invitation_id = $1 and status = 'paid'", [invitationId]);
    expect(rows).toHaveLength(1);
  });

  it("falls back to a deterministic brief when AI is unavailable", async () => {
    const result = ai.updateBriefFromMessage({}, "I am building a booking app for clinics. They need to learn if patients will try it.");
    expect(result.brief.productSummary).toBeTruthy();
    expect(result.brief.targetCustomer).toBeTruthy();
    expect(ai.nextBriefQuestion(result.brief)).toBeTruthy();
  });
});
