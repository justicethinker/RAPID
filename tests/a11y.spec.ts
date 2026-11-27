import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>;

function report(label: string, results: AxeResults) {
  console.log(
    `\n=== ${label}: ${results.violations.length} violations, ` +
      `${results.incomplete.length} needs-review ===`,
  );
  for (const v of results.violations) {
    console.log(
      `\n[${v.impact}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n` +
        v.nodes
          .slice(0, 6)
          .map((n) => `  - ${n.target.join(' ')}\n    ${(n.failureSummary ?? '').split('\n')[1] ?? ''}`)
          .join('\n'),
    );
    if (v.nodes.length > 6) console.log(`  …and ${v.nodes.length - 6} more nodes`);
  }
  for (const c of results.incomplete) {
    console.log(
      `  [review] ${c.id} (${c.nodes.length} nodes)\n` +
        c.nodes.map((n) => `    - ${n.target.join(' ')}`).join('\n'),
    );
  }
}

/**
 * The entry animations fade text in from partial opacity, which makes axe read
 * blended colours and report contrast failures that do not exist at rest.
 * Wait for finite animations to finish; looping ambience is left alone.
 */
async function settle(page: import('@playwright/test').Page) {
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => {
            const timing = animation.effect?.getComputedTiming();
            return timing !== null && timing.endTime !== Infinity;
          })
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]),
  );
}

async function audit(page: import('@playwright/test').Page, label: string, path: string) {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  report(label, results);
  expect(results.violations.map((v) => v.id)).toEqual([]);
}

test('home page is axe-clean', async ({ page }) => {
  await audit(page, 'HOME', '/');
});

test('tester application is axe-clean', async ({ page }) => {
  await audit(page, 'JOIN', '/join');
});

test('founder request is axe-clean', async ({ page }) => {
  await audit(page, 'FOUNDERS', '/founders');
});

test('sign-up role picker is axe-clean', async ({ page }) => {
  await audit(page, 'SIGN UP', '/sign-up');
});

test('sign-in is axe-clean', async ({ page }) => {
  await audit(page, 'SIGN IN', '/sign-in');
});

test('admin landing is axe-clean', async ({ page }) => {
  await audit(page, 'ADMIN', '/admin');
});

test('admin sign-in is axe-clean', async ({ page }) => {
  await audit(page, 'ADMIN SIGN IN', '/admin/sign-in');
});

test('admin sign-up is axe-clean', async ({ page }) => {
  await audit(page, 'ADMIN SIGN UP', '/admin/sign-up');
});

test('privacy page is axe-clean', async ({ page }) => {
  await audit(page, 'PRIVACY', '/privacy');
});

test('404 is axe-clean', async ({ page }) => {
  await audit(page, '404', '/missing-page');
});
