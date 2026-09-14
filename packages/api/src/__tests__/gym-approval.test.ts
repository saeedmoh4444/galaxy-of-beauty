/**
 * E3 — Fitness vertical (second pilot): gyms + trainers.
 * Acceptance: gym registers → admin verifies license → classes book via
 * capacity slots (third booking is "full") → memberships/day passes record
 * purchases (pay at the gym) → trainers ride the technician engine.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let gymOwner: JwtPayload;
let member1: JwtPayload;
let member2: JwtPayload;
let member3: JwtPayload;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdClassIds: number[] = [];
const createdBookingIds: number[] = [];
const createdPlanIds: number[] = [];
const createdPassIds: number[] = [];
let gymSlug: string;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('gym registration + capacity classes + memberships (E3)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const mk = async () => {
      const u = await prisma.user.create({ data: buildUser() });
      createdUserIds.push(u.id);
      return { id: u.id, role: 'CUSTOMER', email: u.email } as JwtPayload;
    };
    gymOwner = await mk();
    member1 = await mk();
    member2 = await mk();
    member3 = await mk();
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.gymClassBooking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.gymClass.deleteMany({ where: { id: { in: createdClassIds } } });
    } catch {}
    try {
      await prisma.customerSubscription.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.classPassPurchase.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.subscriptionPlan.deleteMany({ where: { id: { in: createdPlanIds } } });
    } catch {}
    try {
      await prisma.classPass.deleteMany({ where: { id: { in: createdPassIds } } });
    } catch {}
    try {
      await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
    } catch {}
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous gym registration', async () => {
    const anon = await caller(null);
    await expect(
      anon.marketplace.becomeGym({
        storeName: 'نادي تجريبي',
        storeSlug: 'anon-gym',
        gymType: 'ladies',
        licenseNumber: 'MISA-1234',
        licenseAgency: 'MISA',
        gymCity: 'الرياض',
        gymAddress: 'شارع تجريبي',
        documents: {
          crUrl: 'https://example.com/cr.pdf',
          nationalIdUrl: 'https://example.com/id.pdf',
          licenseUrl: 'https://example.com/license.pdf',
        },
      }),
    ).rejects.toThrow();
  });

  it('registers a gym → type GYM + PENDING submission, hidden until approved', async () => {
    gymSlug = `gym-${Date.now()}`;
    const c = await caller(gymOwner);
    const vendor = await c.marketplace.becomeGym({
      storeName: 'نادي لياقتك',
      storeSlug: gymSlug,
      gymType: 'ladies',
      licenseNumber: 'MISA-987654',
      licenseAgency: 'MISA',
      gymCity: 'الرياض',
      gymAddress: 'حي العليا، شارع التحلية',
      descriptionAr: 'نادي نسائي مجهز بالكامل',
      documents: {
        crUrl: 'https://example.com/cr.pdf',
        nationalIdUrl: 'https://example.com/id.pdf',
        licenseUrl: 'https://example.com/license.pdf',
      },
    });
    createdVendorIds.push(vendor.id);

    expect(vendor.isVerified).toBe(false);
    expect(vendor.type).toBe('GYM');
    expect(vendor.gymType).toBe('ladies');
    expect(vendor.gymCity).toBe('الرياض');

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: gymOwner.id, kind: 'gym' },
    });
    expect(submission).not.toBeNull();
    expect(submission!.status).toBe('PENDING_REVIEW');
    const payload = submission!.payload as { documents?: { licenseUrl?: string } };
    expect(payload.documents?.licenseUrl).toContain('license.pdf');
    createdSubmissionIds.push(submission!.id);

    // Hidden from the public gym list, and never leaks into stores/clinics.
    const anon = await caller(null);
    const gyms = await anon.gyms.list({});
    expect(gyms.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();
    const stores = await anon.marketplace.vendors({});
    expect(stores.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();
    const clinics = await anon.clinics.list({});
    expect(clinics.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();
  });

  it('admin approve → verified + licenseVerifiedAt + listed + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: gymOwner.id, kind: 'gym' },
    });

    const a = await caller(admin);
    const res = await a.providerReview.decide({ id: submission.id, approve: true });
    expect(res.status).toBe('APPROVED');

    const vendor = await prisma.vendor.findFirstOrThrow({ where: { userId: gymOwner.id } });
    expect(vendor.isVerified).toBe(true);
    expect(vendor.licenseVerifiedAt).not.toBeNull();

    const anon = await caller(null);
    const gyms = await anon.gyms.list({});
    expect(gyms.items.find((v: { id: number }) => v.id === vendor.id)).toBeDefined();

    const notif = await prisma.notification.findFirst({
      where: { userId: gymOwner.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('admin creates a gym membership plan → detail lists it → customer subscribes', async () => {
    const a = await caller(admin);
    const plan = await a.subscriptionBoxes.createPlan({
      nameAr: 'عضوية شهرية',
      nameEn: 'Monthly membership',
      descriptionAr: 'دخول غير محدود',
      descriptionEn: 'Unlimited access',
      interval: 'MONTHLY',
      price: 299,
      servicesPerMonth: 0,
      discountPercent: 0,
      gymId: createdVendorIds[0]!,
    });
    createdPlanIds.push(plan.id);

    const anon = await caller(null);
    const detail = await anon.gyms.detail({ slug: gymSlug });
    expect(detail.plans.find((p: { id: number }) => p.id === plan.id)).toBeDefined();

    const c = await caller(member1);
    const sub = await c.subscriptionBoxes.subscribe({ planId: plan.id });
    expect(sub.status).toBe('ACTIVE');

    const mine = await c.subscriptionBoxes.mySubscriptions();
    expect(mine.find((s: { id: number }) => s.id === sub.id)).toBeDefined();
  });

  it('gym adds a capacity-2 class → public classes shows spotsLeft', async () => {
    const c = await caller(gymOwner);
    const start = new Date(Date.now() + 24 * 3_600_000);
    const cls = await c.vendorPortal['gymClasses.add']({
      nameAr: 'يوغا صباحية',
      nameEn: 'Morning yoga',
      startsAt: start.toISOString(),
      endsAt: new Date(start.getTime() + 3_600_000).toISOString(),
      capacity: 2,
      price: 50,
    });
    createdClassIds.push(cls.id);
    expect(cls.enrolledCount).toBe(0);

    const anon = await caller(null);
    const from = new Date(start.getTime() - 3_600_000).toISOString();
    const to = cls.endsAt.toISOString();
    const classes = await anon.gyms.classes({ gymId: createdVendorIds[0]!, from, to });
    const listed = classes.find((x: { id: number }) => x.id === cls.id);
    expect(listed).toBeDefined();
    expect(listed.spotsLeft).toBe(2);
  });

  it('bookClass: two members fill the class; the third gets CONFLICT', async () => {
    const c1 = await caller(member1);
    const b1 = await c1.gyms.bookClass({ classId: createdClassIds[0]! });
    createdBookingIds.push(b1.id);
    expect(b1.status).toBe('BOOKED');
    expect(b1.code).toMatch(/^GYM-/);

    const clsAfter1 = await prisma.gymClass.findUniqueOrThrow({
      where: { id: createdClassIds[0]! },
    });
    expect(clsAfter1.enrolledCount).toBe(1);

    // Same customer cannot book twice (class still has a seat open).
    await expect(c1.gyms.bookClass({ classId: createdClassIds[0]! })).rejects.toThrow(
      /already|Already/i,
    );

    const c2 = await caller(member2);
    const b2 = await c2.gyms.bookClass({ classId: createdClassIds[0]! });
    createdBookingIds.push(b2.id);

    const c3 = await caller(member3);
    await expect(c3.gyms.bookClass({ classId: createdClassIds[0]! })).rejects.toThrow(/full|FULL/i);
  });

  it('customer cancels → CANCELLED + seat freed; ownership guarded', async () => {
    const c2 = await caller(member2);
    const bookings = await c2.gyms.myBookings();
    const mine = bookings.find((b: { classId: number }) => b.classId === createdClassIds[0]!);
    expect(mine).toBeDefined();

    // Ownership guard: member1 cannot cancel member2's booking.
    const c1 = await caller(member1);
    await expect(c1.gyms.cancelBooking({ bookingId: mine!.id as number })).rejects.toThrow();

    const cancelled = await c2.gyms.cancelBooking({ bookingId: mine!.id as number });
    expect(cancelled.status).toBe('CANCELLED');

    const cls = await prisma.gymClass.findUniqueOrThrow({
      where: { id: createdClassIds[0]! },
    });
    expect(cls.enrolledCount).toBe(1);
  });

  it('day pass: gym-scoped ClassPass is listed and purchasable (record-only)', async () => {
    const pass = await prisma.classPass.create({
      data: {
        name: 'بطاقة يوم واحد',
        classes: 1,
        price: 60,
        isActive: true,
        gymId: createdVendorIds[0]!,
      },
    });
    createdPassIds.push(pass.id);

    const anon = await caller(null);
    const detail = await anon.gyms.detail({ slug: gymSlug });
    expect(detail.dayPasses.find((p: { id: number }) => p.id === pass.id)).toBeDefined();

    const c = await caller(member3);
    const purchase = await c.classPass.purchase({ passId: pass.id });
    expect(purchase.classesRemaining).toBe(1);

    const mine = await c.classPass.myPasses({});
    expect(mine.find((p: { id: number }) => p.id === purchase.id)).toBeDefined();
  });

  it('technicians.trainers lists only fitness-category technicians', async () => {
    // Fitness category + service seeded; attach to a fresh technician.
    const cat = await prisma.category.findUnique({ where: { slug: 'fitness' } });
    expect(cat).not.toBeNull();
    const service = await prisma.service.findFirst({
      where: { categoryId: cat!.id, slug: 'personal-training' },
    });
    expect(service).not.toBeNull();

    const techUser = await prisma.user.create({
      data: { ...buildUser(), role: 'TECHNICIAN' },
    });
    createdUserIds.push(techUser.id);
    const tech = await prisma.technician.create({
      data: { userId: techUser.id, city: 'الرياض', kycStatus: 'VERIFIED' },
    });
    await prisma.technicianService.create({
      data: { technicianId: tech.id, serviceId: service!.id },
    });

    const anon = await caller(null);
    const trainers = await anon.technicians.trainers();
    expect(trainers.find((x: { id: number }) => x.id === tech.id)).toBeDefined();
  });

  it('beautyProfile round-trips measurements + fitness goals', async () => {
    const c = await caller(member1);
    await c.beautyProfile.upsert({
      measurements: { heightCm: 165, weightKg: 58, waistCm: 70 },
      fitnessGoals: ['lose-weight', 'tone'],
    });
    const profile = await c.beautyProfile.get();
    const m = profile.measurements as { heightCm?: number } | null;
    expect(m?.heightCm).toBe(165);
    expect(profile.fitnessGoals).toContain('lose-weight');
  });

  it('anonymous guards: bookClass and myBookings require auth', async () => {
    const anon = await caller(null);
    await expect(anon.gyms.bookClass({ classId: createdClassIds[0]! })).rejects.toThrow();
    await expect(anon.gyms.myBookings()).rejects.toThrow();
  });
});
