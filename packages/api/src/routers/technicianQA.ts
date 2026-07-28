import { z } from 'zod';
import { publicProcedure, customerProcedure, router } from '../trpc';

// In-memory Q&A store
export interface QAQuestion {
  id: number; userId: number; userName: string;
  question: string; answer: string | null; technicianName: string | null;
  category: string; isAnswered: boolean; createdAt: string;
}
type Question = QAQuestion;

const questions: Question[] = [];
let qId = 1;

export const technicianQARouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional(), page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      let filtered = questions.filter((q) => q.isAnswered);
      if (input.category) filtered = filtered.filter((q) => q.category === input.category);
      const start = (input.page - 1) * input.limit;
      return { items: filtered.slice(start, start + input.limit), total: filtered.length };
    }),

  ask: customerProcedure
    .input(z.object({ question: z.string().min(5).max(500), category: z.enum(['makeup', 'hair', 'skincare', 'nails', 'general']) }))
    .mutation(async ({ ctx, input }) => {
      const q: Question = {
        id: qId++, userId: ctx.user.id, userName: ctx.user.email ?? 'مستخدمة',
        question: input.question, answer: null, technicianName: null,
        category: input.category, isAnswered: false, createdAt: new Date().toISOString(),
      };
      questions.push(q);
      return q;
    }),

  categories: publicProcedure.query(() => [
    { key: 'makeup', nameAr: 'مكياج', emoji: '💄' },
    { key: 'hair', nameAr: 'شعر', emoji: '💇‍♀️' },
    { key: 'skincare', nameAr: 'عناية بالبشرة', emoji: '✨' },
    { key: 'nails', nameAr: 'أظافر', emoji: '💅' },
    { key: 'general', nameAr: 'عام', emoji: '💬' },
  ]),
});
