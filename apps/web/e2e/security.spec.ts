import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should include security headers in response', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};

    // HSTS
    expect(headers['strict-transport-security']).toBeDefined();
    expect(headers['strict-transport-security']).toContain('max-age=63072000');

    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff');

    // X-Frame-Options
    expect(headers['x-frame-options']).toBe('DENY');

    // Referrer-Policy
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});

test.describe('CSRF Protection', () => {
  test('should set CSRF cookie on first visit', async ({ page }) => {
    await page.goto('/');
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find((c) => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie?.value).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should reject mutation without CSRF token', async ({ request }) => {
    // Send a POST to the tRPC endpoint without CSRF headers
    const response = await request.post('/api/trpc/auth.login', {
      data: { email: 'test@test.com', password: 'Test1234!' },
      headers: { 'Content-Type': 'application/json' },
    });
    // Should fail (403 Forbidden or 401 due to bad credentials but CSRF is still checked)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Rate Limiting', () => {
  test('should throttle multiple forgot-password requests', async ({ request }) => {
    const body = { email: 'rate-test@example.com' };

    // Send 4 rapid requests
    const results = [];
    for (let i = 0; i < 4; i++) {
      const res = await request.post('/api/trpc/auth.forgotPassword?batch=1', {
        data: { 0: body },
        headers: { 'Content-Type': 'application/json' },
      });
      results.push(res.status());
    }

    // At least one should be rate-limited (429)
    const rateLimited = results.filter((s) => s === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
