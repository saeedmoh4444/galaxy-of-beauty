import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 1 — discover tile refresh: real imagery (no emoji-only
 * gradient chips) and stage-aware ordering. Guests keep the canonical
 * order (services first); the stage ordering logic is unit-tested in
 * packages/api (discover-ordering.test.ts) since it needs an authed
 * stage-derived customer.
 */

test.setTimeout(120_000);

test('discover tiles carry imagery and keep the canonical order for guests', async ({ page }) => {
  await page.goto('/discover');

  // Scope to the tile grid (the header nav also links to some destinations).
  const grid = page.getByTestId('discover-grid');

  // Canonical first tile for guests: احجزي خدمات التجميل (/services).
  const firstTile = grid.locator('a[href="/services"]').first();
  await expect(firstTile).toBeVisible();
  await expect(firstTile.getByRole('heading', { name: 'احجزي خدمات التجميل' })).toBeVisible();

  // Media banner: a real image, or the ServiceImage letter fallback when
  // the external CDN is unreachable — never an emoji/gradient-only chip.
  await expect(firstTile.locator('img, [role="img"]').first()).toBeVisible();

  // A few more tiles carry media banners too.
  for (const href of ['/technicians', '/flash-deals', '/marketplace']) {
    await expect(
      grid.locator(`a[href="${href}"]`).first().locator('img, [role="img"]').first(),
    ).toBeVisible();
  }
});
