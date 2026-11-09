import { test, expect } from '@playwright/test';

/**
 * D2 regression guard — the catalog seed tripled the service count, and the
 * pagination row (one button per page, no wrap) pushed the page to
 * scrollWidth 894 on a 390px viewport. In RTL the horizontal scroll shifts
 * every element's visual position, so Playwright's click() found <html> at
 * the element's box ("intercepts pointer events") and the service-detail
 * specs timed out on mobile-chrome.
 */
test('services page has no horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/services');
  await expect(page.locator('body')).toBeVisible();

  // The pagination renders after the list query resolves — wait for a page
  // button so the overflow assertion measures the full layout.
  await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible({
    timeout: 20_000,
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
