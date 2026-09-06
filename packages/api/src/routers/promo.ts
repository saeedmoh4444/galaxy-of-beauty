import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

type PromoRow = NonNullable<Awaited<ReturnType<typeof prisma.promoCode.findUnique>>>;

/**
 * Shared validity guard (B.2): the same rules the public `validate` applies
 * must also gate `redeemOnBooking` — redemption used to skip expiry, maxUses,
 * and min-order checks.
 */
function assertPromoUsable(promo: PromoRow | null, orderAmount: number): asserts promo is PromoRow {
  if (!promo || !promo.isActive) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid or expired promo code' });
  }

  if (promo.validUntil && promo.validUntil < new Date()) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Promo code has expired' });
  }

  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Promo code usage limit reached' });
  }

  if (promo.minOrderAmount && orderAmount < Number(promo.minOrderAmount)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Minimum order amount is ${promo.minOrderAmount} SAR`,
    });
  }
}

export const promoRouter = router({
  // Validate a promo code (public — called at checkout)
  validate: publicProcedure
    .input(z.object({ code: z.string().min(1), orderAmount: z.number().positive() }))
    .query(async ({ input }) => {
      const promo = await prisma.promoCode.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      assertPromoUsable(promo, input.orderAmount);

      let discount = BigInt(0);
      if (promo.discountType === 'percent') {
        discount = BigInt(Math.round((input.orderAmount * Number(promo.discountValue)) / 100));
        if (promo.maxDiscount)
          discount =
            discount > BigInt(Math.round(Number(promo.maxDiscount)))
              ? BigInt(Math.round(Number(promo.maxDiscount)))
              : discount;
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
      if (!booking || booking.customerId !== ctx.user.id)
        throw new TRPCError({ code: 'NOT_FOUND' });

      const promo = await prisma.promoCode.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      assertPromoUsable(promo, Number(booking.totalAmount));

      // Double-redemption guard: the unique (promoCodeId, userId, bookingId)
      // index would otherwise surface as an opaque P2002 mid-transaction.
      const existing = await prisma.promoUsage.findUnique({
        where: {
          promoCodeId_userId_bookingId: {
            promoCodeId: promo.id,
            userId: ctx.user.id,
            bookingId: booking.id,
          },
        },
      });
      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Promo already applied to this booking',
        });
      }

      // Calculate discount
      let discount: number;
      if (promo.discountType === 'percent') {
        discount = (Number(booking.totalAmount) * Number(promo.discountValue)) / 100;
        if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
      } else {
        discount = Math.min(Number(promo.discountValue), Number(booking.totalAmount));
      }

      await prisma.$transaction([
        prisma.promoUsage.create({
          data: {
            promoCodeId: promo.id,
            userId: ctx.user.id,
            bookingId: booking.id,
            discountAmount: discount,
          },
        }),
        prisma.promoCode.update({
          where: { id: promo.id },
          data: { currentUses: { increment: 1 } },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { totalAmount: { decrement: discount } },
        }),
      ]);

      return { success: true, discount, newTotal: Number(booking.totalAmount) - discount };
    }),

  // Admin CRUD
  list: adminProcedure.query(async () => {
    return prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: { usages: { take: SMALL_PAGE_SIZE } },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(3).max(20),
        discountType: z.enum(['percent', 'fixed']),
        discountValue: z.number().positive(),
        minOrderAmount: z.number().optional(),
        maxDiscount: z.number().optional(),
        maxUses: z.number().int().optional(),
        validUntil: z.string().datetime().optional(),
        appliesTo: z.string().optional(),
      }),
    )
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
