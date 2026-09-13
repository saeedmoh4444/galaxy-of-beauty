import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const bookClubRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.bookClub.findMany({
          orderBy: { members: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.bookClub.count(),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  join: customerProcedure
    .input(z.object({ clubId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.bookClubMember.findUnique({
        where: { clubId_userId: { clubId: input.clubId, userId: ctx.user.id } },
      });
      if (!existing) {
        await prisma.bookClubMember.create({ data: { clubId: input.clubId, userId: ctx.user.id } });
        await prisma.bookClub.update({
          where: { id: input.clubId },
          data: { members: { increment: 1 } },
        });
      }
      return { success: true };
    }),

  myClubs: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.bookClubMember.findMany({
        where: { userId: ctx.user.id },
        include: { club: true },
        take: input.limit,
      }),
    ),
});
