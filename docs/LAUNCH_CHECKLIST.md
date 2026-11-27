# Production readiness — code complete, owner actions open

Updated 25 October 2026. This is the launch log: what the code now does, and the
steps and decisions that only the RAPID owner can complete. The acceptance
evidence is in [`ACCEPTANCE_REPORT.md`](ACCEPTANCE_REPORT.md); the design of record
is [`superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md`](superpowers/specs/2026-10-24-rapid-accounts-dashboards-design.md).

## 1. Hardening done in this pass

| Change | Where | Why |
|---|---|---|
| A person is linked to an existing application only through a **verified** primary Clerk email | `src/server/auth.ts` | Linking is by email; an unverified address could otherwise claim someone else's record. Returns `403 email_unverified`, and the account screen says what to do. |
| `/api/health` runs `select 1` and returns **503** when Postgres is unreachable | `src/server/router.ts` | An uptime monitor used to stay green while every real request failed. |
| Migrations take a Postgres **advisory lock** | `scripts/migrate.mjs` | Two deploys can no longer race the same migration files. |
| **HSTS** added (`max-age=63072000; includeSubDomains; preload`) | `vercel.json` | Enforces HTTPS for a year. |
| Dead Apps Script origins removed from `connect-src` | `vercel.json` | Applications now post to `/api`; the old endpoints are no longer contacted. |
| Email send retries **once** after 400 ms with an 8 s timeout per attempt | `src/server/email.ts` | Covers a provider blip without holding the request open. Failures still never undo the user's action. |
| **CI** runs typecheck (app + server), lint, unit tests, build, the public browser suite and the signed-in suite against Postgres 16 | `.github/workflows/ci.yml` | The signed-in suite previously ran only on a developer machine. |

### Admin access, added 25 October

- There is **no public admin sign-up**. The first admin is bootstrapped with
  `STAFF_EMAILS`; everyone else is invited at `/staff/team`, signs up at `/admin`
  with the invited address, and gets the staff role on first sign-in. Invites can be
  revoked before use, and the API refuses to remove the last admin or let an admin
  remove their own access.
- `/admin` explains the invitation instead of returning a 404, and `/admin/sign-up`
  is reachable only as an account-creation page, not from the role picker.

### Sign-up flow, rebuilt 25 October

- `/sign-up` now asks **tester or founder** first. The chosen path
  (`/sign-up/tester`, `/sign-up/founder`) creates the account, then shows the
  existing role form, then lands on that role's dashboard. `/join` and `/founders`
  stay as the information pages and link into this flow.
- A signed-in submission is attached to the **account**, not to whatever email the
  payload names. The address is prefilled and read-only; a mismatch is rejected with
  a field error. Anonymous submissions keep the old by-email path.
- Local mode gained a real account-creation panel, so the whole journey works
  without Clerk keys. `ALLOW_DEV_AUTH=1` still gates it, and it is unreachable on any
  deployment.
- The embedded Clerk `<SignUp>` uses virtual routing and returns to the same step, so
  a completed sign-up is not bounced to an empty dashboard before the form.

Verified after the changes: `pnpm typecheck`, `pnpm typecheck:server`, `pnpm lint`
(0 errors, the same 10 React Compiler warnings), `pnpm test` (84 passed),
`pnpm build`, `pnpm e2e` (55 passed, 2 skipped), `pnpm e2e:auth` (31 passed: 10 loop,
18 form, 3 mobile), and a manual probe showing `/api/health` →
`503 {"ok":false,"database":false,…}` with the database unreachable. CI itself has
not run yet; it starts on the first push.

## 2. Accounts and infrastructure — owner

