import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const serviceWishlistRouter = router({
  myWishlist: customerProcedure.query(async ({ ctx }) => {
    const items = await prisma.serviceWishlistItem.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((t) => ({
      ...t,
      dropped: t.currentPrice < t.prevPrice,
      droppedBy: Math.max(0, t.prevPrice - t.currentPrice),
    }));
  }),

  add: customerProcedure
    .input(
      z.object({
        serviceName: z.string().min(1),
        currentPrice: z.number(),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      prisma.serviceWishlistItem.create({
        data: {
          userId: ctx.user.id,
          serviceName: input.serviceName,
          currentPrice: input.currentPrice,
          prevPrice: input.currentPrice,
          lowestPrice: input.currentPrice,
          emoji: input.emoji,
        },
      }),
    ),

  remove: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.serviceWishlistItem.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
