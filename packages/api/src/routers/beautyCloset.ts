import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const beautyClosetRouter = router({
  myProducts: customerProcedure.query(async ({ ctx }) => {
    return prisma.beautyClosetProduct.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } });
  }),
  addProduct: customerProcedure
    .input(z.object({ name: z.string(), emoji: z.string().optional(), category: z.string().default('skincare'), openDate: z.string().optional(), expiryMonths: z.number().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyClosetProduct.create({ data: { userId: ctx.user.id, ...input, openDate: input.openDate ? new Date(input.openDate) : undefined } });
    }),
  updateUsage: customerProcedure
    .input(z.object({ id: z.number(), usagePct: z.number().min(0).max(100) }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyClosetProduct.updateMany({ where: { id: input.id, userId: ctx.user.id }, data: { usagePct: input.usagePct } });
    }),
  deleteProduct: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.beautyClosetProduct.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
      return { success: true };
    }),
});
