/**
 * R6 — moderation reports + takedowns (REELS_SHOPPABLE_PLAN).
 * Customers report shorts (one report per user per short); three
 * reports auto-hide the short pending admin review. Admins list
 * reported shorts with counts; vendors see their store reels in
 * myShorts (the moderation status surface).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdShortIds: number[] = [];

let owner: JwtPayload;
let admin: JwtPayload;
let r1: JwtPayload;
let r2: JwtPayload;
let r3: JwtPayload;

let vendorShortId: number;
let quietShortId: number;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);

  const ownerU = await prisma.user.create({ data: buildUser() });
  const adminU = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  const u1 = await prisma.user.create({ data: buildUser() });
  const u2 = await prisma.user.create({ data: buildUser() });
  const u3 = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, adminU.id, u1.id, u2.id, u3.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  admin = { id: adminU.id, role: 'ADMIN', email: adminU.email };
  r1 = { id: u1.id, role: 'CUSTOMER', email: u1.email };
  r2 = { id: u2.id, role: 'CUSTOMER', email: u2.email };
  r3 = { id: u3.id, role: 'CUSTOMER', email: u3.email };

  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Reports Store', storeSlug: `rep-${stamp}` },
  });
  createdVendorIds.push(v.id);

  const s1 = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'مُبلَّغ', en: 'Reported' },
      consentGiven: true,
      faceBlurred: true,
      vendorId: v.id,
      isApproved: true,
      isActive: true,
      durationSec: 10,
      category: 'makeup',
    },
  });
  const s2 = await prisma.short.create({
    data: {
      type: 'reel',
      titleJson: { ar: 'هادئ', en: 'Quiet' },
      consentGiven: true,
      faceBlurred: true,
      vendorId: v.id,
      isApproved: true,
      isActive: true,
      durationSec: 10,
      category: 'makeup',
    },
  });
  createdShortIds.push(s1.id, s2.id);
  vendorShortId = s1.id;
  quietShortId = s2.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.shortReport.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.shortLike.deleteMany({ where: { shortId: { in: createdShortIds } } });
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

describe('short reports + takedowns (R6)', () => {
  it('a customer can report a short', async () => {
    const c = caller(r1);
    const res = await c.beautyShorts.report({ shortId: vendorShortId, reason: 'inappropriate' });
    expect(res.reportCount).toBe(1);
  });

  it('duplicate reports from the same user do not double-count', async () => {
    const c = caller(r1);
    const res = await c.beautyShorts.report({ shortId: vendorShortId, reason: 'spam' });
    expect(res.reportCount).toBe(1);
  });

  it('three distinct reports auto-hide the short', async () => {
    await caller(r2).beautyShorts.report({ shortId: vendorShortId, reason: 'privacy' });
    const res = await caller(r3).beautyShorts.report({ shortId: vendorShortId, reason: 'other' });
    expect(res.reportCount).toBe(3);

    const short = await prisma.short.findUniqueOrThrow({ where: { id: vendorShortId } });
    expect(short.isActive).toBe(false);
  });

  it('adminReports lists reported shorts with counts and reasons', async () => {
    const c = caller(admin);
    const rows = (await c.beautyShorts.adminReports()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => r.id === vendorShortId);
    expect(mine).toHaveLength(1);
    expect(mine[0]?.reportCount).toBe(3);
    expect(mine[0]?.hidden).toBe(true);
  });

  it('unreported shorts do not appear in adminReports', async () => {
    const c = caller(admin);
    const rows = (await c.beautyShorts.adminReports()) as Array<Record<string, unknown>>;
    expect(rows.some((r) => r.id === quietShortId)).toBe(false);
  });

  it('myShorts returns the vendor store reels with moderation status', async () => {
    const c = caller(owner);
    const rows = (await c.beautyShorts.myShorts()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    expect(mine.map((r) => r.id)).toContain(vendorShortId);
    expect(mine.find((r) => r.id === vendorShortId)?.isActive).toBe(false);
  });

  it('anonymous callers cannot report (UNAUTHORIZED)', async () => {
    const c = caller(null);
    await expect(
      c.beautyShorts.report({ shortId: vendorShortId, reason: 'spam' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('reporting a nonexistent short is NOT_FOUND', async () => {
    const c = caller(r1);
    await expect(
      c.beautyShorts.report({ shortId: 999999999, reason: 'spam' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
