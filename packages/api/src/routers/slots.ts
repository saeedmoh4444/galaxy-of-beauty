import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, technicianProcedure, router } from '../trpc';

export const slotRouter = router({
  /**
   * Get available slots for a technician in a date range.
   * Public — no auth required.
   */
  getAvailability: publicProcedure
    .input(
      z.object({
        technicianId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        days: z.number().default(7),
      }),
    )
    .query(async ({ input }) => {
      const { technicianId, startDate, endDate, days } = input;

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate
        ? new Date(endDate)
        : new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

      const slots = await prisma.availabilitySlot.findMany({
        where: {
          technicianId,
          startAt: { gte: start },
          endAt: { lte: end },
          isBooked: false,
          isAvailable: true,
        },
        orderBy: { startAt: 'asc' },
      });

      return slots;
    }),

  /**
   * Create a batch of slots for the authenticated technician.
   * Validates no overlaps with existing available slots.
   */
  createSlots: technicianProcedure
    .input(
      z.object({
        slots: z.array(
          z.object({
            startAt: z.string(),
            endAt: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const technician = await prisma.technician.findUnique({
        where: { userId },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const slots = input.slots.map((s) => ({
        startAt: new Date(s.startAt),
        endAt: new Date(s.endAt),
      }));

      // Validate: no startAt after endAt
      for (const slot of slots) {
        if (slot.startAt >= slot.endAt) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'startAt must be before endAt for all slots',
          });
        }
      }

      // Validate no overlaps with existing available slots
      for (const slot of slots) {
        const overlapping = await prisma.availabilitySlot.findFirst({
          where: {
            technicianId: technician.id,
            isAvailable: true,
            startAt: { lt: slot.endAt },
            endAt: { gt: slot.startAt },
          },
        });

        if (overlapping) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Slot overlaps with existing slot ${overlapping.startAt.toISOString()} - ${overlapping.endAt.toISOString()}`,
          });
        }
      }

      const created = await prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({
          technicianId: technician.id,
          startAt: s.startAt,
          endAt: s.endAt,
        })),
      });

      return { count: created.count };
    }),

  /**
   * Create slots for a specific date using time strings.
   * e.g. date="2026-07-15", timeSlots=[{ start: "09:00", end: "10:00" }]
   */
  createBulkSlots: technicianProcedure
    .input(
      z.object({
        date: z.string(),
        timeSlots: z.array(
          z.object({
            start: z.string(),
            end: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const technician = await prisma.technician.findUnique({
        where: { userId },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const slots = input.timeSlots.map((ts) => ({
        startAt: new Date(`${input.date}T${ts.start}`),
        endAt: new Date(`${input.date}T${ts.end}`),
      }));

      // Validate
      for (const slot of slots) {
        if (slot.startAt >= slot.endAt) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'start must be before end for all time slots',
          });
        }
      }

      // Check for overlaps with existing available slots
      for (const slot of slots) {
        const overlapping = await prisma.availabilitySlot.findFirst({
          where: {
            technicianId: technician.id,
            isAvailable: true,
            startAt: { lt: slot.endAt },
            endAt: { gt: slot.startAt },
          },
        });

        if (overlapping) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Time slot overlaps with an existing slot',
          });
        }
      }

      const created = await prisma.availabilitySlot.createMany({
        data: slots.map((s) => ({
          technicianId: technician.id,
          startAt: s.startAt,
          endAt: s.endAt,
        })),
      });

      return { count: created.count };
    }),

  /**
   * Delete a single slot. If already booked, soft-delete
   * (set isAvailable=false). Otherwise hard-delete.
   */
  deleteSlot: technicianProcedure
    .input(z.object({ slotId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const technician = await prisma.technician.findUnique({
        where: { userId },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const slot = await prisma.availabilitySlot.findUnique({
        where: { id: input.slotId },
      });

      if (!slot) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Slot not found' });
      }

      if (slot.technicianId !== technician.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Slot does not belong to you',
        });
      }

      if (slot.isBooked) {
        // Soft-delete: mark unavailable but preserve for booking reference
        await prisma.availabilitySlot.update({
          where: { id: input.slotId },
          data: { isAvailable: false },
        });
      } else {
        // Hard delete unbooked slots
        await prisma.availabilitySlot.delete({
          where: { id: input.slotId },
        });
      }

      return { success: true };
    }),

  /**
   * Delete all unbooked slots for a given date. Booked slots
   * are soft-deleted (isAvailable=false).
   */
  deleteSlotsByDate: technicianProcedure
    .input(z.object({ date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const technician = await prisma.technician.findUnique({
        where: { userId },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);

      // Hard delete unbooked slots
      const { count: deleted } = await prisma.availabilitySlot.deleteMany({
        where: {
          technicianId: technician.id,
          startAt: { gte: startOfDay },
          endAt: { lte: endOfDay },
          isBooked: false,
        },
      });

      // Soft-delete booked slots (make them unavailable)
      const { count: unlisted } = await prisma.availabilitySlot.updateMany({
        where: {
          technicianId: technician.id,
          startAt: { gte: startOfDay },
          endAt: { lte: endOfDay },
          isBooked: true,
        },
        data: { isAvailable: false },
      });

      return { deleted, unlisted };
    }),

  /**
   * Get all slots for the authenticated technician.
   * Optionally filter by date range.
   */
  getMySlots: technicianProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const technician = await prisma.technician.findUnique({
        where: { userId },
      });

      if (!technician) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Technician profile not found',
        });
      }

      const where: Record<string, unknown> = {
        technicianId: technician.id,
      };

      if (input.startDate || input.endDate) {
        const andClause: Array<Record<string, unknown>> = [];
        if (input.startDate) {
          andClause.push({ startAt: { gte: new Date(input.startDate) } });
        }
        if (input.endDate) {
          andClause.push({ endAt: { lte: new Date(input.endDate) } });
        }
        where.AND = andClause;
      }

      const slots = await prisma.availabilitySlot.findMany({
        where,
        orderBy: { startAt: 'asc' },
      });

      return slots;
    }),
});
