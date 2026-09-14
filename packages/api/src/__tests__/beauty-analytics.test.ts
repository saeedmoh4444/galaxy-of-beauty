/**
 * beautyAnalytics router tests — summary (counts/spend/recent credits),
 * byCategory grouping, and the 6-month monthlyTrend. Fresh customers per
 * test keep every assertion deterministic.
 * (Coverage ratchet target: src/routers/beautyAnalytics.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let technician: JwtPayload;

let uid = 0;
const unique = (prefix: string) => `${prefix}-${Date.now()}-${uid++}`;

const created = {
  userIds: [] as number[],
  walletIds: [] as number[],
  categoryIds: [] as number[],
  serviceIds: [] as number[],
  addressIds: [] as number[],
  bookingIds: [] as number[],
  paymentIds: [] as number[],
  txIds: [] as number[],
};

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'CUSTOMER' | 'TECHNICIAN' = 'CUSTOMER') {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `analytics-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + n) % 89999999))}`,
      name: `Analytics Test ${n}`,
      role,
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(user.id);
  return user;
}

function authOf(user: { id: number; email: string }): JwtPayload {
  return { id: user.id, role: 'CUSTOMER', email: user.email };
}

async function makeCustomer() {
  const user = await makeUser('CUSTOMER');
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: 'Home',
      city: 'الرياض',
      area: 'العليا',
      street: 'الشارع العام',
    },
  });
  created.addressIds.push(address.id);
  return { user, addressId: address.id };
}

async function makeWallet(userId: number) {
  const wallet = await prisma.wallet.create({ data: { userId, balance: 0, bonusBalance: 0 } });
  created.walletIds.push(wallet.id);
  return wallet;
}

// Shared fixtures: technician (user id), two categories + services, address
let techUser: Awaited<ReturnType<typeof makeUser>>;
const serviceFixture = new Map<string, { id: number; catId: number; titleAr: string }>();

async function seedService(prefix: string, titleAr: string) {
  const category = await prisma.category.create({
    data: { nameJson: { ar: titleAr, en: prefix }, slug: unique(`${prefix}-cat`) },
  });
  created.categoryIds.push(category.id);
  const service = await prisma.service.create({
    data: {
      categoryId: category.id,
      titleJson: { ar: titleAr, en: prefix },
      basePrice: 150,
      durationMin: 60,
      isActive: true,
    },
  });
  created.serviceIds.push(service.id);
  serviceFixture.set(prefix, { id: service.id, catId: category.id, titleAr });
  return service;
}

async function seedBooking(opts: {
  customerId: number;
  addressId: number;
  serviceId: number;
  status?: string;
  totalAmount?: number;
  createdAt?: Date;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: unique('ANA'),
      customerId: opts.customerId,
      technicianId: techUser.id,
      serviceId: opts.serviceId,
      addressId: opts.addressId,
      startAt: new Date(Date.now() + 86_400_000),
      endAt: new Date(Date.now() + 86_400_000 + 3_600_000),
      status: opts.status ?? 'COMPLETED',
      totalAmount: opts.totalAmount ?? 200,
      platformFee: 0,
      paymentFee: 0,
      cashHandlingFee: 0,
      createdAt: opts.createdAt ?? new Date(),
    },
  });
  created.bookingIds.push(booking.id);
  return booking.id;
}

async function seedCapturedPayment(bookingId: number, amount: number) {
  const payment = await prisma.payment.create({
    data: { bookingId, amount, status: 'CAPTURED' },
  });
  created.paymentIds.push(payment.id);
  return payment;
}

async function seedCredit(walletId: number, amount: number, createdAt: Date) {
  const tx = await prisma.walletTransaction.create({
    data: { walletId, type: 'CREDIT', source: 'CASHBACK', amount, createdAt },
  });
  created.txIds.push(tx.id);
  return tx;
}

beforeAll(async () => {
  const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
  admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
  const techRow = await prisma.user.findFirstOrThrow({ where: { role: 'TECHNICIAN' } });
  technician = { id: techRow.id, role: 'TECHNICIAN', email: techRow.email };

  techUser = await makeUser('TECHNICIAN');
  await seedService('hair', 'العناية بالشعر');
  await seedService('skin', 'العناية بالبشرة');
}, 15000);

describe('beautyAnalytics router', () => {
  it('rejects anonymous callers and non-customer roles', async () => {
    const anon = await caller(null);
    await expect(anon.beautyAnalytics.summary()).rejects.toThrow();
    await expect(anon.beautyAnalytics.byCategory()).rejects.toThrow();
    await expect(anon.beautyAnalytics.monthlyTrend()).rejects.toThrow();

    await expect((await caller(technician)).beautyAnalytics.summary()).rejects.toThrow();
    await expect((await caller(admin)).beautyAnalytics.byCategory()).rejects.toThrow();
  });

  it('returns a zeroed summary for a fresh customer', async () => {
    const { user } = await makeCustomer();
    const s = await (await caller(authOf(user))).beautyAnalytics.summary();
    expect(s).toEqual({
      totalBookings: 0,
      completedBookings: 0,
      completionRate: 0,
      totalSpent: 0,
      recentCredits: [],
    });
    expect(await (await caller(authOf(user))).beautyAnalytics.byCategory()).toEqual([]);
    expect(await (await caller(authOf(user))).beautyAnalytics.monthlyTrend()).toEqual([]);
  });

  it('aggregates bookings, completion rate and captured spend', async () => {
    const { user, addressId } = await makeCustomer();
    const hair = serviceFixture.get('hair')!;

    const b1 = await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'COMPLETED',
      totalAmount: 200,
    });
    await seedCapturedPayment(b1, 200);
    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'REQUESTED',
      totalAmount: 100,
    });

    const s = await (await caller(authOf(user))).beautyAnalytics.summary();
    expect(s.totalBookings).toBe(2);
    expect(s.completedBookings).toBe(1);
    expect(s.completionRate).toBe(50);
    expect(s.totalSpent).toBe(200);
    expect(s.recentCredits).toEqual([]);
  });

  it('caps recent credits at the small page size, newest first', async () => {
    const { user } = await makeCustomer();
    const wallet = await makeWallet(user.id);
    const base = Date.now() - 24 * 3600_000;
    for (let i = 1; i <= 7; i++) {
      await seedCredit(wallet.id, i, new Date(base + i * 60_000));
    }

    const s = await (await caller(authOf(user))).beautyAnalytics.summary();
    expect(s.recentCredits).toHaveLength(5); // SMALL_PAGE_SIZE
    const amounts: number[] = s.recentCredits.map((c: { amount: number }) => c.amount);
    expect(amounts).toEqual([7, 6, 5, 4, 3]);
    const dates: number[] = s.recentCredits.map((c: { date: Date }) => c.date.getTime());
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
    for (const credit of s.recentCredits) {
      expect(credit.source).toBe('CASHBACK');
    }
  });

  it('groups completed bookings by category with reconciling percentages', async () => {
    const { user, addressId } = await makeCustomer();
    const hair = serviceFixture.get('hair')!;
    const skin = serviceFixture.get('skin')!;

    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'COMPLETED',
      totalAmount: 200,
    });
    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'COMPLETED',
      totalAmount: 300,
    });
    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: skin.id,
      status: 'COMPLETED',
      totalAmount: 100,
    });
    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: skin.id,
      status: 'REQUESTED',
      totalAmount: 500,
    }); // excluded

    const rows = await (await caller(authOf(user))).beautyAnalytics.byCategory();
    expect(rows).toHaveLength(2);
    const hairRow = rows.find((r: { category: string }) => r.category === hair.titleAr);
    const skinRow = rows.find((r: { category: string }) => r.category === skin.titleAr);
    expect(hairRow).toMatchObject({ count: 2, spent: 500, pct: 67 });
    expect(skinRow).toMatchObject({ count: 1, spent: 100, pct: 33 });

    // Invariants: counts/spent/pct always reconcile with the total
    const totalCount = rows.reduce((sum: number, r: { count: number }) => sum + r.count, 0);
    const totalSpent = rows.reduce((sum: number, r: { spent: number }) => sum + r.spent, 0);
    const totalPct = rows.reduce((sum: number, r: { pct: number }) => sum + r.pct, 0);
    expect(totalCount).toBe(3);
    expect(totalSpent).toBe(600);
    expect(totalPct).toBe(100);
  });

  it('builds a monthly booking trend across the six-month window', async () => {
    const { user, addressId } = await makeCustomer();
    const hair = serviceFixture.get('hair')!;
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 15);

    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'COMPLETED',
      createdAt: monthAgo,
    });
    await seedBooking({
      customerId: user.id,
      addressId,
      serviceId: hair.id,
      status: 'REQUESTED',
      createdAt: threeMonthsAgo,
    });

    const trend = await (await caller(authOf(user))).beautyAnalytics.monthlyTrend();
    expect(trend).toHaveLength(2);
    expect(trend.every((m: { count: number }) => m.count === 1)).toBe(true);
    expect(trend.reduce((sum: number, m: { count: number }) => sum + m.count, 0)).toBe(2);
    for (const entry of trend) {
      expect(typeof entry.month).toBe('string');
      expect(entry.month.length).toBeGreaterThan(0);
    }
  });
});

afterAll(async () => {
  if (created.paymentIds.length > 0) {
    await prisma.payment.deleteMany({ where: { id: { in: created.paymentIds } } });
  }
  if (created.bookingIds.length > 0) {
    await prisma.booking.deleteMany({ where: { id: { in: created.bookingIds } } });
  }
  if (created.txIds.length > 0) {
    await prisma.walletTransaction.deleteMany({ where: { id: { in: created.txIds } } });
  }
  if (created.walletIds.length > 0) {
    await prisma.wallet.deleteMany({ where: { id: { in: created.walletIds } } });
  }
  if (created.addressIds.length > 0) {
    await prisma.address.deleteMany({ where: { id: { in: created.addressIds } } });
  }
  if (created.serviceIds.length > 0) {
    await prisma.service.deleteMany({ where: { id: { in: created.serviceIds } } });
  }
  if (created.categoryIds.length > 0) {
    await prisma.category.deleteMany({ where: { id: { in: created.categoryIds } } });
  }
  if (created.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
  }
});
