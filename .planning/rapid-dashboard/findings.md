# Findings — RAPID Dashboard Remaining Work

## Source requirements
- Attached file: `Rapid_Founder_Dashboard_Implementation_Plan.docx.txt` (19,714 bytes). Complete plan through release gate.
- Phases 1–6 have substantial implementation; phase 6 completed startup profile reports and founder engagement notices.
- Phase 7 asks for impressions, opens, profile visits, date filters (7/30/90), startup/post breakdown, real attribution, defined denominators/deduplication, honest sparse-data states.
- Phases 8–9 ask for managed request → operator scope/approval → payment verified → recruiting/execution → report publish/download with strict transition and report privacy.
- Phase 13 says implement only payment flows RAPID can fulfill; use a provider and verify callbacks. README says payments/payouts are explicitly not in scope. Do not invent a payment integration.
- Phase 10 AI Guide is optional and only after managed intake works; no third-party LLM service is currently in dependencies or configured.

## Repository context
- React 19 / Vite / Router, same-origin API served through Vite and a Vercel function, PostgreSQL (`pg`), local Vitest + Playwright.
- Canonical organic entities: `startups`, `posts`, `startup_follows`, `post_feedback`, `waitlist_entries`, `startup_demo_clicks`; linked tests use `tests` and invitations.
- Migrations 0009–0011 cover discovery/linked tests/reports; 0012 adds audience events; 0013 adds research-status notifications; 0014 adds report versions and request-received notifications.
- The founder Audience page now has 7/30/90 analytics, profile views, post impressions/opens, unique visitors, sources, daily trend and per-post breakdown.
- The managed research flow now has legal status transitions, actor audits, founder status notices, a published-only Markdown report and report download without tester PII.
- Payment provider is absent; README notes payments/payouts out of scope. No provider keys or account configuration are present.

## Resolved decisions
- Analytics uses first-party, anonymous `audience_events` with a browser-local random visitor key, a unique event/day constraint and allow-listed event types/sources. No IP, account ID, raw URL or campaign query values are stored.
- Profile views are attributed to a startup; impressions and opens to a post. Owner actions are excluded in the browser. Analytics is explicitly organic activity, not research evidence.
- Metrics are deduplicated per visitor per item per day; a refresh does not inflate counts. Sparse/zero periods show an honest empty state.
- Research transitions are constrained in the server, not only the UI. `published` is reachable only through the staff findings endpoint. The staff actor is recorded in `audit_events`.
- Founder notifications cover request received, research status changes, findings published, follows, feedback, waitlist and moderation.
- The report is generated from published findings in the database, includes aggregate sample counts and report version, and excludes tester identity/contact data. Strangers receive 404.
- Payments remain blocked rather than implementing an insecure or fake flow.
- Optional AI remains deferred; no secure provider/configuration exists.

## Verification
- `pnpm test`: 96 passing tests in 7 files, including 12 database integration tests.
- `pnpm typecheck` and `pnpm typecheck:server`: pass.
- `pnpm lint`: 0 errors, 17 existing warnings.
- `pnpm build`: pass with the existing large-chunk warning.
- Integration cleanup: no new people/startups/audience events remained; pre-existing dated demo rows were left untouched.

## Remaining external/setup gaps
- Payment/proposal/quote implementation requires a chosen provider, server-side verification and product approval; not present.
- Optional AI Guide needs a secure provider/configuration and explicit product decision.
- Live Clerk/Resend paths, production deployment and WebKit/Safari coverage remain unexercised in this environment.
