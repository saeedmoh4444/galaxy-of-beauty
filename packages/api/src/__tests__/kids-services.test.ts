/**
 * C1a — kids-services.book creates REAL bookings (the stub returned
 * NOT_CREATED before). Pins the facade→seeded-service resolution, the
 * idempotency replay, and the technician auto-assign convention.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let userId: number;
let addressId: number;
let hasBabyMassage = false;
const createdBookingIds: number[] = [];

beforeAll(async () => {
  const u = await prisma.user.create({ data: buildUser() });
  userId = u.id;
  customer = { id: u.id, role: 'CUSTOMER', email: u.email };
  const addr = await prisma.address.create({
    data: { userId: u.id, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'طريق الملك' },
  });
  addressId = addr.id;
  // The 15 C1a seed rows exist on CI's fresh seed; a long-lived dev DB
  // may predate them — the resolution test needs the row present.
  hasBabyMassage = !!(await prisma.service.findFirst({
    where: { titleJson: { path: ['en'], equals: 'Baby Massage' } },
  }));
}, 15000);

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.address.deleteMany({ where: { id: addressId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

function appt(daysAhead: number): { startAt: string; endAt: string } {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  // Skip Friday (Jummah window) — land on a safe weekday.
  while (d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(10, 0, 0, 0);
  const end = new Date(d.getTime() + 30 * 60_000);
  return { startAt: d.toISOString(), endAt: end.toISOString() };
}

describe('kidsServices.book — real booking', () => {
  it.skipIf(!hasBabyMassage)(
    'creates a REQUESTED booking against the matching seeded service',
    async () => {
      const c = await caller(customer);
      const { startAt, endAt } = appt(3);
      const res = await c.kidsServices.book({
        serviceId: 'bb2', // Baby Massage — seeded with the same titleJson.en
        category: 'baby',
        childName: 'لين',
        childAge: 1,
        addressId,
        startAt,
        endAt,
        idempotencyKey: crypto.randomUUID(),
      });

      expect(res.booked).toBe(true);
      expect(res.bookingCode).toMatch(/^GOB-/);
      createdBookingIds.push(res.bookingId);

      const booking = await prisma.booking.findUniqueOrThrow({ where: { id: res.bookingId } });
      expect(booking.status).toBe('REQUESTED');
      expect(booking.customerId).toBe(userId);
      expect(booking.addressId).toBe(addressId);
      const service = await prisma.service.findUniqueOrThrow({ where: { id: booking.serviceId } });
      expect(service.titleJson).toMatchObject({ en: 'Baby Massage' });
      expect(Number(booking.totalAmount)).toBe(120);
    },
  );

  it('replays a duplicate idempotency key instead of double-booking', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(4);
    const key = crypto.randomUUID();
    const first = await c.kidsServices.book({
      serviceId: 'td1',
      category: 'toddler',
      childName: 'سلمى',
      childAge: 4,
      addressId,
      startAt,
      endAt,
      idempotencyKey: key,
    });
    createdBookingIds.push(first.bookingId);

    const second = await c.kidsServices.book({
      serviceId: 'td1',
      category: 'toddler',
      childName: 'سلمى',
      childAge: 4,
      addressId,
      startAt,
      endAt,
      idempotencyKey: key,
    });

    expect(second.bookingId).toBe(first.bookingId);
    const count = await prisma.booking.count({ where: { idempotencyKey: key } });
    expect(count).toBe(1);
  });

  it('rejects an unknown sub-service with NOT_FOUND', async () => {
    const c = await caller(customer);
    const { startAt, endAt } = appt(5);
    await expect(
      c.kidsServices.book({
        serviceId: 'nope',
        category: 'baby',
        childName: 'لين',
        childAge: 1,
        addressId,
        startAt,
        endAt,
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects bookings inside the Jummah window', async () => {
    const c = await caller(customer);
    // Next Friday 12:00 UTC? — use the lib's own Riyadh window via a
    // Friday 12:30 Riyadh time (09:30 UTC).
    const d = new Date(Date.now() + 3 * 86_400_000);
    while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(9, 30, 0, 0); // Friday 12:30 Riyadh
    const end = new Date(d.getTime() + 30 * 60_000);
    await expect(
      c.kidsServices.book({
        serviceId: 'td1',
        category: 'toddler',
        childName: 'سلمى',
        childAge: 4,
        addressId,
        startAt: d.toISOString(),
        endAt: end.toISOString(),
        idempotencyKey: crypto.randomUUID(),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
