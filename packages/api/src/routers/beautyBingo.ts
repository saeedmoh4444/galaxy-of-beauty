import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { customerProcedure, router , requireFeatureFlag } from '../trpc';

const BINGO_CARD = [
  { id: 1, task: 'روتين عناية يومي كامل ' },
  { id: 2, task: 'شرب ٨ أكواب ماء ' },
  { id: 3, task: 'قناع وجه ' },
  { id: 4, task: 'تطبيق واقي شمس ️' },
  { id: 5, task: 'ماسك شعر ‍️' },
  { id: 6, task: 'إزالة مكياج قبل النوم ' },
  { id: 7, task: 'تمارين وجه ٥ دقائق ️' },
  { id: 8, task: 'تقشير بشرة 🪨' },
  { id: 9, task: 'تدليك وجه ‍️' },
];

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.BEAUTY_BINGO);

export const beautyBingoRouter = router({
  card: customerProcedure.use(flag).query(async ({ ctx }) => {
    const progress = await prisma.bingoProgress.findMany({ where: { userId: ctx.user.id } });
    const completedIds = new Set(progress.map((p: any) => p.taskId));
    const tasks = BINGO_CARD.map((t) => ({ ...t, completed: completedIds.has(t.id) }));
    const completed = tasks.filter((t) => t.completed).length;
    return { tasks, completed, total: 9, reward: '٣ خطوط = جلسة مجانية! ' };
  }),

  mark: customerProcedure.use(flag).input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.bingoProgress.upsert({
        where: { userId_taskId: { userId: ctx.user.id, taskId: input.taskId } },
        update: {},
        create: { userId: ctx.user.id, taskId: input.taskId },
      });
      return { success: true };
    }),
});
