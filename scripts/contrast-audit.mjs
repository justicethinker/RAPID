// WCAG 2.1 contrast audit — run with: node scripts/contrast-audit.mjs
// Thresholds: AA normal 4.5:1 · AA large (≥24px, or ≥18.66px bold) 3:1 · non-text UI 3:1

const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lin = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (fg, bg) => {
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const blend = (fg, alpha, bg) => fg.map((c, i) => Math.round(alpha * c + (1 - alpha) * bg[i]));
// --- Surfaces -------------------------------------------------------------
const PAPER = hex('#FAF8F4');   // .surface-light base
const WHITE = hex('#FFFFFF');   // cards
const NAVY = hex('#0B1826');    // .surface-dark base
const NAVY900 = hex('#10202F'); // browser/dialog dark chrome
const GLASS = blend(hex('#132436'), 0.62, NAVY); // .glass-dark over navy
const RED50 = hex('#FEF2F2');
const WARN50 = hex('#FFF4D6');
const NAVY50 = hex('#F5F7F9');
const SAND100 = hex('#F3EEE6');
const TGRAY = hex('#EBF0F4');   // hero tag chips

// --- Foreground colours (with alpha pre-composited where used) ------------
const INK = hex('#101B26');
const LIGHT_MUTED = hex('#55636E');
const DARK_TEXT = hex('#E6EDF3');
const DARK_MUTED = hex('#9FB0BF');
const BRAND500 = hex('#15E6A0');
const BRAND600 = hex('#0B9468');
const BRAND700 = hex('#087A56');

const checks = [
  // label, fg, bg, px, bold, need (4.5 | 3 | non-text), note
  ['Body ink on paper', INK, PAPER, 17, false, 4.5, ''],
  ['Body ink on white card', INK, WHITE, 17, false, 4.5, ''],
  ['light-muted body on paper', LIGHT_MUTED, PAPER, 17, false, 4.5, '.lead / body copy'],
  ['light-muted body on white', LIGHT_MUTED, WHITE, 17, false, 4.5, ''],
  ['light-muted on sand-100 icon row', LIGHT_MUTED, SAND100, 13, false, 4.5, ''],
  ['Badge gray text on navy-50', LIGHT_MUTED, NAVY50, 11, true, 4.5, 'Badge "EXAMPLE ACTIONS"'],
  ['FindPeople caption on paper', LIGHT_MUTED, PAPER, 12, false, 4.5, 'FindPeople "Example profiles" (now text-light-muted)'],
  ['gray-400 timestamp (aria-hidden illus.)', hex('#9CA3AF'), WHITE, 10, false, 4.5, 'chat bubbles — inside aria-hidden container, exempt', true],
  ['navy-500 eyebrow number on paper', hex('#5B7184'), PAPER, 20, true, 3, '01/02/04 (CreatePitch FindPeople ActionEvidence)'],
  ['navy-400 "03" on dark', hex('#7E93A4'), NAVY, 12, true, 4.5, 'MatchedFeed eyebrow'],
  ['brand-700 on white', BRAND700, WHITE, 11, true, 4.5, 'Badge/Chip mint text'],
  ['brand-700 on paper', BRAND700, PAPER, 12, false, 4.5, '"Why this fits" strips'],
  ['brand-700 link on white card', BRAND700, WHITE, 15, false, 4.5, 'Privacy contact links'],
  ['brand-700 link on white', BRAND700, WHITE, 13, false, 4.5, 'consent "Privacy page" (WaitlistDialog)'],
  ['brand-700 on brand-50', BRAND700, hex('#E6FBF3'), 11, false, 4.5, 'Badge emerald / Chip mint'],
  ['brand-700 on sand-50', BRAND700, hex('#FAF8F4'), 12, false, 4.5, '"why this fits" strips, demo pills'],
  ['ink on brand-600 (primary hover)', INK, BRAND600, 15, true, 4.5, 'Button primary :hover bg'],
  ['danger error text on white', hex('#B42318'), WHITE, 12, false, 4.5, 'form errors'],
  ['danger error text on red-50', hex('#B42318'), RED50, 14, false, 4.5, 'server error banner'],
  ['warn-900 on warn-50', hex('#5C4610'), WARN50, 14, true, 4.5, 'demo report warning card'],
  ['hero tag chip text', LIGHT_MUTED, TGRAY, 11, false, 4.5, 'sample card chips'],
  ['primary button ink on brand gradient', INK, hex('#19F0A9'), 15, true, 4.5, 'all primary CTAs'],
  ['dark body text on navy', DARK_TEXT, NAVY, 17, false, 4.5, 'headlines / nav'],
  ['dark-muted on navy', DARK_MUTED, NAVY, 17, false, 4.5, '.lead on dark sections'],
  ['dark-muted/70 on navy', blend(DARK_MUTED, 0.7, NAVY), NAVY, 12, false, 4.5, 'SampleLabel, Privacy ©, Home footer ©, BrandPanel flow caps'],
  ['dark-muted/40 on navy-900 (disabled)', blend(DARK_MUTED, 0.4, NAVY900), NAVY900, 14, false, 4.5, 'inert "Profile" tab — WCAG-exempt as disabled', true],
  ['brand-500 on navy (eyebrows, Planned pill)', BRAND500, NAVY, 12, true, 4.5, ''],
  ['brand-500 on glass header (active nav)', BRAND500, GLASS, 15, false, 4.5, ''],
  ['dark-text on glass header', DARK_TEXT, GLASS, 15, false, 4.5, 'header nav + logo'],
  ['browser URL pill text', DARK_MUTED, blend(hex('#182C3E'), 0.6, NAVY900), 12, false, 4.5, 'BrowserFrame url pill (hidden unless VITE_SITE_URL)'],
  ['placeholder text on white', LIGHT_MUTED, WHITE, 14, false, 4.5, 'input placeholders (WCAG treats as text)'],
  // Non-text (UI components / focus indicators) — need 3:1
  ['FOCUS ring global on navy', BRAND500, NAVY, 0, false, 3, 'focus-visible outline'],
  ['FOCUS ring .on-light on paper', BRAND600, PAPER, 0, false, 3, ':focus-visible outline on light sections (index.css)'],
  ['FOCUS ring .on-light on white', BRAND600, WHITE, 0, false, 3, 'dialogs'],
  ['Input focus border on white', BRAND600, WHITE, 0, false, 3, 'waitlist inputs'],
  ['Input default border on white', hex('#808F9E'), WHITE, 0, false, 3, 'waitlist inputs (rest state)'],
  ['FAQ open-state border brand-600 on white', BRAND600, WHITE, 0, false, 3, 'accordion open border'],
];

let fails = 0;
console.log('ratio  need  status  check');
console.log('─'.repeat(96));
for (const [label, fg, bg, , , need, note, exempt] of checks) {
  const r = ratio(fg, bg);
  const ok = exempt || r + 0.005 >= need;
  if (!ok) fails++;
  const status = exempt ? 'SKIP' : ok ? 'PASS' : 'FAIL';
  console.log(
    `${r.toFixed(2).padStart(5)}:1  ${String(need).padEnd(4)}  ${status}   ${label}${note ? `  — ${note}` : ''}`
  );
}
console.log('─'.repeat(96));
console.log(`${checks.length} checks, ${fails} FAIL`);
