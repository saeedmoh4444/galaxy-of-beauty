/**
 * featuredTech router tests — public "current" spotlight (highest rating)
 * and "past" carousel (newest, minus the current spotlight). Public
 * procedures: called without a user. Fresh technicians tagged with a
 * recognizable bio marker are cleaned up (including leftovers from
 * crashed runs) to keep assertions deterministic.
 * (Coverage ratchet target: src/routers/featuredTech.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

const ARTIFACT_MARKER = 'FEATURED-TEST-ARTIFACT';

let uid = 0;
const unique = (prefix: string) => `${prefix}-${Date.now()}-${uid++}`;

const created = {
  userIds: [] as number[],
  techIds: [] as number[],
  categoryIds: [] as number[],
  serviceIds: [] as number[],
  addressIds: [] as number[],
  bookingIds: [] as number[],
};

async function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

async function makeTech(opts: { ratingAvg?: number; createdAt?: Date } = {}) {
  const n = ++uid;
  const user = await prisma.user.create({
    data: {
      email: `featured-${Date.now()}-${n}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + n) % 89999999))}`,
      name: `Featured Test ${n}`,
      role: 'TECHNICIAN',
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(user.id);
  const tech = await prisma.technician.create({
    data: {
      userId: user.id,
      city: 'الرياض',
      bioJson: { ar: ARTIFACT_MARKER, en: ARTIFACT_MARKER },
      ratingAvg: opts.ratingAvg ?? 4.0,
      createdAt: opts.createdAt,
    },
  });
  created.techIds.push(tech.id);
  return { user, tech };
}

// Shared fixtures for bookings (a booking requires service + address)
let categoryId: number;
let serviceId: number;
let addressId: number;

async function seedCompletedBooking(technicianUserId: number, customerUserId: number) {
  const booking = await prisma.booking.create({
    data: {
      bookingCode: unique('FEAT'),
      customerId: customerUserId,
      technicianId: technicianUserId,
      serviceId,
      addressId,
      startAt: new Date(Date.now() + 86_400_000),
      endAt: new Date(Date.now() + 86_400_000 + 3_600_000),
      status: 'COMPLETED',
      totalAmount: 200,
      platformFee: 0,
      paymentFee: 0,
      cashHandlingFee: 0,
    },
  });
  created.bookingIds.push(booking.id);
  return booking;
}

beforeAll(async () => {
  // Remove artifacts left behind by previous crashed runs of this file
  const leftovers = await prisma.technician.findMany({
    where: { bioJson: { path: ['en'], equals: ARTIFACT_MARKER } },
    select: { userId: true },
  });
  if (leftovers.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: leftovers.map((l) => l.userId) } } });
  }

  const category = await prisma.category.create({
    data: { nameJson: { ar: 'فئة مميزة', en: 'Featured Category' }, slug: unique('feat-cat') },
  });
  created.categoryIds.push(category.id);
  categoryId = category.id;
  const service = await prisma.service.create({
    data: {
      categoryId,
      titleJson: { ar: 'خدمة مميزة', en: 'Featured Service' },
      basePrice: 150,
      durationMin: 60,
      isActive: true,
    },
  });
  created.serviceIds.push(service.id);
  serviceId = service.id;

  // Address belongs to a throwaway customer that is never a booking customer
  const addressOwner = await prisma.user.create({
    data: {
      email: `featured-addr-${Date.now()}@example.com`,
      phone: `+9665${String(10000000 + ((Math.floor(Math.random() * 89999999) + 1) % 89999999))}`,
      name: 'Featured Addr Owner',
      role: 'CUSTOMER',
      passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
      isActive: true,
      emailVerified: true,
    },
  });
  created.userIds.push(addressOwner.id);
  const address = await prisma.address.create({
    data: {
      userId: addressOwner.id,
      label: 'Home',
      city: 'الرياض',
      area: 'العليا',
      street: 'الشارع العام',
    },
  });
  created.addressIds.push(address.id);
  addressId = address.id;
}, 15000);

describe('featuredTech router', () => {
  it('serves the current spotlight publicly with the expected shape', async () => {
    const c = await caller();
    const current = await c.featuredTech.current();

    expect(current.id).toBeGreaterThan(0); // seed guarantees technicians exist
    expect(typeof current.name).toBe('string');
    expect(current.name.length).toBeGreaterThan(0);
    expect(current.weekOf).toBe(new Date().toISOString().slice(0, 10));
    expect(Array.isArray(current.highlights)).toBe(true);
    expect(current.highlights.length).toBeGreaterThanOrEqual(3);
    expect(typeof current.bio).toBe('string');
    expect(Array.isArray(current.services)).toBe(true);
    expect(current.interview.q.length).toBeGreaterThan(0);
  });

  it('picks the highest-rated technician deterministically and counts their completed bookings', async () => {
    const c = await caller();
    const { user, tech } = await makeTech({ ratingAvg: 99.9 });
    await seedCompletedBooking(tech.userId, user.id);
    await seedCompletedBooking(tech.userId, user.id);

    // Direct-query mirror of the router's selection — holds regardless of other data
    const top = await prisma.technician.findFirst({
      orderBy: { ratingAvg: 'desc' },
      include: { user: { select: { name: true } } },
    });
    expect(top).not.toBeNull();

    const current = await c.featuredTech.current();
    expect(current.id).toBe(top!.id);
    expect(current.name).toBe(top!.user.name);
    // The fresh tech wins, so the completed-booking highlight is deterministic
    expect(current.id).toBe(tech.id);
    expect(
      current.highlights.some((h: string) => h.includes('+2') && h.includes('حجز مكتمل')),
    ).toBe(true);
    expect(current.highlights[0].includes('99.9')).toBe(true);
  });

  it('serves the past carousel capped at the small page size, newest first minus the newest', async () => {
    const c = await caller();
    const now = Date.now();
    // Future-relative timestamps guarantee our trio occupies the newest
    // slots even if other workers create technicians concurrently.
    const t1 = await makeTech({ createdAt: new Date(now + 1 * 60_000) }); // oldest of ours
    const t2 = await makeTech({ createdAt: new Date(now + 2 * 60_000) });
    const t3 = await makeTech({ createdAt: new Date(now + 3 * 60_000) }); // newest of ours

    const past = await c.featuredTech.past();
    expect(past.length).toBeLessThanOrEqual(5); // SMALL_PAGE_SIZE
    expect(past.length).toBeGreaterThanOrEqual(2); // our t1 + t2 must fit in the top-5 window
    for (const entry of past) {
      expect(typeof entry.id).toBe('number');
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.weekOf).toBe('string');
    }
    // slice(1) drops only the single newest record; ours are the newest, so
    // t3 (the newest of ours) is the one excluded while t1 and t2 remain.
    expect(past.some((t: { id: number }) => t.id === t1.tech.id)).toBe(true);
    expect(past.some((t: { id: number }) => t.id === t2.tech.id)).toBe(true);
    expect(past.some((t: { id: number }) => t.id === t3.tech.id)).toBe(false);
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
  if (created.techIds.length > 0) {
    await prisma.technician.deleteMany({ where: { id: { in: created.techIds } } });
  }
  if (created.userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: created.userIds } } });
  }
});
