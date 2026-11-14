/**
 * W2-5 (audit 2026-11-11) — bookings.create must validate the
 * technician↔service mapping and address ownership. A crafted request
 * could otherwise book any technician for any service and attach another
 * user's address (which the technician then sees).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { safeFutureDate } from './factories';

const CSRF = 'a'.repeat(64);

async function authCaller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}

let customer: JwtPayload;
let serviceId: number;
let addressId: number;
let strangerAddressId: number;
let mappedTechnicianUserId: number;
let mappedTechnicianRecordId: number;
let unmappedTechnicianUserId: number;
let unmappedTechnicianRecordId: number;

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];

let uid = 0;
const newIdemKey = () => `bk_guard_${Date.now()}_${uid++}`;

beforeAll(async () => {
  const anonCtx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  const anon = (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(anonCtx) as Record<string, unknown>;
  const login = await (
    anon.auth as {
      login: (i: unknown) => Promise<{ user: { id: number; role: string; email: string } }>;
    }
  ).login({ email: 'customer@test.com', password: 'Admin@123456' });
  customer = { id: login.user.id, role: login.user.role, email: login.user.email };

  const service = await prisma.service.findFirst({ orderBy: { id: 'asc' } });
  if (!service) throw new Error('No service in seed data');
  serviceId = service.id;

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'guard-test',
      city: 'الرياض',
      area: 'تجريبي',
      street: 'شارع الاختبار',
    },
  });
  addressId = address.id;

  // A second user's address — must be rejected.
  const stranger = await prisma.user.create({
    data: {
      email: `guard-stranger-${Date.now()}-${uid++}@example.com`,
      phone: `+9665${String((Date.now() + uid) % 100000000).padStart(8, '0')}`,
      passwordHash: 'x',
      name: 'stranger',
    },
  });
  createdUserIds.push(stranger.id);
  const strangerAddress = await prisma.address.create({
    data: {
      userId: stranger.id,
      label: 'stranger',
      city: 'الرياض',
      area: 'تجريبي',
      street: 'شارع الغريب',
    },
  });
  strangerAddressId = strangerAddress.id;

  // A technician WITH the service mapped (seeded one — pick any with a
  // mapping for our service, or create one).
  let mapped = await prisma.technicianService.findFirst({
    where: { serviceId, isActive: true },
    include: { technician: true },
  });
  if (!mapped) {
    const u = await prisma.user.create({
      data: {
        email: `guard-tech-${Date.now()}-${uid++}@example.com`,
        phone: `+9665${String((Date.now() + uid) % 100000000).padStart(8, '0')}`,
        passwordHash: 'x',
        name: 'tech',
        role: 'TECHNICIAN',
      },
    });
    createdUserIds.push(u.id);
    const t = await prisma.technician.create({ data: { userId: u.id, city: 'الرياض' } });
    mapped = await prisma.technicianService.create({
      data: { technicianId: t.id, serviceId, customPrice: 0, isActive: true },
      include: { technician: true },
    });
  }
  mappedTechnicianUserId = mapped.technician.userId;
  mappedTechnicianRecordId = mapped.technician.id;

  // A technician WITHOUT the service mapped.
  const u2 = await prisma.user.create({
    data: {
      email: `guard-tech2-${Date.now()}-${uid++}@example.com`,
      phone: `+9665${String((Date.now() + uid) % 100000000).padStart(8, '0')}`,
      passwordHash: 'x',
      name: 'tech2',
      role: 'TECHNICIAN',
    },
  });
  createdUserIds.push(u2.id);
  const t2 = await prisma.technician.create({ data: { userId: u2.id, city: 'الرياض' } });
  unmappedTechnicianUserId = u2.id;
  unmappedTechnicianRecordId = t2.id;
}, 60000);

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.technicianService.deleteMany({
    where: {
      technicianId: { in: [mappedTechnicianRecordId, unmappedTechnicianRecordId] },
      serviceId,
    },
  });
  await prisma.technician.deleteMany({
    where: { id: { in: [mappedTechnicianRecordId, unmappedTechnicianRecordId] } },
  });
  await prisma.address.deleteMany({ where: { id: { in: [addressId, strangerAddressId] } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

async function attempt(opts: { technicianId: number; addressId?: number; slotId?: number }) {
  const caller = (await authCaller(customer)) as {
    bookings: { create: (i: unknown) => Promise<{ id: number }> };
  };
  const start = safeFutureDate(1);
  let slotId = opts.slotId;
  if (!slotId) {
    const slot = await prisma.availabilitySlot.create({
      data: {
        technicianId:
          opts.technicianId === mappedTechnicianUserId
            ? mappedTechnicianRecordId
            : unmappedTechnicianRecordId,
        startAt: start,
        endAt: new Date(start.getTime() + 3600000),
        isBooked: false,
      },
    });
    slotId = slot.id;
  }
  const booking = await caller.bookings.create({
    serviceId,
    technicianId: opts.technicianId,
    addressId: opts.addressId ?? addressId,
    slotId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3600000).toISOString(),
    idempotencyKey: newIdemKey(),
  });
  createdBookingIds.push(booking.id);
  return booking;
}

describe('W2 booking guards', () => {
  it('rejects a technician who does not offer the service', async () => {
    await expect(attempt({ technicianId: unmappedTechnicianUserId })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
  });

  it('rejects an address that belongs to another user', async () => {
    await expect(
      attempt({ technicianId: mappedTechnicianUserId, addressId: strangerAddressId }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('still accepts a valid booking (mapped technician + own address)', async () => {
    const booking = await attempt({ technicianId: mappedTechnicianUserId, addressId });
    expect(booking.id).toBeGreaterThan(0);
  });
});
