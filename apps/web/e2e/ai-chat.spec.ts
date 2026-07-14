import { test, expect } from '@playwright/test';

test.describe('AI Chat (Layla)', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/ai-chat');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('AI Subscriptions', () => {
  test('subscriptions page requires auth', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
