import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const salonMembershipRouter = router({
  myMembership: customerProcedure.query(async ({ ctx }) => {
    return prisma.salonMembership.findUnique({ where: { userId: ctx.user.id } });
  }),
  subscribe: customerProcedure
    .input(z.object({ tier: z.string(), autoRenew: z.boolean().default(false) }))
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date(); expiresAt.setMonth(expiresAt.getMonth() + 1);
      return prisma.salonMembership.upsert({ where: { userId: ctx.user.id }, create: { userId: ctx.user.id, tier: input.tier, autoRenew: input.autoRenew, expiresAt }, update: { tier: input.tier, autoRenew: input.autoRenew, expiresAt, status: 'ACTIVE' } });
    }),
  cancel: customerProcedure.mutation(async ({ ctx }) => {
    await prisma.salonMembership.updateMany({ where: { userId: ctx.user.id }, data: { autoRenew: false } });
    return { success: true };
  }),
});
