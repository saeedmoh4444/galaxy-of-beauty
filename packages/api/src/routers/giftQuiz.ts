import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function formatQuestion(q: any) {
  return {
    id: q.questionKey,
    questionAr: (q.questionJson as Record<string, string>)?.ar ?? '',
    questionEn: (q.questionJson as Record<string, string>)?.en ?? '',
    options: (q.options as any[]).map((o: any) => ({
      key: o.key,
      labelAr: o.labelAr,
      labelEn: o.labelEn,
      tags: o.tags,
    })),
  };
}

function formatRecommendation(r: any) {
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
        const question = questions.find((q: any) => q.questionKey === questionId);
        const options = (question?.options as any[]) ?? [];
        const option = options.find((o: any) => o.key === optionKey);
        if (option?.tags) allTags.push(...option.tags);
      }

      const recs = await db.giftQuizRecommendation.findMany({ where: { isActive: true } });
      const scored = recs.map((rec: any) => {
        const tags = (rec.tags as string[]) ?? [];
        const matches = tags.filter((t: string) => allTags.includes(t)).length;
        const score = Math.min(100, Math.round((matches / Math.max(1, allTags.length)) * 100));
        return { ...formatRecommendation(rec), score };
      });

      return scored.sort((a: any, b: any) => b.score - a.score).slice(0, 4);
    }),
});
