/**
 * B1 (PLATFORM_IMPROVEMENT_PLAN) — Sentry activation smoke.
 *
 * The web SDK configs are DSN-gated (no-op without a DSN), so this test
 * asserts what every environment can assert: the client config actually
 * RAN in the browser. sentry.client.config.ts sets a marker on window
 * after Sentry.init — v11 no longer stamps __SENTRY__ at module load,
 * which is why bundle-grep and global-polling both failed before.
 */
import { test, expect } from '@playwright/test';

test('the web app ships and loads the Sentry browser SDK (DSN-gated)', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => window.__GOB_SENTRY_READY__ === true), { timeout: 15_000 })
    .toBe(true);
});
