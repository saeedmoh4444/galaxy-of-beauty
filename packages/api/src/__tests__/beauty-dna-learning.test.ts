/**
 * Beauty DNA 3.1 Phase 2 — ongoing learning: completing a booking folds
 * the service's category into the customer's BeautyProfile.preferences.
 * Coverage ratchet target: src/routers/bookings.ts (transition complete).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let technician: JwtPayload;
let technicianUserId: number;
let technicianRecordId: number;
let addressId: number;

let uid = 0;
const newIdemKey = () => `bdna_${Date.now()}_${uid++}`;

async function completeBooking(serviceId: number): Promise<number> {
  // Seed a fresh slot so completion does not collide with capacity limits.
  const slot = await prisma.availabilitySlot.create({
    data: {
      technicianId: technicianRecordId,
      startAt: new Date(Date.now() + 86400000 + uid * 3600000),
      endAt: new Date(Date.now() + 86400000 + uid * 3600000 + 3600000),
      isBooked: false,
    },
  });

  const customerCaller = await authCaller(customer);
  const booking = await customerCaller.bookings.create({
    serviceId,
    technicianId: technicianUserId,
    addressId,
    slotId: slot.id,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    idempotencyKey: newIdemKey(),
  });

  const techCaller = await authCaller(technician);
  await techCaller.bookings.transition({ id: booking.id, action: 'accept' });
  await techCaller.bookings.transition({ id: booking.id, action: 'start' });
  await techCaller.bookings.transition({ id: booking.id, action: 'complete' });
  return booking.id;
}

function getPreferences(userId: number): Promise<string[]> {
  return prisma.beautyProfile
    .findUnique({ where: { userId } })
    .then((p) => (p?.preferences as string[]) ?? []);
}

beforeAll(async () => {
  const anonCtx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  const anon = (appRouter as any).createCaller(anonCtx);
  const login = await anon.auth.login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const tech = await prisma.technician.findFirst({
    include: { user: true },
    where: { user: { role: 'TECHNICIAN' } },
  });
  if (!tech) throw new Error('No technician in seed data');
  technician = { id: tech.userId, role: 'TECHNICIAN', email: tech.user.email };
  technicianUserId = tech.userId;
  technicianRecordId = tech.id;

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  addressId =
    address?.id ??
    (
      await prisma.address.create({
        data: {
          userId: customer.id,
          label: 'اختبار بصمة الجمال',
          city: 'الرياض',
          area: 'التجريبي',
          street: 'شارع الاختبار',
        },
      })
    ).id;
}, 15000);

describe('Beauty DNA ongoing learning', () => {
  it('folds the completed service category into the customer preferences', async () => {
    const service = await prisma.service.findFirst({
      include: { category: true },
    });
    expect(service?.category?.slug).toBeTruthy();
    const slug = service!.category!.slug;

    const before = (await getPreferences(customer.id)).filter((p) => p !== slug);
    await prisma.beautyProfile.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, preferences: before },
      update: { preferences: before },
    });

    await completeBooking(service!.id);

    const prefs = await getPreferences(customer.id);
    expect(prefs).toContain(slug);
  });

  it('dedupes repeated completions in the same category (most-recent last)', async () => {
    const service = await prisma.service.findFirst({
      include: { category: true },
    });
    const slug = service!.category!.slug;

    await completeBooking(service!.id);
    await completeBooking(service!.id);

    const prefs = await getPreferences(customer.id);
    expect(prefs.filter((p) => p === slug)).toHaveLength(1);
    expect(prefs[prefs.length - 1]).toBe(slug);
  });

  it('does not learn from non-complete transitions', async () => {
    const service = await prisma.service.findFirst({ include: { category: true } });
    const slug = service!.category!.slug;

    const before = (await getPreferences(customer.id)).filter((p) => p !== slug);
    await prisma.beautyProfile.upsert({
      where: { userId: customer.id },
      create: { userId: customer.id, preferences: before },
      update: { preferences: before },
    });

    // Cancel a booking — must NOT add the category.
    const slot = await prisma.availabilitySlot.create({
      data: {
        technicianId: technicianRecordId,
        startAt: new Date(Date.now() + 86400000 + uid * 3600000),
        endAt: new Date(Date.now() + 86400000 + uid * 3600000 + 3600000),
        isBooked: false,
      },
    });
    const customerCaller = await authCaller(customer);
    const booking = await customerCaller.bookings.create({
      serviceId: service!.id,
      technicianId: technicianUserId,
      addressId,
      slotId: slot.id,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      idempotencyKey: newIdemKey(),
    });
    await customerCaller.bookings.transition({
      id: booking.id,
      action: 'cancel',
      reason: 'test',
    });

    const prefs = await getPreferences(customer.id);
    expect(prefs).not.toContain(slug);
  });
});
