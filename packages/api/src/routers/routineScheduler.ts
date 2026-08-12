import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const PRESETS = [
  {
    id: 'morning',
    nameAr: '️ روتين صباحي',
    steps: [
      { time: '7:00', task: 'غسول وجه', emoji: '' },
      { time: '7:05', task: 'تونر', emoji: '' },
      { time: '7:10', task: 'سيروم', emoji: '' },
      { time: '7:15', task: 'مرطب', emoji: '' },
      { time: '7:20', task: 'واقي شمس', emoji: '️' },
    ],
  },
  {
    id: 'evening',
    nameAr: ' روتين مسائي',
    steps: [
      { time: '21:00', task: 'مزيل مكياج', emoji: '' },
      { time: '21:05', task: 'غسول', emoji: '' },
      { time: '21:10', task: 'تونر', emoji: '' },
      { time: '21:15', task: 'سيروم ليلي', emoji: '' },
      { time: '21:20', task: 'كريم ليلي', emoji: '' },
    ],
  },
  {
    id: 'weekly',
    nameAr: ' روتين أسبوعي',
    steps: [
      { time: 'السبت', task: 'قناع وجه', emoji: '' },
      { time: 'الأحد', task: 'تقشير', emoji: '🪨' },
      { time: 'الثلاثاء', task: 'قناع ترطيب', emoji: '' },
      { time: 'الخميس', task: 'مساج وجه', emoji: '‍️' },
    ],
  },
];

export const routineSchedulerRouter = router({
  presets: customerProcedure.query(() => PRESETS),

  myRoutines: customerProcedure.query(async ({ ctx }) => {
    const completed = await prisma.routineStep.findMany({ where: { userId: ctx.user.id } });
    const doneSet = new Set(completed.map((s: any) => `${s.routineId}-${s.stepIndex}`));
    return PRESETS.map((r) => ({
      ...r,
      steps: r.steps.map((s, i) => ({ ...s, done: doneSet.has(`${r.id}-${i}`) })),
    }));
  }),

  toggleStep: customerProcedure
    .input(z.object({ routineId: z.string(), stepIndex: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.routineStep.findUnique({
        where: {
          userId_routineId_stepIndex: {
            userId: ctx.user.id,
            routineId: input.routineId,
            stepIndex: input.stepIndex,
          },
        },
      });
      if (existing) {
        await prisma.routineStep.update({
          where: { id: existing.id },
          data: { done: !existing.done },
        });
        return { toggled: !existing.done };
      }
      await prisma.routineStep.create({
        data: {
          userId: ctx.user.id,
          routineId: input.routineId,
          stepIndex: input.stepIndex,
          done: true,
        },
      });
      return { toggled: true };
    }),
});
