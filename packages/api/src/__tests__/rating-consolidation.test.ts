/**
 * W5-6d — TechnicianRating consolidated into Review (both were
 * bookingId-unique post-booking ratings). The technicianRatings router
 * keeps its API surface but reads/writes the canonical reviews table.
 */
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser, safeFutureDate, ensureTechnicianService } from './factories';
import type { JwtPayload } from '../lib/jwt';

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
const createdReviewIds: number[] = [];
let customer: JwtPayload;
let techUserId: number;
let techProfileId: number;
let serviceId: number;
let addressId: number;

beforeAll(async () => {
  const [cu, tu] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) }),
  ]);
  createdUserIds.push(cu.id, tu.id);
  customer = { id: cu.id, role: 'CUSTOMER', email: cu.email };
  techUserId = tu.id;
  const profile = await prisma.technician.create({
    data: { userId: tu.id, city: 'الرياض', bioJson: { ar: 't', en: 't' } },
  });
  techProfileId = profile.id;
  const svc = await prisma.service.findFirst({ where: { isActive: true } });
  serviceId = svc!.id;
  await ensureTechnicianService(techProfileId, serviceId);
  const addr = await prisma.address.create({
    data: { userId: cu.id, label: 'بيت', city: 'الرياض', area: 'أ', street: 'شارع' },
  });
  addressId = addr.id;
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: techProfileId,
      startAt: new Date(Date.now() + 50 * 86_400_000),
      endAt: new Date(Date.now() + 50 * 86_400_000 + 3_600_000),
    },
  });
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `RC-${crypto.randomUUID().slice(0, 8)}`,
      customerId: cu.id,
      technicianId: techUserId,
      serviceId,
      addressId,
      startAt: new Date(Date.now() + 50 * 86_400_000),
      endAt: new Date(Date.now() + 50 * 86_400_000 + 3_600_000),
      totalAmount: 100,
      status: 'COMPLETED',
    },
  });
  createdBookingIds.push(booking.id);
  void slot;
}, 30000);

afterAll(async () => {
  await prisma.review.deleteMany({ where: { id: { in: createdReviewIds } } });
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.availabilitySlot.deleteMany({ where: { technicianId: techProfileId } });
  await prisma.address.deleteMany({ where: { id: addressId } });
  await prisma.technician.deleteMany({ where: { id: techProfileId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('rating consolidation (W5-6d)', () => {
  it('submit writes the canonical reviews table with dimensions', async () => {
    const c = await caller(customer);
    const res = await c.technicianRatings.submit({
      technicianId: techUserId,
      bookingId: createdBookingIds[0]!,
      overall: 5,
      skill: 5,
      punctuality: 4,
      cleanliness: 5,
      communication: 4,
      comment: 'ممتازة',
    });
    expect(res.rating).toBe(5);
    createdReviewIds.push(res.id);

    const row = await prisma.review.findUnique({ where: { id: res.id } });
    expect(row).not.toBeNull();
    expect(row!.skill).toBe(5);
    expect(row!.punctuality).toBe(4);
    expect(row!.comment).toBe('ممتازة');
  });

  it('getBreakdown aggregates from reviews via the booking join', async () => {
    const c = await caller(null);
    const breakdown = await c.technicianRatings.getBreakdown({
      technicianId: techUserId,
    });
    expect(breakdown.count).toBeGreaterThanOrEqual(1);
    expect(breakdown.avg.rating).toBe(5);
    expect(breakdown.distribution.some((d: { rating: number }) => d.rating === 5)).toBe(true);
  });

  it('a duplicate submit returns the already-rated error', async () => {
    const c = await caller(customer);
    const res = await c.technicianRatings.submit({
      technicianId: techUserId,
      bookingId: createdBookingIds[0]!,
      overall: 4,
    });
    expect(res).toEqual({ error: 'Already rated' });
  });
});
