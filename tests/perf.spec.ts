import { test, expect } from '@playwright/test';

/**
 * PRD section 6 asks for mobile load-test results. This runs once, on Chromium,
 * with a slow 3G profile and 4x CPU throttling, and prints the measured numbers
 * so they can be recorded in docs/ACCEPTANCE_REPORT.md.
 */
test('home page stays inside the mobile load budget', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-chrome',
    'the throttled measurement is recorded once on Chromium',
  );

  test.setTimeout(90_000);

  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const started = Date.now();
  await page.goto('/', { waitUntil: 'load' });
  const wallMs = Date.now() - started;

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const transferred = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    const js = resources
      .filter((entry) => entry.name.endsWith('.js'))
      .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
    return {
      ttfb: Math.round(nav?.responseStart ?? 0),
      domContentLoaded: Math.round(nav?.domContentLoadedEventEnd ?? 0),
      load: Math.round(nav?.loadEventEnd ?? 0),
      transferredKb: Math.round(transferred / 1024),
      jsKb: Math.round(js / 1024),
    };
  });

  console.log(
    `[mobile load] ${JSON.stringify({ ...metrics, wallMs })} (1.6 Mbps, 150 ms RTT, 4x CPU)`,
  );

  // Generous ceilings: they catch a regression, not normal variance.
  expect(metrics.domContentLoaded).toBeLessThan(10_000);
  expect(metrics.jsKb).toBeLessThan(600);
  await expect(page.locator('h1')).toHaveText('Help decide what gets built next.');
});
