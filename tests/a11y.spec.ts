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
    console.log(`  [review] ${c.id} (${c.nodes.length} nodes)`);
  }
}

async function audit(page: import('@playwright/test').Page, label: string, path: string) {
  await page.goto(path);
  await expect(page.locator('h1')).toBeVisible();
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

test('privacy page is axe-clean', async ({ page }) => {
  await audit(page, 'PRIVACY', '/privacy');
});

test('404 is axe-clean', async ({ page }) => {
  await audit(page, '404', '/missing-page');
});
