/**
 * 1.1 Dynamic pricing — public price preview for the booking flows.
 *
 * Mirrors the engine applied inside bookings.create (lib/pricing.ts) so
 * the customer sees the same total they will pay before submitting.
 * Static services return enabled: false with an all-1.0 breakdown.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';
import { computeDynamicPrice } from '../lib/pricing';

export const pricingRouter = router({
  /** preview — the dynamic price for a service/technician/startAt. */
  preview: publicProcedure
    .input(
      z.object({
        serviceId: z.number().int().positive(),
        technicianId: z.number().int().positive(), // USER id
        startAt: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
      if (!service) throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });

      const technician = await prisma.technician.findUnique({
        where: { userId: input.technicianId },
      });
      if (!technician) throw new TRPCError({ code: 'NOT_FOUND', message: 'Technician not found' });

      if (!service.dynamicPricingEnabled) {
        return {
          enabled: false,
          breakdown: {
            base: Number(service.basePrice),
            tierMultiplier: 1,
            peakMultiplier: 1,
            surgeMultiplier: 1,
            total: Number(service.basePrice),
          },
        };
      }

      const rules = await prisma.servicePricing.findMany({ where: { isActive: true } });
      // Surge: the technician's slot fill within ±2h of the start time.
      const windowStart = new Date(input.startAt).getTime() - 2 * 3_600_000;
      const windowEnd = new Date(input.startAt).getTime() + 2 * 3_600_000;
      const windowSlots = await prisma.availabilitySlot.findMany({
        where: {
          technicianId: technician.id,
          startAt: { gte: new Date(windowStart), lte: new Date(windowEnd) },
        },
        select: { isBooked: true },
      });
      const surgeRatio =
        windowSlots.length >= 4
          ? windowSlots.filter((s) => s.isBooked).length / windowSlots.length
          : 0;

      return {
        enabled: true,
        breakdown: computeDynamicPrice({
          base: Number(service.basePrice),
          tier: technician.tier,
          serviceId: service.id,
          categoryId: service.categoryId,
          rules: rules.map((r) => ({
            isActive: r.isActive,
            serviceId: r.serviceId,
            categoryId: r.categoryId,
            technicianTier: r.technicianTier,
            dayOfWeek: r.dayOfWeek,
            hourStart: r.hourStart,
            hourEnd: r.hourEnd,
            priceMultiplier: Number(r.priceMultiplier),
          })),
          date: new Date(input.startAt),
          surgeRatio,
        }),
      };
    }),
});
