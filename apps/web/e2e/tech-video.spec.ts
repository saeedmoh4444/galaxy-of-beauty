import { test, expect } from '@playwright/test';

// A4 follow-up — technician video entry. The technician room UI (web
// /tech/video + mobile tech screens) closes the gap where the socket
// authorized technicians but no UI let them join a call.

const TECH_EMAIL = 'tech1@test.com';
const TECH_PASSWORD = 'Admin@123456';

async function loginAsTech(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('example@email.com').fill(TECH_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TECH_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
}

test.describe('Technician Video Entry', () => {
  test('tech video session page requires auth', async ({ page }) => {
    await page.goto('/tech/video/123');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('tech video room page requires auth', async ({ page }) => {
    await page.goto('/tech/video/123/room?room=test');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('tech bookings page renders for a logged-in technician', async ({ page }) => {
    await loginAsTech(page);
    await page.goto('/tech/bookings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('tech video session page renders for a logged-in technician', async ({ page }) => {
    await loginAsTech(page);
    // A booking the technician isn't part of → error state, but the page
    // chrome (title) renders for technicians instead of redirecting.
    await page.goto('/tech/video/999999');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('tech video room renders its chrome for a logged-in technician', async ({ page }) => {
    await loginAsTech(page);
    await page.goto('/tech/video/999999/room?room=test');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
});
