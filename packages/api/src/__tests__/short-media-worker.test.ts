/**
 * R3 — media pipeline worker (REELS_SHOPPABLE_PLAN). handleShortMediaJob
 * probes the real duration (ffprobe) and generates a poster frame
 * (ffmpeg), stripping the uploader-supplied metadata. Both binaries are
 * optional: without them the job degrades gracefully and leaves the
 * short untouched. The test mocks node:child_process — no ffmpeg
 * required in dev/CI.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { prisma } from '@galaxy/db';
import type { Job } from 'bullmq';
import { buildUser } from './factories';
import { deleteFile } from '../lib/storage';

// ── Binaries present (default mock) ────────────────────────

let binariesAvailable = true;

vi.mock('node:child_process', () => ({
  execFile: (
    cmd: string,
    args: string[],
    _opts: unknown,
    cb: (err: Error | null, stdout?: string, stderr?: string) => void,
  ) => {
    if (!binariesAvailable) {
      const err = new Error('spawn ffprobe ENOENT') as NodeJS.ErrnoException;
      err.code = 'ENOENT';
      cb(err);
      return;
    }
    if (cmd === 'ffprobe') {
      cb(null, JSON.stringify({ format: { duration: '73.4' } }), '');
      return;
    }
    if (cmd === 'ffmpeg') {
      // args end with the tmp poster path — write a minimal jpeg there.
      const tmp = args[args.length - 1];
      fs.writeFileSync(tmp, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x01]));
      cb(null, '', '');
      return;
    }
    cb(null, '', '');
  },
}));

const { handleShortMediaJob } = await import('../workers/handlers');

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdShortIds: number[] = [];

async function runJob(shortId: number) {
  return handleShortMediaJob({ data: { shortId } } as Job);
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const u = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(u.id);
  const v = await prisma.vendor.create({
    data: { userId: u.id, storeName: 'Media Store', storeSlug: `media-${stamp}` },
  });
  createdVendorIds.push(v.id);

  const withVideo = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'فيديو', en: 'Video' },
      videoUrl: 'https://cdn.example.com/reel.mp4',
      durationSec: 1, // uploader-supplied, must be replaced by the probe
      consentGiven: true,
      faceBlurred: true,
      vendorId: v.id,
      isActive: true,
      isApproved: false,
      category: 'makeup',
    },
  });
  const noVideo = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'بلا فيديو', en: 'No video' },
      consentGiven: true,
      faceBlurred: true,
      vendorId: v.id,
      isActive: true,
      isApproved: false,
      category: 'makeup',
    },
  });
  createdShortIds.push(withVideo.id, noVideo.id);

  // module-scope handles for the tests
  (globalThis as Record<string, unknown>).__mediaWithVideoId = withVideo.id;
  (globalThis as Record<string, unknown>).__mediaNoVideoId = noVideo.id;
}, 30000);

afterAll(async () => {
  const ids = createdShortIds;
  for (const id of ids) {
    try {
      const s = await prisma.short.findUnique({ where: { id } });
      if (s?.thumbnailUrl) {
        const key = s.thumbnailUrl.replace(/^.*\/uploads\//, '');
        await deleteFile(key);
      }
    } catch {}
  }
  try {
    await prisma.short.deleteMany({ where: { id: { in: ids } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('handleShortMediaJob (R3)', () => {
  it('probes the real duration and generates a poster when binaries exist', async () => {
    const id = (globalThis as Record<string, unknown>).__mediaWithVideoId as number;
    const result = await runJob(id);
    expect(result).toMatchObject({ durationSec: 73, poster: true });

    const short = await prisma.short.findUniqueOrThrow({ where: { id } });
    expect(short.durationSec).toBe(73);
    // uploadFile keys are UUID-based — assert the media folder, not the name.
    expect(short.thumbnailUrl).toContain(`/uploads/media/${id}/`);
  });

  it('skips shorts without a video', async () => {
    const id = (globalThis as Record<string, unknown>).__mediaNoVideoId as number;
    const result = await runJob(id);
    expect(result).toEqual({ skipped: 'no-video' });
  });

  it('degrades gracefully when ffprobe/ffmpeg are missing', async () => {
    binariesAvailable = false;
    const id = (globalThis as Record<string, unknown>).__mediaWithVideoId as number;
    const result = await runJob(id);
    // No crash, no fabricated metadata.
    expect(result).toEqual({ skipped: 'no-media-binaries' });
    binariesAvailable = true;
  });
});
