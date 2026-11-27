# Site photography

Every photograph on the site is **AI-generated and illustrative**. The people shown are not
real RAPID testers, founders, staff or customers, and no endorsement is implied. The footer
carries one site-wide note saying so ("Photos are illustrative and show no real RAPID testers
or founders.").

The set was generated for this redesign (November 2026) as five scenes of young Nigerian
founders and testers, then colour-graded together so they read as one series. They replace
the earlier Pexels stock set, which is no longer used anywhere in the app.

| Photo name | Files (`public/images/photos/`) | Largest size | Scene | Used on |
| --- | --- | --- | --- | --- |
| `hero` | `hero-768.webp`, `hero-1280.webp`, `hero-1920.webp` | 1920×1072 | Founders and testers working around laptops in a bright co-working space | Home hero |
| `founder` | `founder-600.webp`, `founder-900.webp`, `founder-1200.webp` | 1200×896 | A founder at a desk with sticky notes and printed findings | Home "Which side are you on?" (founder), Founders hero |
| `tester` | `tester-600.webp`, `tester-900.webp`, `tester-1200.webp` | 1200×896 | Two students laughing while trying an app on a phone on campus | Home side switch (tester), Join hero |
| `session` | `session-600.webp`, `session-928.webp` | 928×1152 | A young woman typing feedback on a laptop in a café | Home, Join "No surprises", sign-in / sign-up screens |
| `team` | `team-600.webp`, `team-928.webp` | 928×1152 | Three colleagues reviewing research notes around a table | About hero, admin / staff sign-in screens |

## Rules for these images

- Keep them labelled as illustrative. Do not caption a generated person with a name, quote,
  city or testimonial, and never place one next to a real founder story.
- Alt text describes the scene, not an identity (see `src/pages/*` and
  `src/components/layout/authPhotos.ts`).
- When real pilot photography is available (with signed consent), swap the files at the same
  names and widths; `src/components/ui/Photo.tsx` lists the widths each name expects.

## Processing

Each source image was cropped (16:9-ish for the hero, 4:3 for founder/tester, 4:5 for
session/team) and exported as WebP at the widths listed in `src/components/ui/Photo.tsx`,
which serves them as a responsive `srcset`. Replace a source, then re-export every width for
that name.
