import { expect, test } from '@playwright/test';
import { fillFounder, mockSubmissions } from './mock-submissions';

test('a founder can request a conversation without creating an account', async ({ page }) => {
  const submissions = await mockSubmissions(page, () => ({ body: { reference: 'request-123' } }));
  await page.goto('/contact');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tell us what you’re building.');
  await fillFounder(page);
  await page.getByRole('button', { name: /request a call/i }).click();
  await expect(page).toHaveURL(/\/thanks\/founder$/);
  expect(submissions.envelopes).toHaveLength(1);
  expect(submissions.envelopes[0].formType).toBe('founder');
  await expect(page.getByText(/message you on WhatsApp within three business days/i).first()).toBeVisible();
});
