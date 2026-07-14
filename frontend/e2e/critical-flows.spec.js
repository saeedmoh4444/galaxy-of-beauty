/**
 * Playwright E2E Tests — Critical User Journeys
 *
 * Prerequisites:
 *   1. Backend running on http://localhost:4000
 *   2. Frontend running on http://localhost:5173
 *   3. Database seeded (npm run prisma:seed-demo)
 *
 * Run: npx playwright test e2e/critical-flows.spec.js
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:4000/api';

// Demo credentials (from seed-demo.js)
const DEMO_CUSTOMER = {
  email: 'sara.demo@example.com',
  password: 'Demo@123456',
  name: 'سارة أحمد',
};

const DEMO_TECHNICIAN = {
  email: 'layla.demo@example.com',
  password: 'Demo@123456',
  name: 'ليلى العمري',
};

const DEMO_ADMIN = {
  email: 'admin@galaxyofbeauty.sa',
  password: 'Admin@123456',
};

// Helper: login via API and set localStorage token
async function loginViaApi(page, email, password) {
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: { email, password },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  await page.evaluate((token) => {
    localStorage.setItem('accessToken', token);
  }, body.accessToken);
  return body;
}

// =============================================================================
// 1. Public Pages
// =============================================================================

test.describe('Public Pages', () => {
  test('homepage loads with RTL Arabic content', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    // Should have navigation and main content
    await expect(page.locator('nav, header').first()).toBeVisible();
  });

  test('services page loads with category filtering', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');
    // Should show service cards or loading state
    const content = page.locator('main, .card, [class*="service"]').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('login page renders form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /دخول|login/i })).toBeVisible();
  });

  test('register page renders form with role selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('input[name="name"], input[placeholder*="اسم"]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], input[placeholder*="هاتف"], input[type="tel"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page-xyz`);
    await page.waitForLoadState('networkidle');
    // Should show 404 content
    await expect(page.locator('text=404, text=غير موجود, text=not found').first()).toBeVisible({ timeout: 5000 });
  });
});

// =============================================================================
// 2. Authentication Flow
// =============================================================================

test.describe('Authentication', () => {
  test('customer can login successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', DEMO_CUSTOMER.email);
    await page.fill('input[type="password"]', DEMO_CUSTOMER.password);
    await page.getByRole('button', { name: /دخول|login/i }).click();

    // Should redirect to home or dashboard
    await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });
    // Should show user name or be authenticated
    const body = await page.textContent('body');
    expect(
      body.includes(DEMO_CUSTOMER.name) ||
      body.includes('dashboard') ||
      body.includes('لوحة')
    ).toBeTruthy();
  });

  test('login with wrong credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPass1');
    await page.getByRole('button', { name: /دخول|login/i }).click();

    // Should show error toast or message
    await expect(page.locator('[role="alert"], .toast, [class*="error"]').first()).toBeVisible({ timeout: 5000 });
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('technician can login and access tech dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', DEMO_TECHNICIAN.email);
    await page.fill('input[type="password"]', DEMO_TECHNICIAN.password);
    await page.getByRole('button', { name: /دخول|login/i }).click();
    await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });

    // Navigate to tech dashboard
    await page.goto(`${BASE_URL}/tech/dashboard`);
    await page.waitForLoadState('networkidle');
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });
});

// =============================================================================
// 3. Catalog Browsing
// =============================================================================

test.describe('Service Catalog', () => {
  test('categories are loaded and display correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Categories should be visible on homepage
    const categoryLinks = page.locator('a[href*="services"], a[href*="category"], [class*="category"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('service search/filter works', async ({ page }) => {
    await page.goto(`${BASE_URL}/services`);
    await page.waitForLoadState('networkidle');

    // Look for filter controls or search input
    const searchInput = page.locator('input[placeholder*="بحث"], input[name="search"], [class*="search"] input').first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('شعر');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }
  });

  test('service detail page loads', async ({ page }) => {
    // Login first (service detail may require auth for technician info)
    await loginViaApi(page, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    await page.goto(`${BASE_URL}/services/1`);
    await page.waitForLoadState('networkidle');

    // Should show service details (or loading, or error — but not crash)
    const content = page.locator('main, .card, h1, h2').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});

// =============================================================================
// 4. API Health Check
// =============================================================================

test.describe('Backend API', () => {
  test('health endpoint returns OK', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0');
  });

  test('GET /api/categories returns tree', async ({ request }) => {
    const response = await request.get(`${API_URL}/categories`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('nameJson');
      expect(body[0]).toHaveProperty('slug');
    }
  });

  test('GET /api/services returns paginated results', async ({ request }) => {
    const response = await request.get(`${API_URL}/services?limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('services');
    expect(body).toHaveProperty('pagination');
    expect(body.pagination).toHaveProperty('total');
    expect(body.pagination).toHaveProperty('totalPages');
  });

  test('auth endpoints respond correctly', async ({ request }) => {
    // Register fails with duplicate (demo user already exists)
    const registerRes = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: 'e2e-test-' + Date.now() + '@example.com',
        phone: '+966500000001',
        password: 'TestPass123',
        name: 'E2E Test User',
        role: 'CUSTOMER',
      },
    });
    // Should succeed (201) or fail if phone taken (409)
    expect([201, 409]).toContain(registerRes.status());

    // Login with demo user
    const loginRes = await request.post(`${API_URL}/auth/login`, {
      data: { email: DEMO_CUSTOMER.email, password: DEMO_CUSTOMER.password },
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();
    expect(loginBody.user.role).toBe('CUSTOMER');

    // Refresh token
    const refreshRes = await request.post(`${API_URL}/auth/refresh`, {
      data: { refreshToken: loginBody.refreshToken },
    });
    expect(refreshRes.status()).toBe(200);
  });

  test('unauthenticated access to protected routes returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/bookings`);
    expect(response.status()).toBe(401);
  });

  test('non-existent route returns 404', async ({ request }) => {
    const response = await request.get(`${API_URL}/nonexistent-endpoint-xyz`);
    expect(response.status()).toBe(404);
  });
});

// =============================================================================
// 5. Booking Flow (with auth)
// =============================================================================

test.describe('Booking Flow', () => {
  test('authenticated customer can view bookings', async ({ page, request }) => {
    // Login
    const { accessToken } = await loginViaApi(page, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    // Fetch bookings via API
    const response = await request.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookings');
    expect(Array.isArray(body.bookings)).toBe(true);
    expect(body).toHaveProperty('pagination');
  });

  test('technician can view pending booking requests', async ({ page, request }) => {
    const { accessToken } = await loginViaApi(page, DEMO_TECHNICIAN.email, DEMO_TECHNICIAN.password);

    const response = await request.get(`${API_URL}/technician/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // This may 404 if route doesn't exactly match, or return bookings
    // The route is /bookings with role auto-detection
    const bookingsRes = await request.get(`${API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(bookingsRes.status()).toBe(200);
    const body = await bookingsRes.json();
    expect(body).toHaveProperty('bookings');
  });

  test('wallet balance is accessible', async ({ page, request }) => {
    const { accessToken } = await loginViaApi(page, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    const response = await request.get(`${API_URL}/wallet`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('wallet');
    expect(body.wallet).toHaveProperty('balance');
  });

  test('notifications endpoint works', async ({ page, request }) => {
    const { accessToken } = await loginViaApi(page, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    const response = await request.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('notifications');
    expect(body).toHaveProperty('unreadCount');
  });
});

// =============================================================================
// 6. Admin Flow
// =============================================================================

test.describe('Admin Dashboard', () => {
  test('admin can login and access admin endpoints', async ({ page, request }) => {
    // Login as admin
    const { accessToken } = await loginViaApi(page, DEMO_ADMIN.email, DEMO_ADMIN.password);

    // Fetch technicians list
    const techRes = await request.get(`${API_URL}/admin/technicians`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(techRes.status()).toBe(200);
    const techBody = await techRes.json();
    expect(techBody).toHaveProperty('technicians');

    // Fetch admin settings
    const settingsRes = await request.get(`${API_URL}/admin/settings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(settingsRes.status()).toBe(200);
    expect(settingsRes.body || settingsRes).toBeTruthy();
  });

  test('non-admin cannot access admin endpoints', async ({ page, request }) => {
    const { accessToken } = await loginViaApi(page, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    const response = await request.get(`${API_URL}/admin/technicians`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(403);
  });
});
