import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { bodyHasHorizontalOverflow, signInWithEmail, signInWithRole } from './env';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const PAGES = {
  tester: [
    '/app/tester',
    '/app/tester/invitations',
    '/app/tester/history',
    '/app/tester/profile',
    '/app/notifications',
  ],
  founder: [
    '/app/founder',
    '/app/founder/new',
    '/app/founder/profile',
    '/app/notifications',
  ],
  staff: ['/staff', '/staff/applications', '/staff/tests'],
} as const;

async function visit(
  page: import('@playwright/test').Page,
  paths: readonly string[],
): Promise<void> {
  for (const path of paths) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      await bodyHasHorizontalOverflow(page),
      `${path} overflows a ${page.viewportSize()?.width}px viewport`,
    ).toBe(false);

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations, `${path} has axe violations`).toEqual([]);
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

test('tester account fits a phone and is axe-clean', async ({ page }) => {
  await signInWithRole(page, 'Tester');
  await visit(page, PAGES.tester);

  await page.goto('/app/tester');
  await expect(
    page.getByRole('navigation', { name: 'Account' }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Account' }).getByRole('link', { name: 'Invitations' }),
  ).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await visit(page, ['/app/tester', '/app/tester/invitations']);
});

test('founder account fits a phone and is axe-clean', async ({ page }) => {
  await signInWithEmail(page, 'dev.founder@rapid.local');
  await visit(page, PAGES.founder);

  await page.goto('/app/founder');
  await expect(
    page
      .getByRole('navigation', { name: 'Account' })
      .getByRole('link', { name: 'My startup' }),
  ).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await visit(page, ['/app/founder', '/app/founder/new']);
});

test('staff workspace fits a phone and is axe-clean', async ({ page }) => {
  await signInWithRole(page, 'Staff');
  await visit(page, PAGES.staff);

  await page.goto('/staff');
  await expect(page.getByRole('link', { name: 'Staff dashboard' })).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await visit(page, PAGES.staff);
});
