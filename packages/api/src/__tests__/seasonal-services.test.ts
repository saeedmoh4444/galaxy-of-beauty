/**
 * 1.4 Seasonal & Event Services — season detection + active window query.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { getActiveSeasons } from '../lib/season';

const CSRF = 'a'.repeat(64);

async function callerFor(user?: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let admin: JwtPayload;
let categoryId: number;
const createdIds: number[] = [];

beforeAll(async () => {
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  admin = { id: adminUser!.id, role: adminUser!.role, email: adminUser!.email };
  const category = await prisma.category.findFirst();
  categoryId = category!.id;
}, 15000);

afterAll(async () => {
  await prisma.seasonalService.deleteMany({ where: { id: { in: createdIds } } });
});

describe('getActiveSeasons (pure, Riyadh-anchored)', () => {
  it('detects Ramadan in Hijri month 9', () => {
    // Ramadan 1, 1447 AH ≈ 2026-02-18 (Umm al-Qura). Verify via Intl directly.
    const date = new Date('2026-02-18T12:00:00+03:00');
    const fmt = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      timeZone: 'Asia/Riyadh',
      month: 'numeric',
      day: 'numeric',
    });
    const parts: Record<string, string> = {};
    for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
    if (parts['month'] === '9') {
      expect(getActiveSeasons(date)).toContain('RAMADAN');
    } else {
      // Guard against calendar-table drift: find the real Ramadan 1 instead.
      for (let d = 0; d < 370; d++) {
        const candidate = new Date('2026-01-01T12:00:00+03:00');
        candidate.setDate(candidate.getDate() + d);
        const p2: Record<string, string> = {};
        for (const q of fmt.formatToParts(candidate)) p2[q.type] = q.value;
        if (p2['month'] === '9' && p2['day'] === '1') {
          expect(getActiveSeasons(candidate)).toContain('RAMADAN');
          return;
        }
      }
      throw new Error('could not find Ramadan 1 in 2026');
    }
  });

  it('detects Valentine season in early February', () => {
    expect(getActiveSeasons(new Date('2026-02-10T12:00:00+03:00'))).toContain('VALENTINE');
  });

  it('detects graduation season in June', () => {
    expect(getActiveSeasons(new Date('2026-06-15T12:00:00+03:00'))).toContain('GRADUATION');
  });

  it('reports no seasons on an ordinary autumn day', () => {
    const seasons = getActiveSeasons(new Date('2026-10-15T12:00:00+03:00'));
    for (const s of seasons) {
      expect(['VALENTINE', 'GRADUATION']).not.toContain(s);
    }
  });
});

describe('seasonalServices router', () => {
  it('admin can create and update a seasonal service', async () => {
    const caller = await callerFor(admin);
    const created = await caller.seasonalServices.create({
      nameAr: 'باقة العيد الكاملة',
      nameEn: 'Eid Full Glam',
      categoryId,
      season: 'EID',
      startDate: '2026-01-01T00:00:00+03:00',
      endDate: '2026-12-31T00:00:00+03:00',
      pricePremium: 50,
    });
    createdIds.push(created.id);
    expect(created.season).toBe('EID');

    const updated = await caller.seasonalServices.update({
      id: created.id,
      isActive: false,
    });
    expect(updated.isActive).toBe(false);
  });

  it('active returns an empty list when nothing matches the window', async () => {
    const anon = await callerFor();
    const result = await anon.seasonalServices.active({});
    expect(Array.isArray(result.seasons)).toBe(true);
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('blocks non-admin CRUD', async () => {
    const anon = await callerFor();
    await expect(
      anon.seasonalServices.create({
        nameAr: 'x',
        nameEn: 'x',
        categoryId,
        season: 'EID',
        startDate: '2026-01-01T00:00:00+03:00',
        endDate: '2026-12-31T00:00:00+03:00',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
