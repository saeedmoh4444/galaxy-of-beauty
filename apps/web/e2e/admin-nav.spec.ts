import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const ADMIN_PASSWORD = 'Admin@123456';

// Dev-server first-load compiles are slow; CI (production build) is fast.
test.setTimeout(120_000);

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  // Admin users land on /admin/dashboard after login.
  await expect(page).toHaveURL(/\/admin\//, { timeout: 60_000 });
}

test.describe('Admin Sidebar Navigation', () => {
  test('renders each admin nav item exactly once (no duplicate entries)', async ({ page }) => {
    await loginAsAdmin(page);

    const nav = page.locator('aside nav');
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    // Guard against a vacuous pass: the sidebar must actually render links.
    expect(await links.count()).toBeGreaterThan(5);

    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
    );
    const duplicates = hrefs.filter((href, i) => href !== null && hrefs.indexOf(href) !== i);
    expect(duplicates).toEqual([]);
  });
});
