/**
 * B.6 — provider-proposed beauty packages behind an approval gate.
 * Covers: own-services rule, PENDING_REVIEW lifecycle, the generic
 * ProviderSubmission queue (kind 'package'), admin approval/rejection with
 * notifications (B.26 templates submission_approved/rejected).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let techA: JwtPayload;
let techB: JwtPayload;

const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];
const createdMappingIds: number[] = [];
const createdPackageIds: number[] = [];
const createdSubmissionIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeTechWithService(serviceNames: Array<{ ar: string; en: string }>) {
  const user = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  createdUserIds.push(user.id);
  const tech = await prisma.technician.create({ data: { userId: user.id, city: 'الرياض' } });
  createdTechIds.push(tech.id);

  const cat = await prisma.category.create({
    data: {
      nameJson: { ar: 'تصنيف الباقات', en: 'Package Category' },
      slug: `pkg-cat-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      iconUrl: '',
    },
  });
  createdCategoryIds.push(cat.id);

  // Each tech gets two own services (propose requires bundles of ≥2).
  const serviceIds: number[] = [];
  for (const name of serviceNames) {
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: name,
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 100,
        durationMin: 60,
        isActive: true,
      },
    });
    createdServiceIds.push(svc.id);
    const mapping = await prisma.technicianService.create({
      data: { technicianId: tech.id, serviceId: svc.id },
    });
    createdMappingIds.push(mapping.id);
    serviceIds.push(svc.id);
  }

  return {
    userId: user.id,
    payload: { id: user.id, role: 'TECHNICIAN', email: user.email } as JwtPayload,
    serviceIds,
  };
}

describe('package approvals (B.6)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const a = await makeTechWithService([
      { ar: 'قص شعر', en: 'Haircut' },
      { ar: 'صبغة', en: 'Color' },
    ]);
    techA = a.payload;
    const b = await makeTechWithService([
      { ar: 'تنظيف بشرة', en: 'Facial' },
      { ar: 'ماسك', en: 'Mask' },
    ]);
    techB = b.payload;
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
    } catch {}
    try {
      await prisma.beautyPackageService.deleteMany({
        where: { packageId: { in: createdPackageIds } },
      });
    } catch {}
    try {
      await prisma.beautyPackage.deleteMany({ where: { id: { in: createdPackageIds } } });
    } catch {}
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.technicianService.deleteMany({ where: { id: { in: createdMappingIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous propose calls', async () => {
    const anon = await caller(null);
    await expect(
      anon.beautyPackages.propose({ nameAr: 'x', nameEn: 'x', serviceIds: [1, 2] }),
    ).rejects.toThrow();
  });

  it('enforces the own-services rule on proposals', async () => {
    const c = await caller(techA);
    const own = await prisma.technicianService.findMany({
      where: { technician: { userId: techA.id } },
      select: { serviceId: true },
    });
    const foreign = await prisma.technicianService.findFirstOrThrow({
      where: { technician: { userId: techB.id } },
      select: { serviceId: true },
    });

    await expect(
      c.beautyPackages.propose({
        nameAr: 'باقة غير مسموحة',
        nameEn: 'Invalid bundle',
        serviceIds: [foreign.serviceId, own[0]!.serviceId],
      }),
    ).rejects.toThrow(/own services/);
  });

  it('proposes a package → PENDING_REVIEW + submission row, hidden from public list', async () => {
    const c = await caller(techA);
    const mine = await prisma.technicianService.findMany({
      where: { technician: { userId: techA.id } },
      select: { serviceId: true },
    });
    const [s1, s2] = await prisma.service.findMany({
      where: { id: { in: mine.map((m) => m.serviceId) } },
      take: 2,
    });
    expect(s2).toBeDefined(); // own-services bundle of 2 needs 2 own services

    const pkg = await c.beautyPackages.propose({
      nameAr: 'باقة العناية الكاملة',
      nameEn: 'Complete Care Bundle',
      descriptionAr: 'باقة تجمع خدمتين',
      discountPercent: 20,
      serviceIds: [s1!.id, s2!.id],
    });
    createdPackageIds.push(pkg.id);

    expect(pkg.status).toBe('PENDING_REVIEW');
    expect(pkg.createdByUserId).toBe(techA.id);

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: techA.id, kind: 'package' },
    });
    expect(submission).not.toBeNull();
    expect(submission!.status).toBe('PENDING_REVIEW');
    expect((submission!.payload as { packageId: number }).packageId).toBe(pkg.id);
    createdSubmissionIds.push(submission!.id);

    // Not yet public.
    const anon = await caller(null);
    const pub = await anon.beautyPackages.list();
    expect(pub.find((p: { id: number }) => p.id === pkg.id)).toBeUndefined();
  });

  it('lists only my own proposals in myPackages', async () => {
    const mine = await caller(techA);
    const myPkgs = await mine.beautyPackages.myPackages();
    expect(myPkgs.length).toBe(1);

    const other = await caller(techB);
    const otherPkgs = await other.beautyPackages.myPackages();
    expect(otherPkgs.length).toBe(0);
  });

  it('admin review queue lists pending package submissions (tech cannot)', async () => {
    const c = await caller(techA);
    await expect(c.providerReview.list({})).rejects.toThrow();

    const a = await caller(admin);
    const queue = await a.providerReview.list({ kind: 'package' });
    expect(queue.items.length).toBe(1);
    expect(queue.items[0]!.providerId).toBe(techA.id);
  });

  it('admin approve → package goes live + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: techA.id, kind: 'package' },
    });

    const a = await caller(admin);
    const res = await a.providerReview.decide({ id: submission.id, approve: true });
    expect(res.status).toBe('APPROVED');

    const pkg = await prisma.beautyPackage.findUniqueOrThrow({
      where: { id: (submission.payload as { packageId: number }).packageId },
    });
    expect(pkg.status).toBe('APPROVED');
    expect(pkg.reviewedBy).toBe(admin.id);

    const anon = await caller(null);
    const pub = await anon.beautyPackages.list();
    expect(pub.find((p: { id: number }) => p.id === pkg.id)).toBeDefined();

    const notif = await prisma.notification.findFirst({
      where: { userId: techA.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('admin reject with notes → package REJECTED + provider notified', async () => {
    // techB proposes, then gets rejected.
    const c = await caller(techB);
    const mine = await prisma.technicianService.findMany({
      where: { technician: { userId: techB.id } },
      select: { serviceId: true },
    });
    const [s1, s2] = await prisma.service.findMany({
      where: { id: { in: mine.map((m) => m.serviceId) } },
      take: 2,
    });
    const pkg = await c.beautyPackages.propose({
      nameAr: 'باقة مرفوضة',
      nameEn: 'Rejected bundle',
      serviceIds: [s1!.id, s2!.id],
    });
    createdPackageIds.push(pkg.id);
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: techB.id, kind: 'package' },
    });
    createdSubmissionIds.push(submission.id);

    const a = await caller(admin);
    const res = await a.providerReview.decide({
      id: submission.id,
      approve: false,
      notes: 'الأسعار غير مناسبة',
    });
    expect(res.status).toBe('REJECTED');

    const stored = await prisma.beautyPackage.findUniqueOrThrow({ where: { id: pkg.id } });
    expect(stored.status).toBe('REJECTED');
    expect(stored.reviewNotes).toBe('الأسعار غير مناسبة');

    const notif = await prisma.notification.findFirst({
      where: { userId: techB.id, type: 'submission_rejected' },
    });
    expect(notif).not.toBeNull();
    expect((notif!.bodyJson as { ar: string }).ar).toContain('الأسعار غير مناسبة');
  });
});
