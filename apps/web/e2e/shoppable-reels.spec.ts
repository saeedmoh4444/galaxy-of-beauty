import { test, expect } from '@playwright/test';

/**
 * R4 — shoppable reel surfaces (REELS_SHOPPABLE_PLAN).
 * Approved reels attached to a store render as a poster-first strip on
 * the storefront; reels attached to a service render on its detail page.
 * Seeded: 2 store reels on galaxy-demo-store, 1 reel on the first
 * platform service (قص شعر كامل). Strips hide entirely without reels.
 */

test.setTimeout(120_000);

test('store page shows the reel strip for the demo store', async ({ page }) => {
  await page.goto('/stores/galaxy-demo-store');

  const section = page.getByTestId('store-reels');
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { name: 'فيديوهات المتجر' })).toBeVisible();

  const cards = section.getByTestId('reel-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toBeVisible();
});

test('service detail page shows the reel strip for the seeded service', async ({ page }) => {
  // The listing shows only the 12 newest on page 1 (sort=newest) — the
  // seeded service is found deterministically via the search box.
  await page.goto('/services');

  const search = page.getByPlaceholder('بحث عن خدمة...');
  await search.fill('قص شعر كامل');
  const haircut = page.getByRole('heading', { name: 'قص شعر كامل' }).first();
  await haircut.click();
  await expect(page).toHaveURL(/\/services\/\d+/);

  const section = page.getByTestId('service-reels');
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { name: 'فيديوهات الخدمة' })).toBeVisible();
  await expect(section.getByTestId('reel-card').first()).toBeVisible();
});
