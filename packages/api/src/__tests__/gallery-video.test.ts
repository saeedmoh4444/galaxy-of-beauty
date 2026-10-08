/**
 * F4 — tech gallery video items. A gallery entry can be an image OR a
 * video: upload accepts exactly one of imageUrl/videoUrl, and the public
 * byTechnician listing returns video items alongside images.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let techUser: JwtPayload;
const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdGalleryIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('tech gallery video items (F4)', () => {
  beforeAll(async () => {
    const t = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    techUser = { id: t.id, role: 'TECHNICIAN', email: t.email };
    createdUserIds.push(t.id);

    const tech = await prisma.technician.create({
      data: { userId: t.id, city: 'الرياض', kycStatus: 'VERIFIED', bioJson: { ar: 'أ', en: 'A' } },
    });
    createdTechIds.push(tech.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.galleryImage.deleteMany({ where: { id: { in: createdGalleryIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('upload accepts a video-only item (videoUrl, no imageUrl)', async () => {
    const c = await caller(techUser);
    const item = await c.gallery.upload({
      videoUrl: 'https://example.com/tutorial.mp4',
      captionAr: 'فيديو تعليمي',
    });
    createdGalleryIds.push(item.id);
    expect(item.videoUrl).toBe('https://example.com/tutorial.mp4');
    expect(item.imageUrl).toBeNull();
  });

  it('upload still accepts image-only items (videoUrl null)', async () => {
    const c = await caller(techUser);
    const item = await c.gallery.upload({ imageUrl: 'https://example.com/hair.jpg' });
    createdGalleryIds.push(item.id);
    expect(item.imageUrl).toBe('https://example.com/hair.jpg');
    expect(item.videoUrl).toBeNull();
  });

  it('upload rejects items with neither image nor video', async () => {
    const c = await caller(techUser);
    await expect(c.gallery.upload({})).rejects.toThrow();
  });

  it('byTechnician lists video items alongside images', async () => {
    const c = await caller(techUser);
    const anon = await caller(null);
    const video = await c.gallery.upload({ videoUrl: 'https://example.com/reel.mp4' });
    createdGalleryIds.push(video.id);

    const list = await anon.gallery.byTechnician({ technicianId: techUser.id });
    const ids = list.items.map((i: any) => i.id);
    expect(ids).toContain(video.id);
  });
});
