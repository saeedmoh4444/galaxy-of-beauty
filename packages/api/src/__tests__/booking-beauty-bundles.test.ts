/**
 * ENHANCEMENT_PLAN 1.2 — Service Bundles (Slice 2): bundle booking.
 *
 * A customer can book a pre-built beauty bundle as ONE booking: the first
 * service anchors the slot, the bundle price wins, and the execution order
 * (the bundle's serviceIds) is snapshotted on the booking. Drives the
 * schema/validator/router work: Booking.beautyBundleId + beautyBundleJson
 * + validation (active, in-window, mutually exclusive with K3 bundles and
 * add-ons).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { generateCsrfToken } from '../lib/csrf';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = generateCsrfToken();

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let techUserId: number;
let addressId: number;
let activeBundleId: number;
let inactiveBundleId: number;
let expiredBundleId: number;
const createdUserIds: number[] = [];
const createdServiceIds: number[] = [];
const createdBundleIds: number[] = [];
const bookingIds: number[] = [];
const SUFFIX = Date.now();

beforeAll(async () => {
  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };

  const [tech, address] = await Promise.all([
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  techUserId = tech?.userId ?? 1;
  addressId = address?.id ?? 1;

  const cat = await prisma.category.create({
    data: {
      nameJson: { ar: `تصنيف حجز باقة ${SUFFIX}`, en: `Bundle-booking cat ${SUFFIX}` },
      slug: `bundle-booking-cat-${SUFFIX}`,
    },
  });

  const defs = [
    { ar: 'قص شعر', en: 'Haircut', basePrice: 100, slug: `bb-hair-${SUFFIX}` },
    { ar: 'مكياج', en: 'Makeup', basePrice: 150, slug: `bb-makeup-${SUFFIX}` },
    { ar: 'مانيكير', en: 'Manicure', basePrice: 50, slug: `bb-mani-${SUFFIX}` },
  ];
  for (const d of defs) {
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: d.ar, en: d.en },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: d.basePrice,
        durationMin: 30,
        slug: d.slug,
        sortOrder: 998,
      },
    });
    createdServiceIds.push(svc.id);
  }

  // original 300 → 10% off → total 270.
  const base = {
    titleJson: { ar: 'باقة يوم كامل', en: 'Full Day Package' },
    serviceIds: createdServiceIds,
    discountPct: 10,
    originalPrice: 300,
    totalPrice: 270,
    sortOrder: 1,
  };
  const active = await prisma.beautyBundle.create({ data: base });
  createdBundleIds.push(active.id);
  activeBundleId = active.id;

  const inactive = await prisma.beautyBundle.create({
    data: { ...base, titleJson: { ar: 'باقة موقوفة', en: 'Paused Package' }, isActive: false },
  });
  createdBundleIds.push(inactive.id);
  inactiveBundleId = inactive.id;

  const expired = await prisma.beautyBundle.create({
    data: {
      ...base,
      titleJson: { ar: 'باقة منتهية', en: 'Expired Package' },
      validUntil: new Date(Date.now() - 86_400_000),
    },
  });
  createdBundleIds.push(expired.id);
  expiredBundleId = expired.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.beautyBundle.deleteMany({ where: { id: { in: createdBundleIds } } });
    await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    await prisma.category.deleteMany({ where: { slug: `bundle-booking-cat-${SUFFIX}` } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort; the DB is re-seeded per run
  }
});

function bookingInput(overrides: Record<string, unknown> = {}) {
  const start = new Date(Date.now() + 86_400_000);
  return {
    technicianId: techUserId,
    serviceId: createdServiceIds[0],
    addressId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    ...overrides,
  };
}

describe('beauty bundle booking (1.2)', () => {
  it('books a bundle: bundle price wins, first service anchors, order snapshotted', async () => {
    const caller = await authCaller(customer);
    const booking = await caller.bookings.create(
      bookingInput({ beautyBundleId: activeBundleId, idempotencyKey: `bb-a-${Date.now()}` }),
    );
    bookingIds.push(booking.id);

    expect(booking.beautyBundleId).toBe(activeBundleId);
    expect(Number(booking.totalAmount)).toBe(270);
    expect(booking.serviceId).toBe(createdServiceIds[0]);
    expect(booking.beautyBundleJson).toMatchObject({
      id: activeBundleId,
      discountPct: 10,
      totalPrice: 270,
      originalPrice: 300,
    });
    expect((booking.beautyBundleJson as { serviceIds: { id: number }[] }).serviceIds).toHaveLength(
      3,
    );
  });

  it('rejects an inactive bundle', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({ beautyBundleId: inactiveBundleId, idempotencyKey: `bb-b-${Date.now()}` }),
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects an expired bundle', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({ beautyBundleId: expiredBundleId, idempotencyKey: `bb-c-${Date.now()}` }),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects combining a beauty bundle with a K3 mommy-and-me bundle', async () => {
    const k3 = await prisma.serviceBundle.findFirst({ where: { isActive: true } });
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({
          beautyBundleId: activeBundleId,
          bundleId: k3?.id,
          idempotencyKey: `bb-d-${Date.now()}`,
        }),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects add-ons on a beauty bundle', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({
          beautyBundleId: activeBundleId,
          addonIds: [createdServiceIds[2]],
          idempotencyKey: `bb-e-${Date.now()}`,
        }),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('still books without a beauty bundle', async () => {
    const caller = await authCaller(customer);
    const booking = await caller.bookings.create(
      bookingInput({ idempotencyKey: `bb-f-${Date.now()}` }),
    );
    bookingIds.push(booking.id);
    expect(booking.beautyBundleId).toBeNull();
    expect(booking.beautyBundleJson).toBeNull();
  });
});
