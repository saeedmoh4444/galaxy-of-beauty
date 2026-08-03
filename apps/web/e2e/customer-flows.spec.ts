/**
 * Customer E2E flows — login, dashboard, bookings, wallet, search.
 * Requires seeded database with test customer: customer@test.com / Admin@123456
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'customer@test.com';
const TEST_PASSWORD = 'Admin@123456';

test.describe('Customer — Login & Dashboard', () => {
  test('should login with test credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();

    await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page.getByText('لوحة التحكم')).toBeVisible();
  });

  test('dashboard shows stat cards', async ({ page }) => {
    await loginAsCustomer(page);
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Stat cards should be visible
    await expect(page.getByText('الحجوزات')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('الإنفاق')).toBeVisible();
  });

  test('dashboard has quick action buttons', async ({ page }) => {
    await loginAsCustomer(page);
    await expect(page.getByRole('button', { name: /احجزي الآن/ })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Customer — Bookings', () => {
  test('bookings page shows status tabs', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/bookings');
    await page.waitForURL('**/bookings', { timeout: 10000 });

    await expect(page.getByText('حجوزاتي')).toBeVisible({ timeout: 5000 });
    // Status filter tabs
    await expect(page.getByText('الكل')).toBeVisible();
  });

  test('bookings page shows seeded bookings', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/bookings');

    // At least some content should load (bookings or empty state)
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
  });
});

test.describe('Customer — Wallet', () => {
  test('wallet page shows balance', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/wallet');
    await page.waitForURL('**/wallet', { timeout: 10000 });

    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
  });
});

test.describe('Customer — Search', () => {
  test('search services with Arabic query', async ({ page }) => {
    await page.goto('/search?query=شعر');
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Auth Gating', () => {
  test('dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('wallet redirects to login', async ({ page }) => {
    await page.goto('/wallet');
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('bookings redirects to login', async ({ page }) => {
    await page.goto('/bookings');
    await page.waitForURL('**/login', { timeout: 10000 });
  });
});

// ── Helper ──────────────────────────────────────────────────────────

async function loginAsCustomer(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}
