# Image audit and placement plan

31 October 2026

## Status

Implemented in the three public pages: the Join session band, the Founders scope rail and
the Home two-sides pair. The Founders rail uses a 4:3 desktop crop rather than 4:5 so the
header row closes without a large hole under the lead; phones still get 16:9. The 13 legacy
files stay out of `public/`.

## What happened

The images did not go missing by accident. They were removed in the rebuild commit
`06b6717 feat: rebuild the site for the RAPID pilot`, which deleted 13 files from
`public/images/` and replaced the screenshot-led pages with coded product mockups and a
type-led layout.

Two things make this look like a bug:

1. **`rapid-rouge.vercel.app` is still serving the pre-rebuild build.** Its title is
   "Validation that drives traction", its nav says "Explore ideas" and "Join waitlist", and
   the hero is the old phone mock with a photo in it. The current `main` has a different
   title ("Help decide what gets built next"), different nav and a rebuilt hero. Vercel has
   not rebuilt since the big commit, so the old build — and its images — are still live.
   Every old asset still returns `200`, so nothing is broken on that deployment.
2. **The current build only uses one photograph on the public pages.** `session` sits in the
   desktop hero collage. Join and Founders have none. Everything that looks like a product
   screenshot is now rendered in code (`BrowserMock`, `PhoneMock`, `FindingCard`).

So: nothing "disappeared" from the live site; the redesign removed them from the codebase,
and the live URL is behind the redesign.

### Why the 13 were dropped

All 13 are **iStock preview comps with burned-in watermarks** — the "iStock · Credit: …"
bar is part of the pixels. They were never licensed production assets. The old hero visibly
showed the watermark. They also repeat: 13 files holding seven people and one food shot,
re-cropped and reused across sections.

Copies of all 13 were recovered from the last commit that tracked them
(`dea7b26`) into [`pictures/legacy/`](../pictures/legacy/) for reference. Do **not** copy
them into `public/`.

## Inventory of the old site

| File | Size | Where it appeared | Verdict |
| --- | --- | --- | --- |
| `hero-pitch.webp` | 720×450 | Home hero device mock, waitlist brand panel | Watermarked; replaced by `PhoneMock` |
| `create-pitch.webp` | 880×550 | "Create your pitch" section mock | Watermarked; replaced by `BrowserMock` |
| `role-demo.webp` | 880×550 | "See how RAPID works for you" video tile | Watermarked; duplicate of `roles-testers` |
| `roles-testers.webp` | 960×540 | "Two ways to move ideas forward" tester card | Watermarked; duplicate of `role-demo` |
| `roles-founders.webp` | 960×540 | Same section, founder card | Watermarked; a second shot of the same model |
| `profile-1.webp` | 400×300 | "Reach people who know the problem" cards | Watermarked |
| `profile-2.webp` | 400×300 | Same section | Watermarked; reused as `feedback-avatar` |
| `profile-3.webp` | 400×300 | Same section | Watermarked |
| `feed-1.webp` | 720×495 | App demo feed cards | Watermarked |
| `feed-2.webp` | 720×495 | App demo feed cards | Watermarked |
| `feed-3.webp` | 720×495 | App demo feed cards | Watermarked |
| `feedback-avatar.webp` | 160×160 | Feedback loop author avatar | Watermarked; same man as `profile-2` |
| `grilled-bowl.webp` | 160×160 | Feedback loop attachment | Irrelevant to the new copy; drop |

## What we can actually use

`public/images/photos/` holds 17 WebP exports taken from four Pexels photographs (licence:
commercial use, no attribution), all colour-graded to the site.

| Name | Ratio | Currently used |
| --- | --- | --- |
| `test-session` (900/1400/2000) | 16:9 | No |
| `session` | 4:5 | Home hero collage (4:3 container), sign-in / sign-up rail |
| `staff` | 4:5 | Admin sign-in, admin onboarding |
| `tester` | 4:5 | No |
| `founder` | 4:5 | No |
| `tester-card` | 4:3 | No |
| `founder-card` | 4:3 | No |

Contact sheets: [`legacy-contact-sheet.png`](../pictures/legacy/legacy-contact-sheet.png) and
[`current-photos.png`](../pictures/legacy/current-photos.png).

## Placement plan

The site's strength is the type-led layout with coded mockups. Adding many photos would
undo that and duplicate the mockups. Three photo moments are enough; they are ordered by
value.

### 1. Join — the session itself (implemented)

**Where:** inside "What taking part actually looks like", between the section lead and the
four numbered articles.

**Asset:** `test-session`, full width at 16:9. It is the only asset that shows an actual
test-shaped moment (two people, laptop, notes) and it is already a 16:9 master.

**Treatment:** flat, no rounded card-in-card. A hairline top rule, then the image, then a
one-line caption in the existing meta style: *Pilot session · illustrative · not a RAPID
customer*. On phones it becomes a 3:2 crop (`object-[center_45%]`) so the laptop and faces
stay in frame.

**Why:** the page asks people to do something slightly unfamiliar; a photograph of the
setting does more work than another paragraph. It sits below the hero, so there is no LCP
cost (`loading="lazy"`, 900–1400w is enough).

### 2. Founders — the team behind the scope (implemented)

**Where:** in "A scoped question, not a focus group", as a rail on the right of the heading
and lead on `lg`; stacked 16:9 above the four articles below `lg`. The desktop crop is 4:3
rather than 4:5, which keeps the rail the same height as the heading block.

**Asset:** `staff` — three people reading documents together, which is what "the team turns
it into a short task" actually looks like. It is already graded and used on admin screens.

**Treatment:** same frame style as the auth rail (rounded 22px, hairline border, soft inner
gradient at the bottom). Caption: *Scope review · illustrative*.

**Why:** it answers "who is doing this?" without inventing testimonials, and it balances a
page that is currently all columns of text plus one mock.

### 3. Home — make the two sides visible (implemented)

**Where:** the "Two sides, one loop" fork. A 2-up image pair above the two articles — the
tester crop on the left, the founder crop on the right — each 4:3, sharing one caption row
(*Illustrative · not RAPID testers or founders*).

**Assets:** `tester-card` and `founder-card`, which already exist and are unused.

**Why:** the section is the clearest "which side are you?" moment and currently carries two
icons. The pair costs about 150px on a phone and no new bytes beyond the cards.

**Caveat:** this is the one placement that risks reading as "these are our testers". If the
caption cannot be made to feel deliberate, skip it. The section works without images.

### Already right

- Home hero desktop keeps `session` inside the collage. Do not add it to the phone hero —
  that hero was just tightened and the mock is the proof.
- Sign-in, sign-up and admin screens keep their rails. They are the one place where a face
  above a form helps.
- Signed-in dashboards stay type-led. The staff photo removed there should not come back.

## Guardrails

- No legacy file enters `public/`. All 13 carry visible third-party watermarks.
- One photo moment per screen, maximum. No carousels, no photo grids of stock faces.
- Every photo is illustrative and captioned; the site already makes that promise for
  findings, so match it for imagery.
- Use the widths that exist; nothing new needs exporting for slots 1–3.
- If new photography is commissioned later, match the Pexels grade: window light, muted
  greens, documentary framing, no direct address to camera.
