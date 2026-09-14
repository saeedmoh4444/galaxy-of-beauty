/**
 * wellnessHub router tests — the live router over the seeded DB with
 * factory-created users, invariant assertions, and full cleanup.
 * (Coverage ratchet target: src/routers/wellnessHub.ts — was 9.9%)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let cycleUser: JwtPayload; // cycle phase calendar
let dataUser: JwtPayload; // checkins / skin / wellness / journals
let freshUser: JwtPayload; // empty profile
const createdUserIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

function todayUtcSlice(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

describe('wellnessHub router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };

    const u1 = await prisma.user.create({ data: buildUser() });
    cycleUser = { id: u1.id, role: 'CUSTOMER', email: u1.email };
    const u2 = await prisma.user.create({ data: buildUser() });
    dataUser = { id: u2.id, role: 'CUSTOMER', email: u2.email };
    const u3 = await prisma.user.create({ data: buildUser() });
    freshUser = { id: u3.id, role: 'CUSTOMER', email: u3.email };
    createdUserIds.push(u1.id, u2.id, u3.id);
  }, 20000);

  afterAll(async () => {
    // Children before parents: skinAnalysis is RESTRICT on delete; the other
    // checkin/journal rows carry no FK, but are removed anyway for tidiness.
    await prisma.skinAnalysis.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.selfCareCheckin.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.wellnessCheckin.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.cycleSettings.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.beautyJournal.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  });

  it('rejects anonymous and non-customer callers', async () => {
    const anon = await caller(null);
    await expect(anon.wellnessHub.dashboard()).rejects.toThrow();

    const c = await caller(admin);
    await expect(c.wellnessHub.dashboard()).rejects.toThrow();
  });

  it('returns an empty dashboard for a fresh user', async () => {
    const c = await caller(freshUser);
    const res = await c.wellnessHub.dashboard();

    expect(res.cycle).toBeNull();
    expect(res.settings).toBeNull();
    expect(res.todayMood).toBeNull();
    expect(res.skin).toBeNull();
    expect(res.wellness).toBeNull();
    expect(res.weekly).toEqual({ avgMood: null, avgEnergy: null, checkinCount: 0 });
    expect(res.journalCount).toBe(0);
    expect(res.recentJournals).toEqual([]);
  });

  it('drives the cycle phase calendar from cycleSettings.lastPeriodStart', async () => {
    await prisma.cycleSettings.create({
      data: { userId: cycleUser.id, cycleLength: 28, periodLength: 5 },
    });
    const c = await caller(cycleUser);

    // No period start yet → no cycle, settings flag false.
    const before = await c.wellnessHub.dashboard();
    expect(before.cycle).toBeNull();
    expect(before.settings).toEqual({ hasPeriodStart: false });

    // Period started today → menstrual day 1.
    await prisma.cycleSettings.update({
      where: { userId: cycleUser.id },
      data: { lastPeriodStart: new Date() },
    });
    const day1 = await c.wellnessHub.dashboard();
    expect(day1.settings).toEqual({ hasPeriodStart: true });
    expect(day1.cycle?.currentDay).toBe(1);
    expect(day1.cycle?.cycleLength).toBe(28);
    expect(day1.cycle?.phase.key).toBe('menstrual');
    expect(day1.cycle?.daysUntilNext).toBe(28);
    expect(new Date(day1.cycle?.nextPeriodDate).getTime()).toBeGreaterThan(Date.now() - 1000);

    // 9 days ago → follicular day 10.
    await prisma.cycleSettings.update({
      where: { userId: cycleUser.id },
      data: { lastPeriodStart: new Date(Date.now() - 9 * 86_400_000) },
    });
    const day10 = await c.wellnessHub.dashboard();
    expect(day10.cycle?.currentDay).toBe(10);
    expect(day10.cycle?.phase.key).toBe('follicular');
    expect(day10.cycle?.daysUntilNext).toBe(19);

    // 14 days ago → ovulation day 15.
    await prisma.cycleSettings.update({
      where: { userId: cycleUser.id },
      data: { lastPeriodStart: new Date(Date.now() - 14 * 86_400_000) },
    });
    const day15 = await c.wellnessHub.dashboard();
    expect(day15.cycle?.currentDay).toBe(15);
    expect(day15.cycle?.phase.key).toBe('ovulation');

    // 19 days ago → luteal day 20.
    await prisma.cycleSettings.update({
      where: { userId: cycleUser.id },
      data: { lastPeriodStart: new Date(Date.now() - 19 * 86_400_000) },
    });
    const day20 = await c.wellnessHub.dashboard();
    expect(day20.cycle?.currentDay).toBe(20);
    expect(day20.cycle?.phase.key).toBe('luteal');
    expect(day20.cycle?.daysUntilNext).toBe(9);
  });

  it('surfaces today mood, skin analysis, wellness checkin, weekly averages and journals', async () => {
    await prisma.selfCareCheckin.create({
      data: {
        userId: dataUser.id,
        mood: 3,
        energy: 4,
        sleepHours: 6.5,
        waterGlasses: 4,
        createdAt: new Date(Date.now() - 2 * 86_400_000),
      },
    });
    await prisma.selfCareCheckin.create({
      data: {
        userId: dataUser.id,
        mood: 5,
        energy: 2,
        sleepHours: 7.5,
        waterGlasses: 6,
        createdAt: new Date(),
      },
    });
    await prisma.skinAnalysis.create({
      data: {
        userId: dataUser.id,
        imageUrl: 'http://img.test/skin.jpg',
        resultJson: { skinType: 'oily', concerns: ['acne'] },
        skinType: 'oily',
        concerns: ['acne', 'dryness'],
      },
    });
    await prisma.wellnessCheckin.create({
      data: {
        userId: dataUser.id,
        date: todayUtcSlice(),
        water: 8,
        sleep: 7.5,
        mood: 4,
        steps: 5000,
        skincare: true,
      },
    });
    const oldJournal = await prisma.beautyJournal.create({
      data: {
        userId: dataUser.id,
        title: 'تدوينة قديمة',
        content: 'ق'.repeat(150), // > 100 → truncated by the router
        mood: 4,
        createdAt: new Date(Date.now() - 86_400_000),
      },
    });
    const newJournal = await prisma.beautyJournal.create({
      data: {
        userId: dataUser.id,
        title: 'تدوينة حديثة',
        content: 'ج'.repeat(60),
        mood: 5,
        createdAt: new Date(),
      },
    });

    const c = await caller(dataUser);
    const res = await c.wellnessHub.dashboard();

    expect(res.todayMood).toMatchObject({ mood: 5, energy: 2, waterGlasses: 6 });
    expect(Number(res.todayMood?.sleepHours)).toBe(7.5);

    expect(res.skin).toMatchObject({ skinType: 'oily', concerns: ['acne', 'dryness'] });
    expect(res.skin?.lastAnalysis).toBeTruthy();

    expect(res.wellness).toEqual({ water: 8, sleep: 7.5, mood: 4, steps: 5000, skincare: true });

    // Weekly summary averages over both checkins (last 7 days): round((3+5)/2)=4, round((4+2)/2)=3.
    expect(res.weekly).toEqual({ avgMood: 4, avgEnergy: 3, checkinCount: 2 });

    expect(res.journalCount).toBe(2);
    expect(res.recentJournals.length).toBe(2);
    expect(res.recentJournals[0].id).toBe(newJournal.id);
    expect(res.recentJournals[0].title).toBe('تدوينة حديثة');
    expect(res.recentJournals[0].content).toBe('ج'.repeat(60));
    expect(res.recentJournals[0].mood).toBe(5);
    expect(res.recentJournals[1].id).toBe(oldJournal.id);
    expect(res.recentJournals[1].content.length).toBe(100); // sliced to 100 chars
  });
});
