# RAPID accounts and role dashboards — design

**Status:** implemented 24 October 2026 — see [`docs/ACCEPTANCE_REPORT.md`](../../ACCEPTANCE_REPORT.md)
**Date:** 24 October 2026
**Supersedes:** the "no accounts, no dashboards" boundary in `docs/PILOT_BUILD_PLAN.md`
**Keeps:** the pilot's honesty rules, team-assisted matching, and the existing public copy voice

**As built:** Vite SPA + `api/[...path].ts` on Vercel Functions + Postgres, Clerk for
production identity and an HMAC-signed local role picker for development. Email uses
Resend when `RESEND_API_KEY` is set and a capture adapter otherwise. All six delivery
slices shipped. Authenticated pages were verified manually, not yet in CI; see the
acceptance report for that and the other open gaps.

---

## 1. Problem

The pilot site was built to one brief: a tester-first homepage, two application
forms, and Google Sheets as the record store. It does that faithfully, but it
treats RAPID as a single-conversion campaign rather than a two-sided product.

Three failures follow from that:

1. **Two audiences, one funnel.** The header has one CTA, "Request your invite",
   which only means tester signup. Founders are reachable from a mid-page block,
   the footer, or the 404, and `/founders` is a form with no explanation of what
   a test is, what it produces, or how long it takes.
2. **The loop is invisible.** Nothing explains that a tester's answers become a
   founder's evidence, or that a founder's test is what a tester is invited to.
   That mechanism is the product.
3. **Nothing persists for the visitor.** Confirmation pages dead-end at "return
   home". There is no status, no reference number, no place to see what happens
   next, and no reason to come back.

The owner has chosen to close this gap properly: real accounts, a dashboard for
each role, and a staff surface to operate the pilot.

## 2. Goals

- A visitor can apply as a tester or request a test as a founder in the existing
  three-minute forms, without creating a password first.
- A returning tester can sign in and see their application status, invitations,
  active task, submission history and reward terms.
- A returning founder can sign in and see each test's real status, recruitment
  counts with denominators, responses and published findings, and record a
  build / iterate / pivot decision.
- Staff can review applications, create and scope tests, invite testers, review
  responses, publish findings, export data and honour deletion requests from one
  protected page set.
- Every number shown is derived from real records. No demo, placeholder or
  sample data appears in an authenticated surface.
- The public site finally explains the two-sided loop and gives each role a
  first-class entry point.

## 3. Non-goals

Payments or payouts, chat or messaging, automated matching, video upload or
playback, a native app, SSO, multi-language, a marketing automation suite,
public profiles, and analytics beyond the existing privacy-first pageviews.

Matching remains team-assisted. "Signals help decisions; they do not guarantee
success" remains true in every dashboard label.

## 4. Architecture

```
Browser (React 19 + Vite + Router)
  ├─ public routes: /, /join, /founders, /thanks/*, /privacy, /sign-in
  ├─ authenticated: /app/tester, /app/founder, /staff
  │    Clerk session token (Authorization: Bearer) on every API call
  └─ no database credentials, no service keys
        │
        ▼
Vercel Functions (/api/*, Node runtime, TypeScript)
  ├─ verify Clerk session → person + roles (server-side, never trusted from client)
  ├─ validate input with the shared zod schema
  ├─ authorize by row (tester owns invitation, founder owns test, staff row required)
  └─ Neon Postgres via @neondatabase/serverless
        ├─ Resend for transactional email
        └─ audit_events for privileged changes
```

Decisions:

- **Keep Vite.** The marketing site is tested, accessible and fast; a Next.js
  migration would spend one to two weeks before the first dashboard exists.
- **Server-side authorization.** The browser calls `/api`; the functions hold the
  database URL and verify the Clerk token on every request. RLS is not used as
  the primary boundary because staff operations span many rows.
- **Clerk** for identity (email code with magic-link fallback, prebuilt React
  components). One person, one account, any combination of roles.
- **Neon Postgres** for relational data and counts. Free tier is sufficient for
  the pilot; confirm limits before inviting the first cohort.
- **Resend** for receipts, decisions, invitations and findings notices, from a
  verified `rapid.africa` sender with SPF, DKIM and DMARC.
- **Vercel Functions** in the same repo and deployment as the SPA. `vercel.json`
  must stop rewriting `/api/*` to `index.html` and must allow Clerk and Neon in
  the CSP.

## 5. Roles and identity

A `person` has zero or more roles derived from data, never from a client claim:

| Role | Derived from |
|---|---|
| Tester | a `tester_profiles` row exists |
| Founder | a `founder_profiles` row exists |
| Staff | a `staff_members` row exists |

- `/app` renders a role switcher when a person has both roles; otherwise it
  redirects to their single dashboard.
