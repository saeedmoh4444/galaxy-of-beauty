import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const classPassRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(12) }))
    .query(async ({ input }) => prisma.classPass.findMany({ where: { isActive: true }, take: input.limit, orderBy: { price: 'asc' } })),

  purchase: customerProcedure
    .input(z.object({ passId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const pass = await prisma.classPass.findUnique({ where: { id: input.passId } });
      if (!pass) return { error: 'Pass not found' };
      await prisma.classPassPurchase.create({ data: { userId: ctx.user.id, passId: input.passId, classesRemaining: pass.classes, expiresAt: new Date(Date.now() + 90 * 86400000) } });
      return { success: true };
    }),

  myPasses: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => prisma.classPassPurchase.findMany({ where: { userId: ctx.user.id }, include: { pass: true }, take: input.limit, orderBy: { createdAt: 'desc' } })),
});
