import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with the tester-first hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Help decide what gets built next/);
    await expect(page.locator('h1')).toHaveText('Help decide what gets built next.');
    await expect(page.getByText('Share your experience in short research tasks')).toBeVisible();
    await expect(
      page.getByText('For adults aged 18 and above.', { exact: false }).first(),
    ).toBeVisible();
  });

  test('has the required sections in order', async ({ page }) => {
    await page.goto('/');
    for (const id of [
      'problem-heading',
      'how-heading',
      'founders-heading',
      'faq-heading',
      'final-cta-heading',
    ]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test('header only has the logo and invite CTA', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.locator('a[aria-label="RAPID home"]')).toBeVisible();
    await expect(header.locator('a[href="/join"]')).toBeVisible();
    await expect(header.locator('nav')).toHaveCount(0);
    await expect(header.locator('a[href="/founders"]')).toHaveCount(0);
  });

  test('audience paths are easy to find', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header a[href="/join"]')).toHaveAttribute('href', '/join');
    await expect(page.locator('a[href="/founders"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeAttached();
  });

  test('FAQ uses the approved questions and links privacy', async ({ page }) => {
    await page.goto('/');
    for (const question of [
      'Is joining free?',
      'Who can join?',
      'What happens after I apply?',
      'Will I be paid?',
      'Must I join WhatsApp?',
      'How are my details used?',
    ]) {
      await expect(page.getByText(question, { exact: true })).toBeVisible();
    }
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
    await expect(page.locator('h1')).toHaveText("We couldn't find that page.");
    await expect(page.locator('a[href="/join"]').first()).toBeVisible();
    await expect(page.locator('a[href="/founders"]').first()).toBeVisible();
    await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
  });

  test('confirmation pages are reachable and noindex', async ({ page }) => {
    await page.goto('/thanks/tester');
    await expect(page.locator('h1')).toContainText('Thanks for applying to RAPID');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    await page.goto('/thanks/founder');
    await expect(page.locator('h1')).toContainText('Thanks. We have received your request.');
  });
});

test.describe('Responsive layout', () => {
  const paths = ['/', '/join', '/founders', '/thanks/tester', '/privacy', '/does-not-exist'];

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
