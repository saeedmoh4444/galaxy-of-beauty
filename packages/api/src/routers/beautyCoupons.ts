import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const beautyCouponsRouter = router({
  listActive: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(10) }))
    .query(async ({ input }) => prisma.beautyCoupon.findMany({ where: { isActive: true, expiresAt: { gte: new Date() } }, take: input.limit })),

  validate: customerProcedure
    .input(z.object({ code: z.string().min(3).max(20) }))
    .query(async ({ input }) => {
      const coupon = await prisma.beautyCoupon.findFirst({ where: { code: input.code.toUpperCase(), isActive: true, expiresAt: { gte: new Date() } } });
      if (!coupon) throw notFound('Coupon');
      return { code: coupon.code, discountPercent: coupon.discountPercent, maxUses: coupon.maxUses, used: coupon.used };
    }),

  create: adminProcedure
    .input(z.object({ code: z.string().min(3).max(20), discountPercent: z.number().int().min(5).max(50), maxUses: z.number().int().positive().default(100), expiresAt: z.string() }))
    .mutation(async ({ input }) => prisma.beautyCoupon.create({ data: { code: input.code.toUpperCase(), discountPercent: input.discountPercent, maxUses: input.maxUses, expiresAt: new Date(input.expiresAt) } })),
});
