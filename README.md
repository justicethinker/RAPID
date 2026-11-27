# RAPID — pilot platform

RAPID is a two-sided research pilot. Founders bring a question; testers bring lived
experience; the team turns the answers into evidence. This repository is the whole
product: the public site, a role-first sign-up and application flow, a tester account,
a founder account, and the staff workspace that runs the pilot.

The public copy still follows the pilot PRD. Accounts, dashboards and the operating
API extend it; [`docs/superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md`](docs/superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md)
is the design of record for that layer.

## What is in the box

- **Public site** — `/`, `/join`, `/founders`, `/sign-up`, `/thanks/*`, `/privacy`,
  useful 404.
- **Sign-up and onboarding** — `/sign-up` asks whether you are a tester or a founder;
  `/sign-up/tester` and `/sign-up/founder` create the account (Google or email, per the
  Clerk instance), then show that role's application form. Success lands on the account.
- **Tester account** — application status, invitations, task terms, accept/decline,
  response form, history, reward status, profile.
- **Founder account** — tests with real recruitment counts, published findings,
  anonymised quotes where consent allows, and a recorded build/iterate/pivot decision.
- **Staff workspace** — application queue and decisions, test scoping, candidate
  filters, invitations, response review, findings editor and publish, CSV export,
  anonymisation.
- **API** — same-origin `/api/*`, implemented once and served by a Vercel Function in
  production and by Vite middleware in development.
- **Postgres** — people, profiles, tests, invitations, responses, findings,
  notifications, staff, email log and audit events.
- **Email** — Resend when a key is configured; otherwise captured in the server log.
  Every send attempt is recorded in `email_log`.

Payments use server-side Paystack initialization, verification and webhooks when `PAYSTACK_SECRET_KEY` is configured; the guided AI intake and findings drafting use a server-only AI adapter when `AI_API_KEY` is configured and fall back to deterministic manual templates when it is not. Automated withdrawals, video, native apps and guaranteed automated matching remain out of scope. Matching stays team-assisted and every dashboard says so.

## Quick start

Requirements: Node 22 (npm 10+) and a Postgres 14+ database. The reference
environment is Ubuntu 24.04 / WSL2.

```bash
npm install
cp .env.example .env.local
# set DATABASE_URL, ALLOW_DEV_AUTH=1 and any long DEV_AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. With no Clerk key the site runs in **local mode**:
`/sign-up` creates a real local account from a name and email and continues to the role
form, and `/sign-in` opens any existing account by its email address, so you can
follow one person through every role. Staff use their own door,
`/admin/sign-in`, with `ADMIN_SIGN_IN_USERNAME` and `ADMIN_SIGN_IN_PASSWORD`
(`admin` / `admin` on a fresh machine).

If Postgres is not running, start any local instance and point `DATABASE_URL` at it:

```bash
docker run --name rapid-dev-db -e POSTGRES_USER=rapid -e POSTGRES_PASSWORD=rapid \
  -e POSTGRES_DB=rapid -p 5433:5432 -d postgres:16
