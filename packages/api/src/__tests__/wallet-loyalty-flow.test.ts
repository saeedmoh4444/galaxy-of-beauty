/**
 * Wallet & Loyalty flow integration tests.
 * Hits real tRPC procedures against the database with seed data.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

// Login once, share across all tests to avoid refreshToken constraint collision
let customerCaller: any;

beforeAll(async () => {
  const anon = await anonCaller();
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customerCaller = await authCaller({
    id: login.user.id,
    role: login.user.role,
    email: login.user.email,
  });
}, 15000);

const CUSTOMER: JwtPayload = { id: 1, role: 'CUSTOMER', email: 'customer@test.com' };

// ── Wallet ───────────────────────────────────────────────────────────

describe('Wallet', () => {
  it('should require authentication', async () => {
    const caller = await anonCaller();
    await expect(caller.wallet.getBalance()).rejects.toThrow();
  });

  it('should get balance for authenticated customer', async () => {
    const result = await customerCaller.wallet.getBalance();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('balance');
  });

  it('should list transactions', async () => {
    const result = await customerCaller.wallet.getTransactions({ page: 1, limit: 10 });
    expect(result).toBeDefined();
    expect(result.items || result).toBeDefined();
  });

  it('should reject top-up without authentication', async () => {
    const caller = await anonCaller();
    await expect(caller.wallet.topUp({ amount: 100 })).rejects.toThrow();
  });

  it('should accept an opaque (mobile-style) idempotency key', async () => {
    const key = `mob_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const result = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });
    expect(result).toHaveProperty('balance');
    expect(result.message).toBe('تم شحن الرصيد بنجاح');
  });

  it('should accept a UUID idempotency key (web client)', async () => {
    const result = await customerCaller.wallet.topUp({
      amount: 100,
      idempotencyKey: crypto.randomUUID(),
    });
    expect(result).toHaveProperty('balance');
  });

  it('should replay the same idempotency key without double-charging', async () => {
    const key = `mob_${Date.now()}_replay${Math.random().toString(36).slice(2, 6)}`;
    const first = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });
    const second = await customerCaller.wallet.topUp({ amount: 100, idempotencyKey: key });
    expect(second.message).toBe('Already processed');
    expect(second.balance).toBe(first.balance);
  });

  it('should reject top-up below the 10 SAR minimum', async () => {
    await expect(
      customerCaller.wallet.topUp({ amount: 5, idempotencyKey: `mob_${Date.now()}_min` }),
    ).rejects.toThrow();
  });

  it('should reject top-up above the 5000 SAR maximum', async () => {
    await expect(
      customerCaller.wallet.topUp({ amount: 5001, idempotencyKey: `mob_${Date.now()}_max` }),
    ).rejects.toThrow();
  });
});

// ── Loyalty ──────────────────────────────────────────────────────────

describe('Loyalty', () => {
  it('should get loyalty status for customer', async () => {
    const result = await customerCaller.loyalty.myAccount();
    expect(result).toBeDefined();
    expect(result).toHaveProperty('points');
    expect(result).toHaveProperty('tier');
    expect(['SILVER', 'GOLD', 'PLATINUM']).toContain(result.tier);
  });

  it('should list available rewards', async () => {
    const rewards = await customerCaller.loyalty.rewards();
    expect(rewards).toBeInstanceOf(Array);
  });

  it('should list transaction history', async () => {
    const txs = await customerCaller.loyalty.myTransactions({ page: 1, limit: 10 });
    expect(txs).toBeDefined();
    expect(txs.items || txs).toBeDefined();
  });

  it('should reject unauthorized loyalty access', async () => {
    const caller = await anonCaller();
    await expect(caller.loyalty.myAccount()).rejects.toThrow();
  });
});

// ── Admin: wallet/loyalty management ─────────────────────────────────

describe('Admin — Wallet & Loyalty Management', () => {
  const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

  it('should allow admin to list loyalty rewards', async () => {
    const caller = await authCaller(ADMIN);
    const rewards = await caller.loyalty.listRewards();
    expect(rewards).toBeInstanceOf(Array);
  });

  it('should prevent customer from accessing admin loyalty endpoints', async () => {
    const caller = await authCaller(CUSTOMER);
    await expect(caller.loyalty.listRewards()).rejects.toThrow();
  });

  it('should prevent customer from accessing admin wallet endpoints', async () => {
    const caller = await authCaller(CUSTOMER);
    await expect(caller.admin.listCustomers({ search: '', page: 1, limit: 10 })).rejects.toThrow();
  });
});
