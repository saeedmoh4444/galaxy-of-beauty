import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { protectedProcedure, customerProcedure, router } from '../trpc';

export const rescheduleRouter = router({
  request: customerProcedure
    .input(z.object({
      bookingId: z.number().int().positive(),
      newStartAt: z.string().datetime(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { slot: true },
      });

      if (!booking || booking.customerId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      if (!['REQUESTED', 'ACCEPTED'].includes(booking.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking cannot be rescheduled' });
      }

      const newStart = new Date(input.newStartAt);
      if (newStart <= new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'New time must be in the future' });
      }

      // Check slot availability
      const newEnd = new Date(newStart.getTime() + (booking.endAt.getTime() - booking.startAt.getTime()));
      const conflicts = await prisma.availabilitySlot.findFirst({
        where: {
          technicianId: booking.technicianId,
          isBooked: false,
          startAt: { lte: newStart },
          endAt: { gte: newEnd },
        },
      });

      let targetSlotId: number | null = null;

      if (conflicts) {
        targetSlotId = conflicts.id;
      }

      // Execute reschedule
      const updated = await prisma.$transaction(async (tx) => {
        // Free old slot
        if (booking.slot) {
          await tx.availabilitySlot.update({
            where: { id: booking.slot.id },
            data: { isBooked: false, bookingId: null },
          });
        }

        // Book new slot if available
        if (targetSlotId) {
          await tx.availabilitySlot.update({
            where: { id: targetSlotId },
            data: { isBooked: true, bookingId: booking.id },
          });
        }

        return tx.booking.update({
          where: { id: booking.id },
          data: { startAt: newStart, endAt: newEnd, notes: input.reason ? `Rescheduled: ${input.reason}` : booking.notes },
        });
      });

      return { success: true, booking: updated };
    }),

  history: protectedProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .query(async () => {
      return { items: [] as Array<{ from: string; to: string; reason: string | null; at: Date }> };
    }),
});
