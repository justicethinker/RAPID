import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RAPID/);
    await expect(page.locator('h1')).toContainText('Good ideas need');
  });

  test('has skip link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeAttached();
  });

  test('header nav links exist', async ({ page }) => {
    await page.goto('/');
    const headerNav = page.locator('nav[aria-label="Main navigation"]');
    await expect(headerNav.locator('a[href="#how-it-works"]')).toBeVisible();
    await expect(headerNav.locator('a[href="#explore-ideas"]')).toBeVisible();
    // the header links "For founders" and "For testers" both target #roles
    await expect(headerNav.locator('a[href="#roles"]').first()).toBeVisible();
  });

  test('join waitlist button opens a name + email dialog', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Join waitlist")').first().click();
    const dialog = page.locator('[aria-label="Join the waitlist"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#w-name')).toBeVisible();
    await expect(dialog.locator('#w-email')).toBeVisible();
    // No role selector any more
    await expect(dialog.locator('[role="radio"]')).toHaveCount(0);
  });

  test('all sections render', async ({ page }) => {
    await page.goto('/');
    for (const id of ['top', 'how-it-works', 'explore-ideas', 'roles', 'final-cta']) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });
});

test.describe('Privacy page', () => {
  test('loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy');
  });
});
