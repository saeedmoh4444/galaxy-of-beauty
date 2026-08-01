import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const allergenCheckerRouter = router({
  getProfile: customerProcedure.query(async ({ ctx }) => {
    return prisma.allergenProfile.findUnique({ where: { userId: ctx.user.id } });
  }),
  saveProfile: customerProcedure
    .input(z.object({ allergens: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return prisma.allergenProfile.upsert({ where: { userId: ctx.user.id }, create: { userId: ctx.user.id, allergens: input.allergens }, update: { allergens: input.allergens } });
    }),
});
