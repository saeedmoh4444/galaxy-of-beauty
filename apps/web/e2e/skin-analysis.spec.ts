import { test, expect } from '@playwright/test';

test.describe('Skin Analysis', () => {
  test('should load skin analysis page', async ({ page }) => {
    const response = await page.goto('/skin-analysis');
    // Skin analysis loads as a public page
    expect(response?.status()).toBe(200);
  });

  test('should render page content', async ({ page }) => {
    await page.goto('/skin-analysis');
    await page.waitForLoadState('networkidle');
    // Page should have visible body content
    await expect(page.locator('body')).toBeVisible();
  });
});
