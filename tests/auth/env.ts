/**
 * Environment and identity helpers for the database-backed account tests.
 *
 * These tests run against a real Postgres database and the Vite dev server (not
 * the static preview), because `/api` needs both. They create their own records
 * with a `pw.` email prefix and remove them in global teardown.
 */
import { expect, type Page, type Request } from '@playwright/test';

export function loadLocalEnv(): void {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // CI supplies DATABASE_URL directly.
  }
}

export function databaseUrl(): string {
  loadLocalEnv();
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error(
      'DATABASE_URL is required for the signed-in Playwright suite. ' +
        'Add it to .env.local or export it before running pnpm e2e:auth.',
    );
  }
  return value;
}

export function runTag(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}


/**
 * Navigate to an app route, reloading only when a request was cancelled by a
 * host network change.
 *
 * Chromium aborts every in-flight request — loopback included — whenever any
 * interface or address appears or disappears on the host, and each Docker
 * container start or WSL adapter change does exactly that. A dev-server page
 * load is a few hundred separate module requests, so a load overlapping one of
 * those events leaves `#root` empty.
 *
 * The retry is deliberately narrow: it happens only if Chromium reported
 * `net::ERR_NETWORK_CHANGED` for a request during that load. A blank page from
 * any other cause — a thrown error, a broken build, a route that does not
 * mount — throws on the first attempt, so a product failure still fails here.
 */
export async function visit(page: Page, path: string): Promise<void> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const cancelled: string[] = [];
    const recordCancelled = (request: Request) => {
      const failure = request.failure()?.errorText ?? '';
      if (failure.includes('ERR_NETWORK_CHANGED')) cancelled.push(request.url());
    };

    page.on('requestfailed', recordCancelled);
    try {
      await page.goto(path);
      await page
        .locator('#root > *')
        .first()
        .waitFor({ state: 'attached', timeout: 10_000 });
      return;
    } catch (error) {
      lastError = error;
      if (cancelled.length === 0) throw error;
    } finally {
      page.off('requestfailed', recordCancelled);
    }
  }

  throw lastError;
}

export async function signOut(page: Page): Promise<void> {
  const button = page.locator('button:visible').filter({ hasText: /^Sign out$/ }).first();
  await button.click();
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 15_000 });
}

async function ensureSignedOut(page: Page): Promise<void> {
  await visit(page, '/sign-in');

  // Signed-in visitors are redirected to their account, where the sign-out
  // control lives. Signed-out visitors stay here and see the email form.
  try {
    await page
      .locator('#signin-email')
      .waitFor({ state: 'visible', timeout: 4000 });
    return;
  } catch {
    await signOut(page);
  }
}

export interface DevAccount {
  email: string;
  fullName: string;
}

/**
 * Create an account through the sign-up page (local mode) and stop on the
 * role's profile step: the tester application, or the startup profile that a
 * founder sees after creating their account.
 */
export async function signUpDev(
  page: Page,
  role: 'tester' | 'founder',
  account: DevAccount,
): Promise<void> {
  await ensureSignedOut(page);
  await visit(page, `/sign-up/${role}`);
  await page.locator('#dev-signup-name').fill(account.fullName);
  await page.locator('#dev-signup-email').fill(account.email);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(
    page.locator(role === 'tester' ? '#tester-full-name' : '#startup-name'),
  ).toBeVisible({ timeout: 15_000 });
}

/** A fresh account for a test that only needs the form on screen. */
export async function startOnboarding(
  page: Page,
  role: 'tester' | 'founder',
): Promise<DevAccount> {
  const tag = runTag();
  const account = {
    email: `pw.${tag}.${role}@rapid.invalid`,
    // Names cannot carry digits: the form rejects them (and focuses the field).
    fullName: role === 'tester' ? 'Playwright Tester' : 'Playwright Founder',
  };
  await signUpDev(page, role, account);
  return account;
}

/**
 * Staff sign in at their own slug with the local admin credentials. The public
 * sign-in page deliberately has no admin option, so this is the only staff
 * door and the test covers it directly.
 */
export async function signInAsAdmin(page: Page): Promise<void> {
  await ensureSignedOut(page);
  await visit(page, '/admin/sign-in');
  await page.locator('#admin-username').fill('admin');
  await page.locator('#admin-password').fill('admin');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/staff/, { timeout: 15_000 });
}

/**
 * A tester or founder signs in with the email on their account. Kept as one
 * helper with the role name because every call site already names the role it
 * expects to land in; both use the seeded local accounts.
 */
export async function signInWithRole(
  page: Page,
  role: 'Tester' | 'Founder' | 'Staff',
): Promise<void> {
  if (role === 'Staff') {
    await signInAsAdmin(page);
    return;
  }

  await signInWithEmail(
    page,
    role === 'Tester' ? 'dev.tester@rapid.local' : 'dev.founder@rapid.local',
  );
}

/** Sign in with the email an account already uses. */
export async function signInWithEmail(page: Page, email: string): Promise<void> {
  await ensureSignedOut(page);
  await page.locator('#signin-email').fill(email);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 });
}

export async function bodyHasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const width = window.innerWidth;
    return (
      document.documentElement.scrollWidth > width ||
      document.body.scrollWidth > width
    );
  });
}
