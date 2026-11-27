import { test, expect } from '@playwright/test';
import {
  fillFounder,
  fillTester,
  founderAnswers,
  mockSubmissions,
  testerAnswers,
} from '../mock-submissions';
import { startOnboarding } from './env';

/**
 * The tester application lives behind sign-up. These tests create a local
 * account, land on the role form and drive it exactly as a new visitor would.
 * The founder request form is still the public one at /contact.
 */
test.describe('Tester application', () => {
  test('shows field errors and focuses the first invalid field', async ({ page }) => {
    await startOnboarding(page, 'tester');
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    // Name and email arrive from the account, so the first empty field is city.
    await expect(page.locator('#tester-city')).toBeFocused();
    await expect(page.getByText('Confirm that you are 18 or older.')).toBeVisible();
    await expect(page.getByText('Choose 1–3 interests.')).toBeVisible();
    await expect(
      page.getByText('Write at least 50 characters so we can understand what happened (up to 800).'),
    ).toBeVisible();
    await expect(page.getByText('Please confirm that you have read the Privacy Policy.')).toBeVisible();
  });

  test('reveals school and industry only when relevant', async ({ page }) => {
    await startOnboarding(page, 'tester');

    await page.locator('#tester-main-situation').selectOption('recent_graduate');
    await expect(page.locator('#tester-school')).toBeVisible();
    await expect(page.locator('#tester-industry')).toHaveCount(0);

    await page.locator('#tester-main-situation').selectOption('employed');
    await expect(page.locator('#tester-school')).toHaveCount(0);
    await expect(page.locator('#tester-industry')).toBeVisible();

    await page.locator('#tester-industry').selectOption('other');
    await expect(page.locator('#tester-industry-other')).toBeVisible();
  });

  test('limits interests to three', async ({ page }) => {
    await startOnboarding(page, 'tester');
    await page.locator('#tester-interests-education').check();
    await page.locator('#tester-interests-technology').check();
    await page.locator('#tester-interests-food').check();

    await expect(page.locator('#tester-interests-housing')).toBeDisabled();

    await page.locator('#tester-interests-education').uncheck();
    await expect(page.locator('#tester-interests-housing')).toBeEnabled();
  });

  test('requires a phone only when reminders are requested', async ({ page }) => {
    await startOnboarding(page, 'tester');
    await page.locator('#tester-whatsapp-reminders').check();
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    await expect(
      page.getByText('Add a valid WhatsApp number to receive reminders.'),
    ).toBeVisible();
  });

  test('accepts a blank optional phone with no reminders', async ({ page }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-T-1', duplicate: false },
    }));

    const account = await startOnboarding(page, 'tester');
    await fillTester(page, { whatsapp: '', whatsappReminders: false });
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    // The response is mocked, so no tester row exists yet and the account has
    // no role: the visitor lands on the account chooser, not the tester area.
    await expect(page).toHaveURL(/\/app$/);
    await expect(
      page.getByRole('heading', { name: 'This account has no profile yet' }),
    ).toBeVisible();
    expect(mock.envelopes).toHaveLength(1);
    expect(mock.envelopes[0]?.answers.email).toBe(account.email);
    expect(mock.envelopes[0]?.answers.whatsapp).toBe('');
    expect(mock.envelopes[0]?.answers.whatsappReminders).toBe(false);
  });

  test('preserves answers on save failure and retries with the same submission ID', async ({
    page,
  }) => {
    const mock = await mockSubmissions(page, (_envelope, index) =>
      index === 0
        ? { status: 500, body: { ok: false, error: 'server_error' } }
        : { body: { ok: true, id: 'RAPID-T-2', duplicate: false } },
    );

    await startOnboarding(page, 'tester');
    await fillTester(page);
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'We could not save your details. Please try again.',
    );
    await expect(page.locator('#tester-full-name')).toHaveValue(testerAnswers.fullName);
    await expect(page.locator('#tester-frustration')).toHaveValue(testerAnswers.frustration);

    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page).toHaveURL(/\/app$/);

    expect(mock.envelopes).toHaveLength(2);
    expect(mock.envelopes[0]?.submissionId).toBeTruthy();
    expect(mock.envelopes[1]?.submissionId).toBe(mock.envelopes[0]?.submissionId);
    expect(page.url()).not.toContain('@');
  });

  test('a duplicate submission still lands the visitor on the dashboard', async ({ page }) => {
    await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-T-EXISTING', duplicate: true },
    }));

    await startOnboarding(page, 'tester');
    await fillTester(page);
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    await expect(page).toHaveURL(/\/app$/);
  });

  test('a filled spam trap is acknowledged without sending a record', async ({ page }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-T-3', duplicate: false },
    }));

    await startOnboarding(page, 'tester');
    await fillTester(page);
    await page.locator('#tester-website').evaluate((element) => {
      const input = element as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(input, 'https://spam.example');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();

    await expect(page).toHaveURL(/\/app$/);
    expect(mock.envelopes).toHaveLength(0);
  });
});

