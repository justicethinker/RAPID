import { defineConfig, devices } from '@playwright/test';

/**
 * PRD A09 asks for Android Chrome, iPhone Safari and desktop Chrome, Safari,
 * Edge and Firefox.
 *
 * Edge is Chromium-based and has no Linux binary in this test environment, so
 * the Chromium project stands in for it.
 *
 * WebKit (desktop Safari + iPhone Safari) needs GTK/GStreamer system libraries
 * that are not installed in this Ubuntu 24 environment. Those projects are
 * opt-in: install the libraries with
 *   sudo pnpm exec playwright install-deps webkit
 * and run with PLAYWRIGHT_INCLUDE_WEBKIT=1 pnpm e2e.
 */
const includeWebkit = process.env.PLAYWRIGHT_INCLUDE_WEBKIT === '1';

export default defineConfig({
  testDir: './tests',
  // The signed-in suite needs the API and Postgres and has its own config.
  testIgnore: ['auth/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-android', use: { ...devices['Pixel 5'] } },
    ...(includeWebkit
      ? [
          { name: 'desktop-safari', use: { ...devices['Desktop Safari'] } },
          { name: 'mobile-ios', use: { ...devices['iPhone 13'] } },
        ]
      : []),
  ],
  webServer: {
    command: 'pnpm preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
