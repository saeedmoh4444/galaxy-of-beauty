/**
 * E2 — Clinic console deepening (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
 * Treatment-package proposals (clinic_package submission), consultation
 * outcomes (completed / no-show) with cancel reasons, and slot utilization.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdPackageIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdSlotIds: number[] = [];
const createdConsultIds: number[] = [];

let clinicOwner: JwtPayload;
let customer: JwtPayload;
let bystander: JwtPayload;

let clinicVendorId: number;
let consultId: number;

const DAY = 86_400_000;
const HOUR = 3_600_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

/** Create a CONFIRMED consultation on a booked slot (the outcome flow's
 *  precondition — confirmConsultation does the REQUESTED→CONFIRMED hop). */
async function seededConsultation(overrides: Record<string, unknown> = {}) {
  const slot = await prisma.clinicSlot.create({
    data: {
      clinicId: clinicVendorId,
      startAt: new Date(Date.now() + 2 * DAY),
      endAt: new Date(Date.now() + 2 * DAY + HOUR),
      isBooked: true,
      ...overrides,
    },
  });
  createdSlotIds.push(slot.id);
  const consult = await prisma.clinicConsultation.create({
    data: {
      code: `GOC-${Date.now().toString(36).toUpperCase()}`,
      clinicId: clinicVendorId,
      customerId: customer.id,
      slotId: slot.id,
      treatmentType: 'dermatology',
      price: 200,
      status: 'CONFIRMED',
      scheduledAt: new Date(Date.now() + 2 * DAY),
    },
  });
  createdConsultIds.push(consult.id);
  return consult;
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  const custU = await prisma.user.create({ data: buildUser() });
  const bystanderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, custU.id, bystanderU.id);
  clinicOwner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  customer = { id: custU.id, role: 'CUSTOMER', email: custU.email };
  bystander = { id: bystanderU.id, role: 'CUSTOMER', email: bystanderU.email };

  const clinic = await prisma.vendor.create({
    data: {
      userId: ownerU.id,
      type: 'CLINIC',
      storeName: 'Derma Clinic',
      storeSlug: `cl-${Date.now()}`,
      clinicType: 'dermatology',
    },
  });
  createdVendorIds.push(clinic.id);
  clinicVendorId = clinic.id;
}, 15000);

