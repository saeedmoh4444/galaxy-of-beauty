import { test, expect } from '@playwright/test';

/**
 * Language switching — cookie-based locale (gob_lang):
 * - gob_lang=en → <html lang="en" dir="ltr"> + English UI strings.
 * - The LanguageToggle flips the cookie, context state, and server tree.
 */

test('serves English UI when the gob_lang cookie is en', async ({ page }) => {
  await page.context().addCookies([{ name: 'gob_lang', value: 'en', path: '/', url: '/' }]);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  // MainLayout nav renders from the catalog in English.
  await expect(page.getByRole('link', { name: 'Discover' })).toBeVisible();
  // Header CTA labels.
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('defaults to Arabic without the cookie', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('link', { name: 'دخول' })).toBeVisible();
});

test('toggle switches to English and back without a hard reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  const toggle = page.getByRole('button', { name: 'Switch to English' });
  await toggle.click();

  // Context flips immediately (client re-render) and the cookie is set.
  await expect(html).toHaveAttribute('lang', 'en');
  await expect(html).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('link', { name: 'Discover' })).toBeVisible();
  const cookie = (await page.context().cookies()).find((c) => c.name === 'gob_lang');
  expect(cookie?.value).toBe('en');

  // Toggle back.
  await page.getByRole('button', { name: 'Switch to Arabic' }).click();
  await expect(html).toHaveAttribute('lang', 'ar');
  await expect(page.getByRole('link', { name: 'دخول' })).toBeVisible();
});
