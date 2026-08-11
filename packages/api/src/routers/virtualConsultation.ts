import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const virtualConsultationRouter = router({
  myConsultations: customerProcedure.query(async ({ ctx }) => {
    return prisma.virtualConsultation.findMany({
      where: { userId: ctx.user.id },
      orderBy: { scheduledAt: 'desc' },
    });
  }),
  book: customerProcedure
    .input(
      z.object({
        consultantType: z.string(),
        scheduledAt: z.string(),
        slot: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.virtualConsultation.create({
        data: { userId: ctx.user.id, ...input, scheduledAt: new Date(input.scheduledAt) },
      });
    }),
  cancel: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.virtualConsultation.updateMany({
      where: { id: input.id, userId: ctx.user.id },
      data: { status: 'CANCELLED' },
    });
    return { success: true };
  }),
});
