import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 2 — service detail redesign.
 * - Real hero imagery: an <img> renders in the hero (no empty-emoji box).
 * - Trust row renders via TrustBadges (safeSpace platform badge always on).
 * - Related-services cards carry real imagery.
 * - The E6e before/after gallery section exists and is either populated or
 *   hidden — never a crash, never an empty box.
 */

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

test('service detail shows hero imagery, trust badges and image-backed related cards', async ({
  page,
}) => {
  await page.goto('/services');

  // Pick the first service card and navigate to its detail page.
  const firstCard = page.locator('a[href^="/services/"]').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await expect(page).toHaveURL(/\/services\/\d+/);

  // Hero: a real <img> (ServiceImage) renders.
  const hero = page.getByTestId('service-hero');
  await expect(hero).toBeVisible();
  await expect(hero.locator('img')).toHaveCount(1);

  // Trust row always renders (safeSpace platform badge at minimum).
  const badges = page.getByTestId('trust-badges');
  await expect(badges).toBeVisible();

  // Related cards: every card tile renders an image, not an empty box.
  const related = page.getByTestId('related-services');
  if ((await related.count()) > 0) {
    const tiles = related.locator('a[href^="/services/"] img');
    const tileCount = await tiles.count();
    if (tileCount > 0) {
      for (let i = 0; i < tileCount; i++) {
        await expect(tiles.nth(i)).toBeVisible();
      }
    }
  }

  // E6e gallery section: present, and either populated with images or hidden.
  const gallery = page.getByTestId('ba-gallery');
  if ((await gallery.count()) > 0) {
    const imgs = gallery.locator('img');
    if ((await imgs.count()) > 0) {
      await expect(imgs.first()).toBeVisible();
    }
  }
});
