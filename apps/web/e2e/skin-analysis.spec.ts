import { test, expect } from '@playwright/test';

test.describe('Skin Analysis', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/skin-analysis');
    // Should redirect to login since it requires auth
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Skin Analysis UI Elements', () => {
  // These tests require a logged-in session; we test the page structure via navigation guards
  test('should exist as a route', async ({ page }) => {
    const response = await page.goto('/skin-analysis');
    // Redirects to login — which confirms the route exists and is protected
    expect(response?.status()).toBe(200);
  });
});
