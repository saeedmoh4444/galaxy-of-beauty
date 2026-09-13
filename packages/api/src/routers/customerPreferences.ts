import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const customerPreferencesRouter = router({
  get: customerProcedure.query(async ({ ctx }) => {
    const prefs = await prisma.customerPreference.findUnique({ where: { userId: ctx.user.id } });
    return prefs?.preferences ?? {};
  }),

  update: customerProcedure
    .input(z.object({ preferences: z.record(z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.customerPreference.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, preferences: input.preferences as any },
        update: { preferences: input.preferences as any },
      });
      return { success: true };
    }),

  reset: customerProcedure.mutation(async ({ ctx }) => {
    await prisma.customerPreference.deleteMany({ where: { userId: ctx.user.id } });
    return { success: true };
  }),
});
