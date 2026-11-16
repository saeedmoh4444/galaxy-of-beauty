/**
 * W4-1 — the pro-tools page rendered FABRICATED financials to real
 * technicians (nonexistent procedures + hardcoded numbers: 45 customers,
 * SAR 8,500 revenue, 4.8 rating, expenses 3,200, points 2,500, a fake
 * persona badge). These tests pin the REAL data contracts:
 *
 *  - technicianPerformance.myStats returns customer/revenue/gallery
 *    metrics computed from actual bookings (never fallback fiction).
 *  - technicianPerformance.pricingSuggestion derives from the real
 *    dynamic-pricing engine (never a hardcoded suggestion).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, safeFutureDate } from './factories';
import type { JwtPayload } from '../lib/jwt';

async function caller(user: JwtPayload) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdAddressIds: number[] = [];
const createdGalleryIds: number[] = [];
let techUser: JwtPayload;
let serviceId: number;
let techProfileId: number;

function monthStart(monthsAgo: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
}

async function makeBooking(opts: {
  customerId: number;
  addressId: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
}): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `TP-${crypto.randomUUID().slice(0, 8)}`,
      customerId: opts.customerId,
      technicianId: techUser.id,
      serviceId,
      addressId: opts.addressId,
      startAt: safeFutureDate(3),
      endAt: new Date(safeFutureDate(3).getTime() + 3_600_000),
      status: opts.status,
      totalAmount: opts.totalAmount,
      createdAt: opts.createdAt,
    },
  });
  createdBookingIds.push(booking.id);
  return booking.id;
}

beforeAll(async () => {
  const tu = await prisma.user.create({
    data: buildUser({ role: 'TECHNICIAN', name: 'فنية الأداء' }),
  });
  createdUserIds.push(tu.id);
  techUser = { id: tu.id, role: 'TECHNICIAN', email: tu.email };
  const profile = await prisma.technician.create({
    data: {
      userId: tu.id,
      city: 'الرياض',
      yearsOfExperience: 6,
      ratingAvg: 4.7,
      bioJson: { ar: 'ملف اختبار', en: 'Test profile' },
    },
  });
  techProfileId = profile.id;

  const svc = await prisma.service.findFirst({ where: { isActive: true } });
  if (!svc) throw new Error('No seeded service');
  serviceId = svc.id;

  // Customers: A = regular (this month + last month), B = new this month,
  // C = cancelled-only.
  const [a, b, c] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdUserIds.push(a.id, b.id, c.id);

  const [addrA, addrB, addrC] = await Promise.all([
    prisma.address.create({
      data: { userId: a.id, label: 'بيت أ', city: 'الرياض', area: 'أ', street: 'شارع أ' },
    }),
    prisma.address.create({
      data: { userId: b.id, label: 'بيت ب', city: 'الرياض', area: 'ب', street: 'شارع ب' },
    }),
    prisma.address.create({
      data: { userId: c.id, label: 'بيت ج', city: 'الرياض', area: 'ج', street: 'شارع ج' },
    }),
  ]);
  createdAddressIds.push(addrA.id, addrB.id, addrC.id);

  // A: one completed LAST month (regulars anchor) + one completed THIS month.
  await makeBooking({
    customerId: a.id,
    addressId: addrA.id,
    status: 'COMPLETED',
    totalAmount: 200,
    createdAt: monthStart(1),
  });
  await makeBooking({
    customerId: a.id,
    addressId: addrA.id,
    status: 'COMPLETED',
    totalAmount: 300,
    createdAt: monthStart(0),
  });
  // B: new customer, one completed THIS month.
  await makeBooking({
    customerId: b.id,
    addressId: addrB.id,
    status: 'COMPLETED',
    totalAmount: 150,
    createdAt: monthStart(0),
  });
  // C: cancelled booking last month — counts in totalBookings, not revenue.
  await makeBooking({
    customerId: c.id,
    addressId: addrC.id,
    status: 'CANCELLED',
    totalAmount: 999,
    createdAt: monthStart(1),
  });

  const [g1, g2, g3] = await Promise.all([
    prisma.galleryImage.create({ data: { technicianId: tu.id, imageUrl: '/g/1.jpg' } }),
    prisma.galleryImage.create({ data: { technicianId: tu.id, imageUrl: '/g/2.jpg' } }),
    prisma.galleryImage.create({ data: { technicianId: tu.id, imageUrl: '/g/3.jpg' } }),
  ]);
  createdGalleryIds.push(g1.id, g2.id, g3.id);
}, 30000);

afterAll(async () => {
  await prisma.galleryImage.deleteMany({ where: { id: { in: createdGalleryIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.address.deleteMany({ where: { id: { in: createdAddressIds } } });
  await prisma.technician.deleteMany({ where: { id: techProfileId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('technicianPerformance.myStats — real data (W4-1)', () => {
  it('computes customer metrics from actual bookings', async () => {
    const c = await caller(techUser);
    const stats = await c.technicianPerformance.myStats();

    expect(stats).not.toBeNull();
    expect(stats.totalBookings).toBe(4);
    expect(stats.totalCustomers).toBe(3);
    expect(stats.regularCustomers).toBe(1); // only A has ≥2 bookings
    expect(stats.newThisMonth).toBe(1); // only B's first booking is this month
    expect(stats.avgRating).toBe(4.7);
  });

  it('computes monthly revenue from completed bookings only', async () => {
    const c = await caller(techUser);
    const stats = await c.technicianPerformance.myStats();

    // This month: A 300 + B 150 = 450. C's cancelled 999 is excluded.
    expect(stats.monthlyRevenue).toBe(450);
  });

  it('counts the technician gallery photos', async () => {
    const c = await caller(techUser);
    const stats = await c.technicianPerformance.myStats();
    expect(stats.galleryPhotos).toBe(3);
  });

  it('earnings.summary exposes real fees (the expense line)', async () => {
    const payout = await prisma.payout.create({
      data: {
        technicianId: techUser.id,
        vendorId: null,
        amount: 450,
        fee: 67.5,
        periodStart: monthStart(0),
        periodEnd: new Date(),
        status: 'COMPLETED',
      },
    });
    const c = await caller(techUser);
    const summary = await c.technicianEarnings.summary();
    expect(summary.thisMonth).toBe(450);
    expect(summary.feesThisMonth).toBe(67.5);
    await prisma.payout.delete({ where: { id: payout.id } });
  });

  it('pricingSuggestion derives from the real engine (never hardcoded)', async () => {
    const c = await caller(techUser);
    const suggestion = await c.technicianPerformance.pricingSuggestion();

    expect(suggestion).not.toBeNull();
    // The top service is the seeded one we booked 4 times.
    expect(suggestion.serviceId).toBe(serviceId);
    // Engine math: base × tier multiplier × applicable peak rules.
    expect(suggestion.suggestedPrice).toBeGreaterThanOrEqual(suggestion.currentPrice);
    expect(suggestion.currentPrice).toBeGreaterThan(0);
    // demand is derived from booking counts, one of the enum values.
    expect(['low', 'medium', 'high']).toContain(suggestion.demand);
  });
});
