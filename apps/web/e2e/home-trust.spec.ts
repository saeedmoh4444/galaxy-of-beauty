import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 1 — trust layer on the public home.
 * - Hero trust row renders the TrustBadges component (women-only, private
 *   suite, rating) with Rose Blush tokens.
 * - The stat row is API-derived: no hardcoded counts — the categories stat
 *   must equal the number of category cards on the page, and every stat
 *   value is a `+N` number.
 */

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

test('hero trust row shows the TrustBadges and the stats are API-derived', async ({ page }) => {
  await page.goto('/');

  // TrustBadges row (scoped — trust.womenOnly also appears on a floating card).
  const badges = page.getByTestId('trust-badges');
  await expect(badges).toBeVisible();
  await expect(badges).toContainText('كادر نسائي فقط');
  await expect(badges).toContainText('يوجد جناح خاص');
  await expect(badges).toContainText('4.8');

  // Stat row: 4 values, each formatted as a number with a + prefix.
  const stats = page.getByTestId('trust-stats');
  await expect(stats).toBeVisible();
  const values = stats.locator('p.text-3xl');
  await expect(values).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(values.nth(i)).toHaveText(/^\+\d+$/);
  }

  // The categories stat is live: it equals the category cards on the page.
  const categoryCards = page.locator('a[href^="/services?categoryId="]');
  const cardCount = await categoryCards.count();
  expect(cardCount).toBeGreaterThan(0);
  await expect(values.nth(0)).toHaveText(`+${cardCount}`);
});