test.describe('Founder request', () => {
  test('shows field errors and focuses the first invalid field', async ({ page }) => {
    await page.goto('/contact');

    await page.getByRole('button', { name: 'Request a call' }).click();

    await expect(page.locator('#founder-full-name')).toBeFocused();
    await expect(
      page.getByText('Describe what you want to test in 20–500 characters.'),
    ).toBeVisible();
    await expect(page.getByText('Select who the test is for.')).toBeVisible();
    await expect(page.getByText('Please confirm that you have read the Privacy Policy.')).toBeVisible();
  });

  test('asks for a description only for mixed or unknown audiences', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#founder-audience-students').check();
    await expect(page.locator('#founder-audience-description')).toHaveCount(0);

    await page.locator('#founder-audience-more_than_one').check();
    await expect(page.locator('#founder-audience-description')).toBeVisible();

    await page.locator('#founder-audience-someone_else').check();
    await expect(page.locator('#founder-audience-description')).toBeVisible();
  });

  test('sends the email typed with the request', async ({ page }) => {
    const mock = await mockSubmissions(page, () => ({
      body: { ok: true, id: 'RAPID-F-1', duplicate: false },
    }));

    await page.goto('/contact');
    await fillFounder(page);
    await page.getByRole('button', { name: 'Request a call' }).click();

    await expect(page).toHaveURL(/\/thanks\/founder$/);
    expect(mock.envelopes).toHaveLength(1);
    expect(mock.envelopes[0]?.answers.email).toBe(founderAnswers.email);
  });

  test('preserves answers on failure and reuses the submission ID on retry', async ({ page }) => {
    const mock = await mockSubmissions(page, (_envelope, index) =>
      index === 0
        ? { status: 503, body: { ok: false, error: 'server_error' } }
        : { body: { ok: true, id: 'RAPID-F-2', duplicate: false } },
    );

    await page.goto('/contact');
    await fillFounder(page, {
      audience: 'more_than_one',
      audienceDescription: 'Students and recent graduates in Lagos.',
    });
    await page.getByRole('button', { name: 'Request a call' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'We could not save your details. Please try again.',
    );
    await expect(page.locator('#founder-test-description')).toHaveValue(
      founderAnswers.testDescription,
    );

    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page).toHaveURL(/\/thanks\/founder$/);
    expect(mock.envelopes).toHaveLength(2);
    expect(mock.envelopes[1]?.submissionId).toBe(mock.envelopes[0]?.submissionId);
    expect(mock.envelopes[0]?.answers.audienceDescription).toBe(
      'Students and recent graduates in Lagos.',
    );
  });
});

test.describe('Both audience paths', () => {
  test('the same account can apply as a tester and reach the founder setup', async ({ page }) => {
    const mock = await mockSubmissions(page, (envelope) => ({
      body: { ok: true, id: `${envelope.formType}-1`, duplicate: false },
    }));

    const account = await startOnboarding(page, 'tester');
    await fillTester(page);
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();
    await expect(page).toHaveURL(/\/app$/);

    // Same account, second role: founder sign-up resumes on the startup step.
    await page.goto('/sign-up/founder');
    await expect(page.locator('#startup-name')).toBeVisible();
    await expect(page.getByText(account.email)).toBeVisible();

    expect(mock.envelopes).toHaveLength(1);
    expect(mock.envelopes[0]?.answers.email).toBe(account.email);
  });
});