afterAll(async () => {
  await prisma.clinicConsultation.deleteMany({ where: { id: { in: createdConsultIds } } });
  await prisma.clinicSlot.deleteMany({ where: { id: { in: createdSlotIds } } });
  await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
  await prisma.beautyPackage.deleteMany({ where: { id: { in: createdPackageIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('E2 — proposeClinicPackage', () => {
  it('creates a PENDING_REVIEW package + clinic_package submission', async () => {
    const c = await caller(clinicOwner);
    const res = await c.vendorPortal.proposeClinicPackage({
      nameAr: 'باقة تنظيف البشرة',
      nameEn: 'Deep Cleanse',
      descriptionAr: 'ثلاث جلسات',
      discountPercent: 20,
    });
    createdPackageIds.push(res.packageId);
    createdSubmissionIds.push(res.submissionId);

    const pkg = await prisma.beautyPackage.findUniqueOrThrow({ where: { id: res.packageId } });
    expect(pkg.status).toBe('PENDING_REVIEW');
    expect(pkg.clinicId).toBe(clinicVendorId);
    expect(pkg.createdByUserId).toBe(clinicOwner.id);
    const sub = await prisma.providerSubmission.findUniqueOrThrow({
      where: { id: res.submissionId },
    });
    expect(sub.kind).toBe('clinic_package');
    expect((sub.payload as { packageId: number }).packageId).toBe(res.packageId);
  });

  it('is FORBIDDEN for a non-clinic caller', async () => {
    const c = await caller(bystander);
    await expect(
      c.vendorPortal.proposeClinicPackage({ nameAr: 'باقة', nameEn: 'Pack', discountPercent: 10 }),
    ).rejects.toThrow(/Clinic not found/);
  });
});

describe('E2 — clinicPackages', () => {
  it('lists only own clinic packages with their approval status', async () => {
    const c = await caller(clinicOwner);
    const rows = await c.vendorPortal.clinicPackages();
    expect(rows.length).toBe(1);
    expect(rows[0].nameAr).toBe('باقة تنظيف البشرة');
    expect(rows[0].status).toBe('PENDING_REVIEW');
  });

  it('is FORBIDDEN for a non-clinic caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.clinicPackages()).rejects.toThrow(/Clinic not found/);
  });
});

describe('E2 — clinicOutcome', () => {
  it('marks a CONFIRMED consultation completed', async () => {
    const consult = await seededConsultation();
    const c = await caller(clinicOwner);
    const updated = await c.vendorPortal.clinicOutcome({
      consultationId: consult.id,
      outcome: 'completed',
    });
    expect(updated.status).toBe('COMPLETED');
    expect(updated.noShow).toBe(false);
  });

  it('marks a no-show with the flag set', async () => {
    const consult = await seededConsultation();
    const c = await caller(clinicOwner);
    const updated = await c.vendorPortal.clinicOutcome({
      consultationId: consult.id,
      outcome: 'no_show',
      reason: 'لم تحضر الموعد',
    });
    expect(updated.status).toBe('COMPLETED');
    expect(updated.noShow).toBe(true);
  });

  it('rejects an outcome on a non-CONFIRMED consultation', async () => {
    const slot = await prisma.clinicSlot.create({
      data: {
        clinicId: clinicVendorId,
        startAt: new Date(Date.now() + 3 * DAY),
        endAt: new Date(Date.now() + 3 * DAY + HOUR),
        isBooked: true,
      },
    });
    createdSlotIds.push(slot.id);
    const consult = await prisma.clinicConsultation.create({
      data: {
        code: `GOC-${Date.now().toString(36).toUpperCase()}`,
        clinicId: clinicVendorId,
        customerId: customer.id,
        slotId: slot.id,
        treatmentType: 'laser',
        price: 300,
        status: 'REQUESTED',
        scheduledAt: new Date(Date.now() + 3 * DAY),
      },
    });
    createdConsultIds.push(consult.id);
    const c = await caller(clinicOwner);
    await expect(
      c.vendorPortal.clinicOutcome({ consultationId: consult.id, outcome: 'completed' }),
    ).rejects.toThrow(/not confirmed|CONFIRMED/);
  });

  it('rejects an outcome on another clinic consultation', async () => {
    const consult = await seededConsultation();
    const c = await caller(bystander);
    await expect(
      c.vendorPortal.clinicOutcome({ consultationId: consult.id, outcome: 'completed' }),
    ).rejects.toThrow(/Clinic not found/);
  });
});

describe('E2 — clinicSlotUtilization', () => {
  it('computes booked/total utilization over the last 30 days', async () => {
    // Seed a second booked slot and a free slot (recent days).
    await prisma.clinicSlot
      .create({
        data: {
          clinicId: clinicVendorId,
          startAt: new Date(Date.now() - 1 * DAY),
          endAt: new Date(Date.now() - 1 * DAY + HOUR),
          isBooked: true,
        },
      })
      .then((s) => createdSlotIds.push(s.id));
    await prisma.clinicSlot
      .create({
        data: {
          clinicId: clinicVendorId,
          startAt: new Date(Date.now() - 2 * DAY),
          endAt: new Date(Date.now() - 2 * DAY + HOUR),
          isBooked: false,
        },
      })
      .then((s) => createdSlotIds.push(s.id));

    const c = await caller(clinicOwner);
    const util = await c.vendorPortal.clinicSlotUtilization();
    // 2 booked (recent + seeded 2d future — future slots are outside the
    // window, so count only the −1d one) + free −2d: 1 booked of 2 total.
    expect(util.totalSlots).toBe(2);
    expect(util.bookedSlots).toBe(1);
    expect(util.utilizationPct).toBe(50);
    expect(util.byDay.length).toBeGreaterThan(0);
  });

  it('is FORBIDDEN for a non-clinic caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.clinicSlotUtilization()).rejects.toThrow(/Clinic not found/);
  });
});
