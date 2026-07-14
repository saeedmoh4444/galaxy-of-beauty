import { test, expect } from '@playwright/test';

const DEMO_EMAIL = 'admin@galaxyofbeauty.sa';
const DEMO_PASSWORD = 'Admin@123456';

test.describe('Authenticated Flows', () => {
  test('should login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();

    // Fill credentials
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);

    // Submit
    await page.getByRole('button', { name: 'دخول' }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should browse services after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to services
    await page.goto('/services');
    await expect(page).toHaveURL('/services');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access customer dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Should be on the dashboard
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to admin
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access wallet page when authenticated', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Wallet should be accessible
    await page.goto('/wallet');
    await expect(page).toHaveURL('/wallet');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should access wishlist when authenticated', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto('/wishlist');
    await expect(page).toHaveURL('/wishlist');
  });

  test('should persist auth across page navigation', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(DEMO_EMAIL);
    await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to several pages — none should redirect to login
    const pages = ['/services', '/marketplace', '/wallet', '/bookings'];
    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(1000);
      // Should stay on the page, not redirected to /login
      expect(page.url()).not.toContain('/login');
    }
  });
});

test.describe('Login Failure', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'دخول' }).click();

    // Should stay on login page
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('should show error for empty credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'دخول' }).click();
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });
});
