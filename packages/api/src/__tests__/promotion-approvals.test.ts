/**
 * B.7 — tech promotions through the provider-submission queue.
 * Providers propose time-limited discounts on their OWN services; admin
 * approves → FlashDeal row goes live; rejects → notes + notification.
 * Guardrails: own-service rule and a discount floor (deal price ≥ 40% of
 * the regular price) to stop predatory undercutting.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let techA: JwtPayload;
let techB: JwtPayload;
let techAServiceId: number;
let techBServiceId: number;
let techACustomPrice: number | undefined;

const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];
const createdMappingIds: number[] = [];
const createdSubmissionIds: number[] = [];
const createdDealIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeTechWithService(name: { ar: string; en: string }, customPrice?: number) {
  const user = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  createdUserIds.push(user.id);
  const tech = await prisma.technician.create({ data: { userId: user.id, city: 'الرياض' } });
  createdTechIds.push(tech.id);

  const cat = await prisma.category.create({
    data: {
      nameJson: { ar: 'تصنيف العروض', en: 'Promo Category' },
      slug: `promo-cat-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      iconUrl: '',
    },
  });
  createdCategoryIds.push(cat.id);
  const svc = await prisma.service.create({
    data: {
      categoryId: cat.id,
      titleJson: name,
      descriptionJson: { ar: 'وصف', en: 'Description' },
      basePrice: 200,
      durationMin: 60,
      isActive: true,
    },
  });
  createdServiceIds.push(svc.id);
  const mapping = await prisma.technicianService.create({
    data: { technicianId: tech.id, serviceId: svc.id, customPrice },
  });
  createdMappingIds.push(mapping.id);

  return {
    payload: { id: user.id, role: 'TECHNICIAN', email: user.email } as JwtPayload,
    serviceId: svc.id,
  };
}

const validProposal = (serviceId: number) => ({
  serviceId,
  dealPrice: 100, // 50% of 200 — above the 40% floor
  startsAt: new Date(Date.now() + 86_400_000).toISOString(),
  endsAt: new Date(Date.now() + 3 * 86_400_000).toISOString(),
});

describe('tech promotions (B.7)', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const a = await makeTechWithService({ ar: 'قص شعر', en: 'Haircut' });
    techA = a.payload;
    techAServiceId = a.serviceId;
    const b = await makeTechWithService({ ar: 'تنظيف بشرة', en: 'Facial' });
    techB = b.payload;
    techBServiceId = b.serviceId;
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.flashDeal.deleteMany({ where: { id: { in: createdDealIds } } });
    } catch {}
    try {
      await prisma.providerSubmission.deleteMany({ where: { id: { in: createdSubmissionIds } } });
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

  it('rejects anonymous callers', async () => {
    const anon = await caller(null);
    await expect(anon.promotions.propose(validProposal(techAServiceId))).rejects.toThrow();
  });

  it('enforces the own-service rule', async () => {
    const c = await caller(techA);
    await expect(c.promotions.propose(validProposal(techBServiceId))).rejects.toThrow(
      /own services/,
    );
  });

  it('enforces the discount floor (≥ 40% of regular price)', async () => {
    const c = await caller(techA);
    await expect(
      c.promotions.propose({ ...validProposal(techAServiceId), dealPrice: 50 }),
    ).rejects.toThrow(/floor|٤٠|40/);

    // And a "deal" that isn't cheaper is nonsense.
    await expect(
      c.promotions.propose({ ...validProposal(techAServiceId), dealPrice: 250 }),
    ).rejects.toThrow(/lower|أقل/);

    // endAt before startAt
    await expect(
      c.promotions.propose({
        ...validProposal(techAServiceId),
        endsAt: new Date(Date.now() + 1000).toISOString(),
      }),
    ).rejects.toThrow(/after|بعد/);
  });

  it('proposes a promotion → PENDING_REVIEW submission with the snapshot', async () => {
    const c = await caller(techA);
    const sub = await c.promotions.propose(validProposal(techAServiceId));
    createdSubmissionIds.push(sub.id);

    expect(sub.kind).toBe('promotion');
    expect(sub.status).toBe('PENDING_REVIEW');
    const payload = sub.payload as Record<string, unknown>;
    expect(payload.serviceId).toBe(techAServiceId);
    expect(payload.originalPrice).toBe(200);
    expect(payload.dealPrice).toBe(100);
  });

  it('myPromotions only shows the caller own proposals', async () => {
    const mine = await caller(techA);
    const myList = await mine.promotions.myPromotions();
    expect(myList.length).toBe(1);
    expect(myList[0]!.kind).toBe('promotion');

    const other = await caller(techB);
    const otherList = await other.promotions.myPromotions();
    expect(otherList.length).toBe(0);
  });

  it('admin approve → FlashDeal row live + provider notified', async () => {
    const submission = await prisma.providerSubmission.findFirstOrThrow({
      where: { providerId: techA.id, kind: 'promotion' },
    });

    const a = await caller(admin);
    const res = await a.providerReview.decide({ id: submission.id, approve: true });
    expect(res.status).toBe('APPROVED');

    const deal = await prisma.flashDeal.findFirst({
      where: { serviceId: techAServiceId },
    });
    expect(deal).not.toBeNull();
    expect(Number(deal!.originalPrice)).toBe(200);
    expect(Number(deal!.dealPrice)).toBe(100);
    expect(deal!.discountPercent).toBe(50);
    expect(deal!.isActive).toBe(true);
    createdDealIds.push(deal!.id);

    // Visible in the public feed: the proposal starts tomorrow, so it
    // lands in `upcoming` (active requires startsAt <= now).
    const anon = await caller(null);
    const upcoming = await anon.flashDeals.upcoming();
    expect(upcoming.find((d: { id: number }) => d.id === deal!.id)).toBeDefined();

    const notif = await prisma.notification.findFirst({
      where: { userId: techA.id, type: 'submission_approved' },
    });
    expect(notif).not.toBeNull();
  });

  it('admin reject → no deal created + provider notified with reason', async () => {
    const c = await caller(techB);
    const sub = await c.promotions.propose(validProposal(techBServiceId));
    createdSubmissionIds.push(sub.id);

    const a = await caller(admin);
    const res = await a.providerReview.decide({
      id: sub.id,
      approve: false,
      notes: 'السعر منخفض جدًا',
    });
    expect(res.status).toBe('REJECTED');

    const deal = await prisma.flashDeal.findFirst({
      where: { serviceId: techBServiceId },
    });
    expect(deal).toBeNull();

    const notif = await prisma.notification.findFirst({
      where: { userId: techB.id, type: 'submission_rejected' },
    });
    expect(notif).not.toBeNull();
    expect((notif!.bodyJson as { ar: string }).ar).toContain('السعر منخفض جدًا');
  });
});
