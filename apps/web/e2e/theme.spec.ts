import { test, expect } from '@playwright/test';

/**
 * Theme (dark mode) — class strategy:
 * - localStorage.theme === 'dark' → <html class="dark"> pre-paint via the
 *   inline init script (no flash of light).
 * - The ThemeToggle flips the class and persists the choice.
 */

test('applies dark theme pre-paint when stored preference is dark', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
  });
  await page.goto('/');
  // The inline init script sets the class before first paint — assert on
  // the documentElement class right after load.
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('theme toggle flips the dark class and persists', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  const before = await html.evaluate((el) => el.classList.contains('dark'));

  // Toggle is rendered in the public header (MainLayout).
  const toggle = page.getByRole('button', { name: /تفعيل الوضع/ });
  await toggle.click();

  const after = await html.evaluate((el) => el.classList.contains('dark'));
  expect(after).toBe(!before);

  // Persisted to localStorage
  const stored = await page.evaluate(() => localStorage.getItem('theme'));
  expect(stored).toBe(after ? 'dark' : 'light');

  // Survives a reload (init script reapplies)
  await page.reload();
  await expect(html).toHaveClass(/dark/);
});

test('light mode is the default without stored preference on a light OS', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('theme');
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});
