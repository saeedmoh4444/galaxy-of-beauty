/**
 * ENHANCEMENT_PLAN 8.3 — slice F: season-start announcements.
 *
 * Drives: the daily sweep over getActiveSeasons (lib/season) — when a
 * season is active, members get one seasonal_start notification per
 * season per window (45-day trail dedup). Seasons are injectable so the
 * tests don't depend on today's Hijri/Gregorian calendar.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { buildUser } from './factories';
import { sendSeasonalEmails, SEASON_DEDUP_DAYS } from '../workers/seasonalMarketing';

const createdUserIds: number[] = [];
let userA = 0;
let userB = 0;

beforeAll(async () => {
  await prisma.notificationTemplate.upsert({
    where: { key: 'seasonal_start' },
    update: {},
    create: {
      key: 'seasonal_start',
      category: 'promotions',
      channels: ['in_app', 'push'],
      titleJson: { ar: 'موسم {{seasonName}} وصل', en: '{{seasonName}} Season Is Here' },
      bodyJson: { ar: '{{customerName}}', en: '{{customerName}}' },
    },
  });

  const [a, b] = await Promise.all([
    prisma.user.create({ data: buildUser() }),
    prisma.user.create({ data: buildUser() }),
  ]);
  createdUserIds.push(a.id, b.id);
  userA = a.id;
  userB = b.id;
}, 30000);

afterAll(async () => {
  try {
    await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    // cleanup is best-effort
  }
});

describe('sendSeasonalEmails', () => {
  it('announces each active season once per member', async () => {
    expect(SEASON_DEDUP_DAYS).toBe(45);

    const count = await sendSeasonalEmails(['EID', 'RAMADAN']);
    // Total is DB-wide (seeded customers are eligible too) — pin the
    // fixtures instead of the total.
    expect(count).toBeGreaterThanOrEqual(4); // 2 seasons × 2 members

    for (const id of [userA, userB]) {
      expect(
        await prisma.notification.count({ where: { userId: id, type: 'seasonal_start' } }),
      ).toBe(2); // exactly one per season per member
      for (const season of ['EID', 'RAMADAN']) {
        const row = await prisma.notification.findFirst({
          where: {
            userId: id,
            type: 'seasonal_start',
            link: `/seasonal-calendar?season=${season}`,
          },
        });
        expect(row).not.toBeNull();
      }
    }
  });

  it('does not re-announce within the dedup window', async () => {
    expect(await sendSeasonalEmails(['EID'])).toBe(0);
  });

  it('sends nothing when no season is active', async () => {
    expect(await sendSeasonalEmails([])).toBe(0);
  });
});
