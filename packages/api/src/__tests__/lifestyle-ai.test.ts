/**
 * E8 — Lifestyle AI advisor (B.21 evolution). Grounded answers from the
 * platform's own data: the user's cycle predictions, nutrition library,
 * postpartum/menopause content, pamper window, and fitness profile — with
 * funnel links to the verticals. Deterministic + PDPL-safe (no LLM calls
 * with health data).
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

describe('lifestyle AI advisor (E8)', () => {
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
      await prisma.cycleSettings.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.lifestyleAI.ask({ question: 'متى دورتي؟' })).rejects.toThrow();
    await expect(anon.lifestyleAI.topics()).rejects.toThrow();
  });

  it('answers cycle questions from the user predictions', async () => {
    await prisma.cycleSettings.create({
      data: {
        userId: user.id,
        cycleLength: 28,
        lastPeriodStart: new Date(Date.now() - 10 * 86_400_000),
      },
    });
    const c = await caller(user);
    const res = await c.lifestyleAI.ask({ question: 'متى دورتي القادمة؟' });
    expect(res.handled).toBe(true);
    expect(res.domain).toBe('cycle');
    expect(res.answer).toContain('اليوم');
    expect(res.links.some((l: any) => l.href === '/cycle-tracker')).toBe(true);
  });

  it('answers nutrition questions with the goal-matched library', async () => {
    const c = await caller(user);
    const res = await c.lifestyleAI.ask({ question: 'ماذا آكل لشعري؟' });
    expect(res.handled).toBe(true);
    expect(res.domain).toBe('nutrition');
    expect(res.answer).toBeTruthy();
    expect(res.links.some((l: any) => l.href === '/wellness-hub')).toBe(true);
  });

  it('answers postpartum + menopause questions from the libraries', async () => {
    const c = await caller(user);
    const postpartum = await c.lifestyleAI.ask({ question: 'نصائح بعد الولادة' });
    expect(postpartum.handled).toBe(true);
    expect(postpartum.domain).toBe('postpartum');
    expect(postpartum.answer).toContain('طبيبتك');

    const menopause = await c.lifestyleAI.ask({ question: 'هبات الحرارة والانقطاع' });
    expect(menopause.handled).toBe(true);
    expect(menopause.domain).toBe('menopause');
  });

  it('answers fitness questions with the profile + gyms funnel', async () => {
    await prisma.beautyProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, fitnessGoals: ['tone'] },
      update: { fitnessGoals: ['tone'] },
    });
    const c = await caller(user);
    const res = await c.lifestyleAI.ask({ question: 'أهداف لياقتي ونصائح' });
    expect(res.handled).toBe(true);
    expect(res.domain).toBe('fitness');
    expect(res.links.some((l: any) => l.href === '/gyms')).toBe(true);
  });

  it('answers pampering questions with the window check', async () => {
    const c = await caller(user);
    const res = await c.lifestyleAI.ask({ question: 'دللي نفسك قبل الدورة' });
    expect(res.handled).toBe(true);
    expect(res.domain).toBe('pampering');
    expect(res.answer).toBeTruthy();
  });

  it('returns handled=false for non-lifestyle questions', async () => {
    const c = await caller(user);
    const res = await c.lifestyleAI.ask({ question: 'ما هو المكياج المناسب؟' });
    expect(res.handled).toBe(false);
  });

  it('topics lists the lifestyle domains with bilingual labels', async () => {
    const c = await caller(user);
    const topics = await c.lifestyleAI.topics();
    expect(topics.length).toBeGreaterThanOrEqual(6);
    expect(topics[0].key).toBeTruthy();
  });
});
