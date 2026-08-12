import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const TRACKED_SERVICES = [
  { id: 1, nameAr: 'مكياج احترافي', price: 300, prevPrice: 350, emoji: '', dropped: true },
  { id: 2, nameAr: 'تنظيف بشرة', price: 200, prevPrice: 220, emoji: '', dropped: true },
  { id: 3, nameAr: 'مساج استرخائي', price: 250, prevPrice: 250, emoji: '‍️', dropped: false },
];

export const priceDropAlertsRouter = router({
  tracked: customerProcedure.query(() => TRACKED_SERVICES),

  myAlerts: customerProcedure.query(({ ctx }) =>
    prisma.priceDropAlert.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ),

  create: customerProcedure
    .input(
      z.object({
        serviceName: z.string().min(1),
        targetPrice: z.number().min(1),
        currentPrice: z.number(),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.priceDropAlert.create({ data: { userId: ctx.user.id, ...input } });
    }),

  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.priceDropAlert.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
