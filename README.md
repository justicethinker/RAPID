# RAPID — Pilot Website

Tester-first marketing site, tester application and founder request form for the
RAPID pilot. Implements Sections 1–7 of `RAPID_Website_PRD_Pilot_v2.docx`
(rev. 3, 17 October 2026). Sections 8–11 of the PRD are manual team operations
and add no website features.

## Quick start

```bash
pnpm install
cp .env.example .env.local     # set VITE_SUBMISSIONS_ENDPOINT before real use
pnpm dev                       # http://localhost:5173
```

Node 22+ and pnpm 12 are expected (the reference environment is Ubuntu 24.04 /
WSL2).

## Routes

| Route | Purpose |
|---|---|
| `/` | Tester-first homepage with a short founder section |
| `/join` | Tester application — **Request your invite** |
| `/founders` | Founder request — **Send my request** |
| `/thanks/tester`, `/thanks/founder` | Confirmations, shown only after a confirmed save |
| `/privacy` | Pilot privacy notice |
| `*` | Useful 404 |

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Typecheck and production build |
| `pnpm preview` | Serve the production build on port 4173 |
| `pnpm typecheck` | TypeScript project build check |
| `pnpm lint` | oxlint |
| `pnpm test` | Vitest: schemas, analytics, attribution, Apps Script backend |
| `pnpm e2e` | Playwright: routes, forms, a11y, responsive, load budget |
| `pnpm logo` | Regenerate brand assets from `logoimage/` (design tooling) |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SITE_URL` | Recommended | Canonical/OG URLs, `robots.txt` and `sitemap.xml`. Defaults to the current Vercel URL |
| `VITE_SUBMISSIONS_ENDPOINT` | Yes, before launch | Google Apps Script `/exec` URL. Unset means forms show the honest save-error state |
| `VITE_CONTACT_EMAIL` | Recommended | Support address in the footer, confirmations and privacy page |
| `VITE_PLAUSIBLE_DOMAIN` | Optional | Enables Plausible analytics. Unset disables all analytics |
| `VITE_PLAUSIBLE_SRC` | Optional | Self-hosted Plausible script override |

Never commit `.env.local`. `VITE_*` values are baked in at build time, so rebuild
after changing them.

## How it works

```
Browser (React SPA)
  ├─ /join, /founders ──► src/lib/submission-schema.ts  (client rules)
  │                        src/lib/submissions.ts       (one JSON envelope)
  ▼
Google Apps Script web app  ──► private Google Sheet
  ├─ re-validates every rule
  ├─ dedupes tester email / founder submission ID
  ├─ spam trap + contact rate limit
  └─ writes to "Testers" or "Founders"
```

- `src/content/pilot.ts` is the single editable source for public copy and
  option lists. `integrations/google-apps-script/Code.gs` mirrors the option
  codes; change both together.
- The submission envelope carries a stable `submissionId`, schema/privacy
  versions, acknowledgement time and source/medium/campaign/landing path.
- Confirmation pages render only after the endpoint confirms a durable save. A
  failed save keeps every answer and retries with the same submission ID.
- `VITE_SUBMISSIONS_ENDPOINT` unset or unreachable → required error state, never
  a fake success.

## Storage and private team access

The private record store is one Google Sheet with separate **Testers** and
**Founders** tabs, managed by the Apps Script in
[`integrations/google-apps-script/`](integrations/google-apps-script/README.md).
That README covers deployment, statuses, filtering with filter views, CSV
exports, suppression, deletion, backup/restore and known limits.

Team workflow in short:

1. Share the spreadsheet with named team members only. Visitors cannot list,
   query or export records — the web app has no read endpoint.
2. Filter with Google Sheets filter views by segment, activity, school,
   location, interests or status.
3. Use the **RAPID** menu for exports. The invitation export includes only
   `Accepted`, non-suppressed testers. CSV cells neutralise formulas.
4. Suppress or delete a person from the same menu; withdrawals are applied to
   exports and manual contact lists too.
5. Back up with **File → Make a copy** before each pilot batch; restore by
   copying a backup back into the team Drive.

## Analytics

Plausible (`script.manual.js`) is loaded only when `VITE_PLAUSIBLE_DOMAIN` is
set. Events: `pageview`, `cta_click`, `form_start`,
`form_validation_error` (field code), `form_save_failure`, `form_success` and
`form_duplicate`. Page paths only — no query strings, names, emails, phones or
written answers. A session receipt makes `form_success` count once per
submission.

Visitor/session counting and consent settings remain a pre-launch decision
(recorded in `NOTES.md`).

## Verification

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm e2e
```

The Playwright run covers desktop Chrome, desktop Firefox and mobile Chrome
(Pixel 5). Desktop Safari and iPhone Safari (WebKit) need system GTK/GStreamer
libraries that are not installed here; install them with
`sudo pnpm exec playwright install-deps webkit` and run
`PLAYWRIGHT_INCLUDE_WEBKIT=1 pnpm e2e`. Edge is Chromium-based and is covered by
the Chromium project.

Current results and the acceptance-test mapping are in
[`docs/ACCEPTANCE_REPORT.md`](docs/ACCEPTANCE_REPORT.md). Build decisions and
trade-offs are in [`NOTES.md`](NOTES.md).

## Deployment

1. Build the Apps Script backend and confirm the `/exec` URL responds with
   `{"ok":true,"service":"rapid-pilot"}`.
2. Set `VITE_SITE_URL`, `VITE_SUBMISSIONS_ENDPOINT` and `VITE_CONTACT_EMAIL` in
   the host's environment.
3. `pnpm build`, then deploy `dist/` to Vercel (static SPA). `vercel.json` adds
   the SPA rewrite and security headers/CSP.
4. Update the CSP in `vercel.json` if you use a self-hosted analytics script.
5. Run one internal tester application and one founder request end to end with
   clearly labelled test data.

The `robots.txt` and `sitemap.xml` in `dist/` are generated from
`VITE_SITE_URL`; do not edit them in `public/`.

## Launch inputs still owned by RAPID

- Approved support email (currently `hello@rapid.africa`) and final public copy.
- Domain, then set `VITE_SITE_URL`.
- Approved privacy text and retention period (policy currently rev.
  `2026-10-20`).
- Apps Script deployment URL, sheet ownership and named team users.
- Analytics account, consent mode and visitor/session counting method.
- Confirmed capacity for the three-business-day review and response aim.
- Email sending process, monitored support inbox, screening guide, test brief,
  task terms, reward plan and private test log.
