import { expect, test } from '@playwright/test';
import { fillStartup, fillTester } from '../mock-submissions';
import {
  bodyHasHorizontalOverflow,
  runTag,
  signInWithEmail,
  signInWithRole,
  signOut,
  signUpDev,
  visit,
} from './env';

/**
 * One real loop, through the browser and the database:
 *
 *   founder applies -> tester applies -> staff approves, scopes and invites
 *   -> tester accepts and responds -> staff publishes -> founder decides
 *
 * The records are unique to this run and removed in global teardown.
 */
const RUN = runTag();

const FOUNDER = {
  name: 'Playwright Founder',
  email: `pw.${RUN}.founder@rapid.invalid`,
  phone: '+2348030000101',
};

const TESTER = {
  name: 'Playwright Tester',
  email: `pw.${RUN}.tester@rapid.invalid`,
  phone: '+2348030000102',
};

const DESCRIPTION = `Playwright ${RUN}: would students use a planning app before exams?`;
const TEST_TITLE = DESCRIPTION.slice(0, 80);
const TERMS =
  'Open the prototype for ten minutes and write what happened. Reward: NGN 5,000 mobile credit.';
const REWARD = 'NGN 5,000 mobile credit';
const AUDIENCE = 'Undergraduate students in Lagos';
const NOTE =
  'I opened the planner before my exam and added two deadlines. I stopped when it asked for a timetable I could not upload.';
const HEADLINE = 'A countdown helps; the timetable import is the blocker';
const SUMMARY =
  'One invited tester completed the task. The countdown made the next deadline obvious, but she could not bring her timetable in and left the prototype at that point.';
const LIMITS =
  'One tester in one city. This does not show whether import support would change retention or whether other students hit the same step.';

let testId = '';

