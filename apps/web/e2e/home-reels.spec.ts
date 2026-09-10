import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 1 — real media on the public home (E7).
 * The "شاهدينا" row renders approved+active shorts top-by-views
 * (seeded: 6 pre-approved shorts; the 5200-views reel is the top card)
 * with duration + views chips, and links to the full /beauty-shorts feed.
 * The section hides entirely when no shorts exist.
 */

test.setTimeout(120_000);

test('guest home shows the reels row with the top-viewed short first', async ({ page }) => {
  await page.goto('/');

  const section = page.getByTestId('home-reels');
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { name: 'شاهدينا' })).toBeVisible();

  const cards = page.getByTestId('reel-card');
  await expect(cards.first()).toBeVisible();
  // Top by views: the seeded 5200-views reel → 5.2K chip + 0:32 duration.
  await expect(cards.first()).toContainText('5.2K');
  await expect(cards.first()).toContainText('0:32');

  // View-all leads to the full feed (wait-for-URL races the client nav;
  // a settle first lets lazy media above finish loading).
  const viewAll = section.getByRole('link', { name: 'عرض الكل' });
  await viewAll.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await Promise.all([page.waitForURL(/\/beauty-shorts/, { timeout: 15000 }), viewAll.click()]);
  await expect(page.getByRole('heading', { name: 'جمال شورتس' })).toBeVisible();
});