```

The seed creates `dev.tester@rapid.local`, `dev.founder@rapid.local` and
`dev.staff@rapid.local`. It never runs against production and refuses when
`VERCEL_ENV=production`.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Two-sided homepage: the loop, the role fork, limits and FAQ |
| `/join` | Public | What testers do; links into sign-up |
| `/founders` | Public | What a founder gets; links into sign-up |
| `/sign-up` | Public | Role picker: tester or founder |
| `/sign-up/:role` | Public | Step 1 account (Clerk or local), step 2 the role form |
| `/thanks/tester`, `/thanks/founder` | Public | Public-only confirmations; onboarding lands on `/app` |
| `/privacy` | Public | Pilot privacy notice, including account processors |
| `/sign-in` | Public | Clerk when configured; otherwise email sign-in for testers and founders |
| `/admin` | Public door | Staff access check; explains the invitation and links to the admin sign-in |
| `/admin/sign-in` | Local staff | Admin username and password; unavailable outside local mode |
| `/admin/sign-up` | Invited staff | Creates the account that an existing admin invited |
| `/app` | Signed in | Role chooser, or direct redirect for a single role |
| `/app/tester` | Tester | Status sentence, counts, recent invitations |
| `/app/tester/invitations[/:id]` | Tester | Invitations and the task/response flow |
| `/app/tester/history` | Tester | Completed tests and reward status |
| `/app/tester/profile` | Tester | Contact details, interests, WhatsApp, removal request |
| `/app/founder` | Founder | Tests and what is expected next |
| `/app/founder/new` | Founder | Request another test in-app |
| `/app/founder/intake[/:id]` | Founder | Guided AI/manual intake and structured brief |
| `/app/founder/tests/:id` | Founder | Status, counts, findings, payment, evidence and decision |
| `/app/founder/profile` | Founder | Contact details and organisation |
| `/app/notifications` | Signed in | In-app notifications |
| `/staff` | Staff | Live pilot counts and CSV export |
| `/staff/applications[/:id]` | Staff | Review queue and full application |
| `/staff/tests[/:id]` | Staff | Pipeline, scoping, study builder, candidates, invitations, findings |
| `/staff/team` | Staff | Invite or remove admins |

A signed-in person with no profile gets a role-choice screen. Non-staff visitors get
the 404 page for `/staff`, not a 403, so the surface is not disclosed.

### Staff access

Admin accounts are **not** self-serve and there is no admin card in the public
sign-up picker. Access is granted in one of two ways:

1. **Bootstrap (first admin):** an address listed in `STAFF_EMAILS` receives the
   staff role automatically the next time it loads its account.
2. **Invitation:** a staff member adds an address at `/staff/team`. The invite is
   claimed the first time that exact address signs in or creates an account, and it
   can be revoked from the same page before it is used.

Invited people start at `/admin` → **Create an admin account**, sign up with the
invited address, and land in `/staff`. Local mode additionally exposes
`/admin/sign-in`, which asks for `ADMIN_SIGN_IN_USERNAME` and `ADMIN_SIGN_IN_PASSWORD`
and is refused by the API whenever local role sign-in is off. Removing the last staff
member is refused, and nobody can remove their own access, so the pilot cannot lock
itself out.

Access is a database row once granted: taking an address out of `STAFF_EMAILS` stops
future grants but does not revoke one. Revoke it at `/staff/team`.

## Architecture

```
Browser (React 19 + Vite + Router)
  ├─ public routes, no session mounted
  ├─ account routes mount Clerk/local session
  │    bearer token (Clerk) or HttpOnly dev cookie (local only)
  ▼
