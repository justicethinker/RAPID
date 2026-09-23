import { chromium } from '@playwright/test';
const exe = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell';
const browser = await chromium.launch({ executablePath: exe });
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(700);
  const res = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth;
    const sections = [...document.querySelectorAll('main > section')];
    const rows = sections.map((s, i) => {
      const cs = getComputedStyle(s);
      const before = getComputedStyle(s, '::before');
      const after = getComputedStyle(s, '::after');
      return {
        i,
        id: s.id || '(none)',
        bg: cs.backgroundImage === 'none' ? 'NONE' : 'wash',
        color: cs.backgroundColor,
        pt: parseFloat(cs.paddingTop),
        blend: before.content !== 'none' ? parseFloat(before.height) : 0,
        hairline: after.content !== 'none',
      };
    });
    const h1 = document.querySelector('h1');
    return { overflow, rows, h1: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0 };
  });
  console.log(`\n=== ${width}px :: overflow=${res.overflow}px h1=${res.h1}px ===`);
  for (const r of res.rows) {
    const ok = r.blend === 0 || r.pt > r.blend ? 'clear' : 'TEXT-IN-BLEND';
    console.log(
      `${String(r.i).padStart(2)} ${r.id.padEnd(14)} bg=${r.bg.padEnd(5)} color=${r.color.padEnd(20)} pt=${String(r.pt).padEnd(6)} blend=${String(r.blend).padEnd(5)} hair=${r.hairline ? 'y' : 'n'} ${r.blend ? ok : ''}`,
    );
  }
  await page.close();
}
await browser.close();
