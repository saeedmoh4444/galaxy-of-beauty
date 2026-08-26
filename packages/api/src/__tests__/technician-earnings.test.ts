/**
 * technicianEarnings router tests — summary + monthly payout aggregates
 * for the caller's technician profile. Deterministic via fresh technician
 * users/profiles; the payout-attribution test documents a technicianId
 * convention mismatch (reported, not fixed).
 * (Coverage ratchet target: src/routers/technicianEarnings.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;

let uid = 0;
const unique = (prefix: string) => `${prefix}-${Date.now()}-${uid++}`;

const created = {
  userIds: [] as number[],
  techIds: [] as number[],
  payoutIds: [] as number[],
};

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeTechnicianUser() {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `earn-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + n) % 89999999))}`,
      name: `Earnings Test ${n}`,
      role: 'TECHNICIAN',
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(user.id);
  return user;
}

async function makeTechnicianProfile(userId: number) {
  // Note: buildTechnician in factories.ts is stale (isAvailable/isVerified
  // were removed from the schema) — construct the row inline instead.
  const tech = await prisma.technician.create({
    data: { userId, city: 'الرياض' },
  });
  created.techIds.push(tech.id);
  return tech;
}

function authOf(user: { id: number; email: string }, role: 'TECHNICIAN' | 'CUSTOMER'): JwtPayload {
  return { id: user.id, role, email: user.email };
}

describe('technicianEarnings router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
  }, 15000);

  it('rejects anonymous callers', async () => {
    const c = await caller(null);
    await expect(c.technicianEarnings.summary()).rejects.toThrow();
    await expect(c.technicianEarnings.monthly({ months: 3 })).rejects.toThrow();
  });

  it('rejects non-technician roles', async () => {
    await expect((await caller(customer)).technicianEarnings.summary()).rejects.toThrow();
    await expect((await caller(admin)).technicianEarnings.summary()).rejects.toThrow();
    await expect(
      (await caller(customer)).technicianEarnings.monthly({ months: 3 }),
    ).rejects.toThrow();
  });

  it('returns null summary and empty monthly for a technician without a profile', async () => {
    const user = await makeTechnicianUser();
    const c = await caller(authOf(user, 'TECHNICIAN'));
    expect(await c.technicianEarnings.summary()).toBeNull();
    expect(await c.technicianEarnings.monthly({ months: 3 })).toEqual([]);
  });

  it('returns a zeroed summary and a 6-month zero trend for a profile with no payouts', async () => {
    const user = await makeTechnicianUser();
    await makeTechnicianProfile(user.id);
    const c = await caller(authOf(user, 'TECHNICIAN'));

    const summary = await c.technicianEarnings.summary();
    expect(summary).toEqual({ thisMonth: 0, lastMonth: 0, totalEarned: 0 });

    const trend = await c.technicianEarnings.monthly({});
    expect(trend).toHaveLength(6);
    expect(trend.every((m: { amount: number }) => m.amount === 0)).toBe(true);
    const keys: string[] = trend.map((m: { month: string }) => m.month);
    expect([...keys].sort()).toEqual(keys);
  });

  it('respects the months input range (default 6, min 1, max 12)', async () => {
    const user = await makeTechnicianUser();
    await makeTechnicianProfile(user.id);
    const c = await caller(authOf(user, 'TECHNICIAN'));

    expect(await c.technicianEarnings.monthly({ months: 1 })).toHaveLength(1);
    expect(await c.technicianEarnings.monthly({ months: 2 })).toHaveLength(2);
    expect(await c.technicianEarnings.monthly({ months: 12 })).toHaveLength(12);
  });

  it('rejects out-of-range and non-integer months', async () => {
    const user = await makeTechnicianUser();
    await makeTechnicianProfile(user.id);
    const c = await caller(authOf(user, 'TECHNICIAN'));

    await expect(c.technicianEarnings.monthly({ months: 0 })).rejects.toThrow();
    await expect(c.technicianEarnings.monthly({ months: 13 })).rejects.toThrow();
    await expect(c.technicianEarnings.monthly({ months: 1.5 })).rejects.toThrow();
  });

  it('attributes payouts keyed by the technician user id (fixed 2026-08-19)', async () => {
    // Payout.technicianId stores the User.id (see src/routers/payouts.ts
    // `technicianId: ctx.user.id`). technicianEarnings used to filter by the
    // Technician *profile* id, making every real technician's earnings zero.
    // Fixed: filters use ctx.user.id and return plain numbers.
    const user = await makeTechnicianUser();
    await makeTechnicianProfile(user.id);

    const payout = await prisma.payout.create({
      data: {
        technicianId: user.id, // schema convention: the technician's User.id
        periodStart: new Date(Date.now() - 30 * 86_400_000),
        periodEnd: new Date(),
        amount: 777,
        status: 'COMPLETED',
      },
    });
    created.payoutIds.push(payout.id);

    // Sanity: the payout row exists and is keyed by the user id
    const stored = await prisma.payout.findUnique({ where: { id: payout.id } });
    expect(stored?.technicianId).toBe(user.id);

    const c = await caller(authOf(user, 'TECHNICIAN'));
    expect(await c.technicianEarnings.summary()).toEqual({
      thisMonth: 777,
      lastMonth: 0,
      totalEarned: 777,
    });
    const trend = await c.technicianEarnings.monthly({ months: 2 });
    expect(trend.some((m: { amount: number }) => m.amount === 777)).toBe(true);
  });
});

afterAll(async () => {
  if (created.payoutIds.length > 0) {
    await prisma.payout.deleteMany({ where: { id: { in: created.payoutIds } } });
  }
  if (created.techIds.length > 0) {
    await prisma.technician.deleteMany({ where: { id: { in: created.techIds } } });
  }
  if (created.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
  }
});
