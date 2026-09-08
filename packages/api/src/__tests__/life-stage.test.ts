/**
 * E6a — life-stage journeys. Stage auto-derivation (bridal concierge →
 * bride, pregnancy mode → pregnant, cycle settings → trying, else back to
 * me) with a manual override on the beauty profile; stage-aware home
 * sections; period-pampering window + offers.
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

describe('life-stage journeys + period pampering (E6a)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.beautyProfile.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.bridalConcierge.deleteMany({ where: { userId: { in: createdUserIds } } });
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
    await expect(anon.lifeStage.get()).rejects.toThrow();
    await expect(anon.lifeStage.choose({ stage: 'bride' })).rejects.toThrow();
    await expect(anon.lifeStage.home()).rejects.toThrow();
    await expect(anon.lifeStage.pamperStatus()).rejects.toThrow();
  });

  it('defaults to back_to_me without signals', async () => {
    const c = await caller(user);
    const result = await c.lifeStage.get();
    expect(result.stage).toBe('back_to_me');
    expect(result.definition.nameAr).toBeTruthy();
    expect(result.stages).toHaveLength(5);
  });

  it('derives bride from the bridal concierge', async () => {
    await prisma.bridalConcierge.create({
      data: { userId: user.id, weddingDate: new Date(Date.now() + 90 * 86_400_000) },
    });
    const c = await caller(user);
    const result = await c.lifeStage.get();
    expect(result.stage).toBe('bride');
  });

  it('derives pregnant from pregnancy mode', async () => {
    await prisma.bridalConcierge.deleteMany({ where: { userId: user.id } });
    await prisma.cycleSettings.create({
      data: {
        userId: user.id,
        pregnancyMode: true,
        dueDate: new Date(Date.now() + 200 * 86_400_000),
      },
    });
    const c = await caller(user);
    const result = await c.lifeStage.get();
    expect(result.stage).toBe('pregnant');
  });

  it('derives trying from cycle tracking', async () => {
    await prisma.cycleSettings.update({
      where: { userId: user.id },
      data: { pregnancyMode: false, lastPeriodStart: new Date(Date.now() - 10 * 86_400_000) },
    });
    const c = await caller(user);
    const result = await c.lifeStage.get();
    expect(result.stage).toBe('trying');
  });

  it('manual override wins over derivation and persists', async () => {
    const c = await caller(user);
    await c.lifeStage.choose({ stage: 'new_mom' });
    const result = await c.lifeStage.get();
    expect(result.stage).toBe('new_mom');
    expect(result.source).toBe('manual');

    const profile = await prisma.beautyProfile.findUniqueOrThrow({ where: { userId: user.id } });
    expect(profile.lifeStage).toBe('new_mom');

    await expect(c.lifeStage.choose({ stage: 'nonsense' as never })).rejects.toThrow();
  });

  it('home surfaces mommy-friendly services for new_mom', async () => {
    const c = await caller(user);
    const home = await c.lifeStage.home();
    expect(home.stage).toBe('new_mom');
    // Every returned service carries the mommy-friendly tag.
    expect(home.services.every((s: any) => s.isMommyFriendly)).toBe(true);
    expect(home.links.length).toBeGreaterThanOrEqual(2);
  });

  it('home surfaces pregnancy-safe services only for pregnant', async () => {
    await prisma.beautyProfile.update({
      where: { userId: user.id },
      data: { lifeStage: null },
    });
    await prisma.cycleSettings.update({
      where: { userId: user.id },
      data: { pregnancyMode: true },
    });
    const c = await caller(user);
    const home = await c.lifeStage.home();
    expect(home.stage).toBe('pregnant');
    expect(home.pregnancy?.weeksPregnant).toBeGreaterThan(0);
    expect(home.services.every((s: any) => s.isPregnancySafe)).toBe(true);
  });

  it('pamperStatus activates in the 3-day window before the period', async () => {
    const c = await caller(user);
    // lastPeriodStart 26 days ago, cycle 28 → period in 2 days → window.
    await prisma.cycleSettings.update({
      where: { userId: user.id },
      data: {
        pregnancyMode: false,
        cycleLength: 28,
        lastPeriodStart: new Date(Date.now() - 26 * 86_400_000),
      },
    });
    const inWindow = await c.lifeStage.pamperStatus();
    expect(inWindow.isPamperWindow).toBe(true);
    expect(Array.isArray(inWindow.deals)).toBe(true);
    expect(Array.isArray(inWindow.kits)).toBe(true);
    expect(Array.isArray(inWindow.spaServices)).toBe(true);

    // 14 days ago → mid-cycle → window closed, offers still returned empty-ish.
    await prisma.cycleSettings.update({
      where: { userId: user.id },
      data: { lastPeriodStart: new Date(Date.now() - 14 * 86_400_000) },
    });
    const out = await c.lifeStage.pamperStatus();
    expect(out.isPamperWindow).toBe(false);
  });
});
