import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const affirmationsRouter = router({
  random: publicProcedure.query(async () => {
    const count = await prisma.affirmation.count();
    if (count === 0) return { text: 'أنتِ جميلة كما أنتِ', emoji: '💖' };
    const skip = Math.floor(Math.random() * count);
    return prisma.affirmation.findFirst({ skip, take: 1 });
  }),

  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return prisma.affirmation.findMany({ take: input.limit });
    }),

  myFavorites: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.affirmationFavorite.findMany({ where: { userId: ctx.user.id }, include: { affirmation: true }, take: input.limit });
    }),

  save: customerProcedure
    .input(z.object({ affirmationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.affirmationFavorite.create({ data: { userId: ctx.user.id, affirmationId: input.affirmationId } });
      return { success: true };
    }),
});
