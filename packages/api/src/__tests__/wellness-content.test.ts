/**
 * E4b — mental wellness + nutrition curated libraries exposed through the
 * wellnessContent router (breathing exercises, short meditations, journaling
 * prompts, beauty-goal nutrition cards). Content lives in @galaxy/shared.
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

describe('wellnessContent libraries (E4b)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.wellnessContent.breathing()).rejects.toThrow();
    await expect(anon.wellnessContent.meditations()).rejects.toThrow();
    await expect(anon.wellnessContent.prompts({})).rejects.toThrow();
    await expect(anon.wellnessContent.nutrition({})).rejects.toThrow();
  });

  it('breathing returns guided exercises with phase timings', async () => {
    const c = await caller(user);
    const exercises = await c.wellnessContent.breathing();
    expect(exercises.length).toBeGreaterThanOrEqual(5);
    for (const e of exercises) {
      expect(e.key).toBeTruthy();
      expect(e.nameAr).toBeTruthy();
      expect(e.nameEn).toBeTruthy();
      expect(e.inhale).toBeGreaterThan(0);
      expect(e.exhale).toBeGreaterThan(0);
      expect(e.cycles).toBeGreaterThan(0);
    }
    expect(exercises.find((e: any) => e.key === 'box')).toBeTruthy();
  });

  it('meditations are short, bilingual, and step-by-step', async () => {
    const c = await caller(user);
    const meds = await c.wellnessContent.meditations();
    expect(meds.length).toBeGreaterThanOrEqual(5);
    for (const m of meds) {
      expect(m.titleAr).toBeTruthy();
      expect(m.titleEn).toBeTruthy();
      expect(m.minutes).toBeGreaterThanOrEqual(1);
      expect(m.minutes).toBeLessThanOrEqual(10);
      expect(m.stepsAr.length).toBeGreaterThanOrEqual(3);
      expect(m.stepsEn.length).toBe(m.stepsAr.length);
    }
  });

  it('prompts filter by category and prefer the mood band', async () => {
    const c = await caller(user);
    const all = await c.wellnessContent.prompts({});
    expect(all.length).toBeGreaterThanOrEqual(10);

    const beauty = await c.wellnessContent.prompts({ category: 'beauty' });
    expect(beauty.length).toBeGreaterThan(0);
    expect(beauty.every((p: any) => p.category === 'beauty')).toBe(true);

    // mood=2 (low) should surface the comforting prompts first; every
    // returned prompt either matches the band or is mood-agnostic.
    const low = await c.wellnessContent.prompts({ mood: 2 });
    expect(low.length).toBeGreaterThan(0);
    expect(low.every((p: any) => p.mood === undefined || p.mood === 2)).toBe(true);
  });

  it('nutrition returns the goal card with a glow fallback', async () => {
    const c = await caller(user);
    const hair = await c.wellnessContent.nutrition({ goal: 'hair' });
    expect(hair.key).toBe('hair');
    expect(hair.nameAr).toBeTruthy();
    expect(hair.foods.length).toBeGreaterThanOrEqual(4);
    expect(hair.meals.length).toBeGreaterThanOrEqual(2);

    const unknown = await c.wellnessContent.nutrition({ goal: 'nonsense' });
    expect(unknown.key).toBe('glow');
  });
});
