# RAPID pilot — acceptance report

- **PRD:** `RAPID_Website_PRD_Pilot_v2.docx`, rev. 3 (17 October 2026), Sections 1–7
- **Build:** 23 October 2026
- **Environment:** Ubuntu 24.04 (WSL2), Node 22.23.2, pnpm 12.5.1, Playwright 1.63.0
- **Site build:** Vite 8 production build with `VITE_SITE_URL=https://rapid.africa`

## Command results

| Check | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | Pass, no errors |
| Lint | `pnpm lint` | Pass, 0 warnings, 0 errors (49 files) |
| Unit / server tests | `pnpm test` | **78 passed** (4 files) |
| Production build | `pnpm build` | Pass; 142 KB gzip main JS, 5.8 KB gzip CSS |
| Browser tests | `pnpm e2e` | **106 passed, 2 skipped** (3 projects × 36 tests) |
| Accessibility | included in `pnpm e2e` | **0 axe violations** on home, both forms, privacy and 404, in all three browser projects |
| Mobile load | `tests/perf.spec.ts` | 1.2 s DOMContentLoaded, 144 KB transferred (138 KB JS) at 1.6 Mbps / 150 ms RTT / 4× CPU |

Unit suites:

- `src/lib/submission-schema.test.ts` — 21 tests: every tester and founder rule,
  payload building, code/label storage, phone and email normalisation.
- `integrations/google-apps-script/Code.gs.test.ts` — 48 tests: real `doPost`
  calls against an Apps Script emulator (validation, duplicates, idempotency,
  spam trap, rate limit, CSV escaping, suppression, deletion).
- `src/lib/analytics.test.ts` — 5 tests: PII-free props, query-stripped
  pageviews, once-per-submission success.
- `src/lib/attribution.test.ts` — 4 tests: first touch, sanitisation, fallbacks.

Browser projects: desktop Chrome, desktop Firefox, Pixel 5 (mobile Chrome).
Each project runs the full route, form, responsive, accessibility and hygiene
suites. The load-budget test runs on Chromium only (CDP throttling).

## Acceptance tests

| ID | Requirement | Evidence | Status |
|---|---|---|---|
| A01 | All links, form routes, privacy, confirmations and 404 work; both audience paths easy to find | `tests/home.spec.ts` routing and audience-path tests; header has logo + invite only; footer has founders, privacy, support | Pass |
| A02 | Valid tester and founder forms persist; a tester can also send a founder request | `tests/forms.spec.ts` both-paths test; `Code.gs.test.ts` writes to separate Testers/Founders sheets | Pass (server verified against emulator; live sheet rehearsal still required) |
| A03 | Required, conditional, age, email-confirmation, selection-count, phone and length rules work on client and server | `submission-schema.test.ts` + 21 server validation cases in `Code.gs.test.ts` + `tests/hygiene.spec.ts` | Pass |
| A04 | Unchecked WhatsApp consent and blank phone accepted; reminders require a valid number | `forms.spec.ts` phone tests; server tests for both paths | Pass |
| A05 | Repeat tester email = one application, prior answers unchanged; founder retry = one request, new request allowed | `Code.gs.test.ts` duplicate, repeated-submission-ID and fresh-founder tests; `forms.spec.ts` duplicate confirmation | Pass |
| A06 | Forced save failure preserves answers, allows retry; no success before a durable save | `forms.spec.ts` failure/retry tests (same submission ID, answers retained); confirmation is only rendered after `ok` | Pass |
| A07 | Team can filter, update, export, suppress and delete; visitors cannot read records; CSV cells cannot execute formulas | `Code.gs.test.ts` menu, export escaping, invitation filter, suppression and deletion tests; sheet is private, endpoint has no read route | Pass (filtering via Sheets filter views, documented) |
| A08 | Consent versions, timestamps, source tags and separate statuses save; withdrawn testers excluded from invitation exports | Server row assertions + invitation-export exclusion test | Pass |
| A09 | Phone layouts and browsers work; labels, focus, errors and contrast pass review | 360/390/768/1440 overflow checks in every project; axe clean; visible focus styles; 17 px body text | Partial — Chrome, Firefox and Pixel 5 pass; WebKit blocked (see below) |
| A10 | New-record analytics counted once with no personal answers; duplicates do not inflate sign-ups | `analytics.test.ts` dedupe and prop sanitisation; duplicate path sends `form_duplicate`, never `form_success` | Pass |

## Browser matrix

| Target | Status |
|---|---|
| Desktop Chrome (Chromium) | Tested |
| Android Chrome (Pixel 5 profile) | Tested |
| Desktop Firefox | Tested |
| Desktop Safari (WebKit) | **Not run** — host is missing GTK/GStreamer libraries; needs `sudo pnpm exec playwright install-deps webkit` |
| iPhone Safari (WebKit) | **Not run** — same blocker |
| Desktop Edge | Not run directly — Chromium-based; no Edge binary in Linux. Covered by the Chromium engine |

Both Safari projects are configured and become active with
`PLAYWRIGHT_INCLUDE_WEBKIT=1 pnpm e2e` once the libraries are installed.

## Performance

Measured with `tests/perf.spec.ts` on the production build over a throttled
profile (1.6 Mbps down, 150 ms RTT, 4× CPU): DOMContentLoaded 1.2 s, load 1.2 s,
144 KB transferred including 138 KB JS and 5.8 KB CSS. No video, autoplay or
pop-ups. Fonts are self-hosted (Inter, subset woff2). Remaining public imagery is
two WebP brand files.

## Known limits

1. **Google Sheets has no unique constraint.** Tester uniqueness and founder
   idempotency are lookup-enforced under a script lock, not a database
   constraint. Concurrent writes at high volume could race.
2. **Rate limiting is per contact, not per connection.** Apps Script does not
   expose visitor IPs. Configure host/WAF rate limiting if a true connection
   limit is required.
3. **No automatic email.** Per scope, confirmation pages are the only receipt.
   Review outcomes, invitations and reminders are manual.
4. **The production endpoint is not yet deployed.** With
   `VITE_SUBMISSIONS_ENDPOINT` unset the forms show the required save-error
   state; they never fake a successful save. Real submissions need the Apps
   Script deployment and a rebuild.
5. **WebKit coverage is pending** the system-library install described above.
6. **The privacy notice needs legal sign-off** and the owner must confirm the
   retention period (currently a six-month inactive-review starting policy).
7. **Support address fallback.** `hello@rapid.africa` is used until
   `VITE_CONTACT_EMAIL` is set.

## Checks still owned by RAPID before public launch

- Deploy the Apps Script web app, set the endpoint, and run one clearly labelled
  internal tester application through review → outcome email → invitation →
  removal, plus one founder request through WhatsApp follow-up.
- Confirm review capacity for the three-business-day aim.
- Confirm support inbox monitoring and outcome-email templates.
- Confirm domain, privacy sign-off, retention period, analytics consent and
  session counting.
- Take a spreadsheet backup and rehearse restore once.
