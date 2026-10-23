import { test, expect } from '@playwright/test';
import { fillFounder, fillTester, mockSubmissions, testerAnswers } from './mock-submissions';

/**
 * Conditional fields must not leak stale answers. The PRD (section 3) says
 * "Show only relevant conditional fields; do not submit stale hidden answers."
 */
test.describe('Conditional answer hygiene', () => {
  test('drops school and industry answers when the situation changes', async ({ page }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-T-HYGIENE', duplicate: false },
    }));

    await page.goto('/join');

    // Student: school is shown, industry is not.
    await fillTester(page, {
      mainSituation: 'recent_graduate',
      school: 'University of Lagos',
      industry: '',
    });
    await expect(page.locator('#tester-school')).toBeVisible();

    // Switch to employed: school unmounts, industry appears.
    await page.locator('#tester-main-situation').selectOption('employed');
    await expect(page.locator('#tester-school')).toHaveCount(0);
    await page.locator('#tester-industry').selectOption('technology');
    await page.getByRole('button', { name: 'Request your invite' }).click();

    await expect(page).toHaveURL(/\/thanks\/tester$/);
    expect(mock.envelopes).toHaveLength(1);
    expect(mock.envelopes[0]?.answers.school).toBe('');
    expect(mock.envelopes[0]?.answers.industry).toBe('technology');
  });

  test('drops the industry description when the industry changes away from Other', async ({
    page,
  }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-T-HYGIENE-2', duplicate: false },
    }));

    await page.goto('/join');
    await page.locator('#tester-main-situation').selectOption('employed');
    await page.locator('#tester-industry').selectOption('other');
    await page.locator('#tester-industry-other').fill('Logistics brokerage');
    await page.locator('#tester-industry').selectOption('technology');

    await expect(page.locator('#tester-industry-other')).toHaveCount(0);

    await fillTester(page, { mainSituation: 'employed', industry: 'technology' });
    await page.getByRole('button', { name: 'Request your invite' }).click();

    await expect(page).toHaveURL(/\/thanks\/tester$/);
    expect(mock.envelopes[0]?.answers.industryOther).toBe('');
    expect(mock.envelopes[0]?.answers.school).toBe('');
  });

  test('drops the founder audience description for a single known audience', async ({ page }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-F-HYGIENE', duplicate: false },
    }));

    await page.goto('/founders');
    await page.locator('#founder-audience-more_than_one').check();
    await page.locator('#founder-audience-description').fill('Students and graduates in Lagos.');
    await page.locator('#founder-audience-students').check();
    await expect(page.locator('#founder-audience-description')).toHaveCount(0);

    await fillFounder(page, { audience: 'students' });
    await page.getByRole('button', { name: 'Send my request' }).click();

    await expect(page).toHaveURL(/\/thanks\/founder$/);
    expect(mock.envelopes[0]?.answers.audienceDescription).toBe('');
  });
});

/**
 * Server-side validation errors must land on the right field and focus it.
 */
test.describe('Server-side validation', () => {
  test('shows field errors returned by the endpoint', async ({ page }) => {
    await mockSubmissions(page, () => ({
      status: 200,
      body: {
        ok: false,
        error: 'validation',
        fields: { frustration: 'Write 50–800 characters about a recent problem.' },
      },
    }));

    await page.goto('/join');
    await fillTester(page);
    await page.getByRole('button', { name: 'Request your invite' }).click();

    await expect(
      page.getByText('Write 50–800 characters about a recent problem.'),
    ).toBeVisible();
    await expect(page.locator('#tester-frustration')).toBeFocused();
    await expect(page.locator('#tester-frustration')).toHaveValue(testerAnswers.frustration);
    await expect(page.getByText('Check the highlighted fields and try again.')).toBeVisible();
  });

  test('reports a rate-limited response without losing answers', async ({ page }) => {
    await mockSubmissions(page, () => ({
      body: { ok: false, error: 'rate_limited' },
    }));

    await page.goto('/founders');
    await fillFounder(page);
    await page.getByRole('button', { name: 'Send my request' }).click();

    await expect(page.getByRole('alert')).toContainText('Too many attempts');
    await expect(page.locator('#founder-full-name')).toHaveValue('Tunde Bello');
  });
});
