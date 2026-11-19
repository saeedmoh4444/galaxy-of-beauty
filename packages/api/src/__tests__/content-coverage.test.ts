/**
 * W6-4 — content domain coverage. blog (publish gating + search),
 * tutorials (filter/search catalog), dailyBeautyTip (rotation) and
 * beautyQuiz (scoring + stats) had 4/28 procedures exercised; this suite
 * pins the public-read + admin-write contracts.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let admin: JwtPayload;
let customerA: JwtPayload;
const createdUserIds: number[] = [];
const createdSlugs: string[] = [];
const createdTipIds: number[] = [];
const createdQuestionIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('content domain coverage (W6-4)', () => {
  beforeAll(async () => {
    const a = await prisma.user.create({ data: buildUser() });
    const adm = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
    createdUserIds.push(a.id, adm.id);
    customerA = { id: a.id, role: 'CUSTOMER', email: a.email };
    admin = { id: adm.id, role: 'ADMIN', email: adm.email };
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.beautyQuizAttempt.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.beautyQuizQuestion.deleteMany({ where: { id: { in: createdQuestionIds } } });
    } catch {}
    try {
      await prisma.dailyBeautyTip.deleteMany({ where: { id: { in: createdTipIds } } });
    } catch {}
    try {
      await prisma.blogPost.deleteMany({ where: { slug: { in: createdSlugs } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  describe('blog', () => {
    it('drafts stay private: public list/getBySlug exclude, listAll includes', async () => {
      const cAdmin = await caller(admin);
      const cPub = await caller(null);
      const slug = `w6-draft-${Date.now()}`;
      createdSlugs.push(slug);
      await cAdmin.blog.create({
        titleAr: 'مسودة',
        titleEn: 'Draft',
        bodyAr: 'نص',
        bodyEn: 'Body',
        slug,
        isPublished: false,
      });

      const list = await cPub.blog.list({ page: 1 });
      expect(list.items.find((p: { slug: string }) => p.slug === slug)).toBeUndefined();
      await expect(cPub.blog.getBySlug({ slug })).rejects.toMatchObject({ code: 'NOT_FOUND' });

      const all = await cAdmin.blog.listAll({ page: 1 });
      expect(all.items.find((p: { slug: string }) => p.slug === slug)).toBeDefined();
    });

    it('published posts surface in list, getBySlug and search', async () => {
      const cAdmin = await caller(admin);
      const cPub = await caller(null);
      const slug = `w6-pub-${Date.now()}`;
      createdSlugs.push(slug);
      await cAdmin.blog.create({
        titleAr: 'روتين العناية الصباحي',
        titleEn: 'Morning Skincare Routine',
        bodyAr: 'خطوات',
        bodyEn: 'Steps',
        slug,
        tags: ['skincare-w6'],
        isPublished: true,
      });

      const bySlug = await cPub.blog.getBySlug({ slug });
      expect(bySlug.slug).toBe(slug);
      expect(bySlug.isPublished).toBe(true);

      const searched = await cPub.blog.list({ page: 1, search: 'skincare-w6' });
      expect(searched.items.some((p: { slug: string }) => p.slug === slug)).toBe(true);

      await expect(cPub.blog.getBySlug({ slug: `nope-${Date.now()}` })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  describe('tutorials', () => {
    it('list filters by category and search, getById 404s unknown ids', async () => {
      const c = await caller(null);
      const makeup = await c.tutorials.list({ category: 'makeup', limit: 50 });
      expect(makeup.items.length).toBeGreaterThanOrEqual(1);
      expect(makeup.items.every((t: { category: string }) => t.category === 'makeup')).toBe(true);

      const bridal = await c.tutorials.list({ search: 'bridal' });
      expect(bridal.items.some((t: { titleEn: string }) => t.titleEn.includes('Bridal'))).toBe(
        true,
      );

      const one = await c.tutorials.getById({ id: 1 });
      expect(one.id).toBe(1);

      await expect(c.tutorials.getById({ id: 9999 })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('dailyBeautyTip', () => {
    it('create (admin) feeds the rotating today query and the list', async () => {
      const cAdmin = await caller(admin);
      const cPub = await caller(null);
      const created = await cAdmin.dailyBeautyTip.create({
        emoji: '💧',
        tip: 'اشربي كمية كافية من الماء يومياً',
        category: 'عناية',
      });
      createdTipIds.push(created.id);

      const today = await cPub.dailyBeautyTip.today();
      expect(today).not.toBeNull();

      const list = await cAdmin.dailyBeautyTip.list({ page: 1, limit: 100 });
      expect(list.items.some((t: { id: number }) => t.id === created.id)).toBe(true);
      expect(list.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('beautyQuiz', () => {
    it('submitAnswer scores correct/incorrect and myStats aggregates', async () => {
      const q = await prisma.beautyQuizQuestion.create({
        data: {
          question: 'ما أفضل وقت لوضع المرطب؟',
          optionsJson: ['صباحاً', 'بعد التنظيف', 'قبل النوم', 'كل ما سبق'],
          correctIndex: 3,
          explanation: 'الترطيب بعد التنظيف صباحاً ومساءً',
        },
      });
      createdQuestionIds.push(q.id);

      const c = await caller(customerA);
      const right = await c.beautyQuiz.submitAnswer({ questionId: q.id, answerIndex: 3 });
      expect(right.correct).toBe(true);
      expect(right.explanation).toBe('الترطيب بعد التنظيف صباحاً ومساءً');

      const wrong = await c.beautyQuiz.submitAnswer({ questionId: q.id, answerIndex: 0 });
      expect(wrong.correct).toBe(false);

      const missing = await c.beautyQuiz.submitAnswer({ questionId: 999999, answerIndex: 0 });
      expect(missing.correct).toBe(false);

      const stats = await c.beautyQuiz.myStats();
      expect(stats.total).toBe(2);
      expect(stats.correct).toBe(1);
      expect(stats.pct).toBe(50);

      const list = await c.beautyQuiz.list({ limit: 50 });
      expect(list.some((item: { id: number }) => item.id === q.id)).toBe(true);
    });
  });
});
