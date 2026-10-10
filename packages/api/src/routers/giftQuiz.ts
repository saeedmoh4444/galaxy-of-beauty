import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const db = prisma;

// One choice inside GiftQuizQuestion.options (Json column).
interface GiftQuizOption {
  key: string;
  labelAr: string;
  labelEn: string;
  tags?: string[];
}

interface GiftQuizQuestionRow {
  questionKey: string;
  questionJson: unknown;
  options: unknown;
}

interface GiftQuizRecommendationRow {
  id: number;
  nameJson: unknown;
  descJson: unknown;
  price: number;
  category: string;
  emoji: string;
  tags: unknown;
}

function formatQuestion(q: GiftQuizQuestionRow) {
  return {
    id: q.questionKey,
    questionAr: (q.questionJson as { ar?: string })?.ar ?? '',
    questionEn: (q.questionJson as { en?: string })?.en ?? '',
    options: (q.options as GiftQuizOption[]).map((o) => ({
      key: o.key,
      labelAr: o.labelAr,
      labelEn: o.labelEn,
      tags: o.tags,
    })),
  };
}

function formatRecommendation(r: GiftQuizRecommendationRow) {
  return {
    id: r.id,
    nameAr: (r.nameJson as Record<string, string>)?.ar ?? '',
    nameEn: (r.nameJson as Record<string, string>)?.en ?? '',
    descAr: (r.descJson as Record<string, string>)?.ar ?? '',
    descEn: (r.descJson as Record<string, string>)?.en ?? '',
    price: r.price,
    category: r.category,
    emoji: r.emoji,
    tags: r.tags as string[],
    score: 0,
  };
}

export const giftQuizRouter = router({
  questions: publicProcedure.query(async () => {
    const questions = await db.giftQuizQuestion.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return questions.map(formatQuestion);
  }),

  recommend: publicProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .query(async ({ input }) => {
      const allTags: string[] = [];
      const questions = await db.giftQuizQuestion.findMany({ where: { isActive: true } });
      for (const [questionId, optionKey] of Object.entries(input.answers)) {
        const question = questions.find((q) => q.questionKey === questionId);
        const options = (question?.options as unknown as GiftQuizOption[]) ?? [];
        const option = options.find((o) => o.key === optionKey);
        if (option?.tags) allTags.push(...option.tags);
      }

      const recs = await db.giftQuizRecommendation.findMany({ where: { isActive: true } });
      const scored = recs.map((rec) => {
        const tags = (rec.tags as string[]) ?? [];
        const matches = tags.filter((t: string) => allTags.includes(t)).length;
        const score = Math.min(100, Math.round((matches / Math.max(1, allTags.length)) * 100));
        return { ...formatRecommendation(rec), score };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 4);
    }),
});
