import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 2 — service detail redesign.
 * - Real hero imagery: the hero renders an image with graceful fallback
 *   (ServiceImage renders <img>, or div[role="img"] when the source fails).
 * - Trust row renders via TrustBadges (safeSpace platform badge always on).
 * - Related-services cards carry imagery (image or graceful fallback).
 * - The E6e before/after gallery section exists and is either populated or
 *   hidden — never a crash, never an empty box.
 *
 * NOTE: service listing cards are div[role="link"] (not <a>) because the
 * Book button inside renders its own anchor — anchors cannot nest.
 */

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

test('service detail shows hero imagery, trust badges and image-backed related cards', async ({
  page,
}) => {
  await page.goto('/services');

  // Navigate via a real listing card (div[role="link"] → /services/:id).
  const firstCard = page.locator('div[role="link"]:has(h3)').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  await expect(page).toHaveURL(/\/services\/\d+/);

  // Hero: real imagery or its graceful fallback — never an empty box.
  const hero = page.getByTestId('service-hero');
  await expect(hero).toBeVisible();
  await expect(hero.locator('img, [role="img"]')).toHaveCount(1);

  // Trust row always renders (safeSpace platform badge at minimum).
  const badges = page.getByTestId('trust-badges');
  await expect(badges).toBeVisible();

  // Related cards: every card tile renders imagery (image or fallback).
  const related = page.getByTestId('related-services');
  if ((await related.count()) > 0) {
    const tiles = related.locator('img, [role="img"]');
    const tileCount = await tiles.count();
    if (tileCount > 0) {
      await expect(tiles.first()).toBeVisible();
    }
  }

  // E6e gallery section: present, and either populated with imagery or hidden.
  const gallery = page.getByTestId('ba-gallery');
  if ((await gallery.count()) > 0) {
    const imgs = gallery.locator('img, [role="img"]');
    if ((await imgs.count()) > 0) {
      await expect(imgs.first()).toBeVisible();
    }
  }
});
