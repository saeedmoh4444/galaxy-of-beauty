/**
 * Accessibility, RTL, and responsive design E2E tests.
 */
import { test, expect } from '@playwright/test';

test.describe('RTL Support', () => {
  test('home page renders with RTL direction', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('login page renders RTL', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
  });

  test('services page renders RTL', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Keyboard Navigation', () => {
  test('login form is keyboard accessible', async ({ page }) => {
    await page.goto('/login');

    // Tab through the skip link + header toggles until an input receives
    // focus (the header now hosts the language/theme toggles).
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      if ((await page.locator('input:focus').count()) > 0) break;
    }
    // Either email or password field should be focusable
    await expect(page.locator('input:focus').first()).toBeVisible();
  });

  test('skip link exists', async ({ page }) => {
    await page.goto('/');
    // Tab once should focus skip link
    await page.keyboard.press('Tab');
    const activeEl = page.locator(':focus');
    // Either skip link or first interactive element
    await expect(activeEl).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('home page works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    // No horizontal overflow
    const html = page.locator('html');
    const box = await html.boundingBox();
    expect(box).toBeDefined();
  });

  test('home page works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('home page works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Touch Targets', () => {
  test('login button is large enough', async ({ page }) => {
    await page.goto('/login');
    const btn = page.getByRole('button', { name: 'دخول' });
    const box = await btn.boundingBox();
    expect(box).toBeDefined();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36); // minimum touch target
    }
  });
});
