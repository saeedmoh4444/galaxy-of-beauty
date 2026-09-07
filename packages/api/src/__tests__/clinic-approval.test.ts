/**
 * E2 — Medical beauty clinics (first vertical pilot).
 * Acceptance: clinic registers → admin verifies the license → customer books
 * a consultation (medical consent required) → post-care plan delivered.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let clinicOwner: JwtPayload;
let buyer: JwtPayload;

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdSlotIds: number[] = [];
const createdConsultationIds: number[] = [];
const createdPackageIds: number[] = [];
let clinicSlug: string;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('clinic registration + license approval + consultation booking (E2)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    clinicOwner = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    buyer = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    createdUserIds.push(u1.id, u2.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.clinicConsultation.deleteMany({ where: { id: { in: createdConsultationIds } } });
    } catch {}
    try {
      await prisma.clinicSlot.deleteMany({ where: { id: { in: createdSlotIds } } });
    } catch {}
    try {
      await prisma.beautyPackage.deleteMany({ where: { id: { in: createdPackageIds } } });
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

  it('rejects anonymous clinic registration', async () => {
    const anon = await caller(null);
    await expect(
      anon.marketplace.becomeClinic({
        storeName: 'عيادة تجريبية',
        storeSlug: 'anon-clinic',
        clinicType: 'dermatology',
        licenseNumber: 'MOH-1234',
        licenseAgency: 'MOH',
        documents: {
          medicalLicenseUrl: 'https://example.com/license.pdf',
          crUrl: 'https://example.com/cr.pdf',
          nationalIdUrl: 'https://example.com/id.pdf',
        },
      }),
    ).rejects.toThrow();
  });

  it('registers a clinic → type CLINIC + PENDING submission, hidden until approved', async () => {
    clinicSlug = `clinic-${Date.now()}`;
    const c = await caller(clinicOwner);
    const vendor = await c.marketplace.becomeClinic({
      storeName: 'عيادة لمسة',
      storeSlug: clinicSlug,
      clinicType: 'dermatology',
      licenseNumber: 'MOH-987654',
      licenseAgency: 'MOH',
      descriptionAr: 'عيادة جلدية متخصصة',
      documents: {
        medicalLicenseUrl: 'https://example.com/license.pdf',
        crUrl: 'https://example.com/cr.pdf',
        nationalIdUrl: 'https://example.com/id.pdf',
      },
    });
    createdVendorIds.push(vendor.id);

    expect(vendor.isVerified).toBe(false);
    expect(vendor.type).toBe('CLINIC');
    expect(vendor.clinicType).toBe('dermatology');
    expect(vendor.licenseAgency).toBe('MOH');
    expect(vendor.licenseVerifiedAt).toBeNull();

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: clinicOwner.id, kind: 'clinic' },
    });
    expect(submission).not.toBeNull();
    expect(submission!.status).toBe('PENDING_REVIEW');
    expect((submission!.payload as { vendorId: number }).vendorId).toBe(vendor.id);
    // KSA papers ride the payload for admin review.
    const payload = submission!.payload as { documents?: { medicalLicenseUrl: string } };
    expect(payload.documents?.medicalLicenseUrl).toContain('license.pdf');
    createdSubmissionIds.push(submission!.id);

    // Unverified clinics are hidden from the public clinic list…
    const anon = await caller(null);
    const list = await anon.clinics.list({});
    expect(list.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();

    // …and never leak into the stores list.
    const stores = await anon.marketplace.vendors({});
    expect(stores.items.find((v: { id: number }) => v.id === vendor.id)).toBeUndefined();
  });

  it('rejects duplicate provider registration', async () => {
    const c = await caller(clinicOwner);
    await expect(
      c.marketplace.becomeClinic({
        storeName: 'عيادة أخرى',
        storeSlug: 'another-clinic',
        clinicType: 'laser',
        licenseNumber: 'MOH-1111',
        licenseAgency: 'MOH',
        documents: {
          medicalLicenseUrl: 'https://example.com/license2.pdf',
          crUrl: 'https://example.com/cr2.pdf',
          nationalIdUrl: 'https://example.com/id2.pdf',
        },
      }),
    ).rejects.toThrow(/Already a vendor/);
  });

  it('admin approve → verified + licenseVerifiedAt + listed + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: clinicOwner.id, kind: 'clinic' },
    });

    const a = await caller(admin);
    const res = await a.providerReview.decide({ id: submission.id, approve: true });
    expect(res.status).toBe('APPROVED');

    const vendor = await prisma.vendor.findFirstOrThrow({ where: { userId: clinicOwner.id } });
    expect(vendor.isVerified).toBe(true);
    expect(vendor.licenseVerifiedAt).not.toBeNull();

    const anon = await caller(null);
    const list = await anon.clinics.list({});
    expect(list.items.find((v: { id: number }) => v.id === vendor.id)).toBeDefined();

    const notif = await prisma.notification.findFirst({
      where: { userId: clinicOwner.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('clinic sets its consultation price and opens slots; public slots query works', async () => {
    const c = await caller(clinicOwner);
    const updated = await c.vendorPortal.setConsultationPrice({ price: 150 });
    expect(Number(updated.consultationPrice)).toBe(150);

    const start = new Date(Date.now() + 24 * 3_600_000);
    const end = new Date(start.getTime() + 3_600_000);
    const slot = await c.vendorPortal.clinicSlots.add({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });
    createdSlotIds.push(slot.id);
    expect(slot.isBooked).toBe(false);

    const mine = await c.vendorPortal.clinicSlots.list();
    expect(mine.find((s: { id: number }) => s.id === slot.id)).toBeDefined();

    const anon = await caller(null);
    const from = new Date(start.getTime() - 3_600_000).toISOString();
    const to = end.toISOString();
    const open = await anon.clinics.slots({
      clinicId: createdVendorIds[0]!,
      from,
      to,
    });
    expect(open.find((s: { id: number }) => s.id === slot.id)).toBeDefined();
  });

  it('book requires medical consent (literal true input)', async () => {
    const c = await caller(buyer);
    const slotId = createdSlotIds[0]!;
    await expect(c.clinics.book({ slotId, treatmentType: 'dermatology' } as any)).rejects.toThrow();
  });

  it('customer books a consultation → REQUESTED, slot claimed, consent recorded', async () => {
    const c = await caller(buyer);
    const consult = await c.clinics.book({
      slotId: createdSlotIds[0]!,
      treatmentType: 'dermatology',
      consent: true,
      notes: 'استشارة بشأن حب الشباب',
    });
    createdConsultationIds.push(consult.id);

    expect(consult.status).toBe('REQUESTED');
    expect(consult.code).toMatch(/^GOC-/);
    expect(Number(consult.price)).toBe(150);
    expect(consult.consentAcceptedAt).not.toBeNull();

    const slot = await prisma.clinicSlot.findUniqueOrThrow({
      where: { id: createdSlotIds[0]! },
    });
    expect(slot.isBooked).toBe(true);
    expect(slot.consultationId).toBe(consult.id);
  });

  it('double-booking the same slot is rejected', async () => {
    const c = await caller(buyer);
    await expect(
      c.clinics.book({ slotId: createdSlotIds[0]!, treatmentType: 'laser', consent: true }),
    ).rejects.toThrow();
  });

  it('clinic confirms → CONFIRMED + customer notified with the consultation template', async () => {
    const c = await caller(clinicOwner);
    const confirmed = await c.vendorPortal.confirmConsultation({
      consultationId: createdConsultationIds[0]!,
    });
    expect(confirmed.status).toBe('CONFIRMED');

    const notif = await prisma.notification.findFirst({
      where: { userId: buyer.id, type: 'consultation_confirmed' },
    });
    expect(notif).not.toBeNull();

    // Ownership guard: the buyer cannot confirm someone else's consultation.
    const other = await caller(buyer);
    await expect(
      other.vendorPortal.confirmConsultation({ consultationId: createdConsultationIds[0]! }),
    ).rejects.toThrow();
  });

  it('customer cancels a REQUESTED consultation → slot freed', async () => {
    const c = await caller(clinicOwner);
    const start = new Date(Date.now() + 48 * 3_600_000);
    const slot = await c.vendorPortal.clinicSlots.add({
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    });
    createdSlotIds.push(slot.id);

    const b = await caller(buyer);
    const consult = await b.clinics.book({
      slotId: slot.id,
      treatmentType: 'nutrition',
      consent: true,
    });
    createdConsultationIds.push(consult.id);

    const cancelled = await b.clinics.cancel({ consultationId: consult.id });
    expect(cancelled.status).toBe('CANCELLED');

    const freed = await prisma.clinicSlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(freed.isBooked).toBe(false);
    expect(freed.consultationId).toBeNull();
  });

  it('clinic cancels a REQUESTED consultation → CANCELLED + customer notified', async () => {
    const c = await caller(clinicOwner);
    const start = new Date(Date.now() + 72 * 3_600_000);
    const slot = await c.vendorPortal.clinicSlots.add({
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 3_600_000).toISOString(),
    });
    createdSlotIds.push(slot.id);

    const b = await caller(buyer);
    const consult = await b.clinics.book({
      slotId: slot.id,
      treatmentType: 'laser',
      consent: true,
    });
    createdConsultationIds.push(consult.id);

    const cancelled = await c.vendorPortal.clinicCancelConsultation({
      consultationId: consult.id,
    });
    expect(cancelled.status).toBe('CANCELLED');

    const notif = await prisma.notification.findFirst({
      where: { userId: buyer.id, type: 'consultation_cancelled' },
    });
    expect(notif).not.toBeNull();

    const freed = await prisma.clinicSlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(freed.isBooked).toBe(false);
  });

  it('postCare.myPlan includes the confirmed consultation plan', async () => {
    const c = await caller(buyer);
    const plan = await c.postCare.myPlan();
    const consults =
      (plan as { consultationPlans?: Array<{ treatmentType: string }> }).consultationPlans ?? [];
    expect(consults.some((p) => p.treatmentType === 'dermatology')).toBe(true);
  });

  it('clinic proposes a treatment package → approval gates it into the public detail', async () => {
    const c = await caller(clinicOwner);
    const pkg = await c.clinics.proposePackage({
      nameAr: 'باقة تنظيف البشرة',
      nameEn: 'Skin cleansing package',
      descriptionAr: '٣ جلسات تنظيف',
      discountPercent: 10,
    });
    createdPackageIds.push(pkg.id);
    expect(pkg.status).toBe('PENDING_REVIEW');

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: clinicOwner.id, kind: 'clinic_package' },
    });
    expect(submission).not.toBeNull();
    createdSubmissionIds.push(submission!.id);

    // Not visible while pending.
    let anon = await caller(null);
    let detail = await anon.clinics.detail({ slug: clinicSlug });
    expect(detail.packages.find((p: { id: number }) => p.id === pkg.id)).toBeUndefined();

    const a = await caller(admin);
    await a.providerReview.decide({ id: submission!.id, approve: true });

    anon = await caller(null);
    detail = await anon.clinics.detail({ slug: clinicSlug });
    expect(detail.packages.find((p: { id: number }) => p.id === pkg.id)).toBeDefined();
    expect(detail.clinicType).toBe('dermatology');
    expect(detail.licenseVerifiedAt).not.toBeNull();
  });

  it('anonymous guards: booking and myConsultations require auth', async () => {
    const anon = await caller(null);
    await expect(
      anon.clinics.book({ slotId: 1, treatmentType: 'dental', consent: true }),
    ).rejects.toThrow();
    await expect(anon.clinics.myConsultations()).rejects.toThrow();
  });
});
