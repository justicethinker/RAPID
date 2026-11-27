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
// --- Surfaces (tailwind.config.ts) ---------------------------------------
const CREAM50 = hex('#FBF7EF');  // page canvas
const CREAM100 = hex('#F4EDDF'); // proof bands, quote cards
const WHITE = hex('#FFFFFF');    // cards
const R50 = hex('#EEF6F1');      // positive chips, icon wells
const R900 = hex('#0B3D2E');     // dark cards, welcome banner, CTA band
const R950 = hex('#06291F');     // sidebar, footer, dark sections
const SUN100 = hex('#FFE4CC');   // "Example" chip, profile nudge
const SUN500 = hex('#FF7A1A');   // primary actions
const SUN400 = hex('#FF8E33');   // primary hover
const WARN50 = hex('#FFF3D6');
const DANGER50 = hex('#FEF0EE');
// Photo heroes: the scrim keeps the copy column at least this dark.
const HERO_SCRIM = blend(R950, 0.72, hex('#8A7A62'));

// --- Foregrounds ----------------------------------------------------------
const INK = hex('#16150F');
const INK_SOFT = hex('#47443A');
const INK_FAINT = hex('#625D50');
const R100 = hex('#D9ECE1');
const R200 = hex('#B3D9C4');
const R300 = hex('#82BFA0');
const R600 = hex('#0A6A4C');
const R700 = hex('#075F45');
const R800 = hex('#0B4A37');
const SUN200 = hex('#FFC896');
const SUN300 = hex('#FFA85E');
const SUN700 = hex('#A94604');
const CREAM500 = hex('#938872');

const checks = [
  // label, fg, bg, px, bold, need (4.5 | 3), note, exempt
  ['Body ink on cream', INK, CREAM50, 17, false, 4.5, ''],
  ['Body ink on white card', INK, WHITE, 17, false, 4.5, ''],
  ['ink-soft body on cream', INK_SOFT, CREAM50, 17, false, 4.5, '.lead, section copy'],
  ['ink-soft on cream-100', INK_SOFT, CREAM100, 15, false, 4.5, 'proof band copy'],
  ['ink-faint small on cream', INK_FAINT, CREAM50, 13, false, 4.5, 'fine print, captions'],
  ['ink-faint small on white', INK_FAINT, WHITE, 12, false, 4.5, 'meta labels, stat hints'],
  ['ink-faint on cream-100', INK_FAINT, CREAM100, 12, false, 4.5, 'neutral chip'],
  ['rapid-700 link on cream', R700, CREAM50, 15, true, 4.5, '.text-arrow, kicker'],
  ['rapid-700 on white', R700, WHITE, 14, false, 4.5, 'panel links'],
  ['rapid-800 on rapid-50', R800, R50, 12, true, 4.5, 'positive chip, next-action strip'],
  ['sun-700 on sun-100', SUN700, SUN100, 12, true, 4.5, '"Example" chip'],
  ['ink on sun-500', INK, SUN500, 15, true, 4.5, 'primary buttons'],
  ['ink on sun-400', INK, SUN400, 15, true, 4.5, 'primary hover'],
  ['warn-700 on warn-50', hex('#7A4A00'), WARN50, 12, true, 4.5, 'warning chip'],
  ['danger on danger-50', hex('#B42318'), DANGER50, 14, false, 4.5, 'error panels'],
  ['danger on white', hex('#B42318'), WHITE, 13, false, 4.5, 'field errors'],
  ['cream-50 on rapid-900', CREAM100, R900, 15, false, 4.5, 'proof chip, dark cards'],
  ['white on rapid-950', WHITE, R950, 17, false, 4.5, 'footer, dark sections'],
  ['rapid-100 on rapid-950', R100, R950, 15, false, 4.5, 'dark body copy, sidebar nav'],
  ['rapid-100 on rapid-900', R100, R900, 15, false, 4.5, 'banner copy, CTA band'],
  ['rapid-200 on rapid-950', R200, R950, 12, false, 4.5, 'footer headings'],
  ['rapid-300 on rapid-950', R300, R950, 11, true, 4.5, 'sidebar group labels'],
  ['sun-300 serif on rapid-900', SUN300, R900, 40, false, 3, 'headline accent words (large)'],
  ['sun-300 on rapid-950', SUN300, R950, 15, false, 4.5, 'active drawer link'],
  ['white on hero scrim', WHITE, HERO_SCRIM, 18, false, 4.5, 'photo hero copy column'],
  ['cream-100 on hero scrim', CREAM100, HERO_SCRIM, 18, false, 4.5, 'photo hero lead'],
  ['rapid-100 on hero scrim', R100, HERO_SCRIM, 14, false, 4.5, 'hero fine print'],
  // Non-text (UI components / focus indicators) — need 3:1
  ['FOCUS ring rapid-600 on cream', R600, CREAM50, 0, false, 3, ':focus-visible'],
  ['FOCUS ring rapid-600 on white', R600, WHITE, 0, false, 3, 'dialogs, cards'],
  ['FOCUS ring sun-200 on rapid-950', SUN200, R950, 0, false, 3, '.on-dark :focus-visible'],
  ['Input border cream-500 on white', CREAM500, WHITE, 0, false, 3, 'inputs at rest'],
  ['Input border cream-500 on cream', CREAM500, CREAM50, 0, false, 3, 'inputs on canvas'],
  ['Primary button sun-500 on cream', SUN500, CREAM50, 0, false, 2, 'button shape (label carries meaning)', true],
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
if (fails) process.exitCode = 1;
