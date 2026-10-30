import { test, expect } from '@playwright/test';

/**
 * Q2 Phase 3 (REELS_SHOPPABLE_PLAN) — shoppable tag overlays. Tagged
 * reels render commerce chips on the ACTIVE slide only; the seeded feed
 * carries two tagged reels (eyeliner + skincare) with deterministic
 * labels. Feed order is tie-shuffled by equal createMany timestamps, so
 * the spec scrolls until a tagged reel is active.
 */

test.setTimeout(120_000);

test('a tagged reel shows a shoppable chip with the seeded label', async ({ page }) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();

  const feed = page.getByTestId('reels-feed');
  const tagChip = page.getByTestId('reel-tag').first();
  for (let i = 0; i < 12 && !(await tagChip.isVisible().catch(() => false)); i++) {
    await feed.hover();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(350);
  }

  await expect(tagChip).toBeVisible();
  // One of the two seeded labels — both tagged reels are in the feed.
  await expect(tagChip).toContainText(/جرّبيه الآن|أضيفيه لسلتك/);
  // The chip carries a price line (SAR).
  await expect(tagChip).toContainText(/ر\.س|SAR/);
});

test('anonymous shoppers get a login affordance instead of a silent cart miss', async ({
  page,
}) => {
  await page.goto('/beauty-shorts');
  await expect(page.getByTestId('reel-slide').first()).toBeVisible();

  const feed = page.getByTestId('reels-feed');
  const tagChip = page.getByTestId('reel-tag').first();
  for (let i = 0; i < 12 && !(await tagChip.isVisible().catch(() => false)); i++) {
    await feed.hover();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(350);
  }
  await expect(tagChip).toBeVisible();

  await page.getByTestId('reel-tag-shop').first().click();
  // addToCart is customer-gated — anonymous taps surface the login link.
  await expect(page.getByTestId('reel-tag-login')).toBeVisible();
  await expect(page.getByTestId('reel-tag-login')).toHaveAttribute('href', '/login');
});
