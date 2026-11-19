/**
 * W6-4 — social domain coverage. social (trending/spotlight/tips/feed),
 * socialChallenges (join/leave/progress state) and socialImpact (stats/
 * milestones) had 10/42 procedures exercised; this suite pins the
 * public-read + ownership-write contracts.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking } from './factories';

let admin: JwtPayload;
let customerA: JwtPayload;
const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdBookingIds: number[] = [];
const createdServiceIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdAddressIds: number[] = [];
const createdConfigKeys: string[] = [];
const createdGalleryIds: number[] = [];
const createdImpactIds: number[] = [];
let techUserId: number;

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('social domain coverage (W6-4)', () => {
  beforeAll(async () => {
    const a = await prisma.user.create({ data: buildUser() });
    const adm = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
    const tech = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(a.id, adm.id, tech.id);
    customerA = { id: a.id, role: 'CUSTOMER', email: a.email };
    admin = { id: adm.id, role: 'ADMIN', email: adm.email };
    techUserId = tech.id;

    const profile = await prisma.technician.create({
      data: { userId: tech.id, city: 'الرياض' },
    });
    createdTechIds.push(profile.id);

    const cat = await prisma.category.create({
      data: {
        nameJson: { ar: 'تصنيف اجتماعي', en: 'Social Category' },
        slug: `social-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    createdCategoryIds.push(cat.id);
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'خدمة اجتماعية', en: 'Social Service' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    createdServiceIds.push(svc.id);
    const addr = await prisma.address.create({
      data: { userId: a.id, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'طريق الملك' },
    });
    createdAddressIds.push(addr.id);

    // A COMPLETED booking inside the 30-day trending window.
    const booking = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: a.id,
          technicianId: techUserId,
          serviceId: svc.id,
          status: 'COMPLETED',
          startAt: new Date(Date.now() - 2 * 86_400_000),
          endAt: new Date(Date.now() - 2 * 86_400_000 + 3_600_000),
        }),
        addressId: addr.id,
      },
    });
    createdBookingIds.push(booking.id);
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.galleryImage.deleteMany({ where: { id: { in: createdGalleryIds } } });
    } catch {}
    try {
      await prisma.platformConfig.deleteMany({ where: { key: { in: createdConfigKeys } } });
    } catch {}
    try {
      await prisma.socialImpact.deleteMany({ where: { id: { in: createdImpactIds } } });
    } catch {}
    try {
      await prisma.challengeParticipant.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: { in: createdAddressIds } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  describe('social', () => {
    it('trending surfaces recently COMPLETED services with booking counts', async () => {
      const c = await caller(null);
      const trending = await c.social.trending();
      expect(Array.isArray(trending)).toBe(true);
      const ours = trending.find(
        (t: { id: number; bookingCount: number }) => t.id === createdServiceIds[0],
      );
      expect(ours).toBeDefined();
      expect(ours.bookingCount).toBeGreaterThanOrEqual(1);
    });

    it('createTip (admin) lands in the public tips list', async () => {
      const cAdmin = await caller(admin);
      const cPub = await caller(null);
      const res = await cAdmin.social.createTip({
        titleAr: 'نصيحة العناية',
        titleEn: 'Care tip',
        bodyAr: 'اشربي الماء',
        bodyEn: 'Drink water',
        category: 'care',
      });
      createdConfigKeys.push(`tip:${res.id}`);

      const tips = await cPub.social.tips({ page: 1 });
      expect(tips.length).toBeGreaterThanOrEqual(1);
      const mine = tips.find((t: { id: string }) => t.id === res.id);
      expect(mine.titleAr).toBe('نصيحة العناية');
      expect(mine.bodyEn).toBe('Drink water');
    });

    it('feed returns only published gallery images', async () => {
      const published = await prisma.galleryImage.create({
        data: {
          technicianId: techUserId,
          isPublished: true,
          captionJson: { ar: 'قبل', en: 'Before' },
        },
      });
      const draft = await prisma.galleryImage.create({
        data: {
          technicianId: techUserId,
          isPublished: false,
          captionJson: { ar: 'بعد', en: 'After' },
        },
      });
      createdGalleryIds.push(published.id, draft.id);

      const c = await caller(null);
      const feed = await c.social.feed({ page: 1 });
      const ids = feed.items.map((i: { id: number }) => i.id);
      expect(ids).toContain(published.id);
      expect(ids).not.toContain(draft.id);
    });
  });

  describe('socialChallenges', () => {
    it('join is idempotent and myChallenges reads only the caller’s', async () => {
      const cA = await caller(customerA);
      const first = await cA.socialChallenges.join({ challengeKey: 'w6-hydration' });
      const second = await cA.socialChallenges.join({ challengeKey: 'w6-hydration' });
      expect(first.id).toBe(second.id); // upsert, no duplicate

      const mine = await cA.socialChallenges.myChallenges();
      expect(
        mine.filter((m: { challengeKey: string }) => m.challengeKey === 'w6-hydration'),
      ).toHaveLength(1);
    });

    it('updateProgress marks completedAt only at 100 and leave removes the row', async () => {
      const cA = await caller(customerA);
      const mid = await cA.socialChallenges.updateProgress({
        challengeKey: 'w6-hydration',
        progress: 50,
      });
      expect(mid.progress).toBe(50);
      expect(mid.completedAt).toBeNull();

      const done = await cA.socialChallenges.updateProgress({
        challengeKey: 'w6-hydration',
        progress: 100,
      });
      expect(done.completedAt).not.toBeNull();

      const left = await cA.socialChallenges.leave({ challengeKey: 'w6-hydration' });
      expect(left.success).toBe(true);
      const mine = await cA.socialChallenges.myChallenges();
      expect(
        mine.filter((m: { challengeKey: string }) => m.challengeKey === 'w6-hydration'),
      ).toHaveLength(0);
    });
  });

  describe('socialImpact', () => {
    it('stats sums per-category counters and milestones respect the limit', async () => {
      const c = await caller(null);
      const before = await c.socialImpact.stats();

      const e1 = await prisma.socialImpact.create({ data: { category: 'EMPLOYED', count: 5 } });
      const e2 = await prisma.socialImpact.create({ data: { category: 'TRAINING', count: 3 } });
      createdImpactIds.push(e1.id, e2.id);

      const after = await c.socialImpact.stats();
      expect(after.womenEmployed).toBe(before.womenEmployed + 5);
      expect(after.womenInTraining).toBe(before.womenInTraining + 3);
      expect(after.goal).toBe(1000);

      const milestones = await c.socialImpact.milestones({ limit: 5 });
      expect(milestones.length).toBeLessThanOrEqual(5);
      expect(milestones.length).toBeGreaterThanOrEqual(1);
    });
  });
});
