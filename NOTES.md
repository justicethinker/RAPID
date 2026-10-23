# RAPID — Build Notes

> **October 2026 — the site was rebuilt for the pilot.** Sections 1–7 of
> `RAPID_Website_PRD_Pilot_v2.docx` (rev. 3) now define the product: a
> tester-first homepage, two forms, two confirmations, a pilot privacy notice
> and a useful 404, backed by Google Sheets through an Apps Script endpoint.
> The notes after the divider describe the superseded marketing site and are
> kept only as history. Current results live in
> [`docs/ACCEPTANCE_REPORT.md`](docs/ACCEPTANCE_REPORT.md).

## Decision log — pilot rebuild (23 October 2026)

Each decision was made during the build; the reason and the trade-off are
recorded so a later reviewer does not have to guess.

1. **Keep Google Sheets + Apps Script as the record store.** The PRD allows a
   managed form service with a private team interface, and this repo already
   had a working Apps Script endpoint. Building a database, auth and dashboard
   would add scope the PRD explicitly excludes. Trade-off: no relational unique
   constraint, and the script cannot see visitor IPs (see 5).
2. **Mirror every rule on the client and the server.** The form validates
   immediately for a good phone experience; the Apps Script re-validates the
   same required, conditional, age, email-match, selection-count, phone and
   length rules so a crafted request cannot write invalid records. Field codes
   are returned by name so the browser can focus the first error.
3. **Tester dedupe by normalised email, founder dedupe by submission ID.** The
   PRD treats an email as one application and a founder retry as one request.
   Normalisation only trims and lowercases (dots and `+` suffixes are kept). A
   repeat tester application returns the same neutral confirmation and never
   overwrites answers, status or consent; a new founder request with the same
   phone is allowed.
4. **Confirmation only after a confirmed save.** `VITE_SUBMISSIONS_ENDPOINT`
   unset means the required save-error state, not a fake success. Answers are
   preserved and the retry reuses the same submission ID, so the server can make
   the retry idempotent.
5. **Spam trap plus a contact-level rate limit.** A hidden `website` field
   acknowledges bots without writing. The PRD's five-per-ten-minutes limit is
   enforced per normalised email/phone because Apps Script has no visitor IP.
   A true per-connection limit belongs at the host/WAF layer; this is recorded
   as a known limit.
6. **Platform-safe sheet writes (fixed a real defect).** `safeCell_` originally
   prefixed `+`, `-`, `@` as well as `=` with an apostrophe. Because every
   international phone number starts with `+`, that wrote `'+234…` into the
   sheet. Sheet cells are already forced to plain text and only a leading `=`
   is a formula there, so only `=` (and tab/CR) is escaped when writing. CSV
   export still neutralises `=`, `+`, `-`, `@`, tab and carriage return, which
   is where those characters are dangerous (Excel/LibreOffice).
7. **No custom admin UI.** Statuses are dropdown-backed columns; filtering uses
   Sheets filter views; exports, suppression and deletion live in a **RAPID**
   menu. This matches the PRD's managed-service model and avoids building an
   authenticated dashboard that the pilot does not need. Withdrawn/suppressed
   testers are excluded from the invitation export.
8. **Site URL is a build input, not four hardcoded files.** `VITE_SITE_URL` is
   injected into canonical/OG/JSON-LD tags, and `robots.txt` plus `sitemap.xml`
   are generated at build time. Changing the domain is one env var instead of
   edits in HTML, robots and sitemap. The old files in `public/` were removed so
   they cannot drift.
9. **Analytics stays privacy-first and optional.** Plausible manual mode is
   loaded only when `VITE_PLAUSIBLE_DOMAIN` is set. Only paths and field codes
   are sent; a session receipt dedupes successful saves so duplicate tester
   applications do not inflate sign-ups. `trackPageview` defensively strips
   query strings. Consent mode and session counting remain an owner decision
   before launch.
10. **Test the backend without a Google account.** `Code.gs` now has a small
    Apps Script emulator (`integrations/google-apps-script/code-harness.ts`)
    that exercises real `doPost` calls: validation, duplicates, idempotency,
    spam trap, rate limit, CSV escaping, suppression and deletion. This is the
    only way to prove A03/A05/A07 automatically; a live-sheet rehearsal is still
    listed as a launch check.
