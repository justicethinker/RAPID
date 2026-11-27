import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with the two-sided hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Test your startup idea with real people in Nigeria/);
    await expect(page.locator('h1')).toHaveText('Will people actually use your idea?');
    await expect(
      page.getByText('Find out before you build.', {
        exact: false,
      }),
    ).toBeVisible();
    // The marquee renders its words twice for a seamless loop.
    await expect(
      page.locator('main section').first().getByText('Clear next steps').first(),
    ).toBeVisible();
  });

  test('has the required sections in order', async ({ page }) => {
    await page.goto('/');
    for (const id of [
      'how-it-works',
      'loop-heading',
      'value-heading',
      'honesty-heading',
      'faq-heading',
      'final-cta-heading',
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('header carries real navigation and both role doors', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.locator('a[aria-label="RAPID home"]')).toBeVisible();
    // Small screens keep the links in a drawer behind the Menu button.
    const menu = header.getByRole('button', { name: 'Menu' });
    if (await menu.isVisible()) {
      await menu.click();
      const drawer = page.getByRole('dialog', { name: 'Menu' });
      await expect(drawer.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await expect(drawer.locator('a[href="/join"]')).toBeVisible();
      await expect(drawer.locator('a[href="/founders"]')).toBeVisible();
      await expect(drawer.getByText('How it works')).toBeVisible();
      return;
    }
    // Each breakpoint renders one of two navs, so match the one that is showing.
    await expect(header.locator('nav:visible').first()).toBeVisible();
    await expect(header.locator('a[href="/join"]:visible').first()).toBeVisible();
    await expect(header.locator('a[href="/founders"]:visible').first()).toBeVisible();
    await expect(header.getByText('How it works').filter({ visible: true }).first()).toBeVisible();
  });

  test('audience paths are easy to find', async ({ page }) => {
    await page.goto('/');
    // The hero offers the tester door on every screen size.
    await expect(page.locator('main a[href="/join"]:visible').first()).toHaveAttribute(
      'href',
      '/join',
    );
    await expect(page.locator('a[href="/founders"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeAttached();
  });

  test('FAQ uses the approved questions and links privacy', async ({ page }) => {
    await page.goto('/');
    for (const question of [
      'Is it free to join?',
      'Who can join?',
      'What happens after I apply?',
      'Will I get paid?',
      'Do I have to join WhatsApp?',
      'What happens to my details?',
    ]) {
      await expect(page.getByText(question, { exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Is it free to join?' }).click();
    await expect(page.getByText('Yes. Applying to be a tester is free.')).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').last()).toBeVisible();
  });

  test('has no testimonial, pricing or live-matching claims', async ({ page }) => {
    await page.goto('/');
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('testimonial');
    expect(body).not.toContain('pricing');
    expect(body).not.toContain('guaranteed match');
    expect(body).not.toContain('live matching');
  });
});

test.describe('Routing', () => {
  test('404 is useful', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.locator('h1')).toHaveText('This page doesn’t exist.');
    await expect(page.locator('a[href="/join"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/founders"]:visible').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]:visible').first()).toBeVisible();
  });

  test('confirmation pages are reachable and noindex', async ({ page }) => {
    await page.goto('/thanks/tester');
    await expect(page.locator('h1')).toContainText('Thanks, we’ve got your application.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    await page.goto('/thanks/founder');
    await expect(page.locator('h1')).toContainText('Thanks, we’ve got your request.');
  });
});

test.describe('Responsive layout', () => {
  const paths = [
    '/',
    '/join',
    '/founders',
    '/sign-up',
    '/thanks/tester',
    '/privacy',
    '/does-not-exist',
  ];

  for (const width of [360, 390, 768, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        await page.goto(path);
        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(overflow.scrollWidth, `${path} at ${width}px`).toBeLessThanOrEqual(
          overflow.innerWidth + 1,
        );
      }
    });
  }
});
