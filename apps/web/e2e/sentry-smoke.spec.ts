/**
 * B1 (PLATFORM_IMPROVEMENT_PLAN) — Sentry activation smoke.
 *
 * The web SDK configs are DSN-gated (no-op without a DSN), so this test
 * asserts what CAN be asserted in every environment: the built bundle
 * ships the Sentry client init. The moment a DSN lands in env, the same
 * bundle starts reporting — no code change needed.
 */
import { test, expect } from '@playwright/test';

test('the built web bundle ships the Sentry client SDK (DSN-gated)', async ({ page }) => {
  await page.goto('/');

  const jsUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[src]')).map((s) => (s as HTMLScriptElement).src),
  );
  expect(jsUrls.length).toBeGreaterThan(0);

  const bodies = await Promise.all(
    jsUrls.map(async (url) => {
      const res = await page.request.get(url);
      return res.ok() ? res.text() : '';
    }),
  );
  // The imported namespace gets renamed by minification, so don't assert
  // the literal "Sentry.init" — object-literal keys survive terser, and
  // this one only exists in our client config.
  expect(bodies.join('')).toContain('replaysOnErrorSampleRate');
});
