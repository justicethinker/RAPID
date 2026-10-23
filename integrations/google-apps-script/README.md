# RAPID pilot form backend (Google Sheets)

This is the private record store and server-side validator for the pilot site.
It creates two sheets — **Testers** and **Founders** — in one spreadsheet. The
team uses the spreadsheet directly for filtering, status updates, CSV exports,
suppression and deletion. No custom dashboard is built.

## Deploy

1. Create a new Google Sheet owned by RAPID (for example
   `RAPID Pilot Records`). Do not share it publicly.
2. **Extensions → Apps Script**. Delete the placeholder `Code.gs` content and
   paste `Code.gs` from this folder. Add `appsscript.json` via
   **Project Settings → Show "appsscript.json" manifest file** (paste it there).
3. Run `setup` once from the editor and approve the Google Sheets/Drive
   permissions. This creates both sheets, header rows, frozen headers and the
   status dropdowns. (Alternatively open the sheet and use the **RAPID** menu
   after the first authorization.)
4. **Deploy → New deployment → Web app**:
   - Description: `RAPID pilot forms`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL. Test it in a browser; it should return
   `{"ok":true,"service":"rapid-pilot"}`.
6. Add the URL to the site environment as `VITE_SUBMISSIONS_ENDPOINT` and
   rebuild/redeploy the site. The value is baked in at build time.
7. Share the spreadsheet with named team members only. Editors can update
   statuses; viewers can read. Visitors to the website cannot list, query or
   export records.

The web app URL is public by design (the browser must reach it). It only accepts
the validated form envelope and never exposes a read endpoint.

## Sheets and controls

**Testers** columns include the application ID, normalised email, every valid
answer, primary segment, extra activity codes, status, review fields, outcome /
delivery / group timestamps, WhatsApp consent and withdrawal times, suppression,
privacy/schema versions, submission ID, source tags, landing path and notes.

**Founders** columns include the request ID, normalised phone, optional email,
valid answers, status, owner, follow-up time, linked test ID and notes.

Statuses are dropdown-backed:

- Tester: `New`, `Needs clarification`, `Accepted`, `Not currently eligible`,
  `Withdrawn`.
- Founder: `New`, `Needs clarification`, `Suitable for pilot`,
  `Outside current pilot`, `Withdrawn`.

`Contact suppression` is `Active` / `Suppressed`. Group joining is recorded in
`Group invite sent at` / `Joined group at`, separately from acceptance.

### RAPID menu

Open the spreadsheet after authorization to see the **RAPID** menu:

- **Export all testers (CSV)** — every tester row.
- **Export accepted testers (CSV)** — `Status = Accepted` only, and excludes
  suppressed/withdrawn records. Use this for invitations.
- **Export founder requests (CSV)** — every founder row.
- **Suppress tester by email…** — sets `Withdrawn`, `Suppressed`, clears reminder
  consent and records the withdrawal time. Suppressed people are excluded from
  the invitation export.
- **Delete tester by email…** — asks for confirmation, then deletes the live row.

CSV exports neutralise formula starters (`=`, `+`, `-`, `@`, tab, CR) in every
cell before quoting. Do not use **File → Download → CSV** when the data may
contain user-written text; use the RAPID export so formula content cannot run.

## Rules enforced server-side

- Every required, conditional, age, email-match, selection-count, phone and
  length rule from the PRD is re-validated here. Field errors are returned by
  field name so the form can focus and highlight them.
- **Tester duplicate:** one application per normalised email. A repeat gets the
  same neutral confirmation and never overwrites answers, status or contact
  permissions. Normalisation trims and lowercases only; dots and `+` suffixes
  are preserved.
- **Founder retry:** the submission ID makes network retries and double clicks
  idempotent. A fresh request with the same phone/email gets a new ID and is
  allowed.
- **Spam trap:** a hidden `website` field; filled submissions are acknowledged
  but not stored.
- **Rate limit:** five submissions per ten minutes per normalised email/phone,
  configurable in `CONFIG`. Apps Script does not expose the visitor IP, so this
  is a contact-level limit, not a per-connection limit. Configure hosting/WAF
  rate limiting too if the pilot needs a true connection limit.
- **Formula safety:** cells written to Sheets are forced to plain text and
  formula starters are prefixed; CSV export applies the same rule.

## Backup and retention

- File → **Make a copy** of the spreadsheet before each pilot batch, or use a
  scheduled Google Sheets export. Store backups in RAPID-controlled Drive access.
- The PRD's starting policy is to review applications inactive for six months.
  The owner must confirm the retention period and deletion process before
  collecting real applications.
- Apply withdrawals to the live sheet, CSV copies and manual contact lists.
  Deleting a row does not remove it from pre-existing backups until those
  backups expire.

## Known limits

- Sheets has no unique constraint. Uniqueness is lookup-enforced under a script
  lock; it is not a relational constraint and may not hold at high concurrency.
- The script cannot see visitor IPs. Use Vercel/Cloudflare rate limiting for a
  per-connection limit.
- No automatic email is sent. The confirmation pages are the only receipt.
- Keep `AGE_CODES`, `SITUATION_CODES`, `INDUSTRY_CODES`, `INTEREST_CODES`,
  `HEARD_CODES` and `AUDIENCE_CODES` in sync with `src/content/pilot.ts`.
