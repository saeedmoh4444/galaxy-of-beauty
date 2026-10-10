import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const db = prisma;

// One choice inside MatchmakerQuestion.options (Json column).
interface MatchmakerOption {
  k: string;
  t: string[];
}

export const serviceMatchmakerRouter = router({
  questions: publicProcedure.query(() =>
    db.matchmakerQuestion.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ),

  match: publicProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .query(async ({ input }) => {
      const userTags: string[] = [];
      const questions = await db.matchmakerQuestion.findMany({ where: { isActive: true } });
      for (const [qId, optKey] of Object.entries(input.answers)) {
        const q = questions.find((x) => x.questionKey === qId);
        const opts = (q?.options as unknown as MatchmakerOption[]) ?? [];
        const opt = opts.find((o) => o.k === optKey);
        if (opt?.t) userTags.push(...opt.t);
      }

      const services = await db.matchmakerService.findMany({ where: { isActive: true } });
      const scored = services.map((s) => {
        const tags = (s.tags as string[]) ?? [];
        const matches = tags.filter((t: string) => userTags.includes(t)).length;
        return {
          ...s,
          score: Math.min(100, Math.round((matches / Math.max(1, userTags.length)) * 100)),
        };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 4);
    }),
});
