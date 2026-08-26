/**
 * Worker handler tests — the BullMQ job handlers (wallet cashback,
 * loyalty points, notifications, integration sync) without spawning
 * real workers. Handlers live in workers/handlers.ts precisely so
 * these tests don't need Redis/BullMQ side effects.
 * (Coverage ratchet target: src/workers)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import {
  handleWalletJob,
  handleLoyaltyJob,
  handleNotificationJob,
  handleIntegrationJob,
} from '../workers/handlers';
import { buildUser, buildWallet } from './factories';

function job<T>(data: T): Job<T> {
  return { data } as Job<T>;
}

const userIds: number[] = [];
const accountIds: number[] = [];

async function createUser(): Promise<number> {
  const user = await prisma.user.create({ data: buildUser() });
  userIds.push(user.id);
  return user.id;
}

beforeAll(async () => {
  // Warm the connection pool so per-test timing isn't skewed by setup.
  await prisma.$queryRaw`SELECT 1`;
});

afterAll(async () => {
  const now = Date.now();
  await prisma.walletTransaction.deleteMany({
    where: { idempotencyKey: { startsWith: `wtest-${now}` } },
  });
  await prisma.loyaltyTransaction.deleteMany({
    where: { accountId: { in: accountIds } },
  });
  await prisma.loyaltyAccount.deleteMany({ where: { id: { in: accountIds } } });
  await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
});

// ── Wallet cashback ─────────────────────────────────────────

describe('handleWalletJob', () => {
  it('credits bonus balance and records a transaction', async () => {
    const userId = await createUser();
    const wallet = await prisma.wallet.create({ data: buildWallet({ userId }) });
    const idem = `wtest-${Date.now()}-cashback-1`;

    await handleWalletJob(job({ userId, bookingId: 9001, amount: 25.5, idempotencyKey: idem }));

    const updated = await prisma.wallet.findUnique({ where: { userId } });
    expect(Number(updated?.bonusBalance)).toBe(25.5);

    const txn = await prisma.walletTransaction.findFirst({ where: { idempotencyKey: idem } });
    expect(txn).toBeTruthy();
    expect(txn?.walletId).toBe(wallet.id);
    expect(txn?.type).toBe('CREDIT');
    expect(txn?.source).toBe('CASHBACK');
    expect(txn?.referenceId).toBe('booking_9001');
  });

  it('derives an idempotency key from the booking when none is given', async () => {
    const userId = await createUser();
    await prisma.wallet.create({ data: buildWallet({ userId }) });

    await handleWalletJob(job({ userId, bookingId: 9002, amount: 10 }));

    const txn = await prisma.walletTransaction.findFirst({
      where: { referenceId: 'booking_9002' },
    });
    expect(txn?.idempotencyKey).toBe('cashback_9002');
  });

  it('throws when the user has no wallet', async () => {
    const userId = await createUser();
    await expect(handleWalletJob(job({ userId, bookingId: 9003, amount: 10 }))).rejects.toThrow(
      `Wallet not found for user ${userId}`,
    );
  });
});

// ── Loyalty points ──────────────────────────────────────────

describe('handleLoyaltyJob', () => {
  it('creates a SILVER account when none exists and awards points', async () => {
    const userId = await createUser();

    await handleLoyaltyJob(job({ userId, bookingId: 9101, points: 50, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.points).toBe(50);
    expect(account?.lifetimePoints).toBe(50);
    expect(account?.tier).toBe('SILVER');

    const txn = await prisma.loyaltyTransaction.findFirst({
      where: { accountId: account!.id },
    });
    expect(txn?.points).toBe(50);
    expect(txn?.referenceId).toBe('booking_9101');
  });

  it('adds to an existing account without resetting lifetime', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 100, lifetimePoints: 400, tier: 'SILVER' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9102, points: 50, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.points).toBe(150);
    expect(account?.lifetimePoints).toBe(450);
    expect(account?.tier).toBe('SILVER');
  });

  it('promotes to GOLD at 500 lifetime points', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 490, tier: 'SILVER' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9103, points: 20, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.tier).toBe('GOLD');
    expect(account?.lifetimePoints).toBe(510);
  });

  it('promotes to PLATINUM at 2000 lifetime points', async () => {
    const userId = await createUser();
    await prisma.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 1990, tier: 'GOLD' },
    });

    await handleLoyaltyJob(job({ userId, bookingId: 9104, points: 15, reason: 'booking_reward' }));

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    accountIds.push(account!.id);
    expect(account?.tier).toBe('PLATINUM');
  });
});

// ── Notifications ───────────────────────────────────────────

describe('handleNotificationJob', () => {
  it('creates an in-app notification with localized content', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'BOOKING_CONFIRMED',
        titleAr: 'تم تأكيد الحجز',
        titleEn: 'Booking confirmed',
        bodyAr: 'حجزك مؤكد',
        bodyEn: 'Your booking is confirmed',
        channels: ['push'],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'BOOKING_CONFIRMED' },
    });
    expect(notif).toBeTruthy();
    expect(notif?.titleJson).toEqual({ ar: 'تم تأكيد الحجز', en: 'Booking confirmed' });
    expect(notif?.sentVia).toEqual(['push']);
  });

  it('defaults sentVia to in_app when channels is empty', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'SYSTEM',
        titleAr: 'تنبيه',
        titleEn: 'Notice',
        bodyAr: 'رسالة',
        bodyEn: 'Message',
        channels: [],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'SYSTEM' },
    });
    expect(notif?.sentVia).toEqual(['in_app']);
  });

  it('records all requested channels', async () => {
    const userId = await createUser();

    await handleNotificationJob(
      job({
        userId,
        type: 'PROMO',
        titleAr: 'عرض',
        titleEn: 'Offer',
        bodyAr: 'خصم',
        bodyEn: 'Discount',
        channels: ['email', 'sms', 'push'],
      }),
    );

    const notif = await prisma.notification.findFirst({
      where: { userId, type: 'PROMO' },
    });
    expect(notif?.sentVia).toEqual(['email', 'sms', 'push']);
  });
});

// ── Integration sync (calendar stub) ────────────────────────

describe('handleIntegrationJob', () => {
  it('logs without throwing for all actions', async () => {
    await expect(
      handleIntegrationJob(job({ technicianId: 7, bookingId: 9201, action: 'create' })),
    ).resolves.toBeUndefined();
    await expect(
      handleIntegrationJob(job({ technicianId: 7, bookingId: 9201, action: 'delete' })),
    ).resolves.toBeUndefined();
  });
});
