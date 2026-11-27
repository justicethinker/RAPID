# Deploying RAPID to Vercel

RAPID is a Vite single-page app plus one Node serverless function (`api/[...path].ts`) that
serves the whole `/api/*` surface. Everything Vercel needs is already in `vercel.json`, so
importing the repo is mostly clicking through.

## 1. Import the project

1. In Vercel: **Add New… → Project → Import Git Repository** and pick
   `justicethinker/RAPID`.
2. **Branch.** Vercel builds Production from the repo's production branch (Settings → Git,
   normally `main`). Either:
   - merge `redesign/bring-to-life` into the branch you deploy from, **or**
   - set *Production Branch* to the branch you want live, **or**
   - just push: every other branch gets a Preview deployment automatically, so
     `redesign/bring-to-life` is viewable at its preview URL without merging.
3. **Framework preset: Vite.** Leave Build / Output / Install commands on their defaults;
   `vercel.json` sets them:

   | Setting | Value (from `vercel.json`) |
   | --- | --- |
   | Framework | `vite` |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | SPA rewrites | every path except `/api/`, `/assets/`, `/images/`, `/fonts/` → `/index.html` |
   | Headers | long cache on `/assets/*`, week cache on `/images/*`, security headers + CSP on everything |

4. **Node.js version: 22.x** (Settings → General → Node.js Version). `package.json` pins
   `"engines": { "node": "22.x" }`, so Vercel picks it up automatically.
5. Add environment variables (next section), then **Deploy**.

> `VITE_*` variables are baked into the browser bundle at build time. After adding or
> changing one, **redeploy** (Deployments → ⋯ → Redeploy) for it to take effect. Server-only
> variables apply to the API function on the next request after a redeploy.

## 2. Environment variables

Set these in **Project → Settings → Environment Variables** (Production, and Preview if you
want previews to work the same way). The source of truth is `.env.example`.

### Public site (browser, build time)

| Variable | Required? | What it does |
| --- | --- | --- |
| `VITE_SITE_URL` | Recommended | Canonical origin (e.g. `https://rapid.africa`) for canonical links, Open Graph tags, the privacy page and the generated `robots.txt` / `sitemap.xml`. Falls back to the current Vercel URL. |
| `VITE_CONTACT_EMAIL` | Recommended | Support address shown in the footer, confirmations and privacy page. Falls back to the built-in default (`hello@rapid.africa`). |
| `VITE_PLAUSIBLE_DOMAIN` | Optional | Turns on privacy-friendly Plausible analytics. Unset = no analytics at all. |
| `VITE_PLAUSIBLE_SRC` | Optional | Only for a self-hosted Plausible script. |
| `VITE_CLERK_PUBLISHABLE_KEY` | **Required for accounts** | Clerk publishable key. Without it, sign-in, sign-up and `/admin` (and `/app`, `/staff`, which redirect to sign-in) show "Accounts aren't switched on just yet" instead of a broken form. |
| `VITE_SUBMISSIONS_ENDPOINT` | Legacy, leave empty | Old Google Apps Script endpoint. The API now owns applications. |

### API (server only — never prefix with `VITE_`)

