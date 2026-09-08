/**
 * E7 — beauty media layer. Persisted shorts (reels + before/after) with a
 * moderation queue, like/unlike, view counts, technician posting (consent +
 * face-blur privacy flags), and a media upload procedure reusing the
 * storage pipeline.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let customer: JwtPayload;
let tech: JwtPayload;
let admin: JwtPayload;
const createdUserIds: number[] = [];
const createdShortIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('beauty media layer (E7)', () => {
  beforeAll(async () => {
    const c = await prisma.user.create({ data: buildUser() });
    const t = await prisma.user.create({ data: buildUser() });
    const a = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
    customer = { id: c.id, role: 'CUSTOMER', email: c.email };
    tech = { id: t.id, role: 'TECHNICIAN', email: t.email };
    admin = { id: a.id, role: 'ADMIN', email: a.email };
    createdUserIds.push(c.id, t.id, a.id);

    await prisma.technician.create({
      data: {
        userId: t.id,
        city: 'الرياض',
        kycStatus: 'VERIFIED',
        bioJson: { ar: 'خبيرة مكياج', en: 'Makeup expert' },
      },
    });
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.shortLike.deleteMany({ where: { shortId: { in: createdShortIds } } });
    } catch {}
    try {
      await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { userId: tech.id } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('guards protected procedures; the public feed stays public', async () => {
    const anon = await caller(null);
    const feed = await anon.beautyShorts.feed();
    expect(Array.isArray(feed)).toBe(true);

    await expect(anon.beautyShorts.create({})).rejects.toThrow();
    await expect(anon.beautyShorts.myShorts()).rejects.toThrow();
    await expect(anon.beautyShorts.adminPending()).rejects.toThrow();
    await expect(anon.uploads.uploadMedia({})).rejects.toThrow();
  });

  it('feed returns approved + active shorts only, newest first', async () => {
    const c = await caller(customer);
    const feed = await c.beautyShorts.feed();
    expect(feed.length).toBeGreaterThanOrEqual(1);
    expect(feed.every((s: any) => s.isApproved)).toBe(true);
    const times = feed.map((s: any) => new Date(s.createdAt).getTime());
    for (let i = 1; i < times.length; i++) expect(times[i - 1]!).toBeGreaterThanOrEqual(times[i]!);
  });

  it('like toggles on and off', async () => {
    const c = await caller(customer);
    const feed = await c.beautyShorts.feed();
    const shortId = feed[0]!.id;

    const liked = await c.beautyShorts.like({ shortId });
    expect(liked.liked).toBe(true);

    const unliked = await c.beautyShorts.like({ shortId });
    expect(unliked.liked).toBe(false);
  });

  it('viewed increments the counter', async () => {
    const c = await caller(customer);
    const feed = await c.beautyShorts.feed();
    const before = feed[0]!.views;
    const after = await c.beautyShorts.viewed({ shortId: feed[0]!.id });
    expect(after.views).toBe(before + 1);
  });

  it('create requires a verified technician and explicit consent', async () => {
    const c = await caller(customer);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'اختبار',
        titleEn: 'Test',
        videoUrl: 'https://example.com/v.mp4',
        durationSec: 10,
        category: 'makeup',
        consent: true,
      }),
    ).rejects.toThrow(/technician/i);

    const t = await caller(tech);
    await expect(
      t.beautyShorts.create({
        type: 'reel',
        titleAr: 'اختبار',
        titleEn: 'Test',
        videoUrl: 'https://example.com/v.mp4',
        durationSec: 10,
        category: 'makeup',
        consent: false as never,
      }),
    ).rejects.toThrow();
  });

  it('created shorts land in the moderation queue, not the feed', async () => {
    const t = await caller(tech);
    const created = await t.beautyShorts.create({
      type: 'before_after',
      titleAr: 'قبل وبعد الصبغة',
      titleEn: 'Before & after color',
      beforeImageUrl: 'https://example.com/after.jpg',
      category: 'hair',
      faceBlurred: true,
      consent: true,
    });
    createdShortIds.push(created.id);
    expect(created.isApproved).toBe(false);
    expect(created.type).toBe('before_after');

    const feed = await t.beautyShorts.feed();
    expect(feed.some((s: any) => s.id === created.id)).toBe(false);
  });

  it('myShorts shows own shorts with their moderation status', async () => {
    const t = await caller(tech);
    const mine = await t.beautyShorts.myShorts();
    expect(mine.some((s: any) => s.id === createdShortIds[0])).toBe(true);
    // technicianId is the technician RECORD id, not the user id.
    const techRecord = await prisma.technician.findUniqueOrThrow({ where: { userId: tech.id } });
    expect(mine.every((s: any) => s.technicianId === techRecord.id)).toBe(true);
  });

  it('admin approves → appears in feed; reject → hidden', async () => {
    const a = await caller(admin);
    const pending = await a.beautyShorts.adminPending();
    expect(pending.some((s: any) => s.id === createdShortIds[0])).toBe(true);

    await a.beautyShorts.adminDecide({ shortId: createdShortIds[0]!, approve: true });
    const feed = await a.beautyShorts.feed();
    expect(feed.some((s: any) => s.id === createdShortIds[0])).toBe(true);

    // A second pending short gets rejected → never appears.
    const t = await caller(tech);
    const second = await t.beautyShorts.create({
      type: 'reel',
      titleAr: 'ثانٍ',
      titleEn: 'Second',
      videoUrl: 'https://example.com/v2.mp4',
      durationSec: 5,
      category: 'nails',
      consent: true,
    });
    createdShortIds.push(second.id);
    await a.beautyShorts.adminDecide({ shortId: second.id, approve: false });
    const after = await a.beautyShorts.feed();
    expect(after.some((s: any) => s.id === second.id)).toBe(false);
  });

  it('uploadMedia accepts images and rejects unknown types', async () => {
    const t = await caller(tech);
    await expect(
      t.uploads.uploadMedia({
        mediaType: 'video',
        file: {
          name: 'x.txt',
          type: 'text/plain',
          size: 100,
          base64: 'aGVsbG8=',
        },
      }),
    ).rejects.toThrow();

    const result = await t.uploads.uploadMedia({
      mediaType: 'image',
      file: {
        name: 'look.png',
        type: 'image/png',
        size: 100,
        base64: 'data:image/png;base64,aGVsbG8=',
      },
    });
    expect(result.url).toBeTruthy();
  });
});
