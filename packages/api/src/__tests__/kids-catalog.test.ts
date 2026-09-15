/**
 * K2 (C4 kids plan) — kids catalog contract.
 *
 * Drives: the `mommyFriendly` filter on services.list (matching the E6d
 * trust filters), the isMommyFriendly flag on getById, and the family
 * member preferences flowing through booking list responses (so
 * technicians see gentle/hypoallergenic hints for kids bookings).
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

const SUFFIX = Date.now();
let mommyServiceId: number;
let plainServiceId: number;
let customer: JwtPayload;
let memberId: number;
let bookingId: number;
const createdUserIds: number[] = [];

beforeAll(async () => {
  const [cat, tech, address] = await Promise.all([
    prisma.category.findFirst({ select: { id: true } }),
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  const categoryId = cat?.id ?? 1;

  const [mommy, plain] = await Promise.all([
    prisma.service.create({
      data: {
        categoryId,
        titleJson: { ar: `اختبار أطفال ${SUFFIX}`, en: `Kids Test ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 80,
        durationMin: 30,
        slug: `kids-test-${SUFFIX}`,
        sortOrder: 999,
        isMommyFriendly: true,
      },
    }),
    prisma.service.create({
      data: {
        categoryId,
        titleJson: { ar: `اختبار عادي ${SUFFIX}`, en: `Plain Test ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 100,
        durationMin: 40,
        slug: `plain-test-${SUFFIX}`,
        sortOrder: 999,
      },
    }),
  ]);
  mommyServiceId = mommy.id;
  plainServiceId = plain.id;

  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };

  const member = await prisma.familyMember.create({
    data: {
      userId: user.id,
      name: 'جود',
      relationship: 'child',
      ageGroup: 'child',
      preferences: ['gentle', 'hypoallergenic'],
      notes: '',
    },
  });
  memberId = member.id;

  const start = new Date(Date.now() + 86_400_000);
  const booking = await prisma.booking.create({
    data: {
      bookingCode: `GOB-K2-${SUFFIX}`,
      customerId: user.id,
      technicianId: tech?.userId ?? 1,
      serviceId: mommyServiceId,
      addressId: address?.id ?? 1,
      startAt: start,
      endAt: new Date(start.getTime() + 3_600_000),
      totalAmount: 80,
      familyMemberId: member.id,
    },
  });
  bookingId = booking.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: bookingId } });
  } catch {}
  try {
    await prisma.familyMember.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: [mommyServiceId, plainServiceId] } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('kids catalog (K2)', () => {
  it('services.list filters by mommyFriendly', async () => {
    const caller = await authCaller(customer);
    const result = await caller.services.list({ page: 1, limit: 100, mommyFriendly: true });
    const ids = result.items.map((s: { id: number }) => s.id);
    expect(ids).toContain(mommyServiceId);
    expect(ids).not.toContain(plainServiceId);
    for (const item of result.items) {
      expect(item.isMommyFriendly).toBe(true);
    }
  });

  it('services.list without the filter still returns everything', async () => {
    const caller = await authCaller(customer);
    const result = await caller.services.list({ page: 1, limit: 100 });
    const ids = result.items.map((s: { id: number }) => s.id);
    expect(ids).toContain(mommyServiceId);
    expect(ids).toContain(plainServiceId);
  });

  it('getById returns the mommy-friendly flag', async () => {
    const caller = await authCaller(customer);
    const mommy = await caller.services.getById({ id: mommyServiceId });
    expect(mommy.isMommyFriendly).toBe(true);
    const plain = await caller.services.getById({ id: plainServiceId });
    expect(plain.isMommyFriendly).toBe(false);
  });

  it('booking list carries the family member preferences to the technician side', async () => {
    const caller = await authCaller(customer);
    const result = await caller.bookings.list({ page: 1, limit: 50 });
    const mine = result.bookings.find((b: { id: number }) => b.id === bookingId);
    expect(mine).toBeDefined();
    expect(mine.familyMember).toMatchObject({
      name: 'جود',
      preferences: expect.arrayContaining(['gentle', 'hypoallergenic']),
    });
  });
});
