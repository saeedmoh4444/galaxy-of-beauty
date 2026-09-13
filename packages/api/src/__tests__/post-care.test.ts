/**
 * postCare router tests — the live router over the seeded DB with
 * factory-created users. Regression coverage for B.15:
 *
 * myPlan used to `orderBy: { completedAt: 'desc' }` — Booking has no
 * completedAt column — and silently swallow the Prisma error via
 * `.catch(() => [])`, so the personalized plan was ALWAYS empty.
 * It also mapped categories by their Arabic name against English map
 * keys (always fell back to skincare) and returned `.ar`-only strings.
 *
 * Expected now: plans ordered by endAt desc, `completedAt` = endAt,
 * bilingual names, slug-based category mapping.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking } from './factories';

let admin: JwtPayload;
let customer: JwtPayload;
let freshCustomer: JwtPayload;

const createdUserIds: number[] = [];
const createdBookingIds: number[] = [];
let hairServiceId: number;
let waxServiceId: number;
let categoryIds: number[] = [];
let addressId: number;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('postCare router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    customer = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    freshCustomer = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    const techUser = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(u1.id, u2.id, techUser.id);

    const hairCat = await prisma.category.create({
      data: {
        nameJson: { ar: 'العناية بالشعر', en: 'Hair Care' },
        slug: `hair-care-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    const waxCat = await prisma.category.create({
      data: {
        nameJson: { ar: 'إزالة الشعر', en: 'Waxing' },
        slug: `waxing-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    categoryIds = [hairCat.id, waxCat.id];

    const hairSvc = await prisma.service.create({
      data: {
        categoryId: hairCat.id,
        titleJson: { ar: 'صبغة شعر', en: 'Hair Color' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    hairServiceId = hairSvc.id;
    const waxSvc = await prisma.service.create({
      data: {
        categoryId: waxCat.id,
        titleJson: { ar: 'إزالة شعر بالشمع', en: 'Waxing' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 90,
        durationMin: 30,
        isActive: true,
      },
    });
    waxServiceId = waxSvc.id;

    const addr = await prisma.address.create({
      data: {
        userId: u1.id,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    addressId = addr.id;

    const now = Date.now();
    const day = 86_400_000;
    // Two completed hair bookings: older (-10d) and recent (-1d),
    // plus one waxing booking (-3d) to prove category mapping is per-service.
    const older = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: u1.id,
          technicianId: techUser.id,
          serviceId: hairServiceId,
          status: 'COMPLETED',
          startAt: new Date(now - 10 * day),
          endAt: new Date(now - 10 * day + 3_600_000),
        }),
        addressId,
      },
    });
    const wax = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: u1.id,
          technicianId: techUser.id,
          serviceId: waxServiceId,
          status: 'COMPLETED',
          startAt: new Date(now - 3 * day),
          endAt: new Date(now - 3 * day + 3_600_000),
        }),
        addressId,
      },
    });
    const recent = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: u1.id,
          technicianId: techUser.id,
          serviceId: hairServiceId,
          status: 'COMPLETED',
          startAt: new Date(now - day),
          endAt: new Date(now - day + 3_600_000),
        }),
        addressId,
      },
    });
    createdBookingIds.push(older.id, wax.id, recent.id);
  }, 20000);

  afterAll(async () => {
    // Children before parents: bookings RESTRICT service/address/user deletes.
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: [hairServiceId, waxServiceId] } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: addressId } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous and non-customer callers', async () => {
    const anon = await caller(null);
    await expect(anon.postCare.myPlan()).rejects.toThrow();

    const c = await caller(admin);
    await expect(c.postCare.myPlan()).rejects.toThrow();
  });

  it('returns an empty plan for a user without completed bookings', async () => {
    const c = await caller(freshCustomer);
    const res = await c.postCare.myPlan();
    expect(res.plans).toEqual([]);
    expect(res.timeframes.length).toBeGreaterThan(0);
  });

  it('returns completed bookings newest-first with completedAt = endAt', async () => {
    const c = await caller(customer);
    const res = await c.postCare.myPlan();

    expect(res.plans.length).toBe(3);
    const first = res.plans[0]!;
    // Most recent booking (-1d) first.
    expect(first.serviceNameAr).toBe('صبغة شعر');
    expect(first.bookingId).toBe(createdBookingIds[2]);
    // endAt desc ordering: -1d, -3d, -10d.
    const ids = res.plans.map((p) => p.bookingId);
    expect(ids).toEqual([createdBookingIds[2], createdBookingIds[1], createdBookingIds[0]]);
    // completedAt is real data now (was undefined — the dead column).
    for (const p of res.plans) {
      expect(typeof p.completedAt).toBe('string');
      expect(new Date(p.completedAt).getTime()).not.toBeNaN();
    }
  });

  it('returns bilingual service/category names and per-service tips', async () => {
    const c = await caller(customer);
    const res = await c.postCare.myPlan();

    const hairPlan = res.plans.find((p) => p.bookingId === createdBookingIds[2])!;
    expect(hairPlan.serviceNameAr).toBe('صبغة شعر');
    expect(hairPlan.serviceNameEn).toBe('Hair Color');
    expect(hairPlan.categoryAr).toBe('العناية بالشعر');
    expect(hairPlan.categoryEn).toBe('Hair Care');
    // Slug-based mapping: hair service → hair tips, not the skincare default.
    expect(hairPlan.tips.length).toBeGreaterThan(0);
    expect(hairPlan.tips[0]!.titleEn).toContain('Wash');

    const waxPlan = res.plans.find((p) => p.bookingId === createdBookingIds[1])!;
    expect(waxPlan.tips[0]!.titleEn).toContain('Exfoliation');
  });

  it('exposes the care library and per-category tips bilingually', async () => {
    const c = await caller(customer);
    const lib = await c.postCare.library();
    expect(lib.categories.length).toBeGreaterThanOrEqual(5);
    for (const cat of lib.categories) {
      expect(typeof cat.nameAr).toBe('string');
      expect(typeof cat.nameEn).toBe('string');
      expect(cat.tipsCount).toBeGreaterThan(0);
    }

    const hair = await c.postCare.byCategory({ category: 'hair' });
    expect(hair.tips.length).toBeGreaterThan(0);
    expect(typeof hair.tips[0]!.titleAr).toBe('string');
    expect(typeof hair.tips[0]!.titleEn).toBe('string');
  });
});
