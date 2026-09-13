import { z } from 'zod';
import { prisma } from '@galaxy/db';
import {
  SAUDI_CITIES,
  HOME_SERVICE_BASE_FEE,
  HOME_SERVICE_TRAVEL_FEE_MAJOR,
  HOME_SERVICE_TRAVEL_FEE_OTHER,
  HOME_SERVICE_SERVICE_FEE,
} from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const homeServiceRouter = router({
  estimate: publicProcedure
    .input(z.object({ city: z.string(), serviceCategory: z.string().optional() }))
    .query(({ input }) => {
      const baseFee = HOME_SERVICE_BASE_FEE;
      const travelFee =
        input.city === 'الرياض' || input.city === 'جدة'
          ? HOME_SERVICE_TRAVEL_FEE_MAJOR
          : input.city
            ? HOME_SERVICE_TRAVEL_FEE_OTHER
            : HOME_SERVICE_TRAVEL_FEE_MAJOR;
      const serviceFee = HOME_SERVICE_SERVICE_FEE;
      return {
        city: input.city,
        baseFee,
        travelFee,
        serviceFee,
        total: baseFee + travelFee + serviceFee,
        currency: 'SAR',
        cities: SAUDI_CITIES,
      };
    }),

  request: customerProcedure
    .input(
      z.object({
        serviceId: z.number(),
        city: z.string(),
        address: z.string().min(5),
        preferredDate: z.string(),
        preferredTime: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const req = await prisma.homeServiceRequest.create({
        data: { userId: ctx.user.id, ...input },
      });

      // E5 — assign a verified at-home salon provider covering the city
      // (best-rated first). Unassigned when none covers it.
      const provider = await prisma.vendor.findFirst({
        where: { type: 'ATHOME', isVerified: true, isActive: true, homeCity: input.city },
        orderBy: { ratingAvg: 'desc' },
      });
      let assigned = false;
      let providerName: string | undefined;
      if (provider) {
        await prisma.homeServiceRequest.update({
          where: { id: req.id },
          data: { vendorId: provider.id, assignedAt: new Date() },
        });
        assigned = true;
        providerName = provider.storeName;
      }

      return {
        requestId: `HOME-${req.id}`,
        status: 'PENDING',
        ...input,
        estimatedArrival: 'خلال ٤٥-٦٠ دقيقة',
        confirmationSms: true,
        assigned,
        ...(assigned ? { vendorId: provider!.id, providerName } : {}),
      };
    }),
});
