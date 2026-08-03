/**
 * Auth flow integration tests — register, login, 2FA, password reset.
 * Hits real tRPC procedures against the database with seed data.
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken, verifyCsrfToken, buildCsrfCookie } from '../lib/csrf';
import type { JwtPayload } from '../lib/jwt';

// ── Helpers ──────────────────────────────────────────────────────────

const CSRF_TOKEN = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF_TOKEN, csrfHeader: CSRF_TOKEN });
  return (appRouter as any).createCaller(ctx);
}

const CUSTOMER_ID = 99990;
const TEST_CUSTOMER: JwtPayload = {
  id: CUSTOMER_ID, role: 'CUSTOMER', email: 'flow-test@test.com',
};

// ── Registration ─────────────────────────────────────────────────────

describe('Auth — Registration', () => {
  const testEmail = `reg-test-${Date.now()}@test.com`;

  it('should reject registration with weak password', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.register({ email: testEmail, password: '123', name: 'اختبار' }),
    ).rejects.toThrow();
  });

  it('should reject registration with invalid email', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.register({ email: 'not-an-email', password: 'StrongPass123!', name: 'اختبار' }),
    ).rejects.toThrow();
  });

  it('should register a new customer successfully', async () => {
    const caller = await anonCaller();
    const result = await caller.auth.register({
      email: testEmail,
      password: 'StrongPass123!',
      name: 'مختبرة التكامل',
      phone: `+9665${String(Math.floor(10000000 + Math.random() * 90000000))}`,
      acceptedTerms: true,
    });
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.role).toBe('CUSTOMER');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should reject duplicate email registration', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.register({ email: testEmail, password: 'AnotherPass123!', name: 'مكررة' }),
    ).rejects.toThrow();
  });
});

// ── Login ─────────────────────────────────────────────────────────────

describe('Auth — Login', () => {
  it('should login the seeded test customer', async () => {
    const caller = await anonCaller();
    const result = await caller.auth.login({
      email: 'customer@test.com',
      password: 'Admin@123456',
    });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('customer@test.com');
    expect(result.user.role).toBe('CUSTOMER');
  });

  it('should login the seeded admin', async () => {
    const caller = await anonCaller();
    const result = await caller.auth.login({
      email: 'admin@galaxyofbeauty.sa',
      password: 'Admin@123456',
    });
    expect(result.user.role).toBe('ADMIN');
  });

  it('should reject login with wrong password', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.login({ email: 'customer@test.com', password: 'WrongPassword!' }),
    ).rejects.toThrow();
  });

  it('should reject login with non-existent email', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.login({ email: 'nobody@test.com', password: 'Anything123!' }),
    ).rejects.toThrow();
  });

  it('should reject login with empty password', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.login({ email: 'customer@test.com', password: '' }),
    ).rejects.toThrow();
  });
});

// ── Token refresh ─────────────────────────────────────────────────────

describe('Auth — Token Refresh', () => {
  it('should refresh access token with valid refresh token', async () => {
    const caller = await anonCaller();
    const login = await caller.auth.login({
      email: 'customer@test.com',
      password: 'Admin@123456',
    });
    const refresh = await caller.auth.refresh({ refreshToken: login.refreshToken });
    expect(refresh.accessToken).toBeDefined();
    expect(refresh.refreshToken).toBeDefined();
  });

  it('should reject refresh with invalid token', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.refresh({ refreshToken: 'invalid-token' }),
    ).rejects.toThrow();
  });
});

// ── Password reset flow ──────────────────────────────────────────────

describe('Auth — Forgot / Reset Password', () => {
  it('should accept forgot password for existing email', async () => {
    const caller = await anonCaller();
    const result = await caller.auth.forgotPassword({ email: 'customer@test.com' });
    expect(result).toBeDefined();
  });

  it('should accept forgot password for non-existent email (no leak)', async () => {
    const caller = await anonCaller();
    const result = await caller.auth.forgotPassword({ email: 'ghost@test.com' });
    expect(result).toBeDefined();
  });

  it('should reject reset password with invalid token', async () => {
    const caller = await anonCaller();
    await expect(
      caller.auth.resetPassword({ token: 'bad-token', newPassword: 'NewPass123!' }),
    ).rejects.toThrow();
  });
});
