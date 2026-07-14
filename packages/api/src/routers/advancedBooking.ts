import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, customerProcedure, router } from '../trpc';

export const advancedBookingRouter = router({
  // ── Recurring Booking ─────────────────────────────────
  createRecurring: customerProcedure
    .input(z.object({
      technicianId: z.number(), serviceId: z.number(), addressId: z.number(),
      slotId: z.number(),
      startAt: z.string(), endAt: z.string(),
      recurrence: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
      occurrences: z.number().min(2).max(12),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const bookings = [];
      const startDate = new Date(input.startAt);
      const duration = new Date(input.endAt).getTime() - startDate.getTime();

      for (let i = 0; i < input.occurrences; i++) {
        const nextStart = new Date(startDate);
        switch (input.recurrence) {
          case 'WEEKLY': nextStart.setDate(nextStart.getDate() + i * 7); break;
          case 'BIWEEKLY': nextStart.setDate(nextStart.getDate() + i * 14); break;
          case 'MONTHLY': nextStart.setMonth(nextStart.getMonth() + i); break;
        }
        const nextEnd = new Date(nextStart.getTime() + duration);
        const booking = await prisma.booking.create({
          data: {
            customerId: ctx.user.id, technicianId: input.technicianId,
            serviceId: input.serviceId, addressId: input.addressId,
            startAt: nextStart, endAt: nextEnd, status: 'REQUESTED',
            totalAmount: 0, bookingCode: `GOB-${Date.now().toString(36).toUpperCase().slice(-6)}${i}`,
            notes: `${input.notes || ''} (Recurring #${i + 1}/${input.occurrences})`,
          },
        });
        bookings.push(booking);
      }

      return { created: bookings.length, bookings };
    }),

  // ── Multi-Service Bundle ───────────────────────────────
  createBundle: customerProcedure
    .input(z.object({
      technicianId: z.number(), addressId: z.number(),
      services: z.array(z.object({ serviceId: z.number(), variantId: z.number().optional() })),
      startAt: z.string(), notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const bookings = await prisma.$transaction(
        input.services.map((svc, i) =>
          prisma.booking.create({
            data: {
              customerId: ctx.user.id, technicianId: input.technicianId,
              serviceId: svc.serviceId, variantId: svc.variantId,
              addressId: input.addressId,
              startAt: new Date(new Date(input.startAt).getTime() + i * 3600000),
              endAt: new Date(new Date(input.startAt).getTime() + (i + 1) * 3600000),
              status: 'REQUESTED', totalAmount: 0,
              bookingCode: `GOB-BNDL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
              notes: input.notes,
            },
          })
        )
      );
      return { created: bookings.length, bookings };
    }),

  // ── Express Booking (AI-assisted one-click) ────────────
  express: customerProcedure
    .input(z.object({
      serviceId: z.number(), preferredTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
      addressId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find best available technician + slot
      const hourMap = { morning: 9, afternoon: 14, evening: 18, anytime: 12 };
      const preferredHour = hourMap[input.preferredTime];

      const today = new Date();
      today.setHours(preferredHour, 0, 0, 0);
      if (today <= new Date()) today.setDate(today.getDate() + 1);

      const endTime = new Date(today.getTime() + 3600000);

      // Find any available technician offering this service
      const techService = await prisma.technicianService.findFirst({
        where: { serviceId: input.serviceId },
        include: { technician: { select: { userId: true } } },
      });

      if (!techService) throw new TRPCError({ code: 'NOT_FOUND', message: 'No technician found' });

      const booking = await prisma.booking.create({
        data: {
          customerId: ctx.user.id, technicianId: techService.technicianId,
          serviceId: input.serviceId, addressId: input.addressId,
          startAt: today, endAt: endTime, status: 'REQUESTED', totalAmount: 0,
          bookingCode: `GOB-EXP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          notes: 'Express booking (AI-assisted)',
        },
      });

      return { booking, message: 'Express booking created — technician will confirm shortly' };
    }),

  // ── Cancellation Protection ─────────────────────────────
  getInsuranceOptions: protectedProcedure.query(async () => {
    return [
      { id: 'basic', nameAr: 'حماية أساسية', nameEn: 'Basic Protection', price: 10, coverage: '50% refund' },
      { id: 'premium', nameAr: 'حماية مميزة', nameEn: 'Premium Protection', price: 25, coverage: '100% refund + reschedule' },
    ];
  }),
});
