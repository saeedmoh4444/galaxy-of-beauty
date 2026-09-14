/**
 * E4a — period tracking upgrade. History-aware predictions (average of
 * logged cycles), fertile-window awareness, the logDay persistence fix
 * (symptoms/flow/temperature were accepted but never stored), PMS self-care
 * tips, and pregnancy mode.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let user: JwtPayload;

const createdUserIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('cycle predictions + logging (E4a)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.cyclePeriod.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.cycleEntry.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.cycleSettings.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.cycleTracker.today()).rejects.toThrow();
    await expect(anon.cycleTracker.logDay({ dayNumber: 1, mood: 'ok' })).rejects.toThrow();
  });

  it('logDay persists symptoms, flow intensity, temperature, beauty notes (the fix)', async () => {
    const c = await caller(user);
    const entry = await c.cycleTracker.logDay({
      dayNumber: 3,
      mood: 'bad',
      flowIntensity: 'heavy',
      symptoms: ['cramps', 'headache'],
      temperature: 36.7,
      beautyNotes: 'بشرة متعبة',
    });

    const stored = await prisma.cycleEntry.findUniqueOrThrow({ where: { id: entry.id } });
    expect(stored.flowIntensity).toBe('heavy');
    expect(stored.symptoms).toEqual(['cramps', 'headache']);
    expect(stored.temperature).toBe(36.7);
    expect(stored.beautyNotes).toBe('بشرة متعبة');
  });

  it('updateSettings records the previous period and learns the average', async () => {
    const c = await caller(user);
    const now = Date.now();

    // First period start 90 days ago.
    await c.cycleTracker.updateSettings({
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: new Date(now - 90 * 86_400_000).toISOString(),
    });
    // Second period start 60 days ago → previous period length 30.
    await c.cycleTracker.updateSettings({
      lastPeriodStart: new Date(now - 60 * 86_400_000).toISOString(),
    });
    // Third period start 34 days ago → previous period length 26.
    await c.cycleTracker.updateSettings({
      lastPeriodStart: new Date(now - 34 * 86_400_000).toISOString(),
    });

    const periods = await prisma.cyclePeriod.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'asc' },
    });
    expect(periods.length).toBe(2);
    expect(periods[0]!.length).toBe(30);
    expect(periods[1]!.length).toBe(26);

    const settings = await prisma.cycleSettings.findUniqueOrThrow({
      where: { userId: user.id },
    });
    // avg of [30, 26] = 28.
    expect(settings.avgCycleLength).toBe(28);
  });

  it('today uses the learned average and reports the prediction source', async () => {
    const c = await caller(user);
    const today = await c.cycleTracker.today();
    expect(today.predictionSource).toBe('average');

    // Fresh user with no history → default 28-day extrapolation.
    const u2 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u2.id);
    const fresh = { id: u2.id, role: 'CUSTOMER', email: u2.email } as JwtPayload;
    const c2 = await caller(fresh);
    const freshToday = await c2.cycleTracker.today();
    expect(freshToday.predictionSource).toBe('default');
    expect(freshToday.cycleLength).toBe(28);
  });

  it('computes the fertile window (ovulation = nextPeriod − 14)', async () => {
    const c = await caller(user);
    const today = await c.cycleTracker.today();

    const ovulation = new Date(today.fertileWindow.ovulationDate);
    const nextPeriod = new Date(today.nextPeriodDate);
    const diffDays = Math.round((nextPeriod.getTime() - ovulation.getTime()) / 86_400_000);
    expect(diffDays).toBe(14);

    // Window spans ovulation − 5 .. ovulation + 1.
    const fertileStart = new Date(today.fertileWindow.fertileStart);
    const fertileEnd = new Date(today.fertileWindow.fertileEnd);
    const spanDays = Math.round((fertileEnd.getTime() - fertileStart.getTime()) / 86_400_000);
    expect(spanDays).toBe(6);
    expect(typeof today.fertileWindow.isFertileToday).toBe('boolean');
  });

  it('phase logic + PMS tips: luteal has them, follicular does not', async () => {
    // Force a luteal day: lastPeriodStart 22 days ago, cycle 28.
    const now = Date.now();
    const c = await caller(user);
    await c.cycleTracker.updateSettings({
      lastPeriodStart: new Date(now - 22 * 86_400_000).toISOString(),
      cycleLength: 28,
    });
    const luteal = await c.cycleTracker.today();
    expect(luteal.phase.key).toBe('luteal');
    expect(luteal.pmsTips.length).toBeGreaterThan(0);

    // Follicular day: lastPeriodStart 8 days ago.
    await c.cycleTracker.updateSettings({
      lastPeriodStart: new Date(now - 8 * 86_400_000).toISOString(),
    });
    const follicular = await c.cycleTracker.today();
    expect(follicular.phase.key).toBe('follicular');
    expect(follicular.pmsTips.length).toBe(0);
  });

  it('pregnancy mode switches today to a pregnancy timeline and back', async () => {
    const c = await caller(user);
    const dueDate = new Date(Date.now() + 20 * 7 * 86_400_000); // 20 weeks to go → week 20

    await c.cycleTracker.updateSettings({ pregnancyMode: true, dueDate: dueDate.toISOString() });
    const pregnant = await c.cycleTracker.today();
    expect(pregnant.pregnancyMode).toBe(true);
    expect(pregnant.weeksPregnant).toBe(20);
    expect(pregnant.dueDate).toBeTruthy();
    expect(pregnant.nextPeriodDate).toBeUndefined();

    await c.cycleTracker.updateSettings({ pregnancyMode: false });
    const restored = await c.cycleTracker.today();
    expect(restored.pregnancyMode).toBe(false);
    expect(restored.nextPeriodDate).toBeTruthy();
  });

  it('wellnessHub.dashboard carries pmsTips in the luteal phase', async () => {
    // Fresh user (no period history → default 28-day cycle): day 26 = luteal.
    const u3 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(u3.id);
    const hubUser = { id: u3.id, role: 'CUSTOMER', email: u3.email } as JwtPayload;
    const now = Date.now();
    const c = await caller(hubUser);
    await c.cycleTracker.updateSettings({
      lastPeriodStart: new Date(now - 25 * 86_400_000).toISOString(),
      cycleLength: 28,
    });
    const dash = await c.wellnessHub.dashboard();
    expect(dash.pmsTips).toBeDefined();
    expect((dash.pmsTips as unknown[]).length).toBeGreaterThan(0);
  });
});