test.describe.serial('signed-in pilot loop', () => {
  test('the sign-up page offers both roles and opens the chosen one', async ({ page }) => {
    await visit(page, '/sign-up');

    await expect(
      page.getByRole('heading', { name: 'Create your RAPID account' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /I want to test products/ }),
    ).toBeVisible();

    await page.getByRole('link', { name: /I’m building something/ }).click();
    await expect(page).toHaveURL(/\/sign-up\/founder$/);
    await expect(
      page.getByRole('heading', { name: 'Create your founder account' }),
    ).toBeVisible();
    await expect(page.locator('#dev-signup-name')).toBeVisible();
  });

  test('founder signs up, requests a test and sees the request', async ({ page }) => {
    await signUpDev(page, 'founder', { fullName: FOUNDER.name, email: FOUNDER.email });

    // Step 2 of founder sign-up is the public startup profile.
    await fillStartup(page);
    await page.getByRole('button', { name: 'Create startup' }).click();

    await expect(page).toHaveURL(/\/app\/founder/);
    await expect(
      page.getByRole('heading', { name: 'Your startup', level: 1 }),
    ).toBeVisible();

    // The request is made from the founder workspace, not the marketing site.
    await visit(page, '/app/founder/new');
    await page.locator('#title').fill(TEST_TITLE);
    await page.locator('#question').fill(DESCRIPTION);
    await page.locator('#audience').selectOption('students');
    await page.locator('#reward').fill(REWARD);
    await page.locator('#terms').fill(TERMS);
    await page.getByRole('button', { name: 'Send request' }).click();

    await expect(page).toHaveURL(/\/app\/founder\/tests\//);
    testId = page.url().split('/').pop() as string;
    await expect(page.getByRole('heading', { name: TEST_TITLE })).toBeVisible();
    await expect(page.getByText('requested', { exact: true }).first()).toBeVisible();
  });

  test('tester signs up and applies, staff approves and invites', async ({ page }) => {
    await signUpDev(page, 'tester', { fullName: TESTER.name, email: TESTER.email });
    await fillTester(page, {
      fullName: TESTER.name,
      email: TESTER.email,
      emailConfirm: TESTER.email,
      whatsapp: TESTER.phone,
      whatsappReminders: false,
    });
    await page.getByRole('button', { name: 'Apply to be a tester' }).click();
    await expect(page).toHaveURL(/\/app\/tester/);

    await signInWithRole(page, 'Staff');
    await visit(page, '/staff/applications');
    await page.locator('#search').fill(TESTER.email);
    await page.getByRole('button', { name: 'Apply filters' }).click();

    await page.getByRole('link', { name: TESTER.name }).click();
    await page.getByRole('button', { name: 'Approve' }).click();
    await expect(page.getByText('approved', { exact: true }).first()).toBeVisible();

    await visit(page, `/staff/tests/${testId}`);
    // A request is scoped before it recruits; the server refuses to skip a stage.
    await page.locator('#status').selectOption('scoping');
    await page.locator('#audience-description').fill(AUDIENCE);
    await page.locator('#reward').fill(REWARD);
    await page.locator('#terms').fill(TERMS);
    await page.getByRole('button', { name: 'Save scope' }).click();
    await expect(page.getByText('Test details saved.')).toBeVisible();

    await page.locator('#status').selectOption('recruiting');
    await page.getByRole('button', { name: 'Save scope' }).click();
    await expect(page.getByText('Test details saved.')).toBeVisible();

    const candidate = page.getByRole('checkbox', { name: `Select ${TESTER.name}` });
    await expect(candidate).toBeVisible();
    await candidate.check();
    await page.getByRole('button', { name: /Invite selected \(1\)/ }).click();
    await expect(page.getByText('Invitations sent.')).toBeVisible();
    await expect(page.getByText(TESTER.email).first()).toBeVisible();
  });

  test('tester accepts and responds, then staff publishes findings', async ({ page }) => {
    await signInWithEmail(page, TESTER.email);
    await visit(page, '/app/tester/invitations');
    await page.getByRole('link').filter({ hasText: TEST_TITLE }).first().click();

    await expect(page.getByRole('heading', { name: 'The task and terms' })).toBeVisible();
    await expect(page.getByText(TERMS)).toBeVisible();
    await page.getByRole('button', { name: 'Accept invitation' }).click();
    await expect(page.getByText(/^accepted$/i).first()).toBeVisible();

    await page.locator('#note').fill(NOTE);
    await page.getByLabel(/anonymous quote/i).check();
    await page.getByRole('button', { name: 'Submit response' }).click();
    await expect(page.getByText(/^completed$/i).first()).toBeVisible();
    await expect(page.getByText(NOTE)).toBeVisible();

    await signInWithRole(page, 'Staff');
    await visit(page, `/staff/tests/${testId}`);

    await expect(page.getByText(NOTE)).toBeVisible();
    await page.locator('#headline').fill(HEADLINE);
    await page.locator('#summary').fill(SUMMARY);
    await page.locator('#limits').fill(LIMITS);
    await page.getByLabel('Learning 1 label').fill('The deadline countdown works');
    await page
      .getByLabel('Learning 1 detail')
      .fill('It made the next exam deadline the first thing on screen.');
    await page.getByRole('button', { name: 'Save findings' }).click();
    await expect(page.getByText('Report saved as a draft.')).toBeVisible();

    await page.getByRole('button', { name: 'Publish findings' }).click();
    await expect(page.getByText('Findings published to the founder.')).toBeVisible();
  });

  test('founder sees real counts and findings, records a decision, and is isolated', async ({
    page,
  }) => {
    await signInWithEmail(page, FOUNDER.email);
    await visit(page, `/app/founder/tests/${testId}`);

    await expect(page.getByText('published', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: HEADLINE })).toBeVisible();
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    await expect(page.getByText('1 of 1 accepted')).toBeVisible();
    await expect(page.getByText(NOTE)).toBeVisible();

    await page.getByRole('button', { name: 'Iterate' }).click();
    await expect(page.getByText(/Recorded: Iterate/)).toBeVisible();

    const testerApi = await page.evaluate(async () => {
      const response = await fetch('/api/tester/overview');
      return response.status;
    });
    const staffApi = await page.evaluate(async () => {
      const response = await fetch('/api/staff/summary');
      return response.status;
    });
    expect(testerApi).toBe(404);
    expect(staffApi).toBe(404);

    await visit(page, '/app/tester');
    await expect(page).toHaveURL(/\/app\/founder/);
    await visit(page, '/staff');
    await expect(page.getByRole('heading', { name: /doesn.t exist/i })).toBeVisible();
  });

  test('a tester cannot open founder or staff surfaces', async ({ page }) => {
    await signInWithEmail(page, TESTER.email);

    const founderApi = await page.evaluate(async () => {
      const response = await fetch('/api/founder/tests');
      return response.status;
    });
    const staffApi = await page.evaluate(async () => {
      const response = await fetch('/api/staff/summary');
      return response.status;
    });
    expect(founderApi).toBe(404);
    expect(staffApi).toBe(404);

    await visit(page, '/app/founder');
    await expect(page).toHaveURL(/\/app\/tester/);
    await visit(page, '/staff');
    await expect(page.getByRole('heading', { name: /doesn.t exist/i })).toBeVisible();
  });

  test('a staff account cannot open tester or founder surfaces', async ({
    page,
  }) => {
    await signInWithRole(page, 'Staff');

    const testerApi = await page.evaluate(async () => {
      const response = await fetch('/api/tester/invitations');
      return response.status;
    });
    const founderApi = await page.evaluate(async () => {
      const response = await fetch('/api/founder/tests');
      return response.status;
    });
    expect(testerApi).toBe(404);
    expect(founderApi).toBe(404);

    // The role guard sends staff to their own workspace, not a dead end.
    await visit(page, '/app/tester');
    await expect(page).toHaveURL(/\/staff$/);
    await visit(page, '/app/founder');
    await expect(page).toHaveURL(/\/staff$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('staff manage admin access without a public sign-up', async ({ page }) => {
    const invited = `pw.${RUN}.admin@rapid.invalid`;

    await signInWithEmail(page, TESTER.email);
    await visit(page, '/admin');
    await expect(page.getByText(/doesn.t have staff access/i)).toBeVisible();

    const refused = await page.evaluate(async (email) => {
      const response = await fetch('/api/staff/team/invites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.status;
    }, invited);
    expect(refused).toBe(404);

    await signInWithRole(page, 'Staff');
    await visit(page, '/staff/team');
    await page.getByLabel('Email address').fill(invited);
    await page.getByRole('button', { name: 'Invite admin' }).click();
    await expect(page.getByText(invited, { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Revoke' }).click();
    await expect(page.getByText('No invitations are waiting.')).toBeVisible();

    // Locking yourself out is refused in the endpoint, not only in the UI.
    const selfRemoval = await page.evaluate(async () => {
      const me = (await (await fetch('/api/me')).json()) as {
        person: { id: string };
      };
      const response = await fetch(`/api/staff/team/members/${me.person.id}`, {
        method: 'DELETE',
      });
      return response.status;
    });
    expect(selfRemoval).toBe(409);
  });

  test('an anonymous request is rejected', async ({ page }) => {
    const baseURL = test.info().project.use.baseURL ?? 'http://localhost:5181';
    for (const path of ['/api/me', '/api/tester/overview', '/api/staff/summary']) {
      const response = await fetch(new URL(path, baseURL));
      expect(response.status, `${path} should reject an anonymous request`).toBe(
        401,
      );
    }

    await visit(page, '/app/tester');
    await expect(page).toHaveURL(/\/sign-in/);
    expect(await bodyHasHorizontalOverflow(page)).toBe(false);
  });

  test('every role leaves the sign-in page cleanly', async ({ page }) => {
    for (const role of ['Tester', 'Founder', 'Staff'] as const) {
      await signInWithRole(page, role);
      await expect(page.getByRole('navigation', { name: 'Account' }).first()).toBeVisible();
      await signOut(page);
    }
  });
});
