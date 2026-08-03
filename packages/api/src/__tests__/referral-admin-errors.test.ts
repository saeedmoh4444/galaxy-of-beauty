/**
 * Referral, Admin, and Error/Edge-case integration tests.
 * Closes the remaining gaps in Phase 2 of the platform test plan.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

// ── Helpers ──────────────────────────────────────────────────────────

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customerCaller: any;
let adminCaller: any;

beforeAll(async () => {
  const anon = await anonCaller();
  const customerLogin = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  const adminLogin = await anon.auth.login({ email: 'admin@galaxyofbeauty.sa', password: 'Admin@123456' });
  customerCaller = await authCaller({ id: customerLogin.user.id, role: customerLogin.user.role, email: customerLogin.user.email });
  adminCaller = await authCaller({ id: adminLogin.user.id, role: adminLogin.user.role, email: adminLogin.user.email });
}, 30000);

// ── Referral ─────────────────────────────────────────────────────────

describe('Referral', () => {
  it('should show leaderboard (public)', async () => {
    const caller = await anonCaller();
    const result = await caller.referralRace.leaderboard();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('leaders');
    expect(result.leaders).toBeInstanceOf(Array);
    expect(result).toHaveProperty('endDate');
    expect(result).toHaveProperty('prizes');
  });

  it('should get my rank (customer)', async () => {
    const result = await customerCaller.referralRace.myRank();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('rank');
    expect(result).toHaveProperty('count');
  });

  it('should generate share link (customer)', async () => {
    const result = await customerCaller.referralRace.share({ platform: 'whatsapp' });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('register');
  });

  it('should require auth for myRank', async () => {
    const caller = await anonCaller();
    await expect(caller.referralRace.myRank()).rejects.toThrow();
  });
});

// ── Admin ────────────────────────────────────────────────────────────

describe('Admin — Dashboard & Users', () => {
  it('should access admin dashboard stats', async () => {
    const result = await adminCaller.adminTools.health();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('services');
  });

  it('should list customers', async () => {
    const result = await adminCaller.admin.listCustomers({ search: '', page: 1, limit: 10 });
    expect(result).toBeDefined();
  });

  it('should list all categories (admin)', async () => {
    const result = await adminCaller.categories.all();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should prevent customer from listing customers', async () => {
    await expect(customerCaller.admin.listCustomers({ search: '', page: 1, limit: 10 })).rejects.toThrow();
  });

  it('should access analytics', async () => {
    const result = await adminCaller.adminAnalyticsV2.dashboard();
    expect(result).toBeDefined();
  });
});

// ── Error & Edge Cases ───────────────────────────────────────────────

describe('Error & Edge Cases', () => {
  it('should return 404-like error for non-existent service', async () => {
    await expect(customerCaller.services.getById({ id: 99999 })).rejects.toThrow();
  });

  it('should reject missing required fields', async () => {
    const caller = await anonCaller();
    await expect(caller.auth.login({})).rejects.toThrow();
  });

  it('should validate pagination limits', async () => {
    const result = await customerCaller.services.list({ page: 1, limit: 1 });
    expect(result.items.length).toBeLessThanOrEqual(1);
  });

  it('should handle empty search gracefully', async () => {
    const caller = await anonCaller();
    await expect(caller.search.search({ query: '', page: 1, limit: 10 })).rejects.toThrow();
  });

  it('should require CSRF for mutations', async () => {
    // Create context without CSRF
    const ctx = await createTRPCContext();
    const noCsrfCaller = (appRouter as any).createCaller(ctx);
    await expect(
      noCsrfCaller.auth.forgotPassword({ email: 'test@test.com' }),
    ).rejects.toThrow();
  });

  it('health endpoint should be public', async () => {
    const caller = await anonCaller();
    const result = await caller.health();
    expect(result.status).toBe('ok');
  });

  it('should return platform stats (public)', async () => {
    const caller = await anonCaller();
    const result = await caller.beautyStats.platform();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('totalBookings');
    expect(result).toHaveProperty('citiesCount');
  });
});
