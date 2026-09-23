# RAPID — Waitlist Website

A premium, production-grade marketing site for RAPID, a pre-launch platform connecting Nigerian founders with real people who can try their ideas and show what they would actually do.

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # add your env vars
pnpm dev                      # start dev server on http://localhost:5173
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Typecheck + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run oxlint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run Vitest tests |
| `pnpm e2e` | Run Playwright E2E tests |
| `pnpm gen:map` | Generate Africa dot map SVG (requires `tsx`) |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SITE_URL` | Yes | Production URL (e.g. `https://rapid.africa`) |
| `VITE_WAITLIST_ENDPOINT` | No | Google Apps Script web-app URL for signups (defaults to the production sheet endpoint) |
| `VITE_CONTACT_EMAIL` | No | Contact email (footer link hidden if unset) |
| `VITE_PLAUSIBLE_DOMAIN` | No | Plausible analytics domain (events disabled if unset) |

## Tech Stack

- **Build:** Vite 8, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 3.4
- **UI:** Radix UI (Dialog, Tabs, Accordion, Popover)
- **Icons:** lucide-react
- **Forms:** react-hook-form + zod
- **Waitlist backend:** Google Apps Script web app → Google Sheets
- **Routing:** react-router-dom v7
- **Hosting:** Vercel (static SPA)

## Project Structure

```
src/
  components/
    layout/    Header, MobileMenu, Footer, StickyCta, SkipLink, Section, Container
    ui/        Button, Pill, Chip, Badge, GradientText, IconCircle, Logo, SampleLabel
    media/     Avatar, PersonPhoto, VideoTile, BrowserFrame, PhoneFrame, Connectors, AfricaDotMap
    sections/  Hero, ProblemSolution, CreatePitch, FindPeople, MatchedFeed,
               RoleDemo, ActionEvidence, FeedbackLoop, RolesValue, FaqFinalCta
    demo/      DemoAppDialog, ActionPreviewDialog
    waitlist/  WaitlistDialog, BrandPanel
  content/     copy.ts, demo-data.ts, faq.ts
  hooks/       useInView, useReducedMotion, useScrollSpy, useMediaQuery, useWaitlistDialog
  lib/         waitlist, schema, analytics, cn
  pages/       Home, Privacy
```

## Deployment

1. Connect repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel handles SPA rewrite via `vercel.json`

## Google Sheets Setup

1. Create the waitlist Google Sheet
2. Extensions → Apps Script: add a `doPost` web app that appends `name`, `email`, `source`
3. Deploy as web app (access: Anyone) and copy the `/exec` URL
4. Optional: set it as `VITE_WAITLIST_ENDPOINT` (the repo defaults to the production endpoint)

## Exporting Waitlist Data

Entries are written straight to the waitlist Google Sheet. Open the sheet, or use File → Download → CSV.

## Notes

See `NOTES.md` for build decisions, conflicts, and open items.
