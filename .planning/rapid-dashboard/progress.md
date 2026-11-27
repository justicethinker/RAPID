# Progress

## 2026-11-15 — MVP alignment implementation
- Implemented the approved MVP alignment plan on the existing Vite + React + Postgres + Vercel stack.
- Migration `0015_mvp_alignment.sql` applied locally: service/project/payment fields, research briefs/intake messages, study templates/steps, eligibility rules/screeners/answers, task actions, response flags, Paystack payments and reward ledger, AI usage logs.
- Guided founder intake at `/app/founder/intake` and `/app/founder/intake/:id` with structured brief edit/confirm and manual fallback; server-only AI adapter in `src/server/ai.ts`.
- Admin study builder in the staff test workspace: template copy, AI draft, steps, eligibility rules, screeners, price/task/reward settings, AI findings draft and verify-action control.
- Tester stepped answers, screener answers, signed task-link redirect (`GET /api/task-links/:token`) and separate self-reported/verified outcomes.
- Paystack initialize/verify/webhook implementation with raw-body HMAC-SHA512 webhook verification, amount/currency checks and idempotent paid transitions; webhook at `POST /api/payments/paystack/webhook`.
- Founder test detail now shows guided brief, payment status/action, assigned/opened/self-reported/verified outcomes, failure reasons and audience breakdowns.
- Added `src/server/mvp.integration.test.ts` with 7 integration tests and full verification below.

## 2026-11-15 — Resume remaining plan items
- Read the attached complete founder dashboard implementation plan and existing repository README, acceptance report, launch checklist, package scripts, routes, relevant audience/server code and migrations.
- Confirmed Phase 7 organic analytics and Phase 8/9 managed validation need a gap audit. Phase 13 payment requires a provider not present in the app; README explicitly excludes payments/payouts. Phase 10 AI is optional and conditional.
- Added task plan/findings to `.planning/rapid-dashboard/`.
- Existing worktree contains many unrelated uncommitted changes. No unrelated changes were reverted or committed.

## Completed implementation
- Added `audience_events` with allow-listed event types (`profile_view`, `post_impression`, `post_open`), allow-listed source labels and a unique visitor/event/day constraint. No IP address, account ID or raw URL is stored.
- Added public `POST /api/analytics/events` with validation, published-startup/post checks and rate limits.
- Added browser-local random visitor key, Public Startup profile-view tracking and post-impression markers; Discover post impressions and opens are tracked, with owner actions excluded.
- Extended `GET /api/founder/audience?range=7|30|90` with profile views, post impressions, post opens, unique visitors, profile-view sources, daily series and per-post impressions/opens.
- Reworked the founder Audience page with a 7/30/90 selector, analytics trend, source breakdown, per-post counts and an honest no-activity state.
- Enforced legal research status transitions in `updateStaffTest`; illegal jumps return 409. Staff audit events now record `actor_id`.
- Added founder notifications for request received, recruiting/findings status changes and research status updates; publishing still sends the existing findings notification.
- Added authenticated `GET /api/founder/tests/:id/report`, which refuses unpublished findings and returns Markdown with aggregate sample counts, no tester identity/contact data. Added a download action to the founder test detail page.
- Added report versioning: findings carry a `version`, increments on each staff save draft, and the report/UI expose it.
- Added privacy-notice wording for first-party audience events and the browser-local deduplication key; bumped privacy version to 2026-11-15.
- Added integration coverage for public analytics, daily deduplication, unsupported event type rejection, research transitions/audit/notification, report generation and stranger authorization.

## Verification (MVP alignment)
- `pnpm db:migrate`: migration 0015 applied locally.
- `pnpm typecheck`: pass.
- `pnpm typecheck:server`: pass.
- `pnpm test`: 103 tests across 8 files, all pass.
- `pnpm lint`: 0 errors, 17 pre-existing warnings.
- `pnpm build`: pass (existing >500 kB chunk warning).
- Playwright checks: `tests/home.spec.ts` on desktop Chrome passed (exit 0), including the 360/390/768/1440 responsive-layout tests, and one signed-in auth flow test (`sign-up page offers both roles`) passed on the auth desktop project. Full signed-in suite was not run to completion in this pass.
- Temporary integration rows: 0 `mvp.%` people, 0 `integration.%` people, 0 `pw.%` people, 0 MVP/Integration tests and 0 analytics-session events. Existing demo/test rows were left untouched.

## Verification
- `pnpm db:migrate`: migrations 0012, 0013 and 0014 applied locally.
- `pnpm typecheck`: pass.
- `pnpm typecheck:server`: pass.
- `pnpm test`: 96 tests across 7 files, all pass.
- `pnpm lint`: 0 errors, 17 pre-existing warnings.
- `pnpm build`: pass (existing >500 kB chunk warning).
- Temporary integration rows: 0 people/startups with the integration prefixes and 0 audience events. Existing dated demo/test rows were left untouched.
- No payment flow, commit, push or deployment was made.

## Remaining external/blocking work
- Payments/proposals/quotes remain blocked: no payment provider is installed or configured, and the product currently promises no payments/payouts. Do not fake a provider callback or mark a request paid.
- Optional AI Guide remains deferred; no secure LLM provider/configuration and the managed workflow prerequisite is still optional.
- Live Clerk/Resend provider paths were not exercised locally; WebKit/Safari e2e is unavailable on this host.

## 2026-11-27 — Verification pass on `feat/rapid-mvp-alignment`
- Every check was run on the pushed branch and its full output kept under `.planning/rapid-dashboard/verify/`, which is gitignored so a restarted shell cannot erase the evidence (`*.log`, `*.exit`, `e2e-auth.counts`, plus the `run-checks.sh`/`run-e2e.sh` used to reproduce them).
- `pnpm db:migrate`: applied `0016_published_findings.sql`. The first `pnpm test` failed with `relation "published_findings" does not exist`; that dev database had simply never been migrated past 0015 (CI runs `db:migrate` before `test`), so the fix was the migration, not the code.
- `pnpm test`: 106 passed, 9 files, all green.
- `pnpm typecheck`: pass. `pnpm typecheck:server`: pass.
- `pnpm lint`: 0 warnings, 0 errors across 160 files.
- `pnpm build`: pass.
- `pnpm e2e:auth`: 31 passed in 8.7m, exit 0, one uninterrupted run over auth-desktop (10), auth-mobile (3) and auth-forms (14), including the founder → tester → staff → findings loop and the role-isolation checks.
- Leftover test users (`pw.` / `mvp.` / `integration.`): 0 before the run and 0 after. Global setup found nothing to remove; global teardown reported `cleaned up 14 test records`.
- `visit()` in `tests/auth/env.ts` was narrowed: it reloads only when Chromium reported `net::ERR_NETWORK_CHANGED` for a request during that load, so a blank page from a thrown error, broken build or unmounted route still throws on the first attempt.
- Still owner configuration, deliberately not stubbed: Paystack `PAYSTACK_SECRET_KEY` and the OpenAI key. Without them the app reports "not configured" and uses the manual fallback, which is the documented behaviour.
