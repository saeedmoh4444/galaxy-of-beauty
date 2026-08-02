import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { EMERGENCY_SURCHARGE_SAR, EMERGENCY_WINDOW_HOURS, DEFAULT_PLATFORM_FEE_SAR } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

export const emergencyBookingRouter = router({
  // Check if a service is available for emergency booking
  checkAvailability: customerProcedure
    .input(z.object({ serviceId: z.number().int().positive(), city: z.string().optional() }))
    .query(async ({ input }) => {
      const now = new Date();
      const deadline = new Date(now.getTime() + EMERGENCY_WINDOW_HOURS * 3600 * 1000);

      // Find technicians offering this service who have availability within 3 hours
      const techServices = await prisma.technicianService.findMany({
        where: { serviceId: input.serviceId, isActive: true },
        include: {
          technician: {
            include: {
              availabilitySlots: {
                where: {
                  startAt: { lte: deadline },
                  endAt: { gte: now },
                  isBooked: false,
                  isAvailable: true,
                },
                take: 1,
              },
            },
          },
        },
      });

      const available = techServices
        .filter((ts: any) => ts.technician.availabilitySlots.length > 0)
        .map((ts: any) => ({
          technicianId: ts.technician.id,
          name: `فنية #${ts.technician.id}`,
          city: ts.technician.city,
          rating: Number(ts.technician.ratingAvg),
          price: Number(ts.customPrice),
          nextSlot: ts.technician.availabilitySlots[0]?.startAt,
        }));

      const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
      const basePrice = Number(service?.basePrice || 0);

      return {
        available,
        basePrice,
        emergencySurcharge: EMERGENCY_SURCHARGE_SAR,
        totalEstimate: basePrice + EMERGENCY_SURCHARGE_SAR,
        availableWithin: `${EMERGENCY_WINDOW_HOURS} hours`,
        currency: 'SAR',
      };
    }),

  // Create an emergency booking
  create: customerProcedure
    .input(z.object({
      serviceId: z.number().int().positive(),
      technicianId: z.number().int().positive(),
      addressId: z.number().int().positive(),
      slotId: z.number().int().positive(),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the slot is within 3 hours
      const slot = await prisma.availabilitySlot.findUnique({ where: { id: input.slotId } });
      if (!slot || slot.isBooked) throw new TRPCError({ code: 'BAD_REQUEST', message: 'الموعد غير متاح' });

      const now = new Date();
      const deadline = new Date(now.getTime() + EMERGENCY_WINDOW_HOURS * 3600 * 1000);
      if (slot.startAt > deadline) throw new TRPCError({ code: 'BAD_REQUEST', message: 'الموعد خارج نطاق الحجز الطارئ (3 ساعات)' });

      const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
      if (!service) throw new TRPCError({ code: 'NOT_FOUND', message: 'الخدمة غير موجودة' });

      const totalAmount = Number(service.basePrice) + EMERGENCY_SURCHARGE_SAR;

      const booking = await prisma.booking.create({
        data: {
          bookingCode: `EMG-${Date.now().toString(36).toUpperCase()}`,
          customerId: ctx.user.id,
          technicianId: input.technicianId,
          serviceId: input.serviceId,
          addressId: input.addressId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          status: 'REQUESTED',
          totalAmount,
          platformFee: DEFAULT_PLATFORM_FEE_SAR,
          notes: input.notes,
          idempotencyKey: crypto.randomUUID(),
        },
      });

      // Mark slot as booked
      await prisma.availabilitySlot.update({ where: { id: input.slotId }, data: { isBooked: true, bookingId: booking.id } });

      return { bookingCode: booking.bookingCode, totalAmount, emergencySurcharge: EMERGENCY_SURCHARGE_SAR };
    }),
});
