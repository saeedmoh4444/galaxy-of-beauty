/**
 * B.7 — provider-proposed time-limited discounts on their own services.
 * Proposals ride the generic ProviderSubmission queue (providerReview);
 * admin approval materializes a FlashDeal row, so approved deals appear in
 * the existing public flashDeals feed. (A separate "salon offers" rail was
 * recommended by the plan — deferred until the campaigns feed is reworked.)
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { technicianProcedure, router } from '../trpc';

/** Discount floor: providers may not undercut below 40% of regular price. */
const DEAL_PRICE_FLOOR_PERCENT = 40;

export const promotionRouter = router({
  propose: technicianProcedure
    .input(
      z
        .object({
          serviceId: z.number().int().positive(),
          dealPrice: z.number().positive(),
          startsAt: z.string().datetime(),
          endsAt: z.string().datetime(),
        })
        .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
          message: 'endAt must be after startAt',
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const technician = await prisma.technician.findUnique({
        where: { userId: ctx.user.id },
      });
      if (!technician) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician profile not found' });
      }

      // Own-service rule.
      const mapping = await prisma.technicianService.findFirst({
        where: { technicianId: technician.id, serviceId: input.serviceId, isActive: true },
      });
      if (!mapping) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Service is not one of your own services',
        });
      }

      const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
      if (!service) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
      }

      const originalPrice = Number(mapping.customPrice ?? service.basePrice);
      const floor = (originalPrice * DEAL_PRICE_FLOOR_PERCENT) / 100;

      if (input.dealPrice >= originalPrice) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Deal price must be lower than the regular price',
        });
      }
      if (input.dealPrice < floor) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Deal price below the ${DEAL_PRICE_FLOOR_PERCENT}% floor (${floor} SAR)`,
        });
      }

      const title = (service.titleJson ?? {}) as { ar?: string; en?: string };

      return prisma.providerSubmission.create({
        data: {
          providerId: ctx.user.id,
          kind: 'promotion',
          status: 'PENDING_REVIEW',
          payload: {
            serviceId: service.id,
            titleAr: title.ar ?? '',
            titleEn: title.en ?? '',
            originalPrice,
            dealPrice: input.dealPrice,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
          },
        },
      });
    }),

  /** myPromotions — the caller's own promotion proposals (any status). */
  myPromotions: technicianProcedure.query(async ({ ctx }) => {
    return prisma.providerSubmission.findMany({
      where: { providerId: ctx.user.id, kind: 'promotion' },
      orderBy: { createdAt: 'desc' },
    });
  }),
});
