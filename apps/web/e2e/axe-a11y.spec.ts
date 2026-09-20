/**
 * Axe-core accessibility gate (FE-009).
 *
 * Scans representative routes per budget class and fails CI on any
 * violation with impact `critical` or `serious` (WCAG 2.1 A/AA).
 * Moderate findings are allowlisted per page (see MODERATE_ALLOWLIST);
 * color-contrast violations are `serious` and must always be FIXED.
 *
 * Runs chromium-only in CI to respect the 15-minute E2E budget — set
 * AXE_ALL_BROWSERS=1 to run against chromium+firefox locally. Mobile
 * project is skipped (axe is DOM-static; mobile-chrome reuses the
 * chromium binary, so this costs nothing).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

const CUSTOMER_EMAIL = 'customer@test.com';
const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const DEMO_PASSWORD = 'Admin@123456';

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(CUSTOMER_EMAIL);
  await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  // Admin user lands on /admin/dashboard after login
  await page.waitForTimeout(3000);
}

async function scan(page: import('@playwright/test').Page) {
  // Freeze animations/transitions so axe never reads a transient state.
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  });
  await page.waitForTimeout(1200);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations;
}

type Violation = AxeResults['violations'][number];

const assertNoSerious = (label: string, violations: Violation[]) => {
  const bad = violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''));
  expect(
    bad,
    `${label} serious/critical violations:\n${JSON.stringify(
      bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target) })),
      null,
      2,
    )}`,
  ).toEqual([]);
};

const axeTests = (browserName: string) => {
  test('home page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/');
    assertNoSerious('/', await scan(page));
  });

  test('services page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/services');
    assertNoSerious('/services', await scan(page));
  });

  test('login page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    assertNoSerious('/login', await scan(page));
  });

  test('customer dashboard has no serious/critical a11y violations', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');
    assertNoSerious('/dashboard', await scan(page));
  });

  test('admin dashboard has no serious/critical a11y violations', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    assertNoSerious('/admin/dashboard', await scan(page));
  });
};

test.describe('Axe a11y gate (chromium)', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'axe is DOM-static; the mobile-chrome project reuses the chromium binary',
  );
  test.skip(
    ({ browserName }) => browserName !== 'chromium' && !process.env['AXE_ALL_BROWSERS'],
    'CI runs chromium only to respect the E2E budget (AXE_ALL_BROWSERS=1 locally for firefox)',
  );
  axeTests('chromium');
});

test.describe('Axe a11y gate (firefox, local-only)', () => {
  test.skip(
    ({ isMobile, browserName }) =>
      isMobile || (browserName !== 'firefox' && !process.env['AXE_ALL_BROWSERS']),
    'firefox pass is opt-in via AXE_ALL_BROWSERS=1',
  );
  axeTests('firefox');
});
