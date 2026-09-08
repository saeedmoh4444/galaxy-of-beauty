/**
 * E6e — technician before/after galleries. The E7 before_after shorts
 * surface on the technician's profile through beautyShorts.gallery
 * (approved only, that technician only, newest first).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let techUser: JwtPayload;
let otherUser: JwtPayload;
const createdUserIds: number[] = [];
const createdShortIds: number[] = [];
const createdTechIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('before/after galleries (E6e)', () => {
  beforeAll(async () => {
    const t = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    techUser = { id: t.id, role: 'TECHNICIAN', email: t.email };
    otherUser = { id: o.id, role: 'TECHNICIAN', email: o.email };
    createdUserIds.push(t.id, o.id);

    const techA = await prisma.technician.create({
      data: {
        userId: t.id,
        city: 'الرياض',
        kycStatus: 'VERIFIED',
        bioJson: { ar: 'أ', en: 'A' },
      },
    });
    const techB = await prisma.technician.create({
      data: {
        userId: o.id,
        city: 'جدة',
        kycStatus: 'VERIFIED',
        bioJson: { ar: 'ب', en: 'B' },
      },
    });
    createdTechIds.push(techA.id, techB.id);

    const approved = await prisma.short.create({
      data: {
        type: 'before_after',
        technicianId: techA.id,
        titleJson: { ar: 'قبل وبعد أ', en: 'BA A' },
        beforeImageUrl: 'https://example.com/ba-a.jpg',
        isApproved: true,
        consentGiven: true,
      },
    });
    createdShortIds.push(approved.id);

    const pending = await prisma.short.create({
      data: {
        type: 'before_after',
        technicianId: techA.id,
        titleJson: { ar: 'معلق', en: 'Pending' },
        isApproved: false,
        consentGiven: true,
      },
    });
    createdShortIds.push(pending.id);

    const other = await prisma.short.create({
      data: {
        type: 'before_after',
        technicianId: techB.id,
        titleJson: { ar: 'بعد الآخرين', en: 'Other BA' },
        isApproved: true,
        consentGiven: true,
      },
    });
    createdShortIds.push(other.id);

    // A reel by tech A must NOT appear in the gallery.
    const reel = await prisma.short.create({
      data: {
        type: 'reel',
        technicianId: techA.id,
        titleJson: { ar: 'فيديو', en: 'Reel' },
        isApproved: true,
        consentGiven: true,
      },
    });
    createdShortIds.push(reel.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('gallery is public and returns only approved before_after shorts for the technician', async () => {
    const anon = await caller(null);
    const gallery = await anon.beautyShorts.gallery({ technicianUserId: techUser.id });
    expect(gallery).toHaveLength(1);
    expect(gallery[0]!.id).toBe(createdShortIds[0]);
    expect(gallery[0]!.type).toBe('before_after');
  });

  it('returns an empty list for unknown users', async () => {
    const anon = await caller(null);
    const none = await anon.beautyShorts.gallery({ technicianUserId: 999_999_999 });
    expect(none).toHaveLength(0);
  });

  it('does not leak other technicians or unapproved posts', async () => {
    const anon = await caller(null);
    const otherGallery = await anon.beautyShorts.gallery({ technicianUserId: otherUser.id });
    expect(otherGallery.some((s: any) => s.id === createdShortIds[2])).toBe(true);
    expect(otherGallery).toHaveLength(1);

    const techAGallery = await anon.beautyShorts.gallery({ technicianUserId: techUser.id });
    const ids = techAGallery.map((s: any) => s.id);
    expect(ids).not.toContain(createdShortIds[1]); // pending
    expect(ids).not.toContain(createdShortIds[3]); // reel
  });
});
