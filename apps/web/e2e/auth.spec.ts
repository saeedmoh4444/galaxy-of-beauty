import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('تسجيل الدخول')).toBeVisible();
    await expect(page.getByPlaceholder('example@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: 'دخول' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=إنشاء حساب');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText('إنشاء حساب')).toBeVisible();
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=نسيت كلمة المرور؟');
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should show 2FA page', async ({ page }) => {
    await page.goto('/2fa');
    await expect(page.getByText('المصادقة الثنائية')).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should load services page', async ({ page }) => {
    await page.goto('/services');
    await expect(page).toHaveURL('/services');
  });
});
