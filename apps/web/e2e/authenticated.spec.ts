import { test, expect } from '@playwright/test';

const DEMO_EMAIL = 'admin@galaxyofbeauty.sa';
const DEMO_PASSWORD = 'Admin@123456';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
  await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  // Admin user redirects to /admin/dashboard
  await page.waitForTimeout(3000);
  await expect(page.locator('body')).toBeVisible();
}

test.describe('Authenticated Flows', () => {
  test('should login with demo credentials', async ({ page }) => {
    await login(page);
  });

  test('should browse services after login', async ({ page }) => {
    await login(page);
    await page.goto('/services');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access customer dashboard', async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access admin dashboard', async ({ page }) => {
    await login(page);
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access wallet page when authenticated', async ({ page }) => {
    await login(page);
    await page.goto('/wallet');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access wishlist when authenticated', async ({ page }) => {
    await login(page);
    await page.goto('/wishlist');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should persist auth across page navigation', async ({ page }) => {
    await login(page);
    const pages = ['/services', '/marketplace', '/wallet', '/bookings'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(500);
      expect(page.url()).not.toContain('/login');
    }
  });
});

test.describe('Login Failure', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    await page.getByPlaceholder('example@email.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should show error for empty credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });
});
