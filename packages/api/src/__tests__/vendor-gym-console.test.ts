/**
 * E1 — Gym membership console (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
 * Plans list (gym-scoped), enrolled members, and per-class occupancy —
 * all scoped to the caller's own gym. Plan editing stays admin.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdPlanIds: number[] = [];
const createdSubIds: number[] = [];
const createdClassIds: number[] = [];
const createdBookingIds: number[] = [];

let gymOwner: JwtPayload;
let otherGymOwner: JwtPayload;
let member1: JwtPayload;
let member2: JwtPayload;
let bystander: JwtPayload;

let gymVendorId: number;
let otherGymVendorId: number;
let planAId: number;
let planBId: number;
let otherPlanId: number;

const DAY = 86_400_000;
const HOUR = 3_600_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const otherU = await prisma.user.create({ data: buildUser() });
  const m1 = await prisma.user.create({ data: buildUser() });
  const m2 = await prisma.user.create({ data: buildUser() });
  const bystanderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, otherU.id, m1.id, m2.id, bystanderU.id);
  gymOwner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  otherGymOwner = { id: otherU.id, role: 'CUSTOMER', email: otherU.email };
  member1 = { id: m1.id, role: 'CUSTOMER', email: m1.email };
  member2 = { id: m2.id, role: 'CUSTOMER', email: m2.email };
  bystander = { id: bystanderU.id, role: 'CUSTOMER', email: bystanderU.email };

  const gym = await prisma.vendor.create({
    data: {
      userId: ownerU.id,
      type: 'GYM',
      storeName: 'Fitness Ladies',
      storeSlug: `gym-${Date.now()}`,
      gymType: 'ladies',
    },
  });
  const otherGym = await prisma.vendor.create({
    data: {
      userId: otherU.id,
      type: 'GYM',
      storeName: 'Other Gym',
      storeSlug: `gym2-${Date.now()}`,
      gymType: 'ladies',
    },
  });
  createdVendorIds.push(gym.id, otherGym.id);
  gymVendorId = gym.id;
  otherGymVendorId = otherGym.id;

  const planA = await prisma.subscriptionPlan.create({
    data: {
      nameJson: { ar: 'الباقة الذهبية', en: 'Gold' },
      descriptionJson: { ar: '', en: '' },
      price: 299,
      gymId: gym.id,
      interval: 'MONTHLY',
    },
  });
  const planB = await prisma.subscriptionPlan.create({
    data: {
      nameJson: { ar: 'الباقة الفضية', en: 'Silver' },
      descriptionJson: { ar: '', en: '' },
      price: 199,
      gymId: gym.id,
      interval: 'MONTHLY',
    },
  });
  const otherPlan = await prisma.subscriptionPlan.create({
    data: {
      nameJson: { ar: 'باقة أخرى', en: 'Other' },
      descriptionJson: { ar: '', en: '' },
      price: 99,
      gymId: otherGym.id,
      interval: 'MONTHLY',
    },
  });
  createdPlanIds.push(planA.id, planB.id, otherPlan.id);
  planAId = planA.id;
  planBId = planB.id;
  otherPlanId = otherPlan.id;

  const sub1 = await prisma.customerSubscription.create({
    data: {
      userId: m1.id,
      planId: planA.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(Date.now() - 10 * DAY),
      currentPeriodEnd: new Date(Date.now() + 20 * DAY),
    },
  });
  const sub2 = await prisma.customerSubscription.create({
    data: {
      userId: m2.id,
      planId: planA.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(Date.now() - 5 * DAY),
      currentPeriodEnd: new Date(Date.now() + 25 * DAY),
    },
  });
  const otherSub = await prisma.customerSubscription.create({
    data: {
      userId: m1.id,
      planId: otherPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * DAY),
    },
  });
  createdSubIds.push(sub1.id, sub2.id, otherSub.id);

  const cls = await prisma.gymClass.create({
    data: {
      gymId: gym.id,
      nameJson: { ar: 'يوجا', en: 'Yoga' },
      startsAt: new Date(Date.now() + DAY),
      endsAt: new Date(Date.now() + DAY + HOUR),
      capacity: 10,
      enrolledCount: 4,
      price: 30,
    },
  });
  const pastCls = await prisma.gymClass.create({
    data: {
      gymId: gym.id,
      nameJson: { ar: 'زومبا', en: 'Zumba' },
      startsAt: new Date(Date.now() - 3 * DAY),
      endsAt: new Date(Date.now() - 3 * DAY + HOUR),
      capacity: 8,
      enrolledCount: 8,
      price: 0,
    },
  });
  const otherCls = await prisma.gymClass.create({
    data: {
      gymId: otherGym.id,
      nameJson: { ar: 'كروسفت', en: 'Crossfit' },
      startsAt: new Date(Date.now() + DAY),
      endsAt: new Date(Date.now() + DAY + HOUR),
      capacity: 12,
      enrolledCount: 1,
      price: 40,
    },
  });
  createdClassIds.push(cls.id, pastCls.id, otherCls.id);

  const booking = await prisma.gymClassBooking.create({
    data: {
      code: `GYM-${Date.now().toString(36).toUpperCase()}`,
      classId: cls.id,
      customerId: m1.id,
    },
  });
  createdBookingIds.push(booking.id);
}, 15000);

afterAll(async () => {
  await prisma.gymClassBooking.deleteMany({ where: { id: { in: createdBookingIds } } });
  await prisma.gymClass.deleteMany({ where: { id: { in: createdClassIds } } });
  await prisma.customerSubscription.deleteMany({ where: { id: { in: createdSubIds } } });
  await prisma.subscriptionPlan.deleteMany({ where: { id: { in: createdPlanIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('E1 — gymPlans lists only the caller gym plans', () => {
  it('returns own gym plans with active member counts', async () => {
    const c = await caller(gymOwner);
    const plans = await c.vendorPortal.gymPlans();
    expect(plans.map((p: { id: number }) => p.id).sort()).toEqual([planAId, planBId].sort());
    const a = plans.find((p: { id: number }) => p.id === planAId);
    expect(a?.nameAr).toBe('الباقة الذهبية');
    expect(a?.price).toBe(299);
    expect(a?.memberCount).toBe(2);
    const b = plans.find((p: { id: number }) => p.id === planBId);
    expect(b?.memberCount).toBe(0);
  });

  it('excludes inactive plans and other gym plans', async () => {
    await prisma.subscriptionPlan.update({ where: { id: planBId }, data: { isActive: false } });
    const c = await caller(gymOwner);
    const plans = await c.vendorPortal.gymPlans();
    expect(plans.map((p: { id: number }) => p.id)).toEqual([planAId]);
    expect(plans.some((p: { id: number }) => p.id === otherPlanId)).toBe(false);
    await prisma.subscriptionPlan.update({ where: { id: planBId }, data: { isActive: true } });
  });

  it('is FORBIDDEN for a non-gym caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.gymPlans()).rejects.toThrow(/Gym not found/);
  });
});

describe('E1 — gymMembers lists enrolled members', () => {
  it('returns own gym members with plan + contact info', async () => {
    const c = await caller(gymOwner);
    const members = await c.vendorPortal.gymMembers();
    expect(members).toHaveLength(2);
    const row = members.find((m: { userId: number }) => m.userId === member1.id);
    expect(row?.memberName).toBeTruthy();
    expect(row?.phone).toBeTruthy();
    expect(row?.planNameAr).toBe('الباقة الذهبية');
    expect(row?.status).toBe('ACTIVE');
    expect(row?.periodEnd).toBeTruthy();
  });

  it('is FORBIDDEN for a non-gym caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.gymMembers()).rejects.toThrow(/Gym not found/);
  });
});

describe('E1 — gymClassOccupancy', () => {
  it('returns upcoming own-gym classes with occupancy', async () => {
    const c = await caller(gymOwner);
    const classes = await c.vendorPortal.gymClassOccupancy();
    expect(classes).toHaveLength(1); // past + other-gym classes excluded
    const cls = classes[0];
    expect(cls.nameAr).toBe('يوجا');
    expect(cls.capacity).toBe(10);
    expect(cls.enrolled).toBe(4);
    expect(cls.occupancyPct).toBe(40);
    expect(cls.startsAt).toBeTruthy();
  });

  it('is FORBIDDEN for a non-gym caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.gymClassOccupancy()).rejects.toThrow(/Gym not found/);
  });
});
