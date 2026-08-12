import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const subscriptionGiftRouter = router({
  send: customerProcedure
    .input(
      z.object({
        friendName: z.string().min(2).max(100),
        months: z.number().int().min(1).max(12),
        message: z.string().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prices: Record<number, number> = { 1: 99, 3: 269, 6: 499 };
      const price = prices[input.months] ?? input.months * 99;
      return prisma.subscriptionGift.create({
        data: {
          senderId: ctx.user.id,
          friendName: input.friendName,
          months: input.months,
          price,
          message: input.message ?? null,
        },
      });
    }),

  mySentGifts: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.subscriptionGift.findMany({
        where: { senderId: ctx.user.id },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ),

  options: customerProcedure.query(() => ({
    tiers: [
      { months: 1, price: 99, emoji: '', label: 'شهر واحد' },
      { months: 3, price: 269, emoji: '', label: '3 أشهر', save: '10%' },
      { months: 6, price: 499, emoji: '', label: '6 أشهر', save: '15%' },
    ],
  })),
});
