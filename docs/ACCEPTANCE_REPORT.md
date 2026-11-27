# RAPID platform — acceptance report

- **Pilot PRD:** `RAPID_Website_PRD_Pilot_v2.docx`, rev. 3 (17 October 2026), Sections 1–7
- **Accounts design:** [`docs/superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md`](superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md)
- **Build:** public pilot 23 October 2026; accounts, dashboards, API and staff workspace 24 October 2026
- **Environment:** Ubuntu 24.04 (WSL2), Node 22.23.2, pnpm 12.5.1, Playwright 1.63.0, Postgres 16
- **Site build:** Vite 8 production build with `VITE_SITE_URL=https://rapid.africa`

## Command results

| Check | Command | Result |
|---|---|---|
| App typecheck | `pnpm typecheck` | Pass, no errors |
| Server typecheck | `pnpm typecheck:server` | Pass, no errors |
| Lint | `pnpm lint` | Pass, 0 errors, 10 warnings (React Compiler advisories in session/effect code) |
| Unit / server tests | `pnpm test` | **84 passed** (6 files) |
| Production build | `pnpm build` | Pass; 554 KB main JS (162 KB gzip), 29 KB CSS (6.9 KB gzip) |
| Browser tests | `pnpm e2e` | **106 passed, 2 skipped** (3 projects × public tests) |
| Signed-in tests | `pnpm e2e:auth` | **11 passed** (8 serial desktop flows, 3 mobile account projects) against Postgres |
| Accessibility | `tests/a11y.spec.ts` | **0 axe violations and 0 review items** on home, both forms, privacy and 404 in all three projects |
| Mobile load | `tests/perf.spec.ts` | 1.36 s DOMContentLoaded, 1.36 s load, 172 KB transferred (160 KB JS) at 1.6 Mbps / 150 ms RTT / 4× CPU |

Unit suites: `submission-schema` (21), Apps Script emulator (48), analytics (5),
attribution (4), auth session (3), dashboard status helpers (3).

Browser projects: desktop Chrome, desktop Firefox, Pixel 5 (mobile Chrome). Each
project runs the full public route, form, responsive, accessibility and hygiene
suites. The load-budget test runs on Chromium only (CDP throttling).

## Public pilot acceptance

| ID | Requirement | Evidence | Status |
|---|---|---|---|
| A01 | All links, form routes, privacy, confirmations and 404 work; both audience paths easy to find | `tests/home.spec.ts`; header now carries For testers / For founders / How it works / Sign in on desktop and a visible role strip on mobile; footer is no longer the only founder door | Pass |
| A02 | Valid tester and founder forms persist; a tester can also send a founder request | `tests/forms.spec.ts`; applications now write through `/api/applications/*` to Postgres, with the Apps Script path kept as history | Pass against the local database |
| A03 | Required, conditional, age, email-confirmation, selection-count, phone and length rules work on client and server | `submission-schema.test.ts`, `tests/hygiene.spec.ts`, server validation in `src/server/applications.ts` | Pass |
| A04 | Unchecked WhatsApp consent and blank phone accepted; reminders require a valid number | `forms.spec.ts` phone tests; shared schema | Pass |
| A05 | Repeat tester email = one application, prior answers unchanged; founder retry = one request, new request allowed | `forms.spec.ts` duplicate path; `submit_tester` upsert and submission-ID checks in the API | Pass |
| A06 | Forced save failure preserves answers, allows retry; no success before a durable save | `forms.spec.ts` failure/retry tests; confirmation renders only after `ok` | Pass |
| A07 | Staff can filter, update, export, suppress and delete; visitors cannot read records; CSV cells cannot execute formulas | `/staff` queue, CSV export and anonymise endpoints; `Code.gs.test.ts` retains CSV escaping coverage for the legacy exporter | Pass (API export audited manually) |
| A08 | Consent versions, timestamps, source tags and separate statuses save; withdrawn testers excluded from invitation exports | Migration columns; application inserts; export query excludes suppressed/deleted people | Pass |
| A09 | Phone layouts and browsers work; labels, focus, errors and contrast pass review | 360/390/768/1440 overflow checks in every project; axe clean; visible focus styles | Partial — Chrome, Firefox and Pixel 5 pass; WebKit blocked (below) |
| A10 | New-record analytics counted once with no personal answers; duplicates do not inflate sign-ups | `analytics.test.ts`; duplicate path never emits `form_success` | Pass |

