import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = 'docs/review';
const WIDTHS = [1440, 390];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROME || undefined,
});

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const sections = page.locator('main > section');
  const count = await sections.count();
  for (let i = 0; i < count; i++) {
    const section = sections.nth(i);
    const id = await section.getAttribute('id');
    const name = id || `section-${i}`;
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await section.screenshot({ path: `${OUT}/${i}-${name}-${width}.png` });
  }

  const footer = page.locator('footer');
  if (await footer.count()) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await footer.screenshot({ path: `${OUT}/footer-${width}.png` });
  }

  await page.screenshot({ path: `${OUT}/full-page-${width}.png`, fullPage: true });
  console.log(`Captured ${count + 1} sections at ${width}px`);
  await page.close();
}

await browser.close();
console.log('Done. Screenshots written to', OUT);
