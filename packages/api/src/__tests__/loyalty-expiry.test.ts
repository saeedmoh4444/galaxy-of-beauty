/**
 * ENHANCEMENT_PLAN 8.2 — Loyalty 2.0: points expiry + boost events (slice 1).
 *
 * Drives: shared loyaltyExpiry math, LoyaltyTransaction.expiresAt +
 * LoyaltyBoost model, creditLoyaltyPoints boost/expiry integration, and
 * the loyalty.summary query (effective balance + expiring-soon).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import { creditLoyaltyPoints } from '../lib/loyalty';
import { pointsExpiryDate, boostedPoints } from '@galaxy/shared';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();
const ADMIN: JwtPayload = { id: 3, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

async function authCaller(user: JwtPayload | null) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

const SUFFIX = Date.now();
let customer: JwtPayload;
let accountId = 0;
const createdUserIds: number[] = [];
const createdBoostIds: number[] = [];

beforeAll(async () => {
  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };
  const account = await prisma.loyaltyAccount.create({
    data: { userId: user.id, points: 0, lifetimePoints: 0, tier: 'SILVER' },
  });
  accountId = account.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.loyaltyTransaction.deleteMany({ where: { accountId } });
    await prisma.loyaltyAccount.deleteMany({ where: { id: accountId } });
    await prisma.loyaltyBoost.deleteMany({ where: { id: { in: createdBoostIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort; the DB is re-seeded per run
  }
});

describe('loyaltyExpiry (shared math)', () => {
  it('expires earned points 12 months after earn', () => {
    expect(pointsExpiryDate(new Date('2026-01-15T10:00:00Z')).toISOString()).toBe(
      '2027-01-15T10:00:00.000Z',
    );
  });

  it('rounds boosted points', () => {
    expect(boostedPoints(50, 2)).toBe(100);
    expect(boostedPoints(10, 1.5)).toBe(15);
  });
});

describe('creditLoyaltyPoints with boosts + expiry', () => {
  it('credits a plain earn with a 12-month expiry', async () => {
    await creditLoyaltyPoints(prisma, customer.id, 20, 'test_earn', `t-${SUFFIX}`);
    const txn = await prisma.loyaltyTransaction.findFirst({
      where: { referenceId: `t-${SUFFIX}` },
    });
    expect(txn?.expiresAt).not.toBeNull();
    const months = (txn!.expiresAt!.getTime() - Date.now()) / (30 * 86_400_000);
    expect(months).toBeGreaterThan(11.5);
    expect(months).toBeLessThan(12.5);
  });

  it('doubles points inside an active boost window', async () => {
    const boost = await prisma.loyaltyBoost.create({
      data: {
        nameJson: { ar: 'نقاط مضاعفة', en: 'Double points' },
        multiplier: 2,
        startsAt: new Date(Date.now() - 86_400_000),
        endsAt: new Date(Date.now() + 86_400_000),
        isActive: true,
      },
    });
    createdBoostIds.push(boost.id);

    const before = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });
    const result = await creditLoyaltyPoints(prisma, customer.id, 50, 'boost_earn', `b-${SUFFIX}`);
    expect(result.points).toBe((before?.points ?? 0) + 100);

    // Deactivate so later tests stay deterministic.
    await prisma.loyaltyBoost.update({ where: { id: boost.id }, data: { isActive: false } });
  });

  it('ignores inactive boosts', async () => {
    const before = await prisma.loyaltyAccount.findUnique({ where: { userId: customer.id } });
    const result = await creditLoyaltyPoints(prisma, customer.id, 10, 'no_boost', `nb-${SUFFIX}`);
    expect(result.points).toBe((before?.points ?? 0) + 10);
  });
});

describe('loyalty.summary', () => {
  it('computes effective balance excluding expired, plus expiring-soon', async () => {
    await prisma.loyaltyTransaction.createMany({
      data: [
        {
          accountId,
          points: 40,
          reason: 'soon',
          expiresAt: new Date(Date.now() + 10 * 86_400_000),
        },
        {
          accountId,
          points: 999,
          reason: 'expired',
          expiresAt: new Date(Date.now() - 86_400_000),
        },
      ],
    });

    const caller = await authCaller(customer);
    const summary = await caller.loyalty.summary();

    // Earns: 20 (plain) + 100 (boosted) + 10 (no boost) + 40 (soon) = 170;
    // the 999 already expired, so it is excluded from effective.
    expect(summary.effectivePoints).toBe(170);
    // Only the +40 (10 days out) expires within 30 days.
    expect(summary.expiringSoon).toBe(40);
    // The stored ledger only counts credited earns (the raw +40/+999 rows
    // bypass the account counter, as a not-yet-swept ledger would).
    expect(summary.points).toBe(20 + 100 + 10);
    expect(summary.expiringAt).not.toBeNull();
  });
});

describe('loyalty boost admin CRUD', () => {
  it('blocks customers from listing boosts', async () => {
    const caller = await authCaller(customer);
    await expect(caller.loyalty.listBoosts()).rejects.toThrow();
  });

  it('admin can create and delete a boost', async () => {
    const caller = await authCaller(ADMIN);
    const created = await caller.loyalty.createBoost({
      nameJson: { ar: 'ويكند مزدوج', en: 'Double weekend' },
      multiplier: 2,
      startsAt: new Date(Date.now() - 3_600_000).toISOString(),
      endsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    });
    createdBoostIds.push(created.id);
    expect(Number(created.multiplier)).toBe(2);

    const listed = await caller.loyalty.listBoosts();
    expect(listed.some((b: { id: number }) => b.id === created.id)).toBe(true);

    await caller.loyalty.deleteBoost({ id: created.id });
    const after = await caller.loyalty.listBoosts();
    expect(after.some((b: { id: number }) => b.id === created.id)).toBe(false);
  });
});
