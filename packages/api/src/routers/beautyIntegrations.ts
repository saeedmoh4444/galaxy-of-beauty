import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyIntegrationsRouter = router({
  list: customerProcedure.query(async ({ ctx }) =>
    prisma.beautyIntegration.findMany({ where: { userId: ctx.user.id }, take: 10 }),
  ),

  connect: customerProcedure
    .input(
      z.object({
        provider: z.enum(['google_calendar', 'apple_health', 'oura_ring', 'fitbit', 'instagram']),
        accessToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.beautyIntegration.upsert({
        where: { userId_provider: { userId: ctx.user.id, provider: input.provider } },
        create: {
          userId: ctx.user.id,
          provider: input.provider,
          accessToken: input.accessToken ?? null,
          status: 'CONNECTED',
        },
        update: { accessToken: input.accessToken ?? null, status: 'CONNECTED' },
      });
      return { success: true };
    }),

  disconnect: customerProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.beautyIntegration.deleteMany({
        where: { userId: ctx.user.id, provider: input.provider },
      });
      return { success: true };
    }),

  status: customerProcedure.query(async ({ ctx }) =>
    prisma.beautyIntegration.findMany({
      where: { userId: ctx.user.id, status: 'CONNECTED' },
      select: { provider: true },
    }),
  ),
});
