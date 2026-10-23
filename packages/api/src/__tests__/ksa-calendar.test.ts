/**
 * D5 — KSA calendar & seasonality: Hijri overlay (tabular approximation,
 * known-anchor sanity), season markers and the seasonal deal-template
 * query on vendorPortal.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { hijriDate, seasonMarkers } from '../lib/ksaCalendar';

const createdUserIds: number[] = [];
let owner: JwtPayload;
let vendorId: number;

function callerFor(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const ownerU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  const vendor = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'D5 Store', storeSlug: `d5-${Date.now()}` },
  });
  vendorId = vendor.id;
}, 15000);

afterAll(async () => {
  await prisma.vendor.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('D5 — Hijri overlay', () => {
  it('approximates known Umm al-Qura anchors within ±1 day', () => {
    // Ramadan 1, 1447 ≈ 2026-02-18 (tabular ±1 day tolerance).
    const ramadan = hijriDate(new Date('2026-02-18T12:00:00Z'));
    expect(ramadan.year).toBe(1447);
    expect(ramadan.month).toBe(9); // Ramadan
    expect(ramadan.day).toBeGreaterThanOrEqual(1);
    expect(ramadan.day).toBeLessThanOrEqual(2);

    // Muharram 1, 1447 ≈ 2025-06-26/27.
    const muharram = hijriDate(new Date('2025-06-27T12:00:00Z'));
    expect(muharram.year).toBe(1447);
    expect(muharram.month).toBe(1);
    expect(muharram.day).toBeLessThanOrEqual(2);
  });
});

describe('D5 — season markers', () => {
  it('returns Ramadan + Eid + National Day markers in 2026', () => {
    const markers = seasonMarkers('2026-01-01', '2026-12-31');
    const types = markers.map((m) => m.type);
    expect(types).toContain('ramadan');
    expect(types).toContain('eid-fitr');
    expect(types).toContain('eid-adha');
    expect(types).toContain('national-day');
    expect(markers.find((m) => m.type === 'ramadan')!.day).toBe('2026-02-18');
    expect(markers.find((m) => m.type === 'national-day')!.day).toBe('2026-09-23');
  });

  it('returns nothing for an unknown year', () => {
    expect(seasonMarkers('2030-01-01', '2030-12-31')).toEqual([]);
  });
});

describe('D5 — seasonal deal templates', () => {
  it('lists the current-year seasons as prefilled deal windows', async () => {
    const c = callerFor(owner);
    const templates = await c.vendorPortal.dealTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(4);
    const ramadan = templates.find((t: { type: string }) => t.type === 'ramadan');
    expect(ramadan).toBeDefined();
    expect(ramadan!.titleAr).toContain('رمضان');
    expect(ramadan!.startsAt < ramadan!.endsAt).toBe(true);
  });
});
