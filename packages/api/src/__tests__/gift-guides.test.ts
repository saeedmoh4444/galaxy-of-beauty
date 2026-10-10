/**
 * Audit gap #5 — the mobile gift-guide screen called giftQuiz.questions
 * and rendered guide fields (all empty). A real guides procedure exists
 * now: giftQuiz.giftGuides lists active recommendations formatted for
 * the guide cards.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

const caller = () => (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });

const createdIds: number[] = [];

beforeAll(async () => {
  const rec = await prisma.giftQuizRecommendation.create({
    data: {
      nameJson: { ar: 'طقم عناية', en: 'Care Kit' },
      descJson: { ar: 'وصف', en: 'A description' },
      price: 150,
      category: 'عناية بالبشرة',
      emoji: '🎁',
      tags: ['skincare'],
      sortOrder: 1,
      isActive: true,
    },
  });
  createdIds.push(rec.id);

  const inactive = await prisma.giftQuizRecommendation.create({
    data: {
      nameJson: { ar: 'غير نشط', en: 'Inactive' },
      price: 10,
      category: 'x',
      emoji: '🎁',
      tags: [],
      sortOrder: 2,
      isActive: false,
    },
  });
  createdIds.push(inactive.id);
}, 15000);

afterAll(async () => {
  try {
    await prisma.giftQuizRecommendation.deleteMany({ where: { id: { in: createdIds } } });
  } catch {}
});

describe('gift guides procedure', () => {
  it('lists active recommendations formatted for the guide cards', async () => {
    const guides = await caller().giftQuiz.giftGuides();

    const mine = guides.find((g: { nameAr: string }) => g.nameAr === 'طقم عناية');
    expect(mine).toBeTruthy();
    expect(mine!.nameEn).toBe('Care Kit');
    expect(mine!.category).toBe('عناية بالبشرة');
    expect(mine!.price).toBe(150);
    expect(mine!.emoji).toBe('🎁');
  }, 15000);

  it('excludes inactive recommendations', async () => {
    const guides = await caller().giftQuiz.giftGuides();
    expect(guides.every((g: { nameAr: string }) => g.nameAr !== 'غير نشط')).toBe(true);
  }, 15000);
});
