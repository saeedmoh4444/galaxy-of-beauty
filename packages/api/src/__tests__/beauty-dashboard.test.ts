/**
 * beautyDashboard router tests — the customer overview aggregating
 * bookings (capped/ordered), streak, wallet, skin analysis, journal and
 * wishlist. Fresh customers per test keep every count deterministic.
 * (Coverage ratchet target: src/routers/beautyDashboard.ts)
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
  streakIds: [] as number[],
  skinIds: [] as number[],
  journalIds: [] as number[],
  wishlistIds: [] as number[],
  categoryIds: [] as number[],
  serviceIds: [] as number[],
  addressIds: [] as number[],
  bookingIds: [] as number[],
};

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'CUSTOMER' | 'TECHNICIAN' = 'CUSTOMER') {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `dash-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Date.now() + n) % 89999999))}`,
      name: `Dashboard Test ${n}`,
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

// Shared fixtures: technician (user id), service, address
let techUser: Awaited<ReturnType<typeof makeUser>>;
let serviceId: number;
const SERVICE_TITLE_AR = 'خدمة اللوحة';

async function seedBooking(opts: {
  customerId: number;
  addressId: number;
  status: string;
  createdAt: Date;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: unique('DASH'),
      customerId: opts.customerId,
      technicianId: techUser.id,
      serviceId,
      addressId: opts.addressId,
      startAt: new Date(Date.now() + 86_400_000),
      endAt: new Date(Date.now() + 86_400_000 + 3_600_000),
      status: opts.status,
      totalAmount: 200,
      platformFee: 0,
      paymentFee: 0,
      cashHandlingFee: 0,
      createdAt: opts.createdAt,
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
    data: { nameJson: { ar: 'فئة اللوحة', en: 'Dashboard Category' }, slug: unique('dash-cat') },
  });
  created.categoryIds.push(category.id);
  const service = await prisma.service.create({
    data: {
      categoryId: category.id,
      titleJson: { ar: SERVICE_TITLE_AR, en: 'Dashboard Service' },
      basePrice: 150,
      durationMin: 60,
      isActive: true,
    },
  });
  created.serviceIds.push(service.id);
  serviceId = service.id;
}, 15000);

describe('beautyDashboard.overview', () => {
  it('rejects anonymous callers and non-customer roles', async () => {
    const anon = await caller(null);
    await expect(anon.beautyDashboard.overview()).rejects.toThrow();
    await expect((await caller(technician)).beautyDashboard.overview()).rejects.toThrow();
    await expect((await caller(admin)).beautyDashboard.overview()).rejects.toThrow();
  });

  it('returns a zeroed overview for a fresh customer', async () => {
    const { user } = await makeCustomer();
    const o = await (await caller(authOf(user))).beautyDashboard.overview();
    expect(o).toEqual({
      upcomingBookings: 0,
      completedBookings: 0,
      streakDays: 0,
      walletBalance: 0,
      bonusBalance: 0,
      skinType: null,
      skinConcerns: [],
      journalCount: 0,
      wishlistCount: 0,
      recentBookings: [],
    });
  });

  it('reflects wallet, streak, skin analysis, journal and wishlist data', async () => {
    const { user } = await makeCustomer();
    const wallet = await prisma.wallet.create({
      data: { userId: user.id, balance: 123.45, bonusBalance: 10 },
    });
    created.walletIds.push(wallet.id);
    const streak = await prisma.streak.create({
      data: { customerId: user.id, currentStreak: 4, longestStreak: 6 },
    });
    created.streakIds.push(streak.id);
    const skin = await prisma.skinAnalysis.create({
      data: {
        userId: user.id,
        imageUrl: 'https://example.com/skin.jpg',
        skinType: 'oily',
        concerns: ['acne', 'redness'],
        resultJson: { skinType: 'oily', concerns: ['acne', 'redness'] },
      },
    });
    created.skinIds.push(skin.id);
    const journal = await prisma.beautyJournal.create({
      data: { userId: user.id, content: 'يوم رائع', mood: 5 },
    });
    created.journalIds.push(journal.id);
    const wishlist = await prisma.wishlistItem.create({
      data: { userId: user.id, serviceId },
    });
    created.wishlistIds.push(wishlist.id);

    const o = await (await caller(authOf(user))).beautyDashboard.overview();
    expect(o.streakDays).toBe(4);
    expect(o.walletBalance).toBe(123.45);
    expect(o.bonusBalance).toBe(10);
    expect(o.skinType).toBe('oily');
    expect(o.skinConcerns).toEqual(['acne', 'redness']);
    expect(o.journalCount).toBe(1);
    expect(o.wishlistCount).toBe(1);
  });

  it('categorizes the capped booking window: upcoming vs completed, newest first', async () => {
    const { user, addressId } = await makeCustomer();
    const now = Date.now();
    // 5 bookings total (fills the SMALL_PAGE_SIZE window exactly)
    const ids = {
      newest: await seedBooking({
        customerId: user.id,
        addressId,
        status: 'REQUESTED',
        createdAt: new Date(now),
      }),
      accepted: await seedBooking({
        customerId: user.id,
        addressId,
        status: 'ACCEPTED',
        createdAt: new Date(now - 60_000),
      }),
      completed: await seedBooking({
        customerId: user.id,
        addressId,
        status: 'COMPLETED',
        createdAt: new Date(now - 120_000),
      }),
      cancelledA: await seedBooking({
        customerId: user.id,
        addressId,
        status: 'CANCELLED',
        createdAt: new Date(now - 180_000),
      }),
      cancelledB: await seedBooking({
        customerId: user.id,
        addressId,
        status: 'CANCELLED',
        createdAt: new Date(now - 240_000),
      }),
    };

    const o = await (await caller(authOf(user))).beautyDashboard.overview();
    expect(o.upcomingBookings).toBe(2); // REQUESTED + ACCEPTED
    expect(o.completedBookings).toBe(1);
    expect(o.recentBookings).toHaveLength(3);
    expect(o.recentBookings.map((b: { id: number }) => b.id)).toEqual([
      ids.newest,
      ids.accepted,
      ids.completed,
    ]);
    expect(o.recentBookings[0].serviceName).toBe(SERVICE_TITLE_AR);
    expect(o.recentBookings[0].status).toBe('REQUESTED');
    expect(o.recentBookings[2].status).toBe('COMPLETED');
    const dates: number[] = o.recentBookings.map((b: { date: Date }) => b.date.getTime());
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
  });
});

afterAll(async () => {
  if (created.bookingIds.length > 0) {
    await prisma.booking.deleteMany({ where: { id: { in: created.bookingIds } } });
  }
  if (created.wishlistIds.length > 0) {
    await prisma.wishlistItem.deleteMany({ where: { id: { in: created.wishlistIds } } });
  }
  if (created.journalIds.length > 0) {
    await prisma.beautyJournal.deleteMany({ where: { id: { in: created.journalIds } } });
  }
  if (created.skinIds.length > 0) {
    await prisma.skinAnalysis.deleteMany({ where: { id: { in: created.skinIds } } });
  }
  if (created.streakIds.length > 0) {
    await prisma.streak.deleteMany({ where: { id: { in: created.streakIds } } });
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
