import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const LOOKS = [
  { id: 1, userName: 'نورة', imageUrl: '', title: 'إطلالة سهرة ناعمة', technicianName: 'نورة العمري', votes: 245, category: 'makeup', date: '2026-07-15' },
  { id: 2, userName: 'مها', imageUrl: '', title: 'تسريحة شعر راقية', technicianName: 'سارة الحربي', votes: 189, category: 'hair', date: '2026-07-14' },
  { id: 3, userName: 'ريم', imageUrl: '', title: 'أظافر صيفية', technicianName: 'هند المطيري', votes: 156, category: 'nails', date: '2026-07-13' },
];

export const lookOfTheDayRouter = router({
  today: publicProcedure.query(() => LOOKS[0]),
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }))
    .query(async () => ({ items: LOOKS, total: LOOKS.length })),
  vote: customerProcedure
    .input(z.object({ lookId: z.number() }))
    .mutation(async ({ input }) => ({ lookId: input.lookId, votes: 246, voted: true })),
  submit: customerProcedure
    .input(z.object({ imageUrl: z.string().url(), title: z.string().min(1), technicianName: z.string(), category: z.string() }))
    .mutation(async ({ ctx, input }) => ({ id: LOOKS.length + 1, userName: ctx.user.email, ...input, votes: 0, date: new Date().toISOString().slice(0, 10) })),
});
