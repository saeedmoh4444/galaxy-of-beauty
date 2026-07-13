import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, router } from '../trpc';

export const savedCardRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.savedCard.findMany({
      where: { userId: ctx.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }),

  add: protectedProcedure
    .input(z.object({
      cardToken: z.string().min(1),
      lastFour: z.string().length(4),
      brand: z.enum(['visa', 'mastercard', 'mada', 'amex']),
      expMonth: z.number().int().min(1).max(12),
      expYear: z.number().int().min(2026).max(2040),
      cardholderName: z.string().min(1),
      setDefault: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      // Unset existing default if this is the new default
      if (input.setDefault) {
        await prisma.savedCard.updateMany({
          where: { userId: ctx.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const card = await prisma.savedCard.create({
        data: {
          userId: ctx.user.id,
          cardToken: input.cardToken,
          lastFour: input.lastFour,
          brand: input.brand,
          expMonth: input.expMonth,
          expYear: input.expYear,
          cardholderName: input.cardholderName,
          isDefault: input.setDefault,
        },
      });

      // Mask token in response
      return { ...card, cardToken: card.cardToken.slice(0, 8) + '...' };
    }),

  setDefault: protectedProcedure
    .input(z.object({ cardId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const card = await prisma.savedCard.findFirst({
        where: { id: input.cardId, userId: ctx.user.id },
      });
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      await prisma.$transaction([
        prisma.savedCard.updateMany({ where: { userId: ctx.user.id, isDefault: true }, data: { isDefault: false } }),
        prisma.savedCard.update({ where: { id: card.id }, data: { isDefault: true } }),
      ]);

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ cardId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const card = await prisma.savedCard.findFirst({
        where: { id: input.cardId, userId: ctx.user.id },
      });
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      await prisma.savedCard.delete({ where: { id: card.id } });
      return { success: true };
    }),
});
