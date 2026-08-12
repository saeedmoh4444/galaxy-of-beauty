import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyPartnerRouter = router({
  findMatch: customerProcedure
    .input(z.object({ interest: z.string().min(2).max(100), city: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const match = await prisma.beautyPartner.findFirst({
        where: {
          interest: { contains: input.interest },
          userId: { not: ctx.user.id },
          status: 'SEEKING',
          ...(input.city ? { city: input.city } : {}),
        },
        orderBy: { createdAt: 'asc' },
      });
      if (match) {
        await prisma.beautyPartnerMatch.create({
          data: { partner1Id: ctx.user.id, partner2Id: match.userId, interest: input.interest },
        });
        return { matched: true, partnerId: match.userId };
      }
      await prisma.beautyPartner.upsert({
        where: { userId: ctx.user.id },
        create: { userId: ctx.user.id, interest: input.interest, city: input.city ?? null },
        update: { interest: input.interest },
      });
      return { matched: false, message: 'جاري البحث عن شريكة' };
    }),

  myStatus: customerProcedure.query(async ({ ctx }) =>
    prisma.beautyPartner.findUnique({ where: { userId: ctx.user.id } }),
  ),

  myMatches: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.beautyPartnerMatch.findMany({
        where: { OR: [{ partner1Id: ctx.user.id }, { partner2Id: ctx.user.id }] },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ),

  cancelSearch: customerProcedure.mutation(async ({ ctx }) => {
    await prisma.beautyPartner.deleteMany({ where: { userId: ctx.user.id } });
    return { success: true };
  }),
});
