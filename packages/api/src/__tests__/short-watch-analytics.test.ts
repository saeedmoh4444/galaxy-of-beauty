/**
 * P2 — watch analytics (REELS_SHOPPABLE_PLAN Phase 2). The feed reports
 * watch events (seconds watched + completion) into ShortWatchLog rows;
 * adminWatchStats aggregates watch-seconds, completions and the
 * completion rate over the last 30 days, per short. Views count
 * impressions — watch metrics measure whether reels actually convert.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdShortIds: number[] = [];
const createdLogIds: number[] = [];

let watcher: JwtPayload;
let admin: JwtPayload;
let shortId: number;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const u = await prisma.user.create({ data: buildUser() });
  const a = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  createdUserIds.push(u.id, a.id);
  watcher = { id: u.id, role: 'CUSTOMER', email: u.email };
  admin = { id: a.id, role: 'ADMIN', email: a.email };

  const v = await prisma.vendor.create({
    data: { userId: u.id, storeName: 'Watch Store', storeSlug: `watch-${stamp}` },
  });
  createdVendorIds.push(v.id);

  const s = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'مراقَب', en: 'Watched' },
      consentGiven: true,
      faceBlurred: true,
      vendorId: v.id,
      isApproved: true,
      isActive: true,
      durationSec: 60,
      category: 'makeup',
    },
  });
  createdShortIds.push(s.id);
  shortId = s.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.shortWatchLog.deleteMany({ where: { id: { in: createdLogIds } } });
  } catch {}
  try {
    await prisma.shortWatchLog.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
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

describe('short watch analytics (P2)', () => {
  it('records a watch event with seconds and completion', async () => {
    const c = caller(watcher);
    const res = await c.beautyShorts.watched({ shortId, seconds: 55, completed: true });
    expect(res.ok).toBe(true);
    createdLogIds.push(res.logId);

    const log = await prisma.shortWatchLog.findUniqueOrThrow({ where: { id: res.logId } });
    expect(log.seconds).toBe(55);
    expect(log.completed).toBe(true);
    expect(log.userId).toBe(watcher.id);
  });

  it('allows anonymous watch events (no userId)', async () => {
    const c = caller(null);
    const res = await c.beautyShorts.watched({ shortId, seconds: 12, completed: false });
    expect(res.ok).toBe(true);
    createdLogIds.push(res.logId);
    const log = await prisma.shortWatchLog.findUniqueOrThrow({ where: { id: res.logId } });
    expect(log.userId).toBeNull();
  });

  it('clamps reported seconds to the reel duration', async () => {
    const c = caller(watcher);
    const res = await c.beautyShorts.watched({ shortId, seconds: 900, completed: true });
    createdLogIds.push(res.logId);
    const log = await prisma.shortWatchLog.findUniqueOrThrow({ where: { id: res.logId } });
    expect(log.seconds).toBe(60);
  });

  it('ignores degenerate zero-second events', async () => {
    const c = caller(watcher);
    await expect(
      c.beautyShorts.watched({ shortId, seconds: 0, completed: false }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('adminWatchStats aggregates watch-seconds and completion rate', async () => {
    const c = caller(admin);
    const rows = (await c.beautyShorts.adminWatchStats()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => r.id === shortId);
    expect(mine).toHaveLength(1);
    // 55 + 12 + 60 (clamped) = 127 seconds across 3 events, 2 completed.
    expect(mine[0]?.watchSeconds).toBe(127);
    expect(mine[0]?.completions).toBe(2);
    expect(mine[0]?.events).toBe(3);
    expect(mine[0]?.completionRate).toBeCloseTo(0.67, 1);
  });

  it('non-admin callers cannot read adminWatchStats', async () => {
    const c = caller(watcher);
    await expect(c.beautyShorts.adminWatchStats()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('watched for a nonexistent short is NOT_FOUND', async () => {
    const c = caller(watcher);
    await expect(
      c.beautyShorts.watched({ shortId: 999999999, seconds: 5, completed: false }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
