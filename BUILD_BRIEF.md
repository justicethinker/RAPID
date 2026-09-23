# RAPID — Waitlist Website Build Brief (verbatim source of truth)

> **Status:** This file contains the client's complete build brief, saved verbatim on 2026-09-20. It is the single source of truth for the entire build. Decisions and conflicts are logged in `NOTES.md`. A progress tracker is maintained at the bottom of this file and updated after every phase.

---

You are the builder. You are starting from a brand-new, empty folder. You have NO other files: no design files, no screenshots, no prototype. Everything you need is in this document: product context, exact copy, exact visual descriptions, design tokens, code for the tricky assets, backend schema, quality bars and a phased plan. Implement it precisely. Do not redesign. Where this brief is silent, choose the simplest option that fits the spirit of the design and record it in `NOTES.md`. If two parts of this brief conflict, log it under "Conflicts" in `NOTES.md`, pick the more specific rule, and continue.

Target: a premium, production-grade marketing site for a pre-launch product, with a working waitlist backend, interactive demos, full accessibility, and excellent performance. The visual quality bar is a top-tier startup landing page: deep navy and neon emerald, glassy floating cards, soft glows, big confident typography, generous whitespace, alternating dark and white sections.

---

## 0. How to work

1. Read this entire document before writing code.
2. Work in the phases in section 16. After each phase: run the listed checks, commit, and post a short status report (done, deviations, blocked). Do not start the next phase until told to continue.
3. Rebuild everything as real HTML/React. Never use screenshots or flattened images as page content.
4. Never invent product claims, metrics, testimonials, logos, partners, prices or dates. All demo numbers are sample data and must be labeled (section 11).
5. Never leave lorem ipsum, TODO text or placeholder copy visible on the public page. Items needing client input are in section 17, each with a safe fallback.
6. Do not add dependencies beyond section 3 without recording why in `NOTES.md`.
7. Commit early and often. Keep `main` deployable.
8. At the very start, reply with: (a) a one-paragraph summary of the product and page structure in your own words, (b) any ambiguities you found, (c) your Phase 0 plan. Then wait for approval.

## 1. Product context, voice, honesty rules

RAPID is a pre-launch platform for a Nigeria pilot. Founders share a short pitch video (up to 60 seconds) plus four short notes (problem, target audience, solution, pitch summary). People who experience the problem, called **testers**, watch the pitch and choose what to do: try it, book a call, collaborate, or share feedback. RAPID shows founders the actions people actually took, with clear denominators, instead of vanity metrics. Matching in the pilot is **team-assisted**, not automated.

The website's only job: explain this clearly and get visitors onto the waitlist as either a Founder, a Tester, or Both.

Voice: plain, warm, confident, honest. Short sentences. No hype, no guarantees.

Hard rules (trust and legal):

- Never claim automated or live matching. Say "team-assisted matching" for the pilot.
- Never promise paid opportunities, instant matches, guaranteed demand or income.
- "Joining does not guarantee a place." appears next to every waitlist call to action (final CTA, hero fine print, form).
- Keep signals separate: a call being booked is not a call being attended; a trial signup is not use; a payment pledge is not a completed order.
- Every demo, profile, number and story is labeled sample or example.
- "Signals help decisions; they do not guarantee success."

Role naming: use "Founder" and "Tester" everywhere. Implement via one constant in `src/content/roles.ts` (`ROLE_LABELS`) so it can be renamed in one place.

## 2. Visual identity (read this before anything else)

Mood: premium dark-tech meets friendly African startup energy. Two section moods alternate down the page:

- **Dark sections**: near-black navy (`#03121E`) with large soft radial glows (emerald and teal), glassy navy panels, white headlines with one emerald-gradient phrase, muted blue-gray body text, neon emerald pill buttons that glow.
- **Light sections**: pure white with very soft mint blobs (large blurred radial gradients), near-black headlines with one darker-emerald gradient phrase, white cards with big radius and soft, long, low-contrast shadows, mint icon circles.

Signature elements used repeatedly:

1. **Headline pattern**: a bold, tightly tracked 2-line headline where the second line (or key phrase) is an emerald gradient. Example: "Good ideas need" in white, "the right people." in gradient.
2. **Mint icon circles**: circular icon holders (40 to 52 px) filled `#CFF5E6` with a dark emerald icon on light backgrounds; on dark backgrounds, 52 px circles with a 1.5 px `#1F5A56` outline and an emerald icon.
3. **Floating white cards** with 16 px radius on top of dark backgrounds, connected by thin glowing emerald curved lines that end in small round nodes.
4. **Pill buttons** with an arrow: emerald-to-teal gradient, soft glow shadow, dark ink text.
5. **Sample labels** in small muted text near every illustrative element.
6. **Photography treatment**: warm, natural, candid portraits of young Nigerian founders and students in bright cafe, campus and co-working settings, consistent warm-teal color grade, rounded corners (14 to 20 px). Until real photos arrive, illustrated avatar fallbacks are used (section 13.3).
7. **Wide rhythm**: alternate dark, light, light, light, dark, dark, light, light(+dark band), light, light+dark. Soften joins with gradient hairlines or gradient backgrounds so no seam looks abrupt.

## 3. Tech stack (fixed)

| Concern | Choice |
|---|---|
| Build | Vite 5, React 18, TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 3.4. Tokens in `tailwind.config.ts`. No CSS-in-JS |
| Headless UI | Radix: `@radix-ui/react-dialog`, `-tabs`, `-accordion`, `-popover`, `-visually-hidden` |
| Icons | `lucide-react` only (1.75 to 2 px stroke). Mapping in section 6.5 |
| Fonts | `@fontsource-variable/inter` (self-hosted) and `@fontsource/caveat` weight 600 (sticky note only) |
| Forms | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Backend | Supabase (Postgres + RLS) via `@supabase/supabase-js` v2. No custom server |
| Routing | `react-router-dom` v6: `/` and `/privacy` only |
| Animation | CSS transitions/keyframes + a `useInView` hook (IntersectionObserver). No animation library |
| Testing | Vitest + Testing Library; Playwright + `@axe-core/playwright` |
| Quality | ESLint (typescript-eslint, react-hooks, jsx-a11y), Prettier, `tsc --noEmit` |
| Hosting | Vercel static, `vercel.json` for SPA rewrite and security headers |
| Dev-only | `world-atlas`, `topojson-client`, `d3-geo`, `tsx` (for the map generator) |

Node 20 LTS, pnpm. Scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `e2e`, `gen:map`.

## 4. Fresh scaffold (Phase 0 commands)

```bash
mkdir rapid && cd rapid
pnpm create vite@latest . --template react-ts
pnpm add react-router-dom @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-popover @radix-ui/react-visually-hidden lucide-react react-hook-form zod @hookform/resolvers @supabase/supabase-js @fontsource-variable/inter @fontsource/caveat clsx
pnpm add -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test @axe-core/playwright eslint prettier eslint-plugin-jsx-a11y world-atlas topojson-client d3-geo tsx @types/d3-geo @types/topojson-client
pnpm dlx tailwindcss init -p --ts
git init
```

Project structure:

```
rapid/
  index.html
  vercel.json
  .env.example
  NOTES.md  README.md
  public/            favicon.svg  og-image.png  robots.txt  sitemap.xml
  scripts/generate-africa-dots.ts
  supabase/migrations/0001_waitlist.sql
  src/
    main.tsx  App.tsx  routes.tsx
    styles/index.css
    content/  copy.ts  roles.ts  demo-data.ts  faq.ts
    lib/      supabase.ts  waitlist.ts  schema.ts  analytics.ts  cn.ts
    hooks/    useInView.ts useReducedMotion.ts useScrollSpy.ts useMediaQuery.ts useWaitlistDialog.ts
    components/
      layout/  Header.tsx MobileMenu.tsx Footer.tsx StickyCta.tsx SkipLink.tsx Section.tsx Container.tsx
      ui/      Button.tsx Pill.tsx Chip.tsx Badge.tsx GradientText.tsx IconCircle.tsx Logo.tsx SampleLabel.tsx
      media/   Avatar.tsx PersonPhoto.tsx VideoTile.tsx AfricaDotMap.tsx BrowserFrame.tsx PhoneFrame.tsx Connectors.tsx
      sections/ Hero ProblemSolution CreatePitch FindPeople MatchedFeed RoleDemo ActionEvidence FeedbackLoop RolesValue FaqFinalCta
      demo/    DemoAppDialog.tsx PitchDetailView.tsx FounderReportView.tsx ActionPreviewDialog.tsx UpdateDialog.tsx
      waitlist/ WaitlistDialog.tsx BrandPanel.tsx StepRole.tsx StepDetails.tsx TopicTile.tsx Confirmation.tsx
    pages/    Home.tsx  Privacy.tsx
    assets/   images/ (webp)  africa-dots.svg  africa-nigeria.json
  tests/
```

## 5. Design system

