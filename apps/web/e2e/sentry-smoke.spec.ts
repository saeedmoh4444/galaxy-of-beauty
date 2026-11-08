/**
 * B1 (PLATFORM_IMPROVEMENT_PLAN) — Sentry activation smoke.
 *
 * The web SDK configs are DSN-gated (no-op without a DSN), so this test
 * asserts what every environment can assert: the @sentry/browser module
 * actually shipped in the built bundle and loaded in the page. The SDK
 * stamps window.__SENTRY__ at module import — before init, independent
 * of any DSN. Bundle-content grep was unreliable under Turbopack's
 * chunking (the config chunk isn't among the initial <script src> set).
 */
import { test, expect } from '@playwright/test';

test('the web app ships and loads the Sentry browser SDK (DSN-gated)', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => '__SENTRY__' in window), { timeout: 15_000 })
    .toBe(true);
});
