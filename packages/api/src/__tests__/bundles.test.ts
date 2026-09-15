/**
 * K3 (C4 kids plan) — Mommy & Me bundles contract.
 *
 * Drives: the bundles.list router, and bookings.create bundle support —
 * a bundle books ONE booking priced at the bundle price, on the primary
 * (mother) service, with the bundle linked for display.
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
let customer: JwtPayload;
let techUserId: number;
let addressId: number;
let primaryServiceId: number;
let childServiceId: number;
let activeBundleId: number;
let inactiveBundleId: number;
let bookingId: number;
const createdUserIds: number[] = [];

beforeAll(async () => {
  const [cat, tech, address] = await Promise.all([
    prisma.category.findFirst({ select: { id: true } }),
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  techUserId = tech?.userId ?? 1;
  addressId = address?.id ?? 1;
  const categoryId = cat?.id ?? 1;

  const [mother, child] = await Promise.all([
    prisma.service.create({
      data: {
        categoryId,
        titleJson: { ar: `مانيكير ك3 ${SUFFIX}`, en: `K3 Mani ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 100,
        durationMin: 45,
        slug: `k3-mother-${SUFFIX}`,
        sortOrder: 999,
      },
    }),
    prisma.service.create({
      data: {
        categoryId,
        titleJson: { ar: `أطفال ك3 ${SUFFIX}`, en: `K3 Child ${SUFFIX}` },
        descriptionJson: { ar: 'x', en: 'x' },
        basePrice: 60,
        durationMin: 30,
        slug: `k3-child-${SUFFIX}`,
        sortOrder: 999,
        isMommyFriendly: true,
      },
    }),
  ]);
  primaryServiceId = mother.id;
  childServiceId = child.id;

  const [active, inactive] = await Promise.all([
    prisma.serviceBundle.create({
      data: {
        slug: `k3-active-${SUFFIX}`,
        nameJson: { ar: 'باقة ماما وأنا', en: 'Mommy & Me Bundle' },
        descriptionJson: { ar: 'x', en: 'x' },
        bundlePrice: 140,
        isMommyAndMe: true,
        isActive: true,
        primaryServiceId: mother.id,
        childServiceId: child.id,
      },
    }),
    prisma.serviceBundle.create({
      data: {
        slug: `k3-inactive-${SUFFIX}`,
        nameJson: { ar: 'باقة قديمة', en: 'Old Bundle' },
        descriptionJson: { ar: 'x', en: 'x' },
        bundlePrice: 90,
        isMommyAndMe: true,
        isActive: false,
        primaryServiceId: mother.id,
        childServiceId: child.id,
      },
    }),
  ]);
  activeBundleId = active.id;
  inactiveBundleId = inactive.id;

  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: bookingId } });
  } catch {}
  try {
    await prisma.serviceBundle.deleteMany({
      where: { id: { in: [activeBundleId, inactiveBundleId] } },
    });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: { in: [primaryServiceId, childServiceId] } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

function bookingInput(overrides: Record<string, unknown> = {}) {
  const start = new Date(Date.now() + 86_400_000);
  return {
    technicianId: techUserId,
    serviceId: primaryServiceId,
    addressId,
    startAt: start.toISOString(),
    endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    ...overrides,
  };
}

describe('Mommy & Me bundles (K3)', () => {
  it('bundles.list returns active bundles with both services populated', async () => {
    const caller = await authCaller(customer);
    const bundles = await caller.bundles.list();
    const ids = bundles.map((b: { id: number }) => b.id);
    expect(ids).toContain(activeBundleId);
    expect(ids).not.toContain(inactiveBundleId);
    const mine = bundles.find((b: { id: number }) => b.id === activeBundleId);
    expect(mine.primaryService).toBeDefined();
    expect(mine.childService).toBeDefined();
  });

  it('bookings.create with a bundle links it, prices at the bundle, and uses the primary service', async () => {
    const caller = await authCaller(customer);
    const booking = await caller.bookings.create(
      bookingInput({ bundleId: activeBundleId, idempotencyKey: `k3-a-${SUFFIX}` }),
    );
    bookingId = booking.id;
    expect(booking.bundleId).toBe(activeBundleId);
    expect(booking.serviceId).toBe(primaryServiceId);
    expect(Number(booking.totalAmount)).toBe(140);
    expect(booking.bundle).toMatchObject({ id: activeBundleId });
  });

  it('bookings.create rejects an inactive bundle', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({ bundleId: inactiveBundleId, idempotencyKey: `k3-b-${SUFFIX}` }),
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('bookings.create rejects a nonexistent bundle', async () => {
    const caller = await authCaller(customer);
    await expect(
      caller.bookings.create(
        bookingInput({ bundleId: 999_999_999, idempotencyKey: `k3-c-${SUFFIX}` }),
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('the bundle appears in the bookings list', async () => {
    const caller = await authCaller(customer);
    const result = await caller.bookings.list({ page: 1, limit: 50 });
    const mine = result.bookings.find((b: { id: number }) => b.id === bookingId);
    expect(mine).toBeDefined();
    expect(mine.bundle).toMatchObject({ id: activeBundleId });
  });
});
