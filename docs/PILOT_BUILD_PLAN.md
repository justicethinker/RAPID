# RAPID Pilot — build plan (PRD rev. 3, 17 Oct 2026)

This plan replaces the previous waitlist marketing brief. Sections 1–7 of
`RAPID_Website_PRD_Pilot_v2.docx` are the build scope; sections 8–11 are manual
team operations and add no website features.

## 1. Scope

Build one tester-first homepage, two application forms, two confirmations, a
pilot privacy page and a useful 404. Every submission must persist to a private,
managed record store. No accounts, dashboards, matching engine, chat, payments,
automatic email, pop-up or autoplay.

Routes:

| Route | Purpose |
|---|---|
| `/` | Tester-first homepage with short founder section |
| `/join` | Tester application — primary button **Request your invite** |
| `/founders` | Founder request — primary button **Send my request** |
| `/thanks/tester`, `/thanks/founder` | Separate confirmations after storage succeeds |
| `/privacy` | Pilot privacy notice |
| `*` | 404 with useful links |

## 2. Delivery phases

1. **Foundations** — light visual system, minimal header/footer, route map, 404,
   config-driven copy and option lists.
2. **Homepage** — hero, problem, how it works, founders, FAQ, repeat invite CTA,
   with the PRD copy in the required order.
3. **Tester form** — all fields, conditional school/industry logic, 1–3 interest
   limit, 18+ confirmation, email confirmation, optional WhatsApp, privacy
   acknowledgement, hidden spam trap, field-level errors, first-error focus.
4. **Founder form** — name, WhatsApp, optional email, test description, audience
   and conditional description, privacy acknowledgement.
5. **Storage + resilience** — one submission envelope, one submission ID per
   form instance reused across retries, duplicate tester email returns the same
   neutral confirmation without overwriting, founder retries are idempotent,
   save failure preserves answers, success only after a durable save.
6. **Private records** — Google Sheets (managed service, private team access):
   separate Testers and Founders sheets; statuses, IDs, timestamps, source,
   schema/privacy versions, consent and suppression fields; CSV exports with
   formula escaping; withdrawal-aware invitation export; backup guidance.
7. **Analytics** — page views, audience CTA clicks, form starts, validation
   errors by field code, save failures, confirmed new records. No names, email,
   phone, written answers or raw tracking URLs. Session receipt dedupes success.
8. **Verification** — unit tests for schemas/payload/analytics, Playwright for
   both forms and all routes, axe audit, 360/390/768/1440 overflow checks,
   typecheck, lint and production build.

## 3. Storage decision

The repo already posts form-encoded data to a Google Apps Script web app backed
by a Google Sheet, and the PRD explicitly allows a managed form service with a
private team interface. We keep that approach:

- `src/lib/submissions.ts` posts one envelope to `VITE_SUBMISSIONS_ENDPOINT`.
- `integrations/google-apps-script/Code.gs` is the server: schema validation,
  duplicate and retry handling, spam trap, contact-level rate limit, append-only
  storage, private Sheets access, CSV export and suppression tools.
- `VITE_SUBMISSIONS_ENDPOINT` must point at the new deployment before launch.
  Until then forms surface the required save-error state; they never fake a
  success.

Google Sheets is not a relational database. The PRD's per-record uniqueness
rules are enforced in the Apps Script (lookup before append) rather than by a
database constraint. This is documented as a known limit.

## 4. Data and validation contract

Submission envelope:

```json
{
  "formType": "tester|founder",
  "schemaVersion": "2026-10-20",
  "privacyVersion": "2026-10-20",
  "submissionId": "uuid",
  "acknowledgedAt": "ISO-8601",
  "source": { "source": "…", "medium": "…", "campaign": "…", "landingPath": "/join" },
  "answers": { "…stable option codes and text…" },
  "labels": { "…human-readable labels for codes…" },
  "emailConfirm": "client-only cross-check (not stored)",
  "website": ""
}
```

Server validation mirrors the client for every required, conditional, age,
email-match, selection-count, phone and length rule. Validation errors return
per-field codes so the form can focus and highlight the field. Tester duplicate
responses are indistinguishable from a first submission in the UI. Founder
retries with the same submission ID return the same record; a new intentional
request gets a new submission ID and is allowed.

## 5. Analytics events

| Event | Props | Notes |
|---|---|---|
| `pageview` | path only | No query string |
| `cta_click` | `cta`, `location` | Audience buttons |
| `form_start` | `form_type` | Once per form instance |
| `form_validation_error` | `form_type`, `field` | Field code only |
| `form_save_failure` | `form_type` | No error text |
| `form_success` | `form_type`, `new_record`, `source`, `campaign` | Once per submission ID |

Analytics is disabled unless `VITE_PLAUSIBLE_DOMAIN` is set. Visitor/session and
consent settings remain a pre-launch decision (`NOTES.md`).

## 6. Acceptance mapping

| ID | Where covered |
|---|---|
| A01 | Routes, links, confirmations, 404, Playwright route test |
| A02 | Both forms + tester→founder path; Apps Script writes separate sheets |
| A03 | Zod schemas + Apps Script mirror + unit/E2E validation cases |
| A04 | Optional WhatsApp tests; conditional phone validation |
| A05 | Tester duplicate and founder idempotency in Apps Script + client tests |
| A06 | Save-failure state preserves values, retry reuses submission ID |
| A07 | Sheets private access; Apps Script menu export/suppress/delete + CSV escaping |
| A08 | Version/timestamp/source/status columns; Accepted-only invitation export |
| A09 | Playwright mobile widths, axe, contrast audit |
| A10 | Analytics allow-list + session receipt tests |

## 7. Launch inputs still owned by the client

- Support email and final public copy/logo/domain.
- Approved privacy text and retention period.
- Apps Script deployment URL, sheet ownership and named team users.
- Analytics account, consent mode and visitor/session counting method.
- Review capacity for the three-business-day aim.
- Email sending process, manual screening guide, test brief, task terms,
  reward plan and test log.
- Replace unlicensed preview photography before launch (existing open item).

## 8. Known limits / deviations

- Phone/email rate limiting is per contact because Apps Script does not expose
  the visitor IP. The PRD's per-connection limit should also be configured at
  the hosting/WAF layer if needed.
- Google Sheets has no unique constraint; uniqueness is lookup-enforced in the
  script and is not atomic under simultaneous writes at scale.
- No automatic email is sent (per scope). Confirmation pages are the receipt.
- The old waitlist dialogs, demo pages and section components are removed so no
  superseded claims remain in the codebase.