- [ ] **Vercel** — create the project, attach the domain, confirm HTTPS.
  - Build-time: `VITE_SITE_URL` (canonical, OG, `robots.txt`, `sitemap.xml`),
    `VITE_CONTACT_EMAIL`, optional `VITE_PLAUSIBLE_DOMAIN`.
  - Server: `DATABASE_URL`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`.
  - Do **not** set `ALLOW_DEV_AUTH` or `DEV_AUTH_SECRET`; local sign-in is ignored
    on Vercel and in production regardless.
  - `VITE_*` values are frozen at build time — changing the domain means a rebuild.
- [ ] **Neon** — create the project and copy the **pooled** connection string into
  `DATABASE_URL`. The serverless function opens up to 5 connections per instance;
  a direct (unpooled) string will exhaust the database under any concurrency.
  - Run `DATABASE_URL=… pnpm db:migrate` once against production.
  - Enable point-in-time recovery/backups and do one restore into a branch.
- [ ] **Clerk** — production instance on the live domain.
  - `VITE_CLERK_PUBLISHABLE_KEY` at build, `CLERK_SECRET_KEY` on the server.
  - Add the production origin and the `/sign-in`, `/sign-up`, `/sign-up/tester`,
    `/sign-up/founder` and `/app` redirects.
  - Enable **email + password** and **Google** under Clerk's sign-in strategies. The
    embedded sign-up renders only the strategies the instance allows, so this is
    configuration, not code.
  - Require **email verification**; the API now refuses to link an unverified
    address, so sign-in would otherwise dead-end with a clear message.
  - Require **MFA for staff**. Staff membership is a database row, not a Clerk
    claim, so it is granted in-app rather than configured in Clerk.
- [ ] **First admin** — put your address in `STAFF_EMAILS` (comma-separated) and
  sign in once. The staff role attaches on the next load and `/staff` opens.
  Then invite the rest of the team from `/staff/team`; each invitee signs up at
  `/admin` with the exact invited address. Revoke access from the same page.
  There is deliberately no public admin sign-up, and the API refuses to remove the
  last staff member or let an admin remove their own access.
- [ ] **Resend** — create the key, verify the sending domain (SPF, DKIM, DMARC),
  set `EMAIL_FROM`, and receive one real message. A send without a key is only
  captured in the log.
- [ ] **Error tracking** — not implemented, because it needs an account and DSN.
  Add Sentry (Vercel integration or `@sentry/node`) and alert on 5xx; today server
  faults are visible only in function logs.
- [ ] **Uptime monitor** — poll `https://<domain>/api/health`, expect `200`, alert
  on non-200. The new database probe means a dead Neon branch now fails the check.
- [ ] **Analytics** — decide whether to enable Plausible and what consent text the
  notice needs. Leaving `VITE_PLAUSIBLE_DOMAIN` unset disables it entirely.

## 3. Security and operations — owner

- [ ] Pin Clerk's real hostname in the CSP in `vercel.json` (replace
  `https://*.clerk.accounts.dev` / `https://*.clerk.com` once the production
  instance's frontend API host is known), then retest sign-in.
- [ ] Keep HSTS `preload` only if every subdomain is HTTPS; otherwise drop the
  `preload` token (the header itself can stay).
- [ ] Name the staff accounts, confirm MFA, and remove any former team member at
  `/staff/team` (or delete their `staff_members` row).
- [ ] Confirm the support inbox is monitored and the three-business-day review aim
  has named capacity.
- [ ] Agree the retention period and the deletion route. Data can be anonymised
  from the staff workspace (`POST /api/staff/people/:id/anonymise`); confirm who
  may run it and what is logged.
- [ ] Test the backup restore, not just that backups exist.

## 4. Legal and content — owner

- [ ] Sign off the privacy notice, including Clerk, Neon, Vercel, Resend and the
  analytics provider as processors, and the confirmed retention period.
- [ ] Confirm the published support address and final public copy.
- [ ] If analytics is enabled, confirm the consent approach and that no personal
  answers are sent (the code already sends event names only).

## 5. Launch rehearsal — owner, on the live deployment

Use two labelled records, not real applicants.

- [ ] Tester: `/sign-up` → pick tester → create the account with Google, then repeat
  with email + password → complete the application → dashboard → approve → invite →
  accept → respond.
- [ ] Founder: `/sign-up` → pick founder → create the account → request → scope →
  findings → publish → decide.
- [ ] Confirm a signed-in applicant cannot submit under a different email than the
  account (the address is locked in the form and rejected by the API).
- [ ] Confirm each of the four emails actually arrives (receipt, decision,
  invitation, findings), not just that `email_log` says `sent`.
- [ ] Confirm the application appears under the same person after signing in with
  that verified email (the path hardened in this pass).
- [ ] Admin: sign in with an address on `STAFF_EMAILS` → `/staff` opens → invite a
  second address → that person signs up at `/admin` → `/staff` opens for them →
  revoke the invite and confirm the account loses staff access on refresh.
- [ ] Sign in as each role and confirm the other surfaces return 404 and direct
  URLs redirect.
- [ ] Check the loop at 390 px on a real phone.
- [ ] If any live applications exist in the old Google Sheet, import them before
  switching `VITE_SUBMISSIONS_ENDPOINT` off.

## 6. Known limits after this pass

1. **No staff resend control.** Email is retried once, then recorded as failed;
   staff must use Resend's dashboard or the database, not the workspace.
2. **No error tracking.** See §2.
3. **Clerk and Resend paths are still unexercised live.** No keys existed in the
   development environment. The code paths are implemented and unit-covered; the
   first real sign-in and send remain launch-rehearsal items.
4. **WebKit/Safari is not in CI.** Install the system libraries and run
   `PLAYWRIGHT_INCLUDE_WEBKIT=1 pnpm e2e` if iPhone Safari coverage is required.
5. **No payments.** Reward status is display plus a staff-marked `sent` flag.
6. **Matching is team-assisted.** No automated matching, as designed.