## Accounts and dashboards acceptance

| ID | Requirement | Evidence | Status |
|---|---|---|---|
| A11 | A visitor can apply without an account, then claim the record by signing in with the same verified email | Application → `people` upsert → Clerk `ensureClerkPerson` links `clerk_user_id` by verified email; local mode opens any existing record by email | Pass in local mode; Clerk link path implemented, not exercised without keys |
| A12 | Roles are derived from rows, never from the client | `getMe` plus `requireTester`, `requireFounder` and `requireStaff` query `tester_profiles`, `founder_profiles`, `staff_members`; no role header is trusted | Pass |
| A13 | A tester sees status, invitations, terms, accept/decline, response, history and reward | `tests/auth/flow.spec.ts`: real invitation accepted, task terms visible, response submitted, status `completed` and the written answer displayed; overview, invitations, history and profile render live rows. Reward-pending display was checked manually at 390 px | Pass (automated loop; reward display manual) |
| A14 | A founder sees real status, counts with denominators, findings and records a decision | `tests/auth/flow.spec.ts`: published test shows 1 of 1 accepted, 100% response rate, the consented quote and limits, and records an `Iterate` decision through the UI | Pass (automated) |
| A15 | Staff can review applications, scope tests, filter candidates, invite, review responses, publish findings, export and anonymise | `tests/auth/flow.spec.ts`: staff approves the application, sets status/audience/reward/terms, invites the selected candidate, reads the response and saves plus publishes findings. CSV export and anonymisation were audited manually by API call | Pass (automated core loop; export/anonymise manual) |
| A16 | Empty authenticated surfaces show explicit empty states, never sample data | The seed inserts profiles only, no test or response records; dashboards query rows and render "No … yet" states | Pass |
| A17 | Authorization is server-side and does not disclose other surfaces | `tests/auth/flow.spec.ts`: anonymous `/api/me`, `/api/tester/overview` and `/api/staff/summary` → **401**; founder → tester and staff APIs → **404**; tester → founder **list** and staff APIs → **404**; staff → tester and founder APIs → **404**; each role's route guard redirects or shows the 404 page; foreign `Origin` on a mutation → **403** (manual) | Pass (automated isolation; origin check manual) |
| A18 | Authenticated pages are usable and accessible on a phone | `tests/auth/mobile.spec.ts`: tester overview/invitations/history/profile/notifications, founder overview/new/profile/notifications and staff home/applications/tests at 390 px, main pages again at 360 px — zero horizontal overflow and zero axe violations on every page. Dynamic detail pages were checked manually at 390 px | Pass (automated main pages; detail pages manual) |
| A19 | Privileged changes are audited; email attempts are logged | `audit_events` writes on decisions, status changes, invitations, findings, rewards and anonymisation; `email_log` records status and provider id | Pass by inspection |
| A20 | Account data and processors are described in the privacy notice | `/privacy` covers accounts, Clerk, Neon, Vercel, Resend, retention and deletion | Pass; needs legal sign-off |

## Role and security checks

| Check | Result |
|---|---|
| Anonymous session read | 401 |
| Anonymous tester overview | 401 |
| Anonymous staff summary | 401 |
| Founder requesting tester overview or invitations | 404 |
| Founder requesting staff summary | 404 |
| Tester requesting founder list | 404 |
| Tester requesting staff applications | 404 |
| Staff requesting tester or founder APIs | 404 |
| Tester opening `/app/founder` | Redirect to `/app/tester` |
| Founder or tester opening `/staff` | 404 page, no surface disclosed |
| Cross-origin mutation | 403 |
| Session cookie (local mode) | HttpOnly, SameSite=Lax, signed HMAC, 7 days |
| Dev auth on Vercel or production | Disabled regardless of the environment file |
| Client database credentials | None; only same-origin `/api` calls |

