import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyPartyRouter = router({
  myParties: customerProcedure.query(async ({ ctx }) => {
    return prisma.beautyParty.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } });
  }),
  create: customerProcedure
    .input(z.object({ theme: z.string(), guestCount: z.number().min(2).max(20), totalAmount: z.number(), discountPct: z.number().default(0), scheduledAt: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyParty.create({ data: { userId: ctx.user.id, ...input, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined } });
    }),
  cancel: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.beautyParty.updateMany({ where: { id: input.id, userId: ctx.user.id }, data: { status: 'CANCELLED' } });
      return { success: true };
    }),
});
