import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const promoRouter = router({
  // Validate a promo code (public — called at checkout)
  validate: publicProcedure
    .input(z.object({ code: z.string().min(1), orderAmount: z.number().positive() }))
    .query(async ({ input }) => {
      const promo = await prisma.promoCode.findUnique({ where: { code: input.code.toUpperCase() } });

      if (!promo || !promo.isActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or expired promo code' });
      }

      if (promo.validUntil && promo.validUntil < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Promo code has expired' });
      }

      if (promo.maxUses && promo.currentUses >= promo.maxUses) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Promo code usage limit reached' });
      }

      if (promo.minOrderAmount && input.orderAmount < Number(promo.minOrderAmount)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Minimum order amount is ${promo.minOrderAmount} SAR`,
        });
      }

      let discount = 0n;
      if (promo.discountType === 'percent') {
        discount = BigInt(Math.round(input.orderAmount * Number(promo.discountValue) / 100));
        if (promo.maxDiscount) discount = discount > BigInt(Math.round(Number(promo.maxDiscount))) ? BigInt(Math.round(Number(promo.maxDiscount))) : discount;
      } else {
        discount = BigInt(Math.round(Number(promo.discountValue)));
      }

      return {
        valid: true,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        discountAmount: Number(discount),
        finalAmount: input.orderAmount - Number(discount),
      };
    }),

  // Apply promo code to a booking
  redeemOnBooking: customerProcedure
    .input(z.object({ code: z.string().min(1), bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== ctx.user.id) throw new TRPCError({ code: 'NOT_FOUND' });

      const promo = await prisma.promoCode.findUnique({ where: { code: input.code.toUpperCase() } });
      if (!promo || !promo.isActive) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid promo code' });

      // Calculate discount
      let discount: number;
      if (promo.discountType === 'percent') {
        discount = Number(booking.totalAmount) * Number(promo.discountValue) / 100;
        if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
      } else {
        discount = Math.min(Number(promo.discountValue), Number(booking.totalAmount));
      }

      await prisma.$transaction([
        prisma.promoUsage.create({
          data: { promoCodeId: promo.id, userId: ctx.user.id, bookingId: booking.id, discountAmount: discount },
        }),
        prisma.promoCode.update({ where: { id: promo.id }, data: { currentUses: { increment: 1 } } }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { totalAmount: { decrement: discount } },
        }),
      ]);

      return { success: true, discount, newTotal: Number(booking.totalAmount) - discount };
    }),

  // Admin CRUD
  list: adminProcedure.query(async () => {
    return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' }, include: { usages: { take: 5 } } });
  }),

  create: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(20),
      discountType: z.enum(['percent', 'fixed']),
      discountValue: z.number().positive(),
      minOrderAmount: z.number().optional(),
      maxDiscount: z.number().optional(),
      maxUses: z.number().int().optional(),
      validUntil: z.string().datetime().optional(),
      appliesTo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.promoCode.create({
        data: { ...input, code: input.code.toUpperCase(), createdBy: ctx.user.id },
      });
    }),

  deactivate: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await prisma.promoCode.update({ where: { id: input.id }, data: { isActive: false } });
      return { success: true };
    }),
});