## Accessibility and responsive layout

- Public pages: axe 0 violations, 0 review items, across desktop Chrome, desktop
  Firefox and Pixel 5.
- Authenticated pages: `tests/auth/mobile.spec.ts` runs axe on tester overview,
  invitations, history, profile and notifications; founder overview, new request,
  profile and notifications; and staff home, applications and tests — 0 violations.
  Dynamic detail pages (tester invitation, founder test, staff application and test)
  were audited manually at 390 px and remain a manual check. The only reported review
  item in the manual pass was a contrast check on the injected `html > div`
  development badge, not on RAPID markup.
- Mobile overflow: public pages clean at 360/390/768/1440. Authenticated main pages
  are asserted clean at 390 and 360 in the auth suite; detail pages were verified
  manually at 390 px after fixing an absolutely positioned screen-reader label that
  escaped the mobile navigation scroll strip.
- Fixes made in this pass: visible role doors in the mobile header, founders reachable
  from primary navigation, a real footer path, the founders hero outline button given
  a computable background, the notification unread dot given `role="img"`, and the
  response textarea label corrected from "Your account" to "Your account of what
  happened".

## Performance

Measured on the production build with `tests/perf.spec.ts` (1.6 Mbps down, 150 ms RTT,
4× CPU): DOMContentLoaded 1.36 s, load 1.36 s, 172 KB transferred including 160 KB JS
and 6.9 KB gzip CSS. Clerk is loaded as a separate lazy chunk only on account routes. The dashboard pages
share the main bundle, which grew from 142 KB to 162 KB gzip; the public load budget
still passes. No video, autoplay or pop-ups.

## Browser matrix

| Target | Status |
|---|---|
| Desktop Chrome (Chromium) | Tested |
| Android Chrome (Pixel 5 profile) | Tested |
| Desktop Firefox | Tested |
| Desktop Safari (WebKit) | **Not run** — host lacks GTK/GStreamer; install with `sudo pnpm exec playwright install-deps webkit` |
| iPhone Safari (WebKit) | **Not run** — same blocker |
| Desktop Edge | Not run directly; Chromium-based and covered by the Chromium engine |

## Known limits and open gaps

1. **Authenticated detail pages are not in the mobile project.** `pnpm e2e:auth`
   covers the full loop and every role's main pages. The dynamic tester invitation,
   founder test and staff application/test detail pages are exercised in the desktop
   flow and were checked manually at 390 px, but the automated mobile project does
   not create its own records to visit them.
2. **Clerk and Resend were not exercised live.** No keys are configured in this
   environment. Local role sign-in and the email capture adapter stand in. The Clerk
   token path and Resend send path are implemented but unproven against the providers.
3. **Email has one retry but no queue or resend control.** A send is attempted twice;
   a failure is logged in `email_log` and never rolls back the action. Staff cannot
   resend from the workspace yet.
4. **No payments or payout processing.** Reward status is display plus a staff-marked
   `sent` flag, as designed.
5. **Matching is team-assisted.** Candidate filters help staff choose; no automated
   matching, and applying never guarantees an invitation.
6. **WebKit coverage is pending** the system-library install described above.
7. **The privacy notice needs legal sign-off** and a confirmed retention period.
8. **The legacy sheet migration has not been run.** If there are live sheet records,
   import them before switching the Apps Script endpoint off.

## Checks still owned by RAPID before launch

- Set production `DATABASE_URL`, Clerk keys, `RESEND_API_KEY` and `EMAIL_FROM`; verify
  the sending domain.
- Require MFA for staff Clerk accounts and name every staff member.
- Run one labelled tester through apply → approve → invite → accept → respond and one
  founder through request → scope → findings → decide against the live deployment.
- Confirm support inbox monitoring and the retention/deletion process.
- Confirm analytics consent and session counting.
- Install WebKit libraries and run the Safari projects if iPhone coverage is required.