- Staff also see `/staff` in the app shell; non-staff get 404, not 403, to avoid
  disclosing the surface.
- Sign-in is Clerk email code (six digits) with a magic link as fallback, since
  codes survive a different device or mail client.
- Staff accounts must use Clerk MFA before production launch.

## 6. Data model

All tables in the `public` schema, UUID primary keys generated by
`gen_random_uuid()`, `created_at`/`updated_at` timestamptz with defaults.
Statuses are `text` with check constraints, not Postgres enums, so they can be
extended in a migration without a type rewrite.

### `people`

| Column | Notes |
|---|---|
| `id` | uuid pk |
| `clerk_user_id` | text unique, null until first sign-in (account shell) |
| `email` | text, normalised trim + lowercase; dots and `+` preserved; unique index on `lower(email)` |
| `email_verified` | boolean, set from Clerk |
| `full_name` | text |
| `phone` | text, E.164 where possible |
| `state` | `active` \| `suppressed` \| `deleted` |
| `created_at`, `updated_at` | timestamptz |

### `tester_profiles`

One row per person. Carries every answer the current tester form collects plus
application state.

`person_id` pk/fk · `submission_id` text unique (idempotency and support
reference) · `country_code` · `city` · `age_band` · `situation` ·
`other_activities` text[] · `industry` · `industry_other` · `interests` text[] ·
`interests_other` · `frustration` · `whatsapp` · `whatsapp_reminders` ·
`hear_about` · `application_status` (`received` \| `under_review` \| `approved`
\| `waitlisted` \| `declined` \| `withdrawn`) · `applied_at` · `reviewed_at` ·
`reviewed_by` · `privacy_version` · `schema_version` · `source` jsonb

### `founder_profiles`

`person_id` pk/fk · `whatsapp` · `organisation` (optional) · `created_at`

### `tests`

A founder request becomes a test. One founder may have several.

`id` · `founder_id` fk people · `title` · `question` · `audience_code` ·
`audience_description` · `terms` text (what participation involves, reward note) ·
`status` (`requested` \| `scoping` \| `recruiting` \| `fielding` \| `findings` \|
`published` \| `closed` \| `cancelled`) · `reward_note` · `founder_decision`
(`build` \| `iterate` \| `pivot`, null until chosen) · `decided_at` ·
`created_at` · `published_at` · `updated_at`

### `invitations`

`id` · `test_id` fk · `tester_id` fk people · `status` (`invited` \| `accepted`
\| `declined` \| `withdrawn` \| `completed` \| `expired`) · `invited_by` ·
`invited_at` · `responded_at` (also records acceptance of the test terms) ·
`completed_at` · `reward_status` (`not_applicable` \| `pending` \| `sent`) ·
`reward_sent_at` · unique (`test_id`, `tester_id`)

### `responses`

`id` · `invitation_id` unique fk · `outcome` (`tried` \| `booked_call` \|
`collaborated` \| `no_action`) · `note` text (20–1000 chars, required) ·
`consent_to_quote` boolean · `answers` jsonb for future test-specific fields ·
`schema_version` · `submitted_at`

### `findings`

`id` · `test_id` unique fk · `headline` · `summary` · `learnings` jsonb (array of
`{ label, detail }`) · `limits` text (what the evidence does not show) ·
`authored_by` · `published_at` null until published

### `notifications`

`id` · `person_id` · `kind` (`application_received` \| `application_decision` \|
`invitation` \| `findings_published` \| `reward_sent`) · `title` · `body` ·
`href` · `read_at` · `email_sent_at` · `created_at`

### `staff_members`

`person_id` pk · `granted_by` · `granted_at`

### `email_log`

`id` · `person_id` · `kind` · `provider_id` · `status` (`sent` \| `failed`) ·
`error` · `created_at`. Stores no message body.

### `audit_events`

`id` · `actor_id` · `action` · `entity` · `entity_id` · `meta` jsonb · `created_at`.
Written for application decisions, test status changes, invitations, findings
publish, suppression and deletion.

Counts shown to founders are queries: invited, accepted, declined, completed,
response rate. Nothing is a stored tally.

## 7. Application and account-shell flow

1. The visitor submits `/join` or `/founders`.
2. `POST /api/applications/:kind` validates with the same shared schema the
   browser uses. The server re-checks every required, conditional, age,
   email-match, selection-count, phone and length rule.
3. The server upserts `people` by normalised email, then creates the profile (or
   returns the neutral duplicate response without overwriting an existing one).
   A founder application also creates a `tests` row in `requested`, linked to the
   founder, so staff can scope it. Founder retries reuse the submission ID and
   stay idempotent.
4. A notification row and a receipt email are created. The email contains a
   sign-in CTA, never the answers.
5. The confirmation page says "check your email" with the support address, and
   offers a sign-in link.
