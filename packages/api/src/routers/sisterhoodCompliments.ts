import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const sisterhoodComplimentsRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return prisma.sisterhoodCompliment.findMany({ orderBy: { createdAt: 'desc' }, take: input.limit });
    }),

  send: customerProcedure
    .input(z.object({ emoji: z.string().default('💌'), text: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      return prisma.sisterhoodCompliment.create({ data: { emoji: input.emoji, text: input.text, senderId: ctx.user.id, senderName: ctx.user.name } });
    }),

  mySent: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.sisterhoodCompliment.findMany({ where: { senderId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: input.limit });
    }),

  count: publicProcedure.query(async () => {
    return prisma.sisterhoodCompliment.count();
  }),
});