| Variable | Required? | What it does |
| --- | --- | --- |
| `DATABASE_URL` | **Required for anything that saves data** | Postgres connection string (Neon recommended; use the pooled URL with `sslmode=require`). Needed by the tester / founder application forms, contact form, accounts, dashboards, staff tools and analytics events. |
| `CLERK_SECRET_KEY` | **Required for accounts** | Verifies Clerk session tokens on the API. Pair with `VITE_CLERK_PUBLISHABLE_KEY`. |
| `STAFF_EMAILS` | **Required to have an admin** | Comma-separated addresses that always hold staff access. This bootstraps the first admin; later admins are invited from `/staff/team`. |
| `RESEND_API_KEY` | Optional (recommended) | Sends transactional email via Resend. Without it, emails are written to the function log and recorded in `email_log`; nothing is sent. |
| `EMAIL_FROM` | With Resend | Sender, e.g. `RAPID <hello@rapid.africa>`. The domain must be verified in Resend (SPF, DKIM, DMARC). |
| `TASK_LINK_SECRET` | **Required in production** | Long random string that signs one-time task links sent to testers. If unset it falls back to `DEV_AUTH_SECRET`, then to a public development constant — do not ship that. |
| `AI_API_KEY` | Optional | Turns on guided intake, study drafts and findings drafts. Unset = deterministic manual templates. (`ZAI_API_KEY` / `OPENAI_API_KEY` are accepted as fallbacks.) |
| `AI_API_BASE` | Optional | OpenAI-compatible base URL. Default `https://api.openai.com/v1`. |
| `AI_MODEL`, `AI_ESCALATION_MODEL` | Optional | Model names for the AI adapter. |
| `PAYSTACK_SECRET_KEY` | Optional | Server-side Paystack initialise / verify for paid test requests. Unset = a founder who tries to pay gets "Payment provider is not configured" and the attempt is logged. |
| `PAYSTACK_WEBHOOK_SECRET` | Optional | Verifies webhook signatures; falls back to `PAYSTACK_SECRET_KEY`. Point Paystack's webhook at `https://<your-domain>/api/payments/paystack/webhook`. |

### Local-only (do **not** set on Vercel)

| Variable | Notes |
| --- | --- |
| `ALLOW_DEV_AUTH` | Local role sign-in for building dashboards without Clerk. Ignored on every Vercel deployment (`VERCEL` is set) and when `NODE_ENV=production`. |
| `DEV_AUTH_SECRET` | Signs the local session cookie. Local use only. |
| `ADMIN_SIGN_IN_USERNAME`, `ADMIN_SIGN_IN_PASSWORD` | The local admin door at `/admin/sign-in`. Only accepted while dev auth is on, so a deployed site refuses them whatever you set. |

## 3. Migrate the production database

Run the migrations once against the production database before (or right after) the first
deploy, and again whenever `db/migrations/` changes:

```bash
npm ci
DATABASE_URL="postgresql://…your production url…" npm run db:migrate
```

`db:migrate` applies `db/migrations/*.sql` in order, records them in `schema_migrations`, and
takes an advisory lock so two runs can't race. Do **not** run `npm run db:seed` in
production; it creates local test accounts.

## 4. Clerk set-up (when you turn accounts on)

1. Create a Clerk application; enable email + password and Google, require email
   verification, and require MFA for staff.
2. Add the production origin to Clerk's allowed origins / domains.
3. Set `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, then redeploy.
4. **CSP:** `vercel.json` already allows `*.clerk.com` and `*.clerk.accounts.dev` (Clerk
   development instances). A Clerk **production** instance serves its Frontend API from your
   own subdomain (e.g. `https://clerk.rapid.africa`); add that host to `script-src`,
   `connect-src`, `img-src` and `frame-src` in `vercel.json`, or sign-in will be blocked.

## 5. What works with zero environment variables

A fresh import with **no** variables set builds and deploys cleanly, and:

- **Works:** every public page — Home, For founders (`/founders`), For testers (`/join`),
  How it works, Discover, About, Contact, Privacy, the thanks pages and the 404 — with all
  photography, motion and responsive layouts.
- **Account pages degrade gracefully:** `/sign-in`, `/sign-up` and `/admin` show
  **"Accounts aren't switched on just yet."** (and `/app/*` / `/staff/*` redirect to
  `/sign-in`, which shows the same notice) with links to *Tell us your idea*
  and *How it works*, instead of a broken sign-in.
- **Needs `DATABASE_URL`:** submitting the tester / founder / contact forms and anything that
  saves. Without a database the API cannot store submissions and the form shows its error
  state, so set `DATABASE_URL` (and run the migration) before sharing the form links.

## 6. Smoke test after deploying

1. Open `/`, `/founders`, `/join`, `/how-it-works` on a phone and a laptop.
2. `GET /api/health` should return JSON.
3. Submit one labelled test application (use an address you control) and check it lands in
   the database / staff view.
4. With accounts on: sign up one tester and one founder and walk the loop
   approve → invite → accept → respond → publish → decide.

See also `docs/LAUNCH_CHECKLIST.md` for the full pre-launch list.