11. **Cross-browser scope is honest.** Playwright runs desktop Chrome, desktop
    Firefox and Pixel 5 Chrome on every test. WebKit (desktop Safari and iPhone
    Safari) needs GTK/GStreamer libraries that are absent from this Ubuntu 24
    environment and installing them needs administrative approval, so those
    projects are opt-in behind `PLAYWRIGHT_INCLUDE_WEBKIT=1`. Edge is
    Chromium-based and has no Linux binary here; the Chromium project covers its
    engine. The gap is reported, not hidden.
12. **One accent, one typeface, no motion noise.** The PRD fixes white,
    emerald and a single typeface; Inter is kept and the earlier "AI-default
    font" debate is closed by the PRD. Decorative section eyebrows that carried
    no meaning were not reintroduced. Body text is 17 px, focus is visible, and
    axe runs on every page plus both forms.
13. **Remove dead old-site code, assets and scripts.** The previous waitlist
    dialogs, demo sections, generated map, unused photography and their scripts
    were deleted in the rewrite. `package.json` no longer exposes `gen:map` or
    `pictures` (their scripts were gone) and no longer depends on `d3-geo`,
    `topojson-client`, `world-atlas`, `tsx`, `@fontsource/caveat` or the unused
    Testing Library packages. `sharp` is kept for the logo pipeline.
14. **Privacy copy was rewritten for the pilot.** The old policy claimed
    automated/AI matching, which contradicts the marketing copy and the PRD's
    team-assisted model. The current notice covers tester and founder data,
    WhatsApp consent, the optional group, retention, removal and analytics. It
    still needs the owner's legal sign-off and a confirmed retention period.
15. **Support email defaults to `hello@rapid.africa`.** The PRD requires an
    approved address before launch; the fallback keeps the footer, confirmations
    and privacy page coherent until the owner confirms or overrides it with
    `VITE_CONTACT_EMAIL`.
16. **Submission IDs are React state, not refs.** Both forms create the ID once
    per mount with `useState` and reuse it for retries. This keeps retry
    semantics and removes the React Compiler lint warnings about reading refs
    during render; lint is now clean (0 warnings, 0 errors).

### Open items from this pass

- Deploy the Apps Script web app, set `VITE_SUBMISSIONS_ENDPOINT`, and run one
  labelled internal tester and founder request through the live sheet.
- Confirm the support address, domain, privacy sign-off and retention period.
- Install WebKit's system libraries and run the Safari projects before launch if
  iPhone Safari coverage is required by the owner.
- Agree the analytics consent mode and visitor/session counting method.

---

## Historical notes — superseded marketing site

### Decisions

- **React 19**: Project uses React 19 (not 18 as brief specified). The brief said React 18 but the scaffold defaulted to 19.
- **Router**: Using `react-router-dom` v7 (v6 API compatible) as installed by pnpm.
- **Avatar fallbacks**: All portraits use the illustrated `Avatar` component until real photography arrives (section 17).
- **Africa dot map**: Using a generated inline fallback pattern until `pnpm gen:map` output is committed.
- **No images**: All photo slots use `Avatar` fallbacks or placeholder gradients.
- **Strict mode**: `strict: true` and `noUncheckedIndexedAccess: true` enabled in tsconfig.

## Conflicts

- **2026-09-22 — Privacy Policy vs. honesty rules (brief §1).** The brief says never to claim
  automated or live matching ("team-assisted matching" for the pilot), but the client-supplied
  Privacy Policy §3 "Matching and AI" states RAPID may use automated systems and AI to match
  founders with validators. The client's legal text is used verbatim on /privacy; all marketing
  copy keeps "team-assisted matching". Flagged for the client to reconcile.
- **2026-09-22 — Role naming (brief §1) vs. Privacy Policy.** The brief requires Founder/Tester
  naming everywhere via `roles.ts`; the policy uses "founder, validator, or both". The client's
  wording was kept verbatim on the policy page only.

## Open Items (section 17)