/api/*  ── api/[...path].ts (Vercel Function)  /  Vite middleware in dev
  ├─ verify session, load person, derive roles from rows
  ├─ authorize per row (tester owns invitation, founder owns test, staff row)
  ├─ validate input with the shared zod schemas
  ├─ Postgres (pg)
  ├─ in-app notifications + Resend email (optional)
  └─ audit_events for privileged changes
```

Roles are never read from a client claim:

| Role | Derived from |
|---|---|
| Tester | `tester_profiles.person_id` exists |
| Founder | `founder_profiles.person_id` exists |
| Staff | `staff_members.person_id` exists |

The browser holds no database credentials or service keys. Mutations reject a
foreign `Origin`. Responses are `cache-control: no-store`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes (server) | Postgres connection string. Neon in production |
| `CLERK_SECRET_KEY` | For Clerk | Verifies session tokens |
| `VITE_CLERK_PUBLISHABLE_KEY` | For Clerk | Mounts Clerk in the browser |
| `ALLOW_DEV_AUTH` | Local only | `1` enables the seeded role sign-in. Ignored on Vercel and in production |
| `STAFF_EMAILS` | For the first admin | Comma-separated addresses that always hold staff access |
| `DEV_AUTH_SECRET` | Local only | HMAC key for the local session cookie |
| `ADMIN_SIGN_IN_USERNAME` | Local only | Username for `/admin/sign-in`; defaults to `admin` |
| `ADMIN_SIGN_IN_PASSWORD` | Local only | Password for `/admin/sign-in`; defaults to `admin` |
| `RESEND_API_KEY` | Production | Sends receipt, decision, invitation and findings email |
| `EMAIL_FROM` | Optional | Sender identity; defaults to `RAPID <hello@rapid.africa>` |
| `VITE_SITE_URL` | Recommended | Canonical/OG URLs, `robots.txt`, `sitemap.xml` |
| `VITE_CONTACT_EMAIL` | Recommended | Support address across the site |
| `VITE_PLAUSIBLE_DOMAIN` | Optional | Enables privacy-first analytics |
| `VITE_PLAUSIBLE_SRC` | Optional | Self-hosted Plausible script |
| `VITE_SUBMISSIONS_ENDPOINT` | Legacy | Old Apps Script endpoint; the API now owns applications |

Never commit `.env.local`. `VITE_*` values are baked in at build time.

## Database

```bash
npm run db:migrate   # applies db/migrations/*.sql in order, tracked in schema_migrations
npm run db:seed      # local role accounts only
```

Migrations cover the pilot application tables plus accounts, tests, invitations,
responses, findings, notifications, staff, email log, audit events, review notes and
tester profile timestamps. No demo records are inserted by the seed. Anything you see
in a dashboard is a real row you or the team created.

## API

Public: `POST /api/applications/tester|founder`, `POST /api/analytics/events`
(anonymous profile views, post impressions and post opens with an allow-listed source),
`GET /api/health`. A submission sent with a session belongs to that account and may not
name a different email; an anonymous submission keeps the public path and creates or
reuses the person by email.

Signed in: `GET/PATCH /api/me`, `GET /api/notifications`,
`POST /api/notifications/:id/read`.

Tester: `GET /api/tester/overview`, `GET /api/tester/invitations`,
`GET /api/tester/invitations/:id`, `POST /api/tester/invitations/:id/respond`,
`POST /api/tester/invitations/:id/response`, `GET /api/tester/history`,
`PATCH /api/tester/profile`.

Founder: `GET/POST /api/founder/tests`, `GET /api/founder/tests/:id`,
`POST /api/founder/tests/:id/decision`, `GET /api/founder/tests/:id/report`
(published findings only, no tester identity data), `GET /api/founder/audience?range=7|30|90`
(followers, feedback, profile views, post impressions/opens, sources and daily trend).

Staff: `GET /api/staff/summary`, `GET /api/staff/applications`,
`GET /api/staff/applications/:id`, `POST /api/staff/applications/:id/decision`,
`GET /api/staff/tests`, `GET/PATCH /api/staff/tests/:id`,
`GET /api/staff/tests/:id/candidates`,
`POST /api/staff/tests/:id/invitations`,
`GET /api/staff/tests/:id/responses`,
`PUT /api/staff/tests/:id/findings`,
`POST /api/staff/tests/:id/findings/publish`,
`POST /api/staff/invitations/:id/reward`,
`GET /api/staff/export?type=testers|founders|invitations`,
`POST /api/staff/people/:id/anonymise`, `GET /api/staff/team`,
`POST /api/staff/team/invites`, `DELETE /api/staff/team/invites/:email`,
`DELETE /api/staff/team/members/:personId`.

Errors use `{ "error": code, "fields"?: { … } }`. Input limits and validation mirror
the browser schemas, so a crafted request cannot write a partial record.

## Email

With `RESEND_API_KEY` set, transactional mail goes through Resend. Without it the
message is captured in the server log and still recorded in `email_log`, which is what
development and tests use. Addresses ending `@rapid.invalid` or `.rapid.local` are never
sent externally. Delivery failures are logged and never fail the user's action.

## Verification

```bash
npm run typecheck && npm run typecheck:server && npm run lint && npm run test && npm run build
npm run e2e          # public site against the static production build
npm run e2e:auth     # signed-in flows against Postgres and the dev server
npm run e2e:all      # both suites
```

CI (`.github/workflows/ci.yml`) runs the same checks plus both browser suites on
every push and pull request, against a disposable Postgres 16 service.

- Unit tests cover the shared submission schema, analytics, attribution, role/status
  helpers, auth sessions and the legacy Apps Script backend.
- `npm run e2e` covers the public routes, the `/sign-up` role picker, responsive
  overflow and axe accessibility on desktop Chrome, desktop Firefox and Pixel 5. It
  uses `vite preview`, so it needs no database and ignores `tests/auth`.
- `npm run e2e:auth` is the database-backed account suite. It reads `DATABASE_URL` from
  `.env.local` (or the environment), applies migrations, seeds the three local role
  accounts, and starts Vite on port 5181. One serial test walks the whole pilot loop
  through the browser: founder signs up and sees the request, tester signs up and is
  approved, staff scopes and invites, tester accepts and responds, staff publishes
  findings, founder sees real counts and records a decision. It also proves role
  isolation at the API and route guards for all three roles, anonymous 401s and
  sign-out. It also covers admin access: a tester is refused the invitation endpoint
  and told at `/admin` that the address holds no staff role, staff invite and revoke
  an address, and the API refuses to let an admin remove their own access. Another
  project drives both role forms from the real onboarding page
  (validation, conditional fields, retries, duplicate handling, the locked account
  email), and a third repeats the tester, founder and staff pages at 390 px and
  360 px, asserting no horizontal overflow and zero axe violations. Test records use
  `pw.*@rapid.invalid` and are removed in global teardown. This suite needs a running
  Postgres; it is not part of the static preview run.

WebKit (desktop Safari and iPhone Safari) needs GTK/GStreamer libraries that are not
installed here. Install them with `sudo npx playwright install-deps webkit` and
run `PLAYWRIGHT_INCLUDE_WEBKIT=1 npm run e2e`. Edge is Chromium-based and covered by the
Chromium project.

Current results and known limits: [`docs/ACCEPTANCE_REPORT.md`](docs/ACCEPTANCE_REPORT.md).
Decisions and trade-offs: [`NOTES.md`](NOTES.md).

## Deployment

Step-by-step Vercel instructions, every environment variable and what works with none
set: [`DEPLOY.md`](DEPLOY.md). In short:

1. Provision Postgres (Neon) and run `npm run db:migrate` with the production
   `DATABASE_URL`.
2. Create a Clerk application. Enable the sign-in strategies the sign-up page should
   offer — email + password and Google — and require email verification. Set
   `VITE_CLERK_PUBLISHABLE_KEY` at build time and `CLERK_SECRET_KEY` in the host
   environment. Require MFA for staff accounts. Add the production origin to Clerk's
   allowed origins.
3. Set `RESEND_API_KEY`, `EMAIL_FROM`, `VITE_SITE_URL` and `VITE_CONTACT_EMAIL`.
   Verify the sending domain (SPF, DKIM, DMARC).
4. `npm run build`, deploy to Vercel. `vercel.json` rewrites non-API paths to the SPA and
   sets security headers; `api/[...path].ts` serves the API as a Node function.
5. Confirm the CSP allows the Clerk and Plausible hosts actually used.
6. Run one labelled tester and one founder through the live loop, including
   approve → invite → accept → respond → publish → decide.

`robots.txt` and `sitemap.xml` in `dist/` are generated from `VITE_SITE_URL`; do not
edit them in `public/`.

The production readiness log — what the code already covers and the owner actions
still open — is [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md).

## Launch inputs still owned by RAPID

- Domain and final public copy; then set `VITE_SITE_URL`.
- Privacy sign-off, retention period and deletion route (the notice names Vercel,
  Neon, Clerk, Resend and the analytics provider).
- Named staff accounts with MFA, and a monitored support inbox.
- Review capacity for the three-business-day aim.
- Migration of existing sheet records, if the pilot has live applications. The old
  Apps Script folder stays as history; no CSV is committed.