6. On first sign-in, Clerk verifies the email; `/api/me` claims the existing
   person row by matching verified email and fills `clerk_user_id`. Until then
   the profile is an account shell that grants no access.
7. If the verified email differs from the profile email, nothing is claimed and
   staff can resolve it manually.

Applications remain public. Requiring an account before the form would add
friction the pilot's conversion depends on.

## 8. API surface

All authenticated endpoints verify the bearer token, load the person, and
authorize server-side. Mutations validate input and write an audit row where
relevant. Errors use a stable shape: `{ error: code, fields?: {...} }`.

**Public**

- `POST /api/applications/tester`
- `POST /api/applications/founder`

**Signed in**

- `GET /api/me` → person, roles, profile summaries, unread notification count
- `PATCH /api/me` → name, phone
- `GET /api/notifications`, `POST /api/notifications/:id/read`
- Tester: `GET /api/tester/overview`, `GET /api/tester/invitations`,
  `GET /api/tester/invitations/:id`, `POST /api/tester/invitations/:id/respond`,
  `POST /api/tester/invitations/:id/response`, `GET /api/tester/history`,
  `PATCH /api/tester/profile`
- Founder: `GET /api/founder/tests`, `POST /api/founder/tests`,
  `GET /api/founder/tests/:id`, `POST /api/founder/tests/:id/decision`

**Staff**

- `GET /api/staff/applications`, `POST /api/staff/applications/:id/decision`
- `GET /api/staff/tests`, `PATCH /api/staff/tests/:id`
- `GET /api/staff/tests/:id/candidates` (filters: country, situation, interests,
  application status, not already invited)
- `POST /api/staff/tests/:id/invitations`
- `GET /api/staff/tests/:id/responses`
- `PUT /api/staff/tests/:id/findings`,
  `POST /api/staff/tests/:id/findings/publish`
- `GET /api/staff/export?type=testers|founders|invitations` → CSV
- `POST /api/staff/people/:id/anonymise`

## 9. Screens

### Public

- `/` — the loop, in this order: what RAPID is (both sides in one sentence);
  a role fork with two equal paths; how a test works end to end; what each side
  gets; the honesty block (team-assisted matching, no guaranteed payment or
  place); FAQ split by role; closing CTA with both paths.
- `/join` — tester page: what you will do, what you get, how selection works,
  privacy, tester FAQ, then the existing form. Keeps the same field set.
- `/founders` — founder page: what a test is, the process, what you receive
  (actions with denominators, not vanity metrics), timing, cost position for the
  pilot, founder FAQ, then the existing request form.
- `/thanks/*` — what happens next, when, what to check, sign-in link, support.
- `/sign-in` — Clerk component, role-aware redirect.
- Header: real navigation (For testers · For founders · How it works) and a
  role-aware CTA. Footer keeps Privacy and support, and stops being the only
  founder door.

### Tester app

- Overview: application state as one clear sentence and the next action;
  invitation count; recent activity.
- Invitations: list with test, reward note and status.
- Invitation detail: task terms, what is asked, accept / decline, then the
  response form once accepted.
- History: completed tests, what happened, reward status.
- Profile: contact details, interests, WhatsApp preferences, sign out, request
  removal.

### Founder app

- Overview: tests with status and the next thing expected from the founder.
- New request: the existing form, available after sign-in too.
- Test detail: status timeline; recruitment counts with denominators; responses
  summary (counts and, where consent allows, anonymised quotes); findings when
  published; decision control once findings exist.
- Profile: contact details and organisation.

### Staff

- Applications: queue filtered by status, search by email/name, detail with the
  full application, approve / waitlist / decline, notes.
- Tests: pipeline by status; scope a requested test; edit terms; change status.
- Test detail: candidate list with filters, select and invite (one email and
  notification per tester, idempotent), responses, findings editor, publish.
- People: search, suppress/delete with confirmation and audit.
- Export: CSV for the selected entity.

## 10. Email and notifications

- Application receipt (tester, founder).
- Decision (approved, waitlisted, declined).
- Invitation with task terms and a link to sign in.
- Findings published.
- Reward sent (tester, when staff mark a reward as sent).

Each email creates an in-app `notifications` row. Emails are plain, branded
lightly, contain no answers, and link to the app rather than embedding data.
Bounces and failures are logged in `email_log` and shown to staff on the person
record; staff can resend.

## 11. Migration from Sheets

- One idempotent script, run manually with production env, reads a CSV export of
  the tester and founder sheets.
- Testers become `people` + `tester_profiles` with `clerk_user_id` null,
  `source = { "sheet": "testers", "row": n }`, preserving `submitted_at` and the
  existing submission ID; founders become `people` + `founder_profiles` and
  their requests become `tests` in `requested`.