- [x] Final logo SVG and favicon — implemented from the client's brand image (see "Brand logo pass" below)
- [ ] Final photography (section 13.2) — illustrated `Avatar` components used
- [ ] Domain — Vercel URL in `VITE_SITE_URL`
- [ ] Contact email — `VITE_CONTACT_EMAIL`; footer link hidden if unset
- [ ] Approved Privacy text — client text of 2026-09-22 implemented on `/privacy` (draft notice
  removed). Its "[Insert email/website]" placeholders are wired to `VITE_CONTACT_EMAIL` /
  `VITE_SITE_URL`; confirm both env vars and final legal sign-off before launch.
- [ ] Waitlist sheet — signups post to the Google Apps Script web app (default URL baked into
  `src/lib/waitlist.ts`, override with `VITE_WAITLIST_ENDPOINT`). Confirm the sheet columns and
  share access with the client.
- [ ] Typeface — Inter is the most-cited "AI-default" font tell (Krebs' 16-pattern audit). The
  brief fixes Inter, so a swap is a client decision; if approved, record it under Decisions.

## Deviations

- Phone feed Previous/Next buttons use text arrows instead of SVG icons (simplification).
- Phone frame side buttons are simplified rectangles.
- The `gen:map` script has not been run yet; AfricaDotMap uses a simplified dot pattern.
- Privacy page has a client/legal review notice per section 14.
- **Seam gradient blends removed (2026-09-22, client request).** The `.seam-after-dark` /
  `.seam-after-light` 150 px crossfade bands read as a blur or smudge at every dark↔light join.
  Sections now meet crisply at the neutral seam hairline (the brief's "gradient hairlines" option
  in section 2.7), and every section keeps the one rhythm from brief 5.4 (56 px mobile / 96 px
  desktop) instead of the 176/216 px seam padding. `.surface-dark--bleed-top` now starts at
  `#0a1622` — the exact colour the section above ends on — so MatchedFeed → RoleDemo reads as one
  canvas with no step at the join.
- **AI-design-tell pass (2026-09-22, client request).** Removed the purely decorative tracked-caps
  ornaments (FAQ "CLEARER PATHS. / BRIGHTER IDEAS." and the final CTA's "IDEAS / PEOPLE /
  VALIDATION / TRACTION" stack) and changed the Interests/Screening block's emerald left border
  to a neutral sand rule. Research on AI-generated-site markers lists the eyebrow/caps ornament and
  the coloured card border as the most reliable tells. Meaningful labels were kept: sample/demo
  honesty labels, in-mockup UI caps, and the 01–04 numbered step eyebrows (they mark the actual
  sequence across sections).
- **Waitlist simplified (2026-09-22, client request).** The form now collects only a name and an
  email: the Founder/Tester/Both selector, WhatsApp, country, city and every step-2 founder/tester
  field are gone, along with the second step — submit shows the "You are on the list"
  confirmation directly (duplicate emails show "You're already on the list"). The
  `waitlist_entries` table was reduced to `name`/`email`/`source`; the old migration file was
  corrupt (NUL bytes) and was rewritten. Deep link `/?join=…` still opens the dialog, value
  ignored. `StepRole.tsx`, `StepDetails.tsx` and `roles.ts` were removed. Supersedes brief
  sections 6.4 (role preselect deep links) and 9 (two-step dialog). The privacy policy §1 still
  lists "role" among information that *may* be collected — left verbatim as client text.
- **Waitlist backend swapped to Google Sheets (2026-09-22, client request).** Signups now POST
  form-encoded to the client's Google Apps Script web app (deployment id baked in as the default
  endpoint, `VITE_WAITLIST_ENDPOINT` overrides it) instead of Supabase. Supabase was removed
  everywhere: `src/lib/supabase.ts`, `supabase/migrations/`, the `@supabase/supabase-js`
  dependency, the env vars, and the `connect-src` CSP entry in `vercel.json` (now allows
  `script.google.com` / `script.googleusercontent.com`). Supersedes brief section 3 (fixed tech
  stack) and 9.5 (migration). Note: Sheets has no unique constraint — duplicate detection now
  depends on the Apps Script checking the email column; the client still honours a
  `{ duplicate: true }` JSON reply.

## Visual system — editorial-restraint pass (supersedes the brief's visual spec)

The client explicitly overrode the brief's "do not redesign" for a visual pass, so the
following deliberately departs from the original visual description while keeping all copy,
section order, data and behaviour intact:

- **Accent budget.** The brief specified neon emerald **and** teal as co-equal accents plus
  emerald/teal glows throughout. Two cool accents in every headline, orb, border and hairline
  put the accent well over the 10% it should occupy, so nothing led. Now: one accent hue
  (emerald), reserved for primary actions, one key headline word and a handful of glyphs.
  Background washes are **neutral**, not accent-coloured.
- **Surfaces.** `#03121E` (effectively pure black) and `#FFFFFF` (pure white) were replaced with
  a lifted navy `#0B1826` and a warm paper `#FAF8F4`, with sand neutrals. Softer `#E6EDF3` body
  text replaces `#F2F7FB` to reduce halation on dark surfaces.
- **Typography.** Headings were normalised to a three-tier scale (`t-statement` / `t-section` /
  `t-eyebrow`) instead of one near-uniform clamp size per section.
- **Depth.** A single elevation ladder (`elev-1/2/3`, plus dark variants) and one glass treatment
  replace the previous mix of emitted neon glows and unrelated drop shadows. The hero card's
  one-off `rotateY(14deg)` tilt was removed so it no longer contradicts every flat mockup.
- **Removed accent-coloured decoration** (emerald/teal orbs, mint section blobs, emerald seam
  hairlines) in favour of neutral washes and neutral hairlines.

## Accessibility & contrast audit (2026-09-22)

Tooling: `tests/a11y.spec.ts` (axe-core via Playwright, wcag2a/2aa/21a/21aa + best-practice,
runs against the production build) + `scripts/contrast-audit.mjs` (pair-wise WCAG math over
the real palette). Run: `pnpm exec playwright test tests/a11y.spec.ts` · `node scripts/contrast-audit.mjs`.

**Result: 0 axe violations on home, waitlist dialog, and privacy; 37/37 contrast checks pass.**

Fixes applied:
- Palette: `brand-700` `#0A8A62` → `#087A56` (was 4.03:1 on brand-50, needs 4.5) and
  `brand-600` `#0FB37B` → `#0B9468` (focus borders/rings need 3:1, was 2.7). All brand text/
  border usages re-verified against white, paper, sand-50, brand-50.
- `nested-interactive`: PhoneFrame had `role="img"` wrapping real buttons (filter pills,
  action buttons, scroll region) → removed the role/aria-label.
- `heading-order`: Hero sample-card title h3 → h2 (was skipping h1 → h3); CreatePitch form
  title h4 → h3.
- `region`: privacy hero `<section>` now `aria-labelledby="policy-title"` (h1 got the id).
- `color-contrast` text fixes: RoleDemo footnote + FeedbackLoop chat mock `text-dark-muted`
  on white → `text-light-muted`; FeedbackLoop "See update" button was `outline` variant
  (white text) on a white card → `ghost` + `!border-brand-500 !text-brand-700`;
  small brand-600 text (consent link, demo eyebrows, phone tab label) → brand-700;
  eyebrow numbers navy-300 (1.92:1) → navy-500 (4.78:1); FindPeople caption gray-400 →
  light-muted; footer/BrandPanel dark-muted opacity /50-/60 → /70; BrowserFrame URL pill
  /60 → solid; placeholders /50 → solid; input rest border `#CBD7E0` (1.47:1) → `#808F9E` (3.31:1).
- FAQ/ActionEvidence open-state border `brand-500/40` (1.27:1) → `brand-600` (3.85:1).
- Remaining `gray-400` timestamps in ProblemSolution chat live inside an `aria-hidden`
  illustration container → WCAG-exempt (audit marks them SKIP); disabled Profile tab exempt too.

## Layout rhythm pass — 2026-09-22 (client request, extends the restraint pass above)

The page was eight variations of the same side-by-side two-column composition. Each section now
uses a different structural rhythm while keeping all copy, section order, data and behaviour intact:

| # | Section | Rhythm |
|---|---|---|
| 1 | Hero | Text \| visual split + 4-step strip (the anchor) |
| 2 | Problem & solution | Vertical narrative: headline → problem (text + still life) → down-arrow → centred solution stack → closing line |
| 3 | Create pitch | Editorial header (headline left / lead + tip right) → full-width browser band breaking out to 1280 px |
| 4 | Find people | Centred single column, with the network diagram radiating beneath it |
| 5 | Explore feed | Text \| phone split |
| 6 | Role demo | Centred header + segmented tabs + panel pair |
| 7 | Action evidence | Editorial header (headline left / lead right) → centred accordion rows → full-width report band |
| 8 | Feedback loop | Three-card arrow row + planned-feature grid |
| 9 | Roles | Two-panel comparison with divider |
| 10 | FAQ | Centred narrow column (760 px) |
| 11 | Final CTA | Centred closing statement (820 px) |

No two adjacent sections share a rhythm. The brief's per-section two-column descriptions
(section 7.x) are superseded by this table.

## Photo ingest pass

The nine WhatsApp JPEGs in `pictures/` are now wired into the site's image slots via
`pnpm pictures` (`scripts/process-pictures.mjs`, sharp) → `public/images/*.webp`
(12 outputs, all ≤ 38 KB vs the 200 KB budget; crop uses sharp's `attention` strategy
so faces stay in frame):

| Slot | Used by |
|---|---|
| hero-pitch | Hero sample-pitch VideoTile |
| create-pitch | CreatePitch browser band video |
| role-demo | RoleDemo mock video |
| feed-1/2/3 | Explore feed cards (cycled across 8 ideas via `DemoIdea.image`) + demo dialog (feed-1, same lunch pitch) |
| profile-1/2/3 | FindPeople floating profile cards |
| roles-founders/testers | RolesValue comparison panels |
| feedback-avatar | FeedbackLoop chat avatar (1:1) |

Implementation: new `Photo` component (`src/components/media/Photo.tsx`) renders the
image over the existing Avatar/gradient placeholder and hides itself if the file is
absent, so the site still looks correct before images are generated. `VideoTile` gained
an optional `image` prop.

⚠️ **Watermark / licensing**: the source JPEGs are iStock comp/preview files — each has
the translucent "iStock / Credit: …" band and a stock ID. The script's crop/resize
removes the watermark band from every slot (band sits outside the cropped region), so
nothing visible ships to the site — but these remain unlicensed preview images.
Replace `pictures/` with licensed exports (same filenames → just re-run `pnpm pictures`)
before any real launch. Logged as an open item.

`public/images/` is not git-ignored (the repo's `.gitignore` has no `images` rule), so
the generated WebPs commit and deploy with the site.

## Brand logo pass

The client supplied final artwork in `logoimage/Rlogo.jpg` (R mark on dark navy) and
`logoimage/rapid.jpg` (RAPID wordmark on dark). `scripts/process-logo.mjs` (run manually:
`pnpm exec node scripts/process-logo.mjs`) luminance-keys the dark backgrounds away and
trims to the glyph bbox, producing:

- `public/images/brand/r-mark.png` — transparent RGBA mark (900×594, ~103 KB)
- `public/images/brand/rapid-wordmark.png` — transparent white-RGBA wordmark (1200×221, ~25 KB)
- regenerated `favicon.svg` / `og-image.svg` embedded from the same mark

`Logo.tsx` now uses these directly:
- **Mark**: `<img>` of the real PNG (hard-coded aspect 1.5152).
- **Wordmark**: the PNG as a CSS `mask-image` over `currentColor` — white on dark sections,
  ink on light ones, exactly like the text it sits next to (with `-webkit-` prefix for
  Safari). Aspect 5.4299; `sr-only` "RAPID" text keeps it accessible.
- Thin divider from the brand lockup kept; optional `tagline` prop ("VALIDATION THAT DRIVES
  TRACTION.") used on the waitlist BrandPanel.
- Verified in Chromium on the built site: dark header, light browser-mock sidebar, dark
  footer, and favicon all render the real artwork correctly.
- Regenerate the PNGs only if the source JPGs change (`pnpm exec node scripts/process-logo.mjs`).

## RoleDemo section fix + redesign (section 6)

**Bug**: `Tabs.Root` in `RoleDemo.tsx` had `className="flex justify-center mb-12"` — a flex
ROW containing both the tab-list and the panels wrapper. Result: the `glass-dark` pill
container stretched (align-items default) into a large dark blob ~450 px tall, the demo
cards were shoved to the right of it, and the tester card's 3 CTA buttons overflowed the
card (`overflow-hidden` clipped "Collaborate").

**Fix**: Root → `flex w-full flex-col items-center gap-10`; panels wrapper → `w-full
max-w-[980px]`. CTA row → `flex flex-wrap` + `whitespace-nowrap` on each button.

**Redesign of the role switcher**: bare "Tester | Founder" pills replaced with
descriptive segmented tabs — icon (Users/Rocket) + label + one-line hint (copy.ts:
`testerHint` "Try ideas and give feedback", `founderHint` "Share your idea, get proof").
Hints are `hidden sm:block` so the pill stays 260 px on phones.

**Verified** with DOM assertions (screenshot attachments were unreliable this session):
pill 70 px tall, centered (cx=640), cards 32 px below, all 3 CTAs fit, hints visible
desktop / hidden mobile, tab switching works, mobile scrollWidth=390 (no overflow).

## Grilled chicken bowl (FeedbackLoop card 2)

`pictures/bayu-syaits-APkN840aeh4-unsplash.jpg` → slot `grilled-bowl` (1:1, 160 px) in
`scripts/process-pictures.mjs` → `public/images/grilled-bowl.webp` (~6 KB). Replaced the
orange gradient placeholder in `FeedbackLoop.tsx` card 2 ("The founder improved" →
"Grilled Chicken Bowl") with a `Photo` layered over the same gradient as fallback.
Verified on the built site; `pnpm pictures` regenerates it with the rest.

## Waitlist BrandPanel rebuilt to match the reference visual (2026-09-23, client request)

The left panel of `WaitlistDialog` previously rendered only the logo, heading, lead and
the flow caps — BUILD_BRIEF §9.1's phone cluster was never built. Rebuilt
`src/components/waitlist/BrandPanel.tsx` to match the client's reference screenshot:

- **Phone cluster** (decorative, `aria-hidden`): scaled-down `PhoneFrame` (0.4×, width
  pinned `!w-[340px]`) showing the founder video tile, title and the three stacked pill
  buttons from `copy.ts` (`brandCta` / `brandCallCta` / `brandCollabCta`).
- **Six portrait chips** (84 px, `brandChipsLeft` / `brandChipsRight` labels): `Photo`
  over `Avatar` fallback, tiny brand-700 icon + label, `shadow-card-float`.
- **`Connectors`** — six glowing emerald paths phone→chip, drawn on mount (the component
  honours `prefers-reduced-motion`).
- **`AfricaDotMap`** behind the phone at 60% opacity, plus an emerald radial wash and a
  blurred glow pool under the phone base.
- **Flow strip** split into words with `→` separators (`justify-between`), same
  `text-dark-muted/70` as the audited pair.
- Panel widened `w-[400px] xl:w-[440px]` to fit the wider composition; cluster box is
  376×246 with connector geometry tuned to it (the SVG stretches at md, ends still land
  beside the chips).

**Verified**: `tsc --noEmit`, `oxlint`, `vitest`, `pnpm build` all clean; Playwright
`tests/a11y.spec.ts` → 0 violations on the waitlist dialog; `contrast-audit.mjs` →
37/37 PASS. DOM geometry checks at 1440×900 and 900×800: lowest chip bottom 626 vs flow
top 655 (1440) and 576 vs 629 (900) — no overlap, phone clears the flow strip, panel
scrollHeight overflow is only the unscaled phone layout box (visually clipped-safe).
Note: `tests/home.spec.ts` "header nav links exist" fails on a pre-existing strict-mode
collision (`nav a[href="#explore-ideas"]` matches both header and footer links) —
unrelated to this change. *(Superseded: selector now scoped to
`nav[aria-label="Main navigation"]`, suite green — see the mobile pass below.)*

## Mobile optimization pass — audit + reported-bug fixes

**Reported bugs**
- **04 / LEARN FROM ACTIONS** — added an `accordionClose` exit keyframe (Radix waits for
  it before unmounting, so panels no longer snap shut on close) and promoted the
  section's gradient blob to its own layer (`will-change-transform`) so it isn't
  repainted frame-by-frame while the height animates. FAQ accordion gets the same close.
- **02 / FIND RELEVANT PEOPLE** — rebuilt. Desktop: cards, audience node and connector
  paths now share one exact 640×480 stage, so every line starts under the node and ends
  just inside its card; the SVG renders first, so lines can never cover a photo. Below
  `md`: a stacked timeline (spine + curved connector per card, horizontal photo cards)
  replaces the cramped absolute layout that clipped at small widths.
- **Hero connectors** — lines now start behind the main card, touch a pulsing bounce
  node on the globe's visible dot field, then deflect into each floating card; the SVG
  renders before the cards so line ends are covered. Added `@keyframes pulseRing` to
  CSS — the keyframes lived only in tailwind.config and were never emitted, so the
  globe's Nigeria pulse had never actually animated.

**Audit fixes (Lighthouse mobile, before → after)**
- performance 66 → 81, accessibility 97 → 100, best-practices 96 → 100;
  TBT 940 → 420 ms, LCP 3.6 → 3.0 s, TTI 4.1 → 3.0 s (CLS 0.01 unchanged).
- removed the hand-written `<link rel="modulepreload" href="/src/main.tsx">` — the
  build rewrote it to a hashed `.tsx` asset served with an empty MIME type (console
  error + wasted request on every load; the `errors-in-console` best-practices fail).
- hero thumbnail loads `eager` + `fetchpriority=high` (it was the lazily-loaded LCP
  image — `Photo`/`VideoTile` gained `loading`/`eager` props).
- logo now loads WebP (`r-mark` 105 → 9.3 KB, `rapid-wordmark` 26 → 4.3 KB; PNGs kept
  for favicon/OG embeds — new step 6 in `process-logo.mjs`); hero/profile/avatar photos
  resized to display sizes (−~40 KB) in `process-pictures.mjs`.
- privacy page lazy-loaded out of the main bundle (`routes.tsx`).
- `cv-auto` utility (`content-visibility: auto`) on below-fold sections — offscreen
  sections skip rendering work until they near the viewport (the layout/TBT win;
  verified in-view reveals and line draws still fire after the scroll).
- waitlist dialog: `92dvh` instead of `90vh` (mobile URL-bar safe), `min-h` only from
  `md`, inputs `text-base` below `md` (prevents the iOS focus zoom) — dialog measured
  370×530 fully inside a 390×844 viewport.
- footer links get 44 px tap targets; chat timestamps `gray-400 → gray-600` (2.3 →
  6.8:1 contrast); `VideoTile` aria-label now contains its visible label + duration
  (WCAG Label in Name — clears Lighthouse `label-content-name-mismatch`).

**Verified**: `tsc --noEmit`, `oxlint`, `vitest`, `pnpm build` clean; Playwright
`tests/` 9/9 with 0 axe violations on home, waitlist dialog and privacy; contrast-audit
37/37; `scripts/verify-mobile.mjs` 34/34 (dialog fit, both FindPeople layouts'
geometry, line-behind-card paint order at both widths, hero connector
start/touch/end behaviour, accordion open/close height sampling, zero console errors).
Screenshots in `docs/audit/`. The privacy a11y test now waits for the lazy route to
render before running axe.

## Interactive role demo — section 05 (2026-09-23)

**Reported**: "Pick a role and try it" wasn't interactive for either role.
- **Tester panel**: Try it / Book a call / Collaborate now drive the right panel —
  idle prompt → action preview → success state (sample slot picker for calls; every
  success carries "demo only, nothing was sent/booked" copy). The X, Close and
  "Try another" buttons all return to idle. Active CTA gets a ring + `aria-pressed`.
- **Founder panel**: each incoming-action row gets accept / pass round buttons
  (badge + undo replace them when decided), an n/3 handled counter and an
  all-handled note; "Open sample report" expands the three report details in place
  and toggles to Close (`aria-expanded`).
- New strings live in `ROLE_DEMO` (`src/content/copy.ts`); all state is component-
  local — nothing is sent, booked or stored.
- **Verified**: `scripts/verify-mobile.mjs` 46/46 (12 new checks click every tester
  and founder control end-to-end), Playwright 9/9 with 0 axe violations, contrast
  37/37, `tsc`/`oxlint`/build clean. Screenshot: `docs/audit/role-demo-1440.png`.
