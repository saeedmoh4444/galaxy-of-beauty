/**
 * K4 (C4 kids plan) — babysitting vertical contract.
 *
 * Drives: hourly pricing on bookings.create (Service.isHourly — the
 * total is rate × ceil(durationMin/60), min one hour), and the
 * FamilyMember emergency-contact/allergy fields (round-trip through
 * familyAccount.add/update).
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
let hourlyServiceId: number;
let memberId: number;
const bookingIds: number[] = [];
const createdUserIds: number[] = [];

beforeAll(async () => {
  const [cat, tech, address] = await Promise.all([
    prisma.category.findFirst({ select: { id: true } }),
    prisma.technician.findFirst({ select: { userId: true } }),
    prisma.address.findFirst({ select: { id: true } }),
  ]);
  techUserId = tech?.userId ?? 1;
  addressId = address?.id ?? 1;

  const svc = await prisma.service.create({
    data: {
      categoryId: cat?.id ?? 1,
      titleJson: { ar: `جليسة أطفال ك4 ${SUFFIX}`, en: `K4 Babysitter ${SUFFIX}` },
      descriptionJson: { ar: 'x', en: 'x' },
      basePrice: 50,
      durationMin: 60,
      slug: `k4-babysitter-${SUFFIX}`,
      sortOrder: 999,
      isHourly: true,
    },
  });
  hourlyServiceId = svc.id;

  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  customer = { id: user.id, role: 'CUSTOMER', email: user.email };
}, 30000);

afterAll(async () => {
  try {
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  } catch {}
  try {
    await prisma.familyMember.deleteMany({ where: { userId: { in: createdUserIds } } });
  } catch {}
  try {
    await prisma.service.deleteMany({ where: { id: hourlyServiceId } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('babysitting (K4)', () => {
  it('prices an hourly booking as rate × hours (ceil)', async () => {
    const caller = await authCaller(customer);
    const start = new Date(Date.now() + 86_400_000);
    const twoHours = await caller.bookings.create({
      technicianId: techUserId,
      serviceId: hourlyServiceId,
      addressId,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 2 * 3_600_000).toISOString(),
      idempotencyKey: `k4-a-${SUFFIX}`,
    });
    bookingIds.push(twoHours.id);
    expect(Number(twoHours.totalAmount)).toBe(100); // 50/hr × 2h

    const ninetyMin = await caller.bookings.create({
      technicianId: techUserId,
      serviceId: hourlyServiceId,
      addressId,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 90 * 60_000).toISOString(),
      idempotencyKey: `k4-b-${SUFFIX}`,
    });
    bookingIds.push(ninetyMin.id);
    expect(Number(ninetyMin.totalAmount)).toBe(100); // 1.5h → ceil → 2h
  });

  it('round-trips emergency contact and allergies on family members', async () => {
    const caller = await authCaller(customer);
    const member = await caller.familyAccount.add({
      name: 'جود',
      relationship: 'child',
      ageGroup: 'child',
      preferences: ['gentle'],
      emergencyContact: 'أم جود — 0550000000',
      allergies: 'حساسية فول سوداني',
    });
    memberId = member.id;
    expect(member.emergencyContact).toBe('أم جود — 0550000000');
    expect(member.allergies).toBe('حساسية فول سوداني');

    const updated = await caller.familyAccount.update({
      id: memberId,
      allergies: 'حساسية لاتكس',
    });
    expect(updated.allergies).toBe('حساسية لاتكس');
    expect(updated.emergencyContact).toBe('أم جود — 0550000000');
  });
});
