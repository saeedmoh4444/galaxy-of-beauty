import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 4 — public header IA.
 * - 6 primary links + a More toggle (the old flat 18-link row is gone).
 * - /services is reachable from the primary row.
 * - More opens a dropdown with reels/technicians/skin-analysis + venues;
 *   Escape closes it.
 * - Mobile: the drawer toggle opens a drawer and navigates.
 */

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

test('public header shows the primary row and a working More dropdown', async ({ page }) => {
  await page.goto('/');

  const headerNav = page.locator('header nav');
  await expect(headerNav).toBeVisible();

  // Core destinations are top-level now.
  await expect(headerNav.locator('a[href="/services"]')).toBeVisible();
  await expect(headerNav.locator('a[href="/marketplace"]')).toBeVisible();

  // More dropdown: opens on click, exposes previously footer-only routes.
  const more = page.getByTestId('nav-more-toggle');
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');

  const menu = page.getByTestId('nav-more-menu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('a[href="/technicians"]')).toBeVisible();
  await expect(menu.locator('a[href="/beauty-shorts"]')).toBeVisible();
  await expect(menu.locator('a[href="/stores"]')).toBeVisible();

  // Escape closes it.
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('mobile drawer opens and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByTestId('nav-drawer-toggle').click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await drawer.locator('a[href="/services"]').click();
  await expect(page).toHaveURL(/\/services/);
});