### 5.1 Tokens: `tailwind.config.ts` (use exactly)

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#03121E', 900: '#061C2C', 800: '#0A2235', 700: '#0E2840', line: '#1C3A55' },
        brand: { 500: '#15E6A0', 600: '#0FB37B', 700: '#0A8A62' },
        teal: { 500: '#12C9D6' },
        mint: { 50: '#E6FBF3', 100: '#CFF5E6' },
        ink: '#03121E',
        'dark-text': '#F2F7FB',
        'dark-muted': '#B7C7D5',
        'light-muted': '#3B4F60',
        warn: { 50: '#FFF4D6', 900: '#5C4610' },
        danger: '#B42318',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      maxWidth: { site: '1160px' },
      borderRadius: { card: '20px', phone: '48px' },
      boxShadow: {
        'glow-btn': '0 10px 34px -10px rgba(21,230,160,.75)',
        'glow-btn-hover': '0 16px 40px -10px rgba(21,230,160,.9)',
        'glow-card': '0 40px 90px -30px rgba(21,230,160,.55), 0 0 60px rgba(18,201,214,.25)',
        'glow-phone': '0 0 0 2px #35506A, 0 0 90px rgba(21,230,160,.35)',
        'card-light': '0 24px 60px -24px rgba(3,18,30,.28), 0 0 0 1px #E6EDF2',
        'card-float': '0 24px 50px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)',
      },
      backgroundImage: {
        'brand-btn': 'linear-gradient(90deg,#15F0A8,#0FD0A0 60%,#12C9D6)',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'none' } },
        pulseRing: { '0%': { transform: 'scale(.4)', opacity: '.9' }, '100%': { transform: 'scale(3.2)', opacity: '0' } },
        drawLine: { to: { strokeDashoffset: '0' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 5.2 Global CSS (`src/styles/index.css`)

```css
@import '@fontsource-variable/inter';
@import '@fontsource/caveat/600.css';
@tailwind base; @tailwind components; @tailwind utilities;

:root { color-scheme: dark; }
html { scroll-behavior: smooth; scroll-padding-top: 88px; -webkit-text-size-adjust: 100%; }
body { @apply bg-navy-950 text-dark-text font-sans antialiased overflow-x-hidden; font-size: 17px; line-height: 1.6; }
:focus-visible { outline: 3px solid #15E6A0; outline-offset: 3px; border-radius: 8px; }
.on-light :focus-visible { outline-color: #0FB37B; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

@layer utilities {
  .text-grad-dark  { background: linear-gradient(90deg,#15E6A0,#12D3C4 70%,#3BB8F0); -webkit-background-clip: text; background-clip: text; color: transparent; }
  /* Emerald on WHITE must use this darker gradient and only at 24px bold or larger (contrast). */
  .text-grad-light { background: linear-gradient(90deg,#0A9B6D,#13B58B 60%,#22A7A8); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .orb { position: absolute; border-radius: 9999px; pointer-events: none; }
  .section-dark  { color-scheme: dark;  background: #03121E; color: #F2F7FB; --muted: #B7C7D5; }
  .section-light { color-scheme: light; background: #fff;    color: #03121E; --muted: #3B4F60; }
  .lead { font-size: clamp(18px, 2vw, 22px); line-height: 1.55; color: var(--muted); max-width: 58ch; }
}

/* Reveal: content is visible by default. Pre-reveal state only exists when JS added .motion to <html>. */
.motion [data-reveal]:not(.is-in) { opacity: 0; transform: translateY(12px); }
.motion [data-reveal] { transition: opacity .25s ease, transform .25s ease; }
```

### 5.3 Type scale

| Role | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| H1 (hero only) | `clamp(42px, 6.6vw, 80px)` | 800 | 1.02 | -0.03em |
| H2 (sections) | `clamp(32px, 4.6vw, 56px)` | 800 | 1.05 | -0.03em |
| H3 (cards, features) | 22 to 42 px by context | 700 to 800 | 1.1 | -0.02em |
| Lead | `clamp(18px, 2vw, 22px)` | 400 | 1.55 | 0 |
| Body | 17 px | 400 | 1.6 | 0 |
| Small / caption | 14 px (13 px minimum, labels only) | 400 to 500 | 1.45 | 0 |
| Eyebrow | 13 px, uppercase | 600 | 1.2 | 0.14em |
| Button | 16 to 17 px | 700 | 1 | 0 |

Muted text on navy must be `#B7C7D5` or brighter. Muted text on white must be `#3B4F60` or darker. Never use fainter gray for text.

### 5.4 Spacing and shape

- Container: `max-w-site` (1160 px), gutters 20 px mobile, 32 px tablet, 40 px desktop.
- Section vertical padding: 96 px desktop, 56 px mobile. One consistent rhythm.
- 8 px grid. Card gaps 16 to 24 px.
- Radius: buttons full pill; cards 16 to 24 px; inputs 12 px; phone 48 px; dialogs 24 to 28 px; video tiles 14 px.

### 5.5 Buttons (`Button.tsx`)

Min height 48 px (44 px for `sm`), pill radius, 150 to 200 ms transitions on transform, shadow and border, arrow icon (`ArrowRight`, 20 px) optional at the right.

- `primary`: `bg-brand-btn`, ink text, weight 700, `shadow-glow-btn`; hover: translateY(-2px) + `shadow-glow-btn-hover`.
- `outline` (on dark): transparent fill, 1.5 px border `#2FD8B0`, light text; hover fills `rgba(21,230,160,.1)`. Variant with a 30 px circled play icon on the left, used for "Walk through the demo".
- `ghost` (on light): white, 1.5 px `#CBD7E0` border, ink text.
- Disabled: 60 percent opacity, `aria-disabled`, no hover motion.
- Focus ring per 5.2.

### 5.6 Breakpoints

`sm 640`, `md 768`, `lg 1024`, `xl 1280`. Below `lg` the hero visual stacks. Below `md` the phone feed becomes a normal full-width list.

## 6. Global layout and behavior

### 6.1 Header (one shared header for the entire page)

- Sticky, height 72 px, background `rgba(3,18,30,.82)` with backdrop blur, 1 px bottom border `rgba(28,58,85,.6)`. Same dark header over dark and light sections. Content sits in the standard container.
- Left: `Logo`. Center: nav links "How it works", "Explore ideas", "For founders", "For testers" (15 px, weight 500, `#DCE7F0`, hover emerald, active link via scroll-spy gets a 2 px emerald underline). Right: primary `sm` button "Join waitlist" with arrow.
- Anchors: How it works to `#how-it-works`; Explore ideas to `#explore-ideas`; For founders and For testers both to `#roles` (each also moves keyboard focus to its own card heading).
- Below 900 px: nav collapses to a hamburger that opens a full-height Radix Dialog sheet with the same links and a full-width "Join waitlist" button.
- First focusable element on the page: a "Skip to main content" link.

### 6.2 Sticky mobile CTA

Below 700 px show a fixed bottom bar with a full-width primary "Join the waitlist" button, only after the hero has scrolled out of view. Hide it when the final CTA section is in view or any dialog is open. Respect `env(safe-area-inset-bottom)`. Give the page bottom padding so it never covers content.

### 6.3 Footer (dark)

Left: Logo (smaller). Right: links "Privacy" (`/privacy`), "Contact" (`mailto:` from `VITE_CONTACT_EMAIL`, hidden if unset), "Explore the demo" (`#explore-ideas`). Small line: "© RAPID. Nigeria pilot."

### 6.4 Waitlist entry points

Every "Join waitlist / Join the waitlist / Join as a founder / Join as a tester" control opens the single `WaitlistDialog` (section 9). Header, hero, final CTA and sticky bar open it with no role preselected. "Join as a founder" preselects Founder; "Join as a tester" preselects Tester. Deep link: `/?join=founder|tester|both` opens it on load. The hero's "Walk through the demo" does NOT open the dialog: it scrolls to `#explore-ideas`.

### 6.5 Icon mapping (lucide-react)

| Purpose | Icon |
|---|---|
| Location pill | `MapPin` |
| Share a pitch / idea tip / lightbulb | `Lightbulb` |
| People / audience / collaborate | `Users` |
| Track actions / check | `CheckCircle2` |
| Bar chart / pivot / next step | `BarChart3` |
| Trial signup / tester joined | `UserPlus` |
| Call / calendar | `CalendarDays` |
| Feedback / message | `MessageSquare` |
| Try it | `Rocket` |
| Interested | `Heart` |
| Search | `Search` |
| Video | `Video` |
| Documents / my pitches | `FileText` |
| Pre-order | `ShoppingCart` |
| Warning / limits | `TriangleAlert` |
| Build | `Hammer` |
| Iterate | `RefreshCw` |
| Chevron | `ChevronRight`, `ChevronDown` |
| Saved ideas | `Bookmark` |
| Activity history | `Clock` |
| Coffee (profile) | `Coffee` |
| Food (profile) | `UtensilsCrossed` |
| Demo flask label | `FlaskConical` |
| Menu / close | `Menu`, `X` |
| Play | inline SVG triangle (not an icon-font) |

## 7. Page sections (in page order)

All copy below is authoritative and lives in `src/content/copy.ts`. "Section moods" refer to section 2.

### 7.1 Hero (dark, `id="top"`)

**Background:** `#03121E` base. Orb 1: 720 px circle, top-right (offset -220 px right, -160 px top), `radial-gradient(circle, rgba(18,201,214,.22), transparent 65%)`. Orb 2: 620 px circle, bottom-left (offset -260 px left, -80 px bottom), `radial-gradient(circle, rgba(21,230,160,.16), transparent 65%)`.

**Layout:** two columns at `lg` and up (text column about 45 percent, visual column about 55 percent, 40 px gap), vertically centered; stacked below `lg`. Below both columns: the 4-step strip. Top padding 64 px.

**Text column, top to bottom:**

1. Pill (border 1 px `#2A4E6A`, bg `rgba(10,34,53,.7)`, radius full, padding 7 by 16, 14 px text): `MapPin` icon in emerald + "Nigeria pilot". Margin-bottom 26.
2. H1: line 1 "Good ideas need" in white; line 2 "the right people." with `text-grad-dark`. Force the line break at large widths.
3. Lead (muted): "Test your ideas with people who could use it or help shape products that solve problems you care about."
4. Plain-language definition (19 to 23 px, weight 500, near-white, max 34ch): "RAPID connects founders with real people who can try their ideas and show what they would actually do."
5. Two buttons in a row (wrap on small screens): primary "Join the waitlist" with arrow (opens dialog); outline "Walk through the demo" with circled play icon (scrolls to `#explore-ideas`, then moves focus to that section's heading).
6. Fine print (14 px, `#9FB3C3`): "Free to join. Joining does not guarantee a place."

**Visual column** is a relatively-positioned box about 560 px wide by 560 px tall on desktop (fluid), containing, back to front:

a. **Africa dot map** (`AfricaDotMap`, section 13.5): a large glowing emerald dotted silhouette of Africa, positioned right (right offset -30 px, top -10 px, width 560 px max), 95 percent opacity, dots fade toward the lower-left. A marker on Nigeria (bright emerald dot with drop-shadow glow) with a ring that pulses (keyframe `pulseRing`, 2.6 s, `animation-iteration-count: 3`, then rests).

b. **Connector lines** (SVG overlay, `Connectors`): three thin (1.6 px) emerald curves with `drop-shadow(0 0 6px #15E6A0)` from the right edge of the main card (at y about 270 of 560) to the left edge of each floating card (at about y 92, 270, 442). Small solid emerald dots at the ends. Lines draw in once (stroke-dasharray/offset animation 1.2 s, 0.5 s delay).

c. **Main card** (white, radius 22 px, padding 14 px, absolute: left 0, top 50 px, width 330 px, `shadow-glow-card`, slight 3D tilt `perspective(1200px) rotateY(-6deg) rotateX(2deg)`; tilt is removed below 1000 px). Contents:
   - Top row: three 9 px dots (red `#FF5F57`, yellow `#FEBC2E`, emerald `#15E6A0`).
   - Video tile (16:10, radius 12): sample founder portrait, centered 58 px white circular play button (dark triangle), small dark pill bottom-left "Sample pitch · 0:58".
   - Title (19 px, weight 800): "A better way to plan campus meals".
   - Byline row: 28 px round avatar + "By Amara Okafor" (14 px, `#3B4F60`) + mint chip "Founder".
   - Tag chips (13 px, radius full, light gray-blue `#EBF0F4`): "Food & Lifestyle", "Students", "Nigeria".
   - Description (14 px, `#3B4F60`): "Helping students find affordable, healthy meals near campus with real-time options and group orders."

d. **Three floating cards** (white, radius 16, padding 12 by 14, width about 236 px, `shadow-card-float`), absolutely positioned on the right edge at top 30 px, 215 px and 400 px; the middle one sticks out an extra 14 px to the right. Each has a 40 px mint icon circle and two text lines:
   - `UserPlus` / "Trial signup" / "Someone requested trial access"
   - `CalendarDays` / "Call requested" / "A tester wants to chat"
   - `MessageSquare` / "Feedback shared" / "Received specific feedback"

e. Caption bottom-right, 13 px `#9FB3C3`: "Illustrative product preview".

**Below `lg`:** the visual becomes a centered vertical stack (main card, then the three floating cards, each max 360 px wide), connectors and caption hidden, dot map remains as a dimmed (55 percent) background.

**4-step strip** (below, full width; top border 1 px `rgba(46,216,176,.25)`, padding 34 px top, 40 px bottom, margin-top 56 px). Four columns (2 columns below 900 px, 1 below 520 px). Each: 52 px round icon (1.5 px `#1F5A56` outline, `rgba(21,230,160,.06)` fill, emerald icon) + bold 16 px title + 14 px `#A9BBCB` line. Small chevron arrows between items on desktop.

1. `Lightbulb` "Share a pitch" / "Tell us what you're building in a few minutes."
2. `Users` "Meet relevant people" / "Reach people who experience the problem."
3. `CheckCircle2` "Track actions" / "See signups, calls, feedback and more."
4. `BarChart3` "Choose your next step" / "Iterate, find co-founders or move forward."

**Motion (once, on first view):** the three floating cards fade in and rise 8 px, staggered 120 ms, 500 ms each; then connectors draw. The H1, text and main card render immediately (protect LCP). Everything is visible with JS off or reduced motion.

### 7.2 Problem and solution (light)

**Background:** white with one very soft mint blob (520 px circle, `radial-gradient(circle,#BDF3DD,transparent 68%)`) on the right, partly off-screen.

Top: small pill "WHY RAPID" (mint, tracking .14em, 12 px, bold) centered. H2 centered, two lines: "A good response is not" / "always a real" then `text-grad-light` "next step." (The gradient phrase is "next step.")

Below: three-column composition at `lg` (left visual+text, a circular arrow badge, right card), one column below `lg` (badge rotates 90 degrees).

**Left column:** H3-size (40 px) "The problem". Text: "Finding the right people takes time. Friendly feedback can hide weak demand. Likes alone do not tell you who will try it." Under it, a pure HTML/CSS still life (about 330 px tall, `aria-hidden`), with one visually-hidden sentence: "Illustration of vague feedback: a survey, two chat replies and a note asking what happens next."

- A white paper sheet (270 px wide, radius 6, rotated -6 degrees, soft shadow) titled "Product feedback" with: "1. What do you think about this idea?" then three checkbox lines "Very interested", "Somewhat interested", "Not for me"; then "2. Any additional thoughts?" and three thin ruled lines.
- Two light gray chat bubbles (radius 16) to the right of the paper: "Interesting idea" with tiny "10:24 AM" and "Sounds useful" with "11:03 AM".
- A yellow sticky note (`#FFE566`, about 150 by 140 px, rotated 3 degrees, shadow), handwritten in Caveat 30 px: "What happens next?"
- A black pen lying diagonally at the paper's left edge (simple CSS shapes).

**Arrow badge:** 64 px circle, mint fill, dark emerald `ArrowRight`.

**Right column:** H3-size (40 px) "A clearer way to test". Text: "RAPID helps you reach people who know the problem and see what they choose to do." White card (radius 18, `shadow-card-light`, padding 20 by 22): header row "Recent actions" (bold 17 px) with small right label "EXAMPLE ACTIONS". Three rows separated by 1 px `#EEF2F5` lines, each: 42 px mint icon circle, bold title + 13 px sub, and a mint badge "Action taken" pushed right (12 px bold, dark emerald text), then a chevron:

- `UserPlus` "Asked to try it" / "Showed interest and requested access"
- `CalendarDays` "Requested a conversation" / "Booked a call to learn more"
- `MessageSquare` "Shared a useful concern" / "Provided a specific insight"

Closing line, centered, 24 to 30 px, weight 800, tight tracking: "Useful feedback matters." (ink) then `text-grad-light` "So does what happens after it."

**Motion:** the response examples (bubbles, note, action rows) reveal once with 250 ms fade and 12 px rise as the section enters. Fully readable without motion.

### 7.3 How it works: create a pitch (light, `id="how-it-works"`)

Two columns at `lg` (text about 42 percent, visual 58 percent), stacked below.

**Text:** eyebrow row "01" (emerald, 26 px bold) + "SHARE YOUR IDEA" (muted, 15 px, tracking). H2-size (46 px) heading in ink: "One short pitch." / "The details that matter." Lead: "Add a pitch video and a few clear notes so people can understand your idea quickly." A short 40 px emerald rule. Tip row: 42 px mint circle with `Lightbulb` + "Explain the idea without sharing private technical details."

**Visual:** `BrowserFrame` (radius 16, `shadow-card-light`, overflow hidden). Top bar `#0B1E2D` with three dots (red, yellow, emerald). If a URL pill is shown, it displays the real site host from `VITE_SITE_URL`; otherwise omit the pill. Body is a two-column app mock:

- Sidebar (150 px, hidden below 620 px, `#FAFCFD` with a right border): Logo (small), then items with icons: "Create pitch" (`Video`, active: mint background, dark emerald bold), "My pitches" (`FileText`), "Discover" (`Users`), "Messages" (`MessageSquare`), "Settings" (`Settings`).
- Main: H4 "Create your pitch" (20 px bold) + 13 px gray "Add a short video and key details about your idea." Two columns: left a video tile (sample man with headphones, play button, bottom label "Pitch video · Up to 60 seconds"); right four read-only field boxes (1 px `#DAE4EB` border, radius 9, tiny gray label + 13 px value):
  - Problem: "Students spend too long waiting for lunch."
  - Target audience: "Students who buy meals near campus."
  - Solution: "Pre-order a meal and choose a pickup time."
  - Pitch summary: "Less time in line. More control over lunch."
  and two pill buttons: primary "Preview pitch" (`ArrowRight`), ghost "Save draft".

**Behavior:** the frame is a static preview, not an editor: fields are not editable and are exposed as a description list to assistive tech. "Preview pitch" opens the Demo App dialog (section 8) on the pitch detail view. Example video is capped at 60 seconds.

### 7.4 How it works: find relevant people (light)

Row reversed from 7.3 (visual left about 58 percent, text right) at `lg`; stacked below with the text first.

**Text:** eyebrow "02" (emerald) + "FIND RELEVANT PEOPLE". H2-size (46 px): "Reach people who know the" / "problem" followed by an emerald period. Lead: "We use your target audience and what people tell us about their needs to help find a relevant group." Muted line: "The pilot starts with team-assisted matching." Below a 3 px emerald left border (padding-left 16): "**Interests** help us discover a fit. **Screening** checks whether the problem applies."

**Visual (network, container about 560 by 440 px, `role="img"` with aria-label "Example profiles connected to the audience 'students near campus'"):**

- Center node: mint-green card (170 px wide, radius 16, `#D8F7EA`, border `#9BE6C9`, soft green shadow) at about 42 percent left, 170 px top, with a `Users` icon (28 px, dark emerald), "Your audience:" (13 px) and bold "students near campus".
- Three white profile cards (190 px wide, radius 16, `shadow-card-light`), each with a portrait on top (110 px tall) and a label row below (icon + bold 14 px text):
  1. top-left (left 6 percent, top 0): `Coffee` "Buys lunch near campus"
  2. right (right 0, top 82 px): `Users` "Often waits in a queue"
  3. bottom (left 26 percent, bottom 0): `UtensilsCrossed` "Open to trying pre-orders"
- Thin glowing emerald curved connectors (1.6 px) from each card's edge to the center node, with a small solid dot at the card end.
- Caption bottom-right: "Example profiles" (12 px gray).

**Motion:** cards and connectors reveal once, staggered 150 ms, connectors draw in. Screening details are always visible.

**Below 700 px:** vertical stack; connectors hidden.

Copy must never imply live automated matching.

### 7.5 Matched ideas feed with phone (dark, `id="explore-ideas"`)

**Background:** `#03121E` with a strong emerald glow bottom-left (ellipse, about 60 by 50 percent, `rgba(21,230,160,.35)` to transparent) and a teal glow top-right (`rgba(18,201,214,.2)`). A blue floor reflection under the phone.

Two columns at `lg`: text left, phone right, stacked below with the text first.

**Text:** eyebrow "03 / EXPLORE MATCHED IDEAS" (emerald "03", light gray label). H2 (white with second line `text-grad-dark`): "Scroll into an idea" / "that fits your life." Lead: "Watch a short pitch. See who it is for. Choose whether to try it, talk to the founder or share feedback." Outline button "Walk through the demo" (circled play) which opens the Demo App dialog on the pitch detail view for the first idea. Small text: "Demo only · Sample ideas".

**Phone (`PhoneFrame`):** width 320 px (max 340), radius 48 px, 10 px border `#131E28`, outer 2 px ring `#35506A`, `shadow-glow-phone`, a dark 96 by 26 px rounded notch at top center, metallic side buttons as small vertical bars. A cyan glow ellipse (blur 10 px) sits under the base. Screen is white:

- Status bar text "9:41" left, signal/wifi/battery icons right (drawn inline).
- App header: small emerald "R" mark + "RAPID" bold italic; `Search` icon at right.
- H "Matched ideas" (23 px, weight 800).
- Filter pills: "Food" (active, emerald fill), "Design", "Work" (outlined gray).
- Feed (height about 410 px, vertical scroll with scroll-snap `y proximity`, hidden scrollbar, `overscroll-behavior: auto`): idea cards.
- Bottom tab bar: "Discover" (active, emerald icon with a dot under it), "Activity", "Profile".
- Under the phone (desktop): visible "Previous" and "Next" buttons (44 px high, pill, ghost style). To the right of the phone (desktop): a thin vertical line with an up-chevron and the text "Swipe to explore more ideas" (13 px, `#9FB3C3`).

**Idea card:** video tile (16:11, radius 14, duration badge bottom-left), title (17 px bold), "For …" line (13 px gray), a mint "Why this fits" strip with a `Lightbulb` icon (12.5 px text), and a row of four equal outlined buttons (each 52 px high, icon above 11 px label): `Heart` "Interested", `Rocket` "Try it", `CalendarDays` "Book a call", `Users` "Collaborate".

**Ideas (`demo-data.ts`):**

1. "Lunch without the queue" / "For students near campus" / 0:58 / Why this fits: "You buy lunch near campus and often wait in line (sample)."
2. "Clearer briefs for creatives" / "For designers and small teams" / 0:47 / "You take design work from clients (sample)."
3. "Study groups that actually meet" / "For university students" / 0:52 / "You study in groups before exams (sample)."

**Behavior:**

- Desktop: the feed scrolls INSIDE the phone. Never trap page scroll: do not `preventDefault` wheel events; at the feed's top or bottom edge, scroll continues to the page.
- Below `md` (768): remove the phone chrome; the feed becomes a normal full-width vertical list of cards in page flow; Previous/Next hidden.
- The feed is `role="region"` with `aria-label="Sample matched ideas"`, `tabindex="0"`; each card is an `article`. Previous/Next scroll one card and are keyboard operable.
- **Motion:** when the phone first reaches 60 percent visibility, do ONE gentle preview: smooth-scroll about 70 px down, then back after 1 s. Cancel immediately and never repeat on hover, focus, touch, wheel or any interaction. Reduced motion: no preview.
- Videos never autoplay. The play button opens the Demo App dialog (pitch detail).
- The four card buttons open `ActionPreviewDialog` (section 8.2). Nothing is sent or booked.
- Clicking a card's title or video opens pitch detail.

### 7.6 Role demo (dark, continues section 7.5's glow)

Header row: Logo left, right-aligned small label "Interactive demo · Sample data". Centered: H2 with 2 lines "See how RAPID" / `text-grad-dark` "works for you." Lead: "Pick a role and try it. Nothing you click is sent or booked."

**Role switch:** a segmented control (Radix Tabs, arrow-key navigation) centered under the heading: pill container (bg `rgba(10,34,53,.8)`, 1 px `#2A4E6A` border, padding 5), two tabs "Tester" and "Founder" (48 px high, 16 px bold). Active tab: gradient `bg-brand-btn` with dark text and glow. Default: **Tester**. Switching crossfades content in 200 ms, keeps both views the same min-height so nothing jumps.

**Tester view (two panels with a glowing arrow between, max width 980 px, centered):**

- Left card (white, radius 20, `shadow-card-light`, width about 440): top photo (bowl of chicken and vegetables on a campus picnic table, 16:10), then title "Lunch without the queue" (bold 22 px), sub "Pre-order meals near campus.", a mint strip "**Why this fits** You buy lunch near campus and often wait in line." with `Lightbulb`, then three buttons: primary "Try it" (`Rocket`), ghost "Book a call" (`CalendarDays`), ghost "Collaborate" (`Users`).
- A glowing emerald arrow (`ArrowRight`, 36 px, with text-shadow glow).
- Right panel (white card, radius 20, close "X" top-right, a mint 56 px rounded-square icon tile with `Rocket`): H3 "Try this idea", text "Preview how you could request early access and tell the founder what you need.", a light-gray message box "Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!", buttons primary "Preview request" (with a paper-plane icon) and ghost "Close", and a 13 px gray footnote "Demo only. No request will be sent."
- The right panel is an inline static preview. The three buttons on the left open a real accessible `ActionPreviewDialog` with matching content (section 8.2).

**Founder view:** left card shows the founder's pitch (title "Lunch without the queue", chips "Food & Lifestyle", "Students", "Nigeria", sample stats "40 people reached · 24 fit the target") plus the three "Recent actions" rows from 7.2. Right panel "What you would see": the key finding sentence and a primary button "Open sample report" that opens the Demo App dialog on the founder report view (8.1).

Footer line, centered between two 1 px hairlines: "Switch roles to see what each person gets from RAPID."

### 7.7 Action evidence (light)

**Background:** white with a large soft mint blob (640 px) behind the right column.

Two columns at `lg` (left about 45 percent), stacked below.

**Left:** eyebrow "04 / LEARN FROM ACTIONS". H2-size (52 px): "See the steps people" / `text-grad-light` "actually take." Lead: "RAPID helps you measure early traction from a relevant audience, then decide what to test next." Below, four full-width white selectable rows (Radix Accordion, one open at a time; each row 64 px min height, radius 16, 1 px `#DDE7EE` border, soft shadow, 44 px mint or light-blue icon circle, bold 17 px label, chevron at right; open row gets an emerald border):

- `UserPlus` "Joined a waitlist" → "A light signal of interest in hearing more. It does not show someone will use the product."
- `FileText` "Signed up for a trial" → "Someone asked for access. Signing up is not the same as using it."
- `CalendarDays` "Attended a call" → "Booked and attended are different. Attending shows real effort and time."
- `ShoppingCart` "Completed a pre-order" with sub "Where offered" → "A payment pledge is not a completed order. Only a completed order counts here, and only where offered."

**Right:** `BrowserFrame` card (dark top bar) containing a white app screen: top row with Logo left and a tiny muted stepper "Idea → Action → Validation → Traction" right; H "What your test tells you" (28 px, bold); three light rows (radius 14, `#F3F8FB`) each with a 46 px icon circle (mint, mint, light blue) and bold title + 14 px sub:

- `Users` "Who responded" / "People who fit the audience."
- `FileText` "What they did" / "Completed actions, not just clicks."
- `Lightbulb` "What to test next" / "A clearer next question."

Then a divider and three buttons in a row: "Build" (`Hammer`, emerald outline), "Iterate" (`RefreshCw`, blue outline), "Pivot" (`BarChart3`, navy outline). Each opens a short accessible explanation (Radix Popover):

- Build: "The evidence is strong enough to start building. Signals help you decide; they do not guarantee success."
- Iterate: "Something worked and something did not. Change one thing and run another test."
- Pivot: "People did not respond to the core idea. Try a different problem or audience."

Footnote (13 px gray): "Example report. Signals help decisions; they do not guarantee success."

### 7.8 Feedback loop and planned features (light top, dark band bottom)

**Top (white):** eyebrow row: "PRODUCT PREVIEW" (emerald, tracking) + "· SAMPLE STORY" (muted). H2 (56 px): "See what your input" (ink) `text-grad-light` "helped change." Three white cards in a row (radius 20, `shadow-card-light`) joined by emerald `ArrowRight` between them (stack vertically below 1000 px, arrows rotate down). Each card has a numbered header (30 px mint circle with the digit + bold 20 px title):

1. "You shared": a 76 px round portrait (sample student) beside a light-gray speech bubble "I need to choose a pickup time." and caption "From a student near campus".
2. "The founder improved": a 56 px rounded food photo tile + "Grilled Chicken Bowl" (bold) + "Fresh. Local. Fast."; below, label "Pickup time" and a segmented row of three chips "12:00", "12:30" (selected: emerald gradient fill, bold), "13:00".
3. "You hear back": a notification card (light gray `#F3F8FB`, radius 14) with a small app icon, "2h ago" top-right, bold "Pickup times are now part of the next test.", "Your feedback helps shape what we build.", and an emerald outline button "View update →".

Caption centered, 14 px gray: "An example of the feedback loop we plan to build."

"View update" opens `UpdateDialog`: "Sample update. Pickup times were added to the ordering step after a student asked for them. This is an example of the feedback loop we plan to build."

**Bottom band (dark):** background `linear-gradient(180deg,#061C2C,#03121E)` with a teal-emerald glow at the bottom-left. Left: H2 "More ways to" (white) / `text-grad-dark` "stay involved." Right: three columns, each with a 52 px outlined circle icon (emerald), a small "Planned" pill (emerald text, 1 px emerald border, radius full, 12 px bold), a bold 17 px title and a 14 px `#A9BBCB` line:

- `Bookmark` "Saved ideas" / "Bookmark ideas you care about and get updates."
- `MessageSquare` "Founder conversations" / "Join structured discussions with founders." (must connect participants with founders, not only their own team)
- `Clock` "Your activity history" / "See how your feedback helps over time."

Never present these as live.

### 7.9 Roles value (light, `id="roles"`)

H2 centered (60 px max): "Two ways to move" / `text-grad-light` "ideas forward." Two equal columns with a thin vertical 1 px `#DDE7EE` divider between them at `md` and up; stacked below. Equal visual weight. Each column: a 16:9 photo (radius 20, soft shadow), H3 (42 px bold), text (18 px, `#3B4F60`), primary button.

- **For founders:** photo of a woman founder recording a pitch on a phone mounted on a tripod, with a chalkboard behind reading BUILD TEST LEARN REPEAT. Text: "Find relevant people. Test a clear question. Learn what to change before investing more." Button "Join as a founder" (`ArrowRight`).
- **For testers:** photo of two smiling students looking at a laptop in a bright co-working space, wall sign BETTER IDEAS BRIGHTER FUTURES. Text: "Discover ideas that fit your needs. Try early products and help shape what gets built." Button "Join as a tester" (`ArrowRight`).

Under both, centered, with a `Users` icon (30 px, emerald) and bold 17 px text: "You can do both with one profile."

If real photos do not contain the sign text, `PersonPhoto` renders a small dark rounded label in the photo's top-right corner with the sign text (fallback captions only).

Do not promise paid opportunities, instant matches or guaranteed demand.

### 7.10 FAQ and final CTA

**FAQ (light).** Two columns at `lg` (left 40 percent): left H2 "A few things" / `text-grad-light` "to know", lead "Quick answers about the Nigeria pilot, who can join, and how it works.", a short emerald rule, and stacked muted caps (13 px, tracking .14em, `#6B7D8C`): "CLEARER PATHS." / "BRIGHTER IDEAS." Right: Radix Accordion (single, collapsible, first item open by default). Rows are white cards (radius 16, 1 px `#DDE7EE`, soft shadow, 64 px min height): a 30 px circle with "+" at left (1.5 px `#C6D3DD` border) followed by the question (bold 17 px). Open row: mint-tinted (`#F3FCF8`) with an emerald-ish border (`#7DE3C2`), the circle becomes an emerald gradient fill with a dark minus, and the answer (17 px, `#3B4F60`) appears indented under the question. Keyboard and touch operable.

- "What happens after I join?" → "We will email you if there is a Nigeria pilot opportunity that fits your role and interests. Joining does not guarantee a place."
- "Can I be both a founder and a tester?" → "Yes, with one profile."
- "Do I need a finished product?" → "No. You can start with a clear idea and a question you want answered."
- "What can a test tell me?" → "It shows how a specific audience responds in a specific situation. It cannot guarantee business success."

**Final CTA (dark).** Background: navy with an emerald glow at the right (ellipse `rgba(21,230,160,.22)`), plus two large translucent "glass" circles (one 520 px at top-right, one 340 px at bottom-left, each with a 1 px `rgba(46,216,176,.35)` border and a faint emerald-to-teal radial fill) that overlap slightly. Left-aligned content: H2 "Your next idea needs" (white) / `text-grad-dark` "the right people." Lead: "Join the RAPID waitlist for a chance to enter the Nigeria pilot." Primary button "Join the waitlist" (`ArrowRight`). Fine print: "Joining does not guarantee a place." On the far right at `lg` and up (decorative, `aria-hidden`): a stack of small tracked caps "IDEAS / PEOPLE / VALIDATION / TRACTION" with a short emerald rule beneath. Then the footer (6.3).

## 8. Demo system

Everything in a demo: never sends data, never books anything, always carries the mint label "Interactive demo · Sample data" (`FlaskConical` icon). Keep demo state in React state only; never persist.

### 8.1 `DemoAppDialog`

A large Radix Dialog (desktop: max width 1100 px, up to 90 dvh; below `md`: full screen). Dark mini app header: Logo, tabs "Discover", "My report", "Profile" (Profile inert with tooltip "Not part of this demo"), close button. Focus is trapped, Esc closes, focus returns to the trigger. Two working views:

**Discover: pitch detail.** Mint banner "Interactive demo · Sample data". A "← Back to ideas" link (closes the dialog). Title "Lunch without the queue" (40 px bold). Two columns: left a large video tile (founder portrait, centered play button, a dark pill "Pitch preview"); play shows an inline notice "Video plays only after a click. This sample has no real video." Right, three stacked rows with 64 px mint/blue icon squares and small caps labels:

- `TriangleAlert` "THE PROBLEM" / "Students lose time waiting for lunch."
- `Users` "WHO IT'S FOR" / "Students who buy lunch near campus."
- `Lightbulb` "THE IDEA" / "Choose a meal and pickup time before you arrive."

(and a "Pitch summary" line when opened from "Preview pitch": "Less time in line. More control over lunch.")

Bottom bar (mint, radius 20): 56 px `MessageSquare` tile, bold "Would you try this?", gray "Choose what fits you. It's fine to skip.", then buttons: primary "Preview trial signup" (play/arrow), outline "Share feedback" (`MessageSquare`), text button "Not for me". "Not for me" shows "No problem. Skipping has no penalty." and closes. The first two open `ActionPreviewDialog`. Skipping carries no pressure or penalty.

**My report: founder report.** Same banner. Title "Your test, explained" (40 px bold), sub "A clear summary of what you learned and what's next." Label "Project" + bold "Lunch without the queue". Order matters (evidence before advice):

1. Key finding card (mint, 64 px lightbulb circle): small caps "KEY FINDING", bold 24 px "Students liked choosing a pickup time. Meal choice needs another test."
2. Three stat tiles (light blue/mint/lavender tints, icon + big number + label): "40 people reached", "24 fit the target", "8 trial signups". Below them: "8 of the 24 people who fit the target requested trial access."
3. "WHAT WE LEARNED" card (light blue): "Pickup time mattered most" / "Students were much more likely to sign up when they could choose a pickup time."; "Menu options need more choice" / "Several people said they wanted more variety, especially vegetarian options."
4. "WHAT THIS DOES NOT TELL US" card (`#FFF4D6` tint, amber `TriangleAlert` circle): bold "A signup does not confirm repeat use or payment." / "People who signed up may not come back, and we haven't tested whether they would pay for the service."
5. "RECOMMENDED NEXT STEP": radio-group segmented control "Build" (`Settings`/`Hammer`), "Iterate" (`RefreshCw`, preselected, emerald outline and tint), "Pivot" (`BarChart3`), and primary "Plan another test →" (opens a small dialog: "In the real product this starts a new test. Not available in the demo.").
6. Footnote: "These counts are sample data. The founder chooses Build, Iterate or Pivot based on the evidence."

A small decorative phone with floating portrait chips ("Founder joined", "Call booked", "Collaboration request", "Customer matched", each marked "Illustrative") sits top-right at `lg` and up, `aria-hidden`.

### 8.2 `ActionPreviewDialog`

Small Radix Dialog (max 440 px, radius 22). Title, one-sentence explanation, a light-gray message-preview box, primary "Preview request", ghost "Close", footnote "Demo only. No request will be sent and nothing will be booked." After "Preview request": replace the body with "This is where you would see your request confirmed. In this demo, nothing was sent." and hide the button. Never calls the network. Variants:

- Interested: "Show interest" / "Let the founder know you are interested." / message "I'm interested in Lunch without the queue. Keep me updated."
- Try it: "Try this idea" / "Preview how you could request early access and tell the founder what you need." / "Hi! I'm a student near campus and I'd love early access to this. I usually grab lunch between 11–1pm. Please keep me updated!"
- Book a call: "Book a call" / "Preview how you could ask the founder for a short call." / "Hi! Can we talk about this for 15 minutes this week?"
- Collaborate: "Collaborate" / "Preview how you could offer your skills to this idea." / "Hi! I'd like to help with this idea. Here is what I can do."
- Preview trial signup: "Preview trial signup" / "Preview how you would request trial access." / same message as Try it.
- Share feedback: "Share feedback" / "Preview how you would tell the founder what you think." / "One thing that would help me try this: …"

## 9. Waitlist dialog (the single conversion surface)

`WaitlistDialog`: Radix Dialog. `md` and up: centered, max width 1100 px, radius 28, two panels side by side. Below `md`: full screen with a sticky top row (close button + step indicator) and the form scrolling beneath; the primary button is pinned to the bottom of the viewport (use `dvh` units).

### 9.1 Left brand panel (desktop only; dark with emerald/teal glow and the dotted Africa map)

- Step 1 variant: Logo lockup with tagline "VALIDATION THAT DRIVES TRACTION." (tiny tracked caps, "TRACTION" emerald). H "Your next step" (white) / `text-grad-dark` "starts here." Lead: "Connect, validate, and build for a brighter Africa." Center: a phone (smaller `PhoneFrame`) showing a founder video card and three stacked pill buttons ("Join waitlist", "Book a call", "Collaborate"), flanked by three small portrait chips on each side, connected to the phone with glowing emerald lines. Chip labels: "Founder joined", "Collaboration request", "Great pitch!" (left) and "Call booked", "Customer matched", "In the network" (right). Mark the cluster with a small "Illustrative" label. Bottom: tracked caps "IDEA → ACTION → VALIDATION → TRACTION".
- Step 2 variant: three portrait chips ("Ideas shape Africa", "Real people real input", "Diverse perspectives") beside the phone, and bold stacked caps at bottom-left "BETTER IDEAS." / emerald "BRIGHTER AFRICA."
- No "Sign in", no secondary navigation.

### 9.2 Step 1 of 2

Small emerald "Step 1 of 2". Heading "Join the RAPID waitlist" (34 px bold). Sub: "Tell us a bit about yourself so we can match you with the right opportunities."

1. "What best describes you?": three selectable cards in a radio group, each with an icon: `Users`-style outline icons for "Founder", "Tester", "Both". Card: 54 px high, radius 14, 1.5 px `#CBD7E0` border. Selected: emerald border (`#0FB37B`), mint fill, 3 px soft emerald ring, and a filled green circle with a white check at the right. Preselected when opened from a role CTA. Always editable.
2. "Name": text, placeholder "Enter your name", `autocomplete="name"`.
3. "Email address": email, placeholder "Enter your email address", `autocomplete="email"`.
4. "Country": select, default Nigeria, with a small Nigeria flag (drawn inline as three vertical green/white/green stripes, not an emoji) shown left of the value. Options: Nigeria first, then all African countries alphabetically, then "Other".
5. "State or city (optional)": text, `autocomplete="address-level1"`, placeholder "Enter your state or city".
6. Full-width primary "Continue" with arrow.
7. Below it, centered 14 px gray: "Already selected a role? You can change it here." ("change it here" focuses the role group).
8. Consent microcopy (13 px gray): "By joining you agree that we may email you about the pilot. See our Privacy page." (link opens `/privacy` in a new tab).

No sign-in is needed.

### 9.3 Step 2 of 2

A two-dot stepper (1 filled, 2 active) and "Step 2 of 2". Content by role:

- **Tester:** heading "What would you like to shape?" (36 px bold, centered), sub "Choose the topics and activities that interest you." A 3-column grid (2 columns on mobile) of image tiles (radius 14, 1.5 px border, photo on top about 90 px tall, bold label below, circular checkbox at top-right; selected: emerald border, mint tint, green check): "Food" (grain bowl), "Education" (books and pencil cup), "Design" (wireframe sketches and pen), "Technology" (laptop and headphones), "Work" (mug and notebook), "Small business" (shop chalkboard sign). Then a divider line with centered text "What would you like to do?" and three selectable rows (icon left, label, circle at right): "Share feedback" (`MessageSquare`), "Try a product" (cube/package icon), "Talk to a founder" (`Users`). Info bar (mint, `Lightbulb`): "You choose which ideas to take part in. It's fine to skip." Both groups optional.
- **Founder:** heading "Tell us about your idea". Fields: "Your idea" (textarea, 10 to 500 chars, live counter), "Who is it for?" (text, 3 to 160 chars, placeholder "e.g. Students who buy lunch near campus"). Helper: "These answers help us match you. They do not confirm customer fit."
- **Both:** Tester content first, then a divider, then the Founder fields, on one scrolling page.

Buttons: text "Back" (`ChevronLeft`; keeps all values) and primary "Join the waitlist" with arrow.

### 9.4 Validation, state, errors, success

- zod schema (`src/lib/schema.ts`), react-hook-form. Inline errors, `aria-invalid` and `aria-describedby`, first invalid field focused, errors announced in an `aria-live="polite"` region. Messages: role "Choose Founder, Tester or Both."; name "Enter your name." (2 to 80 chars); email "Enter a valid email address, like name@example.com."; idea "Describe your idea in a sentence or two."; users "Say who it is for."
- Trim strings, lowercase email. Keep all entries after any error. Also keep a non-sensitive draft in `sessionStorage` (one key) if the dialog is closed or the page reloads; clear on success. Never write the final record to `localStorage`.
- Submit: button shows "Saving…" and is disabled; 10 s timeout. On network or server error show a persistent inline alert above the buttons: "We could not save your details. Nothing is lost. Check your connection and try again." with a Retry button. Show no success UI.
- **Confirmation appears only after the insert succeeds.** Confirmation view: gradient green circle with a dark check, H "You are on the list", "We will email you if there is a Nigeria pilot opportunity that fits your role and interests. Joining does not guarantee a place.", links "Explore the demo" (closes and scrolls) and "Close". Move focus to the confirmation heading.
- Duplicate email (Postgres error code `23505`): show the same style of confirmation with "You're already on the list. We will email you if there is a Nigeria pilot opportunity that fits." No error styling.
- Anti-spam: a hidden honeypot input named `company_website` (visually hidden, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden`). If filled, show the normal confirmation without inserting. Recommended v1.1 before any paid promotion: Cloudflare Turnstile verified inside a Supabase Edge Function that performs the insert.
- Optional analytics (only if `VITE_PLAUSIBLE_DOMAIN` is set): events `join_open`, `join_step2`, `join_success` with only the role as a prop. No personal data.

### 9.5 Database: `supabase/migrations/0001_waitlist.sql`

```sql
create extension if not exists citext;

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role text not null check (role in ('founder','tester','both')),
  name text not null check (char_length(name) between 2 and 80),
  email citext not null unique check (char_length(email) between 5 and 254),
  country_code text not null check (country_code ~ '^[A-Z]{2}$' or country_code = 'OTHER'),
  country_name text not null check (char_length(country_name) between 2 and 80),
  city text check (city is null or char_length(city) <= 80),
  idea text check (idea is null or char_length(idea) between 10 and 500),
  intended_users text check (intended_users is null or char_length(intended_users) between 3 and 160),
  interests text[] not null default '{}' check (cardinality(interests) <= 6),
  activities text[] not null default '{}' check (cardinality(activities) <= 3),
  source text check (source is null or char_length(source) <= 40),
  constraint founder_fields_required check (
    role = 'tester' or (idea is not null and intended_users is not null)
  )
);

alter table public.waitlist_entries enable row level security;

create policy "public can join waitlist"
  on public.waitlist_entries for insert to anon
  with check (true);

revoke all on public.waitlist_entries from anon, authenticated;
grant insert on public.waitlist_entries to anon;
```

The client inserts with the anon key and no `.select()` (no read access needed). Entries are read from the Supabase dashboard or a service-role script; add `docs/EXPORT.md` explaining CSV export. Send `source` from `document.referrer` host or a `?ref=` param (trimmed, max 40).

`.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`, `VITE_PLAUSIBLE_DOMAIN` (optional). Never commit real values. Fail the production build with a clear message if required vars are missing.

## 10. Motion and interaction rules

- Transitions 150 to 250 ms with `ease`. Nothing over 500 ms except the one-time hero entrance and connector draw.
- `useInView` with `once: true`. Elements are visible by default; add the `.motion` class to `<html>` only after mount, only if IntersectionObserver exists and reduced motion is not requested, so there is never a flash of invisible content. No re-triggering on scroll back.
- No scroll hijacking, no parallax, no auto-advancing carousels, no autoplay video, no looping animation. Pulses and line-draws run a finite number of times (map pulse: 3 iterations).
- `prefers-reduced-motion: reduce` disables reveals, pulses, smooth scroll and the phone preview move; the page stays complete.
- Every interactive element has hover and focus states that never rely on color alone.

## 11. Content integrity: required visible labels

- Hero card and floating cards: "Illustrative product preview".
- Profiles: "Example profiles".
- Action log: "Example actions".
- Phone feed and role demo: "Demo only · Sample ideas" and "Interactive demo · Sample data".
- Report numbers: "Sample data" / "Example report".
- Feedback story: "Sample story" and "An example of the feedback loop we plan to build."
- Future features: "Planned".
- Waitlist brand-panel chips: "Illustrative".

Portraits are illustrative. Do not attach real-sounding testimonials, ratings or company names to them. The sample founder name "Amara Okafor" appears only in the hero card and is always beside "Sample pitch".

## 12. Accessibility (WCAG 2.2 AA is mandatory)

- Landmarks: `header`, labeled `nav`, `main`, `footer`. One `h1`. Headings in order.
- Full keyboard access in logical order; visible 3 px focus ring; no traps except dialogs (which release on close and return focus to the opener). Tabs, accordion and dialogs use Radix.
- Contrast: 4.5:1 for text (3:1 only for 24 px bold and larger). Emerald `#15E6A0` is never small or body text on white. Check every muted-on-navy pairing.
- Touch targets at least 44 by 44 CSS px.
- Images: meaningful ones have concise alt text; decorative ones (mood portraits, glows, dot map, connectors, avatars) use `alt=""` or `aria-hidden`. Video tiles are buttons named e.g. "Play sample pitch video".
- Forms: real `<label>`s, `autocomplete` tokens, associated errors, live-region announcements, no placeholder-as-label; radio cards and tile groups use `fieldset/legend` or `role="radiogroup"`.
- 200 percent zoom and increased text spacing must not break layout; no horizontal page scroll at 320 px.
- `<html lang="en">`, page title and meta description set.
- Automated: `@axe-core/playwright` on the home page, every dialog state and `/privacy` reports zero serious or critical issues. Manual: keyboard-only pass and one screen reader smoke test of the waitlist flow.

## 13. Assets and code you need

### 13.1 Image rules

WebP (and AVIF if available), explicit `width`/`height`, `srcset` for portraits (400, 800, 1200). Hero LCP image preloaded, not lazy; all others `loading="lazy"` `decoding="async"`. Under 200 KB each; total page weight under 1.2 MB before fonts. No external hotlinks. SVG for logo, icons, map, decorative shapes.

### 13.2 Image manifest (client generates or supplies; fallbacks used until then)

Create `src/assets/images/README.md` listing these. `PersonPhoto` resolves the real file if present, otherwise renders the `Avatar` fallback (13.3).

| File | Slot | Aspect | Brief |
|---|---|---|---|
| `founder-amara.webp` | hero card, feedback loop | 16:10 | Nigerian woman, braids, Ankara-print top, talking to camera, warm cafe, plants, bright natural light |
| `pitch-creator-man.webp` | Create pitch video tile | 16:10 | Nigerian man, headphones around neck, dark green sweater, gesturing, chalkboard "Good Food Brighter Days" |
| `profile-buyer.webp` | Find people | 4:3 | Smiling young man, dark hoodie, campus buildings behind |
| `profile-queue.webp` | Find people | 4:3 | Smiling young woman, braids, cream sweater, laptop bag |
| `profile-preorder.webp` | Find people | 4:3 | Smiling young man, cap, glasses, headphones, green hoodie |
| `feed-lunch.webp` | feed card 1, detail | 16:11 | Founder in navy tee explaining, cafe with chalkboard |
| `feed-briefs.webp` | feed card 2 | 16:11 | Laptop with design wireframes and a coffee cup on a desk |
| `feed-study.webp` | feed card 3 | 16:11 | Students studying together at a campus table |
| `demo-bowl.webp` | role demo card | 16:10 | Chicken-and-vegetable grain bowl in a paper bowl on a campus picnic table, water bottle beside |
| `founder-tripod.webp` | roles: founders | 16:9 | Woman founder recording a pitch on a phone on a tripod, chalkboard "BUILD TEST LEARN REPEAT" |
| `testers-laptop.webp` | roles: testers | 16:9 | Two students smiling at a laptop in a bright co-working space |
| `student-quote.webp` | feedback loop step 1 | 1:1 | Smiling young man, white shirt, green jacket |
| `meal-bowl.webp` | feedback loop step 2 | 1:1 | Grilled chicken bowl with beetroot and vegetables |
| `topic-food/education/design/technology/work/business.webp` | waitlist topic tiles | 4:3 | Grain bowl; books and pencil cup; wireframe sketches and pen; laptop and headphones; mug and notebook; shop chalkboard sign |
| `og-image.png` | social share | 1200x630 | Navy, logo, headline "Good ideas need the right people." |

Generation guidance for the client: photoreal, natural skin tones, no readable text on props except the short signs listed, no real brand logos, avoid awkward hands, consistent warm-teal grade, licensed for commercial use.

### 13.3 Fallback avatars: `src/components/media/Avatar.tsx` (use exactly)

```tsx
import { useId } from 'react';

type Style = 'braids' | 'short' | 'cap' | 'fila';
type Preset = {
  skin: string; hair: string; cloth: string; bg: [string, string];
  style: Style; glasses?: boolean; headphones?: boolean; long?: boolean;
};

export const PRESETS = {
  A: { skin: '#7B4A2F', hair: '#1A1210', cloth: 'ankara',  bg: ['#0B6B63', '#15E6A0'], style: 'braids' },
  B: { skin: '#6A3E25', hair: '#120C0A', cloth: '#1E5C4C', bg: ['#123A56', '#12B5C4'], style: 'short', glasses: true },
  C: { skin: '#8A5738', hair: '#1A1210', cloth: '#F2E6D8', bg: ['#1C5A4F', '#3FD9B0'], style: 'braids', long: true },
  D: { skin: '#5D3520', hair: '#120C0A', cloth: '#1A2530', bg: ['#123047', '#3B6FB5'], style: 'cap', glasses: true, headphones: true },
  E: { skin: '#7B4A2F', hair: '#120C0A', cloth: '#F5F5F0', bg: ['#0E4A5E', '#15E6A0'], style: 'fila', glasses: true },
  F: { skin: '#74442B', hair: '#120C0A', cloth: '#141C24', bg: ['#1F3A66', '#7A6BE0'], style: 'braids', long: true, headphones: true },
  G: { skin: '#6E4028', hair: '#120C0A', cloth: '#1F6F55', bg: ['#0F3B46', '#15E6A0'], style: 'short', headphones: true },
} as const satisfies Record<string, Preset>;

export type AvatarVariant = keyof typeof PRESETS;

export function Avatar({ variant, className }: { variant: AvatarVariant; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const p: Preset = PRESETS[variant];
  const fill = p.cloth === 'ankara' ? `url(#${uid}p)` : p.cloth;
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg[0]} /><stop offset="1" stopColor={p.bg[1]} />
        </linearGradient>
        <pattern id={`${uid}p`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#E8792B" />
          <circle cx="10" cy="10" r="6" fill="#1B3F8B" /><circle cx="10" cy="10" r="2.4" fill="#F5C518" />
          <path d="M0 0l4 4M20 20l-4-4" stroke="#fff" strokeWidth="1.4" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#${uid}g)`} />
      <circle cx="160" cy="34" r="64" fill="#fff" opacity=".09" />
      <circle cx="30" cy="170" r="50" fill="#fff" opacity=".06" />
      {p.style === 'braids' && (
        <>
          <ellipse cx="100" cy="88" rx="47" ry="53" fill={p.hair} />
          <rect x={p.long ? 52 : 55} y="86" width={p.long ? 15 : 12} height={p.long ? 74 : 46} rx="7" fill={p.hair} />
          <rect x={p.long ? 133 : 133} y="86" width={p.long ? 15 : 12} height={p.long ? 74 : 46} rx="7" fill={p.hair} />
        </>
      )}
      <path d="M20 205 C20 158 62 142 100 142 C138 142 180 158 180 205Z" fill={fill} />
      <rect x="87" y="116" width="26" height="32" rx="11" fill={p.skin} />
      <path d="M78 145 Q100 168 122 145 L118 140 Q100 152 82 140Z" fill={p.skin} />
      <circle cx="67" cy="96" r="6.5" fill={p.skin} /><circle cx="133" cy="96" r="6.5" fill={p.skin} />
      <ellipse cx="100" cy="92" rx="33" ry="39" fill={p.skin} />
      {p.style === 'braids' && <path d="M65 90 C60 46 140 46 135 90 C128 66 72 66 65 90Z" fill={p.hair} />}
      {p.style === 'short' && <path d="M67 84 C65 50 135 50 133 84 C126 68 74 68 67 84Z" fill={p.hair} />}
      {p.style === 'cap' && (<><path d="M64 80 C64 46 136 46 136 80Z" fill="#232B33" /><rect x="60" y="76" width="80" height="8" rx="4" fill="#232B33" /><rect x="112" y="76" width="38" height="8" rx="4" fill="#33404B" /></>)}
      {p.style === 'fila' && (<><path d="M66 78 C66 52 134 52 134 78Z" fill="#EFE6D2" /><rect x="63" y="72" width="74" height="10" rx="5" fill="#E0D5BC" /></>)}
      {p.headphones && (<><path d="M64 92 C60 38 140 38 136 92" fill="none" stroke="#10161C" strokeWidth="6" strokeLinecap="round" /><rect x="57" y="86" width="13" height="26" rx="6.5" fill="#10161C" /><rect x="130" y="86" width="13" height="26" rx="6.5" fill="#10161C" /></>)}
      <circle cx="87" cy="93" r="3.3" fill="#1a1210" /><circle cx="113" cy="93" r="3.3" fill="#1a1210" />
      <path d="M80 84 Q87 80 94 84M106 84 Q113 80 120 84" stroke={p.hair} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M100 97 Q96 105 101 106" stroke="rgba(0,0,0,.28)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M86 109 Q100 124 114 109Z" fill="#fff" stroke="#3a1c10" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="80" cy="106" rx="6" ry="4" fill="#ff8a6b" opacity=".18" /><ellipse cx="120" cy="106" rx="6" ry="4" fill="#ff8a6b" opacity=".18" />
      {p.glasses && (<g fill="none" stroke="#111" strokeWidth="2.4"><circle cx="87" cy="93" r="10.5" /><circle cx="113" cy="93" r="10.5" /><path d="M97.5 93h5" /></g>)}
    </svg>
  );
}
```

Slot-to-variant defaults: hero card and founders card `A`; create-pitch video `D`; profiles buyer `B`, queue `C`, pre-order `G`; feed cards `A`, `E`, `F`; testers pair `B` and `C`; feedback-loop student `B`. `PersonPhoto` props: `id` (manifest key), `fallback: AvatarVariant`, `alt`, optional `fallbackCaption`.

### 13.4 Logo: `src/components/ui/Logo.tsx`

```tsx
import { useId } from 'react';

export function Logo({ className = '', size = 38 }: { className?: string; size?: number }) {
  const g = useId().replace(/:/g, '');
  return (
    <span className={`inline-flex items-center gap-2.5 font-extrabold italic tracking-[.07em] ${className}`} style={{ fontSize: size * 0.66 }}>
      <svg viewBox="0 0 44 40" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#15E6A0" /><stop offset="1" stopColor="#12B5F0" /></linearGradient>
        </defs>
        <path d="M2 12h9M0 19h7M3 26h8" stroke={`url(#${g})`} strokeWidth="2.4" strokeLinecap="round" />
        <path fillRule="evenodd" fill={`url(#${g})`} d="M14 5h17a10 10 0 0 1 3 19.6L40 35h-9l-6-9.5h-5.5V35H14z M19.5 11v8.5H31a4.25 4.25 0 0 0 0-8.5z" />
      </svg>
      <span>RAPID</span>
    </span>
  );
}
```

This is a placeholder lockup; the client's real logo SVG replaces it later (section 17). Provide `public/favicon.svg` from the same mark on a navy rounded square.

### 13.5 Africa dot map: `scripts/generate-africa-dots.ts`

Run once with `pnpm gen:map` (`"gen:map": "tsx scripts/generate-africa-dots.ts"`) and commit the outputs `src/assets/africa-dots.svg` and `src/assets/africa-nigeria.json`.

```ts
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoMercator, geoContains } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-110m.json'), 'utf8'));
const all: any = feature(topo, topo.objects.countries);

// ISO 3166-1 numeric codes of African countries present in the 110m dataset.
const AF = new Set([
  '012','024','204','072','854','108','120','140','148','174','178','180','384','262','818','226','232','748',
  '231','266','270','288','324','624','404','426','430','434','450','454','466','478','480','504','508','516',
  '562','566','646','678','686','690','694','706','710','728','729','834','768','788','800','894','716','732',
]);
const africa: any = { type: 'FeatureCollection', features: all.features.filter((f: any) => AF.has(String(f.id).padStart(3, '0'))) };

const W = 420, H = 470, STEP = 9;
const projection = geoMercator().fitSize([W, H], africa);
const nigeria = projection([8.1, 9.6])!;

const dots: string[] = [];
for (let row = 0, y = 4.5; y < H; y += STEP, row++) {
  for (let x = 4.5 + (row % 2 ? STEP / 2 : 0); x < W; x += STEP) {
    const ll = projection.invert!([x, y]);
    if (!ll || !geoContains(africa, ll as [number, number])) continue;
    const d = Math.hypot(x - nigeria[0], y - nigeria[1]);
    const op = (0.22 + 0.78 * Math.exp(-d / 170)).toFixed(2);
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill-opacity="${op}"/>`);
  }
}
writeFileSync('src/assets/africa-dots.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="#15E6A0">${dots.join('')}</svg>`);
writeFileSync('src/assets/africa-nigeria.json', JSON.stringify({ x: +nigeria[0].toFixed(1), y: +nigeria[1].toFixed(1), width: W, height: H }));
console.log(`dots: ${dots.length}`);
```

`AfricaDotMap.tsx`: import the SVG as inline markup (`?raw`), render it in a wrapper with `aria-hidden`, add a CSS mask (linear-gradient from top-right opaque to bottom-left about 25 percent) and a soft `drop-shadow(0 0 12px rgba(21,230,160,.35))`, and overlay the Nigeria marker (a 10 px emerald dot with a glow, plus a ring using the `pulseRing` keyframe, 2.6 s, 3 iterations) positioned by percentage from `africa-nigeria.json`.

### 13.6 Connectors: `Connectors.tsx`

A small helper that renders an absolutely positioned SVG (`aria-hidden`, `overflow: visible`, `preserveAspectRatio="none"`) with cubic Bezier paths: stroke `#15E6A0`, width 1.6, `filter: drop-shadow(0 0 6px #15E6A0)`, `stroke-dasharray` equal to path length and `stroke-dashoffset` initially equal to it, animated to 0 with `drawLine` (1.2 s) when `.is-in` is set (visible immediately if motion is off). Props: array of `{ d: string; end?: {x:number;y:number} }` and optional delay.

## 14. Performance, SEO, security

- Lighthouse (mobile, throttled) targets: Performance 95+, Accessibility 100, Best Practices 100, SEO 100. LCP under 2.0 s on a mid-range phone on 4G, CLS under 0.05, INP under 200 ms.
- Code-split: `WaitlistDialog`, `DemoAppDialog`, `Privacy` route load lazily and prefetch on hover/focus of their triggers. Tree-shake icons.
- Self-host fonts with `font-display: swap`, Latin subset, preload the Inter variable WOFF2; fallback stack with size-adjust to avoid layout shift.
- SEO: `<title>` "RAPID | Test your idea with the right people", meta description, canonical (`VITE_SITE_URL`), Open Graph and Twitter tags with `og-image.png`, `robots.txt`, `sitemap.xml`, `theme-color` `#03121E`, SVG favicon, JSON-LD `Organization`. Prerender the home page at build time (`vite-react-ssg` or a build-time prerender script) so content is in the initial HTML.
- `vercel.json`: SPA rewrite so `/privacy` resolves; headers: strict CSP (`default-src 'self'`; `script-src 'self'` plus the Plausible host only if enabled; `connect-src 'self'` plus the Supabase project URL; `img-src 'self' data:`; `font-src 'self'`; `style-src 'self' 'unsafe-inline'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` with camera, microphone and geolocation off, `Cross-Origin-Opener-Policy: same-origin`.
- Only the public anon key ships to the client. The service-role key is never in the repo or client bundle.
- `/privacy` is a real page: plain-language draft covering what is collected (the fields in 9.5), why (pilot invitations), retention, how to request deletion, processor (Supabase), no sale of data. Leave a code comment and a `NOTES.md` entry: "Requires client and legal review before launch (Nigeria Data Protection Act)." Do not go live until the client approves the text.

## 15. Responsive checks (verify at 1440, 1280, 1024, 768, 390, 360)

- Hero: two columns from 1024; below it the visual stacks under the text, tilt and connectors removed, floating cards become a vertical list, dot map dimmed.
- Problem: three-part composition collapses to one column; the arrow badge rotates.
- Create pitch and Find people: text above visual; browser sidebar hides below 620 px; profile network becomes a stack.
- Phone feed: chrome removed below 768; plain list; Previous/Next hidden.
- Role demo: role switch stays centered; panels stack; inline preview under the card.
- Evidence and Roles: two columns to one; the divider hides.
- Waitlist dialog: single full-screen panel, brand panel hidden, sticky top row, primary button pinned bottom.
- No horizontal overflow at any width. Test with the on-screen keyboard open on the form.

## 16. Phased delivery (stop and report after each phase)

**Phase 0: Setup.** Scaffold (section 4), Tailwind tokens and global CSS (5.1, 5.2), fonts, ESLint/Prettier, path aliases, CI script (`typecheck`, `lint`, `test`, `build`). Create `copy.ts`, `roles.ts`, `demo-data.ts`, `faq.ts` with all copy from sections 7 to 9. Deliver: a blank page proving tokens, fonts, dark and light section utilities, and gradient text.

**Phase 1: Shell and primitives.** Header (desktop and mobile menu), skip link, footer, sticky mobile CTA, `Section`/`Container`, scroll-spy. `Button`, `Pill`, `Chip`, `Badge`, `IconCircle`, `GradientText`, `Logo`, `Avatar`, `PersonPhoto`, `VideoTile`, `BrowserFrame`, `PhoneFrame`, `Connectors`, and `AfricaDotMap` (run `gen:map`). Deliver: the shell with all section placeholders in the correct moods and rhythm.

**Phase 2: Static sections.** Build all sections in 7.1 to 7.10 with final copy, responsive at all widths, links working, no interactivity beyond anchors. Match the described glow, gradients, spacing and hierarchy. Deliver: screenshots of every section at 1440 and 390 wide saved in `docs/review/`.

**Phase 3: Interactions and demo.** Phone feed behavior (scroll, controls, one preview move, mobile expansion), role tabs, `ActionPreviewDialog`, `DemoAppDialog` (pitch detail and founder report), evidence accordion and Build/Iterate/Pivot popovers, "View update" dialog, FAQ accordion, "Walk through the demo" scroll, all reduced-motion handling. Deliver: Playwright traces for each flow.

**Phase 4: Waitlist and backend.** `WaitlistDialog` (both steps and the Both flow), zod schema, react-hook-form, Supabase client, migration applied to a real project, honeypot, duplicate handling, session draft, error and retry states, confirmation only after save, deep links, analytics hooks. Deliver: a screenshot of saved rows for each role, and an offline test showing entries kept and no false confirmation.

**Phase 5: Hardening.** Privacy page, meta/OG/sitemap/robots, prerender, security headers, image optimization, Lighthouse and axe runs, keyboard and screen reader pass, cross-browser check (latest Chrome, Safari, Firefox; iOS Safari; Android Chrome), low-end Android performance check. Fix everything below the targets in sections 12 and 14.

**Phase 6: Launch.** Vercel project, environment variables, production Supabase, custom domain and HTTPS, `www` redirect, final Lighthouse on the production URL, delete test rows, tag `v1.0.0`. Deliver `README.md` (run, build, env, deploy, export the waitlist) and `NOTES.md` (decisions, conflicts, open items).

## 17. Client to provide (do not block; use the fallback)

| Item | Fallback until provided |
|---|---|
| Final logo SVG and favicon | Placeholder `Logo.tsx` lockup |
| Final photography (13.2) | Illustrated `Avatar` components |
| Domain | Vercel URL in `VITE_SITE_URL` |
| Contact email | `VITE_CONTACT_EMAIL`; footer link hidden if unset |
| Approved Privacy text | Draft on `/privacy`; do not launch without approval |
| Supabase project (URL and anon key) | Ask before Phase 4 |

## 18. Guardrails (any of these gets the build rejected)

- Using screenshots or flattened images as page content.
- Any invented statistic, testimonial, partner logo, price, date or "as seen in".
- Copy that promises matches, income, guaranteed demand or a guaranteed place.
- A waitlist confirmation shown before the database write succeeds, or a form that loses data after an error.
- Storing waitlist records in `localStorage`, or exposing read access to the table.
- Autoplaying video, auto-advancing carousels, scroll hijacking, or motion that ignores `prefers-reduced-motion`.
- Missing labels from section 11.
- Contrast failures, removed focus outlines, or click targets under 44 px.
- Emerald `#15E6A0` as small text on white.
- A second header or nav inside any section, or any "Sign in" button.
- Console errors or warnings in the production build; unused dependencies.
- Copy hard-coded inside components (all copy lives in `src/content`).

## 19. Definition of done

1. Every section, dialog and state in sections 7 to 9 is implemented with the exact copy specified.
2. Each section visibly matches its description here: composition, glow, gradient text, type hierarchy, spacing rhythm and dark/light alternation. `docs/review/` screenshots at 1440 and 390 are supplied for every section, and any deliberate difference is noted in `NOTES.md`.
3. Mobile (390 and 360) is designed, not merely stacked: hamburger menu, sticky CTA, full-width feed, full-screen dialogs, no horizontal scroll.
4. The waitlist works end to end against real Supabase for Founder, Tester and Both, including validation, retry, duplicate and honeypot paths.
5. `typecheck`, `lint`, `test` and `e2e` pass. Axe reports no serious or critical issues. Lighthouse meets targets on the production URL.
6. A keyboard-only walkthrough completes: open the waitlist from the header, choose a role, submit, close; open the demo, act, close; expand every FAQ row.
7. Reduced-motion mode shows a complete, static page.
8. `README.md` and `NOTES.md` are complete. Open items are only those in section 17.

Begin with the reply described in section 0, step 8. Do not start Phase 0 work until it is approved.

---

## Progress tracker (maintained by Buffy — update after each phase)

### Status log

- 2026-09-20 — Brief received and saved verbatim. Reply with summary/ambiguities/Phase 0 plan sent. Awaiting approval before Phase 0.

### Phase checklist

- [ ] **Phase 0: Setup** — Vite + React + TS scaffold; deps installed; Tailwind tokens (5.1) and global CSS (5.2); fonts; ESLint/Prettier/strict tsconfig; path aliases; scripts (`dev` `build` `preview` `lint` `typecheck` `test` `e2e` `gen:map`); `copy.ts` `roles.ts` `demo-data.ts` `faq.ts` with ALL copy from sections 7–9; token proof page; `NOTES.md` started; checks + commit
- [ ] **Phase 1: Shell and primitives** — Header, MobileMenu, SkipLink, Footer, StickyCta, Section/Container, scroll-spy; Button, Pill, Chip, Badge, GradientText, IconCircle, Logo, Avatar, PersonPhoto, VideoTile, BrowserFrame, PhoneFrame, Connectors, AfricaDotMap (`gen:map`); section placeholders in correct moods/rhythm
- [ ] **Phase 2: Static sections** — all sections 7.1–7.10, final copy, responsive 1440/1280/1024/768/390/360, no horizontal overflow; screenshots at 1440 and 390 in `docs/review/`
- [ ] **Phase 3: Interactions and demo** — phone feed scroll + one preview move, role tabs, ActionPreviewDialog, DemoAppDialog (pitch detail + founder report), evidence accordion + popovers, UpdateDialog, FAQ accordion, reduced-motion handling; Playwright traces
- [ ] **Phase 4: Waitlist and backend** — WaitlistDialog both steps + Both flow, zod + RHF, Supabase client + migration applied, honeypot, duplicate (23505) handling, session draft, error/retry, confirmation only after save, deep links, analytics hooks; Supabase credentials requested from client first
- [ ] **Phase 5: Hardening** — Privacy page, meta/OG/sitemap/robots/favicon, prerender, vercel.json headers, image optimization, Lighthouse + axe, keyboard + SR pass, cross-browser
- [ ] **Phase 6: Launch** — Vercel + env vars + production Supabase + domain, final Lighthouse, delete test rows, tag `v1.0.0`, README.md + NOTES.md complete
