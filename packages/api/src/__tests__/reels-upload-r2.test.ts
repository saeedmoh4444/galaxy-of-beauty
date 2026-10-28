/**
 * R2 — shoppable reels video upload path (REELS_SHOPPABLE_PLAN).
 * Presigned uploads gain a `shorts` folder (video content-types only,
 * enforced before the presigner runs) and a finalize step that checks
 * the uploaded object's real size (presigned signatures cannot bound
 * size) and deletes oversize files. The create quota caps active reels
 * per author at 10.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { prisma } from '@galaxy/db';
import { MAX_VIDEO_SIZE } from '@galaxy/shared';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { uploadFile, deleteFile } from '../lib/storage';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdShortIds: number[] = [];

let poster: JwtPayload;
let vendorUserId: number;
let vendorId: number;

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), process.env['UPLOAD_DIR'] || 'uploads');

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  poster = { id: u.id, role: 'CUSTOMER', email: u.email };
  vendorUserId = u.id;

  const v = await prisma.vendor.create({
    data: { userId: u.id, storeName: 'Upload Store', storeSlug: `up-${stamp}` },
  });
  createdVendorIds.push(v.id);
  vendorId = v.id;

  // Ten active reels already at the cap.
  for (let i = 0; i < 10; i++) {
    const s = await prisma.short.create({
      data: {
        type: 'reel',
        titleJson: { ar: `فيديو ${i}`, en: `Reel ${i}` },
        consentGiven: true,
        faceBlurred: true,
        vendorId: v.id,
        isActive: true,
        isApproved: false,
        durationSec: 10,
        category: 'makeup',
      },
    });
    createdShortIds.push(s.id);
  }
}, 30000);

afterAll(async () => {
  try {
    await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('reels upload path (R2)', () => {
  it('presignedUrl rejects non-video content-types for the shorts folder', async () => {
    const c = caller(poster);
    await expect(
      c.uploads.presignedUrl({ folder: 'shorts', contentType: 'image/jpeg' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('presignedUrl accepts video content-types for the shorts folder', async () => {
    const c = caller(poster);
    try {
      const result = await c.uploads.presignedUrl({ folder: 'shorts', contentType: 'video/mp4' });
      expect(result).toHaveProperty('key');
    } catch (err) {
      // Without S3 configured the presigner is unavailable — the type
      // gate above is what this test owns, not the storage backend.
      expect((err as { code?: string })?.code).toBe('NOT_IMPLEMENTED');
    }
  });

  it('finalizeShortUpload rejects keys outside the caller folder', async () => {
    const c = caller(poster);
    await expect(
      c.uploads.finalizeShortUpload({ key: 'shorts/999999999/leak.mp4' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('finalizeShortUpload accepts an in-limit local file and reports its size', async () => {
    const up = await uploadFile(Buffer.from('tiny'), 'ok.mp4', `shorts/${poster.id}`, 'video/mp4');
    expect(up.key.startsWith(`shorts/${poster.id}/`)).toBe(true);
    const c = caller(poster);
    const res = await c.uploads.finalizeShortUpload({ key: up.key });
    expect(res.sizeBytes).toBe(4);
    await deleteFile(up.key);
  });

  it.skipIf(process.env['AWS_S3_BUCKET'])(
    'finalizeShortUpload rejects and deletes oversize local files',
    async () => {
      const key = `shorts/${poster.id}/big-${Date.now().toString(36)}.mp4`;
      const fp = path.join(LOCAL_UPLOAD_DIR, key);
      fs.mkdirSync(path.dirname(fp), { recursive: true });
      fs.writeFileSync(fp, 'x');
      // Sparse file — full size without allocating 100 MB.
      fs.truncateSync(fp, MAX_VIDEO_SIZE + 1);
      const c = caller(poster);
      await expect(c.uploads.finalizeShortUpload({ key })).rejects.toMatchObject({
        code: 'PAYLOAD_TOO_LARGE',
      });
      expect(fs.existsSync(fp)).toBe(false);
    },
  );

  it('create enforces the 10-active-reel quota per vendor', async () => {
    const c = caller(poster);
    await expect(
      c.beautyShorts.create({
        type: 'reel',
        titleAr: 'فيديو زائد',
        titleEn: 'Over the cap',
        consent: true,
        vendorId,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
