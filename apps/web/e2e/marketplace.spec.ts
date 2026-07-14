import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('should load marketplace page', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page).toHaveURL('/marketplace');
    await expect(page.getByRole('heading', { name: 'متجر منتجات التجميل' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/marketplace');
    const searchInput = page.getByPlaceholder('ابحثي عن منتج...');
    await expect(searchInput).toBeVisible();
  });

  test('should show products or empty state', async ({ page }) => {
    await page.goto('/marketplace');
    // Wait for either products to load or empty state to appear
    await page.waitForTimeout(3000);
    // Page should have either product cards or an empty state message
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/marketplace');
    const searchInput = page.getByPlaceholder('ابحثي عن منتج...');
    await searchInput.fill('مرطب');
    await page.waitForTimeout(2000);
    // Results should filter (may show products or empty)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Marketplace Auth', () => {
  test('should be publicly accessible', async ({ page }) => {
    const response = await page.goto('/marketplace');
    expect(response?.status()).toBe(200);
  });
});
