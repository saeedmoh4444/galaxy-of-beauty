import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const skinDiaryRouter = router({
  entries: customerProcedure.query(async ({ ctx }) =>
    prisma.skinDiaryEntry.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: 30 })),

  add: customerProcedure
    .input(z.object({ imageUrl: z.string().url(), skinCondition: z.string(), notes: z.string().optional(), hydration: z.number().min(1).max(10).default(5), concerns: z.array(z.string()).default([]) }))
    .mutation(async ({ ctx, input }) =>
      prisma.skinDiaryEntry.create({ data: { userId: ctx.user.id, imageUrl: input.imageUrl, skinCondition: input.skinCondition, hydration: input.hydration, concerns: input.concerns, notes: input.notes ?? '' } })),

  delete: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.skinDiaryEntry.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
      return { success: true };
    }),

  timeline: customerProcedure.query(async ({ ctx }) => {
    const entries = await prisma.skinDiaryEntry.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { hydration: true, skinCondition: true, createdAt: true },
    });
    return entries.map((e) => ({ date: e.createdAt.toISOString().slice(0, 10), hydration: e.hydration, skinCondition: e.skinCondition }));
  }),
});
