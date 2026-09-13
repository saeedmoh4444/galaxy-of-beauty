/**
 * beautyExpenses router tests — summary aggregates over the caller's
 * COMPLETED bookings (this month / last month / this year, category
 * breakdown, 6-month trend). Fresh customers per test keep the math
 * deterministic. (Coverage ratchet target: src/routers/beautyExpenses.ts)
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
  categoryIds: [] as number[],
  serviceIds: [] as number[],
  addressIds: [] as number[],
  bookingIds: [] as number[],
};

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

function authOf(user: { id: number; email: string }, role: 'CUSTOMER' | 'TECHNICIAN'): JwtPayload {
  return { id: user.id, role, email: user.email };
}

async function makeUser(role: 'CUSTOMER' | 'TECHNICIAN' = 'CUSTOMER') {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `expense-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + n) % 89999999))}`,
      name: `Expense Test ${n}`,
      role,
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(user.id);
  return user;
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

// Shared fixtures: technician (user id is what bookings reference), service, address
let techUser: Awaited<ReturnType<typeof makeUser>>;
let categoryId: number;
let serviceId: number;
const SERVICE_TITLE_AR = 'خدمة المصروفات';

async function seedBooking(opts: {
  customerId: number;
  addressId: number;
  status?: string;
  totalAmount?: number;
  createdAt?: Date;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: unique('EXP'),
      customerId: opts.customerId,
      technicianId: techUser.id,
      serviceId,
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

beforeAll(async () => {
  const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
  admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
  const techRow = await prisma.user.findFirstOrThrow({ where: { role: 'TECHNICIAN' } });
  technician = { id: techRow.id, role: 'TECHNICIAN', email: techRow.email };

  techUser = await makeUser('TECHNICIAN');
  const category = await prisma.category.create({
    data: { nameJson: { ar: 'فئة المصروفات', en: 'Expenses Category' }, slug: unique('exp-cat') },
  });
  created.categoryIds.push(category.id);
  categoryId = category.id;
  const service = await prisma.service.create({
    data: {
      categoryId,
      titleJson: { ar: SERVICE_TITLE_AR, en: 'Expenses Service' },
      basePrice: 150,
      durationMin: 60,
      isActive: true,
    },
  });
  created.serviceIds.push(service.id);
  serviceId = service.id;
}, 15000);

describe('beautyExpenses.summary', () => {
  it('rejects anonymous callers', async () => {
    const c = await caller(null);
    await expect(c.beautyExpenses.summary()).rejects.toThrow();
  });

  it('rejects non-customer roles', async () => {
    await expect((await caller(technician)).beautyExpenses.summary()).rejects.toThrow();
    await expect((await caller(admin)).beautyExpenses.summary()).rejects.toThrow();
  });

  it('returns a zeroed aggregate for a customer with no bookings', async () => {
    const { user } = await makeCustomer();
    const s = await (await caller(authOf(user, 'CUSTOMER'))).beautyExpenses.summary();
    expect(s).toMatchObject({
      thisMonthTotal: 0,
      lastMonthTotal: 0,
      thisYearTotal: 0,
      monthOverMonth: 0,
      totalBookingsThisMonth: 0,
      avgPerBooking: 0,
      byCategory: [],
    });
    expect(s.monthlyTrend).toHaveLength(6);
    expect(s.monthlyTrend.every((m: { total: number }) => m.total === 0)).toBe(true);
  });

  it('counts only COMPLETED bookings this month and builds the category/trend breakdown', async () => {
    const { user, addressId } = await makeCustomer();
    const c = await caller(authOf(user, 'CUSTOMER'));

    await seedBooking({ customerId: user.id, addressId, status: 'COMPLETED', totalAmount: 200 });
    await seedBooking({ customerId: user.id, addressId, status: 'COMPLETED', totalAmount: 300 });
    await seedBooking({ customerId: user.id, addressId, status: 'REQUESTED', totalAmount: 999 }); // filtered out

    const s = await c.beautyExpenses.summary();
    expect(s.thisMonthTotal).toBe(500);
    expect(s.totalBookingsThisMonth).toBe(2);
    expect(s.avgPerBooking).toBe(250);
    expect(s.lastMonthTotal).toBe(0);
    expect(s.monthOverMonth).toBe(0);
    expect(s.thisYearTotal).toBe(500);

    // Category breakdown: both bookings land in the single seeded category
    const cat = s.byCategory.find(
      (entry: { categoryId: number }) => entry.categoryId === categoryId,
    );
    expect(cat).toBeDefined();
    expect(cat.total).toBe(500);
    expect(cat.count).toBe(2);
    expect(cat.name).toBe(SERVICE_TITLE_AR);
    // Invariant: breakdown totals always reconcile with the month total
    const breakdownTotal = s.byCategory.reduce(
      (sum: number, entry: { total: number }) => sum + entry.total,
      0,
    );
    expect(breakdownTotal).toBe(s.thisMonthTotal);

    // Trend: exactly 6 months, ascending, current month matches the month total
    expect(s.monthlyTrend).toHaveLength(6);
    expect(s.monthlyTrend[5].total).toBe(500);
    const keys: string[] = s.monthlyTrend.map((m: { month: string }) => m.month);
    expect([...keys].sort()).toEqual(keys);
  });

  it('attributes last-month COMPLETED bookings to lastMonthTotal and the trend', async () => {
    const { user, addressId } = await makeCustomer();
    const c = await caller(authOf(user, 'CUSTOMER'));
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    await seedBooking({
      customerId: user.id,
      addressId,
      status: 'COMPLETED',
      totalAmount: 400,
      createdAt: lastMonthStart,
    });

    const s = await c.beautyExpenses.summary();
    expect(s.lastMonthTotal).toBe(400);
    expect(s.thisMonthTotal).toBe(0);
    // (0 - 400) / 400 * 100 — exact, since lastMonthTotal > 0
    expect(s.monthOverMonth).toBe(-100);
    // Last month is trend index 4 (5 slots back from the current month)
    expect(s.monthlyTrend[4].total).toBe(400);
    const sameYear = lastMonthStart.getFullYear() === now.getFullYear();
    expect(s.thisYearTotal).toBe(sameYear ? 400 : 0);
  });
});

afterAll(async () => {
  if (created.bookingIds.length > 0) {
    await prisma.booking.deleteMany({ where: { id: { in: created.bookingIds } } });
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
