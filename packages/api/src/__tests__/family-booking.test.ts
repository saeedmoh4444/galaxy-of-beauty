/**
 * K1 (C4 kids plan) — book-on-behalf foundation contract.
 *
 * A customer can attach one of their family members (e.g. a child) to a
 * booking; only members they own are accepted. These tests drive the
 * schema/validator/router work: Booking.familyMemberId + validation +
 * the member included in booking detail/list responses.
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

let customerA: JwtPayload;
let customerB: JwtPayload;
let techUserId: number;
let serviceId: number;
let addressId: number;
let memberId: number;
const createdUserIds: number[] = [];
const bookingIds: number[] = [];

beforeAll(async () => {
  const [a, b] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdUserIds.push(a.id, b.id);
  customerA = { id: a.id, role: 'CUSTOMER', email: a.email };
  customerB = { id: b.id, role: 'CUSTOMER', email: b.email };

  const [tech, service, address] = await Promise.all([
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.service.findFirst({ select: { id: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  techUserId = tech?.userId ?? 1;
  serviceId = service?.id ?? 1;
  addressId = address?.id ?? 1;

  // Customer A owns one child member.
  const member = await prisma.familyMember.create({
    data: {
      userId: a.id,
      name: 'ليان',
      relationship: 'child',
      ageGroup: 'child',
      preferences: ['gentle'],
      notes: '',
    },
  });
  memberId = member.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  } catch {}
  try {
    await prisma.familyMember.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

function bookingInput(overrides: Record<string, unknown> = {}) {
  const start = new Date(Date.now() + 86_400_000);
  return {
    technicianId: techUserId,
    serviceId,
    addressId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    ...overrides,
  };
}

describe('family member booking (K1)', () => {
  it('books on behalf of my own family member and returns the member', async () => {
    const caller = await authCaller(customerA);
    const booking = await caller.bookings.create(
      bookingInput({ familyMemberId: memberId, idempotencyKey: `k1-a-${Date.now()}` }),
    );
    bookingIds.push(booking.id);
    expect(booking.familyMemberId).toBe(memberId);
    expect(booking.familyMember).toMatchObject({
      name: 'ليان',
      relationship: 'child',
      ageGroup: 'child',
    });
  });

  it('rejects another customer’s family member', async () => {
    const caller = await authCaller(customerB);
    await expect(
      caller.bookings.create(
        bookingInput({ familyMemberId: memberId, idempotencyKey: `k1-b-${Date.now()}` }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects a nonexistent family member', async () => {
    const caller = await authCaller(customerA);
    await expect(
      caller.bookings.create(
        bookingInput({ familyMemberId: 999_999_999, idempotencyKey: `k1-c-${Date.now()}` }),
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('still books without a family member', async () => {
    const caller = await authCaller(customerB);
    const booking = await caller.bookings.create(
      bookingInput({ idempotencyKey: `k1-d-${Date.now()}` }),
    );
    bookingIds.push(booking.id);
    expect(booking.familyMemberId).toBeNull();
    expect(booking.familyMember).toBeNull();
  });

  it('the member appears in the bookings list', async () => {
    const caller = await authCaller(customerA);
    const result = await caller.bookings.list({ page: 1, limit: 50 });
    const mine = result.bookings.find((b: { id: number }) => b.id === bookingIds[0]);
    expect(mine).toBeDefined();
    expect(mine.familyMember).toMatchObject({ name: 'ليان', relationship: 'child' });
  });
});
