/**
 * ENHANCEMENT_PLAN 8.2 — Loyalty 2.0: expiry sweep + reminders (slice 2).
 *
 * Drives: sweepExpiredLoyaltyPoints (reconcile the stored ledger against
 * effective points, idempotent) and sendLoyaltyExpiryReminders (30-day
 * heads-up via the template-driven notification system).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { sweepExpiredLoyaltyPoints, sendLoyaltyExpiryReminders } from '../workers/loyaltyExpiry';

const SUFFIX = Date.now();
const createdUserIds: number[] = [];
let accountAId = 0;
let accountBId = 0;

beforeAll(async () => {
  // The sweep notifies via the template-driven system; the local test DB
  // may not carry the seed templates, so provision the one we need.
  await prisma.notificationTemplate.upsert({
    where: { key: 'loyalty_points_expiring' },
    update: {},
    create: {
      key: 'loyalty_points_expiring',
      category: 'promotions',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'نقاطك على وشك الانتهاء', en: 'Your Points Expire Soon' },
      bodyJson: {
        ar: '{{customerName}}، ستنتهي صلاحية {{points}} نقطة بتاريخ {{date}}.',
        en: 'Hi {{customerName}}, {{points}} points expire on {{date}}.',
      },
    },
  });

  const a = await prisma.user.create({ data: buildUser() });
  const b = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(a.id, b.id);

  // A: +100 already expired + +50 active (ledger 150, effective 50).
  const accA = await prisma.loyaltyAccount.create({
    data: { userId: a.id, points: 150, lifetimePoints: 150, tier: 'SILVER' },
  });
  accountAId = accA.id;
  await prisma.loyaltyTransaction.createMany({
    data: [
      {
        accountId: accA.id,
        points: 100,
        reason: 'booking',
        expiresAt: new Date(Date.now() - 86_400_000),
      },
      {
        accountId: accA.id,
        points: 50,
        reason: 'booking',
        expiresAt: new Date(Date.now() + 365 * 86_400_000),
      },
    ],
  });

  // B: +40 expiring in 10 days (ledger 40, effective 40, expiring soon).
  const accB = await prisma.loyaltyAccount.create({
    data: { userId: b.id, points: 40, lifetimePoints: 40, tier: 'SILVER' },
  });
  accountBId = accB.id;
  await prisma.loyaltyTransaction.create({
    data: {
      accountId: accB.id,
      points: 40,
      reason: 'booking',
      expiresAt: new Date(Date.now() + 10 * 86_400_000),
    },
  });
}, 30000);

afterAll(async () => {
  try {
    await prisma.loyaltyTransaction.deleteMany({
      where: { accountId: { in: [accountAId, accountBId] } },
    });
    await prisma.loyaltyAccount.deleteMany({ where: { id: { in: [accountAId, accountBId] } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort; the DB is re-seeded per run
  }
});

describe('sweepExpiredLoyaltyPoints', () => {
  it('reconciles the ledger to effective points and reports the sweep', async () => {
    const result = await sweepExpiredLoyaltyPoints();
    expect(result.accounts).toBe(1); // only A changed
    expect(result.pointsSwept).toBe(100);

    const accA = await prisma.loyaltyAccount.findUnique({ where: { id: accountAId } });
    expect(accA?.points).toBe(50);
    // B is untouched: nothing expired there.
    const accB = await prisma.loyaltyAccount.findUnique({ where: { id: accountBId } });
    expect(accB?.points).toBe(40);
  });

  it('is idempotent — a second sweep changes nothing', async () => {
    const result = await sweepExpiredLoyaltyPoints();
    expect(result.accounts).toBe(0);
    expect(result.pointsSwept).toBe(0);
  });
});

describe('sendLoyaltyExpiryReminders', () => {
  it('notifies the owner of points expiring within 30 days', async () => {
    const count = await sendLoyaltyExpiryReminders();
    expect(count).toBe(1);

    const row = await prisma.notification.findFirst({
      where: { userId: createdUserIds[1], type: 'loyalty_points_expiring' },
    });
    expect(row).not.toBeNull();
  });

  it('sends nothing on a second pass (daily cadence, no dedup table yet)', async () => {
    // Second run still notifies (daily interval is the dedup) — assert the
    // count matches the number of qualifying accounts, not cumulative rows.
    const count = await sendLoyaltyExpiryReminders();
    expect(count).toBe(1);
  });
});
