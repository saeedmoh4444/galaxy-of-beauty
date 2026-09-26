/**
 * ENHANCEMENT_PLAN 8.3 — slice B: 30-day inactivity re-engagement.
 *
 * Drives: User.lastReengagementAt (throttle marker), the pure inactivity
 * helper, and the daily re-engagement sweep — "we miss you" + free add-on
 * nudge for customers with no booking in 30 days, at most once a month.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { isInactiveFor, sendReengagementEmails } from '../workers/reengagement';

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
let recentBookingUserId = 0;
let neverBookedUserId = 0;
let throttledUserId = 0;
let staleUserId = 0;

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

beforeAll(async () => {
  await prisma.notificationTemplate.upsert({
    where: { key: 'reengagement_30d' },
    update: {},
    create: {
      key: 'reengagement_30d',
      category: 'promotions',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'اشتقنا لكِ', en: 'We Miss You' },
      bodyJson: { ar: '{{customerName}}', en: '{{customerName}}' },
    },
  });

  const tech = await prisma.technician.findFirst({ select: { userId: true } });
  const service = await prisma.service.findFirst({ select: { id: true } });
  const address = await prisma.address.findFirst({ select: { id: true } });

  const mkUser = async (data: Record<string, unknown> = {}) => {
    const u = await prisma.user.create({ data: { ...buildUser(), ...data } });
    createdUserIds.push(u.id);
    return u;
  };

  // Recent booking (2 days ago) → must be skipped.
  const recent = await mkUser();
  recentBookingUserId = recent.id;
  const b1 = await prisma.booking.create({
    data: {
      bookingCode: `RE-${Date.now()}-1`,
      customerId: recent.id,
      technicianId: tech?.userId ?? 1,
      serviceId: service?.id ?? 1,
      addressId: address?.id ?? 1,
      startAt: daysAgo(2),
      endAt: new Date(daysAgo(2).getTime() + 3_600_000),
      status: 'COMPLETED',
      totalAmount: 100,
      platformFee: 0,
      paymentFee: 0,
      cashHandlingFee: 0,
      idempotencyKey: `re-${Date.now()}-1`,
    },
  });
  createdBookingIds.push(b1.id);

  // Never booked, never re-engaged → must receive.
  const never = await mkUser();
  neverBookedUserId = never.id;

  // Re-engaged 10 days ago (throttle) → skip.
  const throttled = await mkUser({ lastReengagementAt: daysAgo(10) });
  throttledUserId = throttled.id;

  // Re-engaged 40 days ago, still inactive → receive again.
  const stale = await mkUser({ lastReengagementAt: daysAgo(40) });
  staleUserId = stale.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('isInactiveFor', () => {
  it('returns true without any booking', () => {
    expect(isInactiveFor(null, 30, new Date())).toBe(true);
  });

  it('returns true when the last booking is older than the window', () => {
    expect(isInactiveFor(daysAgo(31), 30, new Date())).toBe(true);
  });

  it('returns false when the last booking is inside the window', () => {
    expect(isInactiveFor(daysAgo(2), 30, new Date())).toBe(false);
  });
});

describe('sendReengagementEmails', () => {
  it('notifies inactive members and respects the monthly throttle', async () => {
    // Note: the sweep may also match other seeded customers in the DB, so
    // assert per-fixture behavior, never a global count.
    const count = await sendReengagementEmails();
    expect(count).toBeGreaterThanOrEqual(2);

    for (const id of [neverBookedUserId, staleUserId]) {
      const row = await prisma.notification.findFirst({
        where: { userId: id, type: 'reengagement_30d' },
      });
      expect(row).not.toBeNull();
    }
    for (const id of [recentBookingUserId, throttledUserId]) {
      const row = await prisma.notification.findFirst({
        where: { userId: id, type: 'reengagement_30d' },
      });
      expect(row).toBeNull();
    }

    // Throttle markers were written.
    const never = await prisma.user.findUnique({ where: { id: neverBookedUserId } });
    expect(never?.lastReengagementAt).not.toBeNull();

    // Second pass: my two recipients stay at one notification each.
    await sendReengagementEmails();
    for (const id of [neverBookedUserId, staleUserId]) {
      const rows = await prisma.notification.count({
        where: { userId: id, type: 'reengagement_30d' },
      });
      expect(rows).toBe(1);
    }
  });
});
