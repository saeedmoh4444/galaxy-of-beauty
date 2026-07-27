import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

export const priceEstimatorRouter = router({
  // Estimate total cost for a booking
  estimate: publicProcedure
    .input(z.object({
      serviceId: z.number().int().positive(),
      variantId: z.number().int().positive().optional(),
      promoCode: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
      if (!service) throw new Error('الخدمة غير موجودة');

      let basePrice = Number(service.basePrice);
      let variantDelta = 0;
      let variantName = '';

      if (input.variantId) {
        const variant = await prisma.serviceVariant.findUnique({ where: { id: input.variantId } });
        if (variant && variant.serviceId === input.serviceId) {
          variantDelta = Number(variant.priceDelta);
          variantName = (variant.nameJson as Record<string, string>)?.ar || '';
        }
      }

      const subtotal = basePrice + variantDelta;
      const platformFee = 11; // SAR — configurable via PLATFORM_FEE_SAR env
      let discount = 0;
      let discountType = '';
      let promoValid = false;

      // Check promo code
      if (input.promoCode) {
        const promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode.toUpperCase() } });
        if (promo && promo.isActive && (!promo.validUntil || promo.validUntil > new Date())) {
          if (promo.discountType === 'percent') {
            discount = Math.round(subtotal * Number(promo.discountValue) / 100);
            if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
          } else {
            discount = Number(promo.discountValue);
          }
          discountType = promo.discountType;
          promoValid = true;
        }
      }

      const total = Math.max(0, subtotal + platformFee - discount);

      return {
        serviceName: (service.titleJson as Record<string, string>)?.ar || '',
        basePrice,
        variantDelta,
        variantName,
        subtotal,
        platformFee,
        discount,
        discountType,
        promoValid,
        total,
        currency: 'SAR',
      };
    }),
});