- Normalisation matches the application flow, so a person who applies after the
  import is not duplicated.
- The sheet stays read-only for 30 days, then is retired and the Apps Script
  endpoint is disabled. The integration folder stays in the repo as history. No
  CSV is committed.
- Duplicate emails in the sheet are merged, keeping the earliest application and
  logging the merge in `audit_events`.

## 12. Privacy, security and compliance

- Update the privacy notice before launch: account data, Neon as processor,
  Clerk for sign-in, Resend for email, retention period, deletion route.
- Staff access is least-privilege and audited. MFA required for staff.
- No PII in logs, error messages or analytics. Analytics keeps sending paths and
  field codes only; authenticated paths are excluded.
- Suppression and deletion anonymise the person row in place (keep the id, clear
  name, email and phone, set `state = deleted`), cascade to profiles, keep
  invitation and response rows so counts stay intact, and preserve the audit
  trail without contact data.
- Data export on request is a staff CSV action.
- CSP is narrowed to the Clerk and Neon endpoints actually used, and `/api` is
  excluded from the SPA rewrite. Cookies, where used, are `Secure`, `HttpOnly`
  and `SameSite=Lax`. API calls authenticate with a bearer token, so mutations
  carry no cookie; state-changing endpoints still reject cross-origin `Origin`
  headers.
- Rate limits: per hashed IP and per email/phone on public applications (five in
  ten minutes), per session on mutations, with `Retry-After`.
- Idempotency: `submission_id` unique on applications; invitation creation
  unique per (test, tester); response unique per invitation.

## 13. Error handling and empty states

- Forms keep the current behaviour: field-level errors, first error focused,
  answers preserved on failure, retry reuses the same submission ID.
- API failures map to stable codes; the UI never shows a raw provider message.
- Dashboard empty states are explicit: "No invitations yet", "This test has no
  responses yet", "Findings are published when the team has reviewed the
  responses". No sample data, ever.
- A signed-in person with no profile sees a role-choice screen, not a blank
  dashboard.
- Deleted or suppressed accounts see a neutral notice and the support address.

## 14. Testing

- Unit: shared schema, status transitions, role derivation, count queries,
  CSV escaping, suppression rules.
- API integration against a disposable Neon branch (or local Postgres in CI):
  401 without a token, 403 for another person's row, staff-only endpoints,
  idempotent retries, rate limiting, duplicate email, invitation uniqueness.
- Component tests for each dashboard state (empty, pending, complete).
- Playwright: tester applies → signs in → sees status; staff approves → invites;
  tester accepts → submits; staff publishes → founder sees findings and decides;
  staff application review; suppression; 404 for non-staff on `/staff`.
- Axe on every public and authenticated page; no horizontal overflow at the
  existing breakpoints.
- Migration script tested against a fixture CSV, including duplicates.
- Email uses a capture adapter in development and tests; Resend only in
  production.

## 15. Delivery slices

Each slice is demoable and leaves the site deployable.

1. **Foundation** — schema and migrations, Clerk, `/api/me`, session bootstrap,
   authenticated shell, env and CSP changes. Demo: sign in, see an empty
   role-aware app.
2. **Public to account** — applications moved to the API, account shells,
   receipt emails, claim-on-sign-in, the new front door and role pages.
   Demo: apply, sign in, see the real application status.
3. **Tester dashboard** — invitations, accept/decline, task detail, response,
   history, profile.
4. **Staff page** — application queue, scoping a requested test, candidates,
   invitations, responses, findings publish, export, anonymisation.
5. **Founder dashboard** — requests, status timeline, real counts, findings,
   decision.
6. **Hardening** — decision emails, failure handling, rate limits, deletion,
   accessibility pass, migration, docs, privacy update.

## 16. Open decisions for the owner

These do not block slices 1–3 and have safe defaults in brackets:

- Retention period for declined and inactive tester records [12 months, then
  anonymise].
- Whether a founder may see anonymised quotes alongside counts [yes, only with
  the tester's explicit consent at response time].
- Reward handling: display terms and staff-marked status only, no payment
  processing [yes].
- Whether staff accounts are limited to named team members or shared [named
  only, MFA].
- Sender identity and reply-to for transactional mail [`hello@rapid.africa`].

## 17. Definition of done

- A new tester can apply, sign in, be approved, invited, accept, submit and see
  their history without staff touching a spreadsheet.
- A founder can request a test, watch its real recruitment counts, read published
  findings and record a decision.
- Staff can run the whole pilot from `/staff`, including export and deletion.
- No authenticated surface displays sample data, and every count is traceable to
  rows.
- Typecheck, lint, unit, API integration and Playwright suites pass in CI, with
  axe clean on all routes.
- The privacy notice names every processor and the retention period.
- The sheet is read-only and the migration is verified.
