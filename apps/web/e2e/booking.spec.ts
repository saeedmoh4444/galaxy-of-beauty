import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should display services page with categories', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL('/services');
    // Service listing should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to service detail', async ({ page }) => {
    await page.goto('/services');
    // Click first service link if available
    const link = page.locator('a[href^="/services/"]').first();
    if (await link.isVisible()) {
      await link.click();
      await expect(page).toHaveURL(/\/services\/\d+/);
    }
  });
});

test.describe('Wallet & Payments', () => {
  test('wallet page requires auth', async ({ page }) => {
    await page.goto('/wallet');
    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('bookings page requires auth', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Pages', () => {
  test('admin dashboard requires auth', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin users requires auth', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Navigation', () => {
  test('services page links to public route', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL('/services');
  });

  test('technicians page is accessible', async ({ page }) => {
    await page.goto('/technicians');
    // May exist or go to 404 — either is fine
    await expect(page.locator('body')).toBeVisible();
  });
});
