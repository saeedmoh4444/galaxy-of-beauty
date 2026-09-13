import { test, expect } from '@playwright/test';

test.describe('AI Chat (Beauty Galaxy)', () => {
  test('should load AI chat page successfully', async ({ page }) => {
    const response = await page.goto('/ai-chat');
    // AI chat is a public page — it loads without redirect
    expect(response?.status()).toBe(200);
  });
});

test.describe('Subscriptions', () => {
  test('subscriptions page requires authentication', async ({ page }) => {
    await page.goto('/subscriptions');
    // Subscriptions is a protected route — expect redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
