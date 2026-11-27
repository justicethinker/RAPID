import { defineConfig, devices } from '@playwright/test';

/**
 * Signed-in coverage needs the API and Postgres, so it runs against the Vite
 * dev server rather than the static preview used by the public suite.
 *
 *   pnpm e2e:auth
 *
 * Requires DATABASE_URL in `.env.local` or the environment. The global setup
 * applies migrations, seeds the local role accounts and clears leftovers. All
 * records created by the suite use `pw.` emails and are removed in teardown.
 */
const PORT = 5181;
const baseURL = `http://localhost:${PORT}`;

const env = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  ),
);

export default defineConfig({
  testDir: './tests/auth',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  outputDir: 'test-results/auth',
  globalSetup: './tests/auth/global-setup.ts',
  globalTeardown: './tests/auth/global-teardown.ts',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth-desktop',
      testMatch: /flow\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'auth-mobile',
      testMatch: /mobile\.spec\.ts/,
      // Contrast is audited at rest. Cards fade in over 0.7s through a CSS
      // transition, and axe reading a card mid-fade reports the blended colour
      // (for example #95a2a6 instead of light-muted) as a failure that no
      // visitor ever sees. Reduced motion keeps every colour final.
      use: { ...devices['Pixel 5'], reducedMotion: 'reduce' },
    },
    {
      name: 'auth-forms',
      testMatch: /(forms|hygiene)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...env,
      ALLOW_DEV_AUTH: '1',
      DEV_AUTH_SECRET: 'rapid-playwright-only',
    },
  },
});
