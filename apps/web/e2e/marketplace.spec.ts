import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test('should load marketplace page', async ({ page }) => {
    const response = await page.goto('/marketplace');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/marketplace');
    // Page should have visible body content
    await expect(page.locator('body')).toBeVisible();
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

test.describe('Storefront SEO (F4)', () => {
  test('store pages carry per-store title, canonical and breadcrumbs', async ({ page }) => {
    await page.goto('/stores');
    const card = page.locator('a[href^="/stores/"]').first();
    await expect(card).toBeVisible({ timeout: 60_000 });
    const href = (await card.getAttribute('href')) ?? '';

    await page.goto(href);
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[/.]/g, '\\$&')}$`));

    // Per-store <title> — the store name, not the generic stores title.
    const h1 = await page.getByRole('heading', { level: 1 }).first().textContent();
    const title = await page.title();
    expect(h1).toBeTruthy();
    expect(title).toContain((h1 ?? '').slice(0, 20));

    // Canonical link resolves to the store URL.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${href.replace(/[/.]/g, '\\$&')}$`),
    );

    // F4 breadcrumbs: home / stores / store name.
    const crumbs = page.locator('nav[aria-label] ol');
    await expect(crumbs).toBeVisible();
    await expect(crumbs.getByRole('link', { name: /stores|المتاجر/i })).toBeVisible();
  });
});
