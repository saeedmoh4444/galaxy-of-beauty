import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 1 — stage-aware home greeting (E6a wiring).
 * Guests (no auth) get the back_to_me greeting as the hero subtitle and
 * never see the period-pampering banner (customers only, inside the window).
 */

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

test('guest home shows the back_to_me greeting subtitle in Arabic', async ({ page }) => {
  await page.goto('/');
  const greeting = page.getByTestId('hero-greeting');
  await expect(greeting).toBeVisible();
  await expect(greeting).toContainText('احجزي خدمات التجميل المنزلية بكل سهولة');
  await expect(page.getByTestId('pamper-banner')).toHaveCount(0);
});

test('guest home shows the English greeting with the en cookie', async ({ page, baseURL }) => {
  await page
    .context()
    .addCookies([{ name: 'gob_lang', value: 'en', url: baseURL || 'http://localhost:3000' }]);
  await page.goto('/');
  const greeting = page.getByTestId('hero-greeting');
  await expect(greeting).toBeVisible();
  await expect(greeting).toContainText('Book home beauty services with ease');
  await expect(page.getByTestId('pamper-banner')).toHaveCount(0);
});
