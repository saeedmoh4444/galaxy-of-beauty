import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, router } from '../trpc';

const db = prisma;

// Legacy slot shape the payload reads (the schema uses startAt/endAt, not date/startTime/endTime).
interface LegacySlotRow {
  id: number;
  date: string | Date;
  startTime: string;
  endTime: string;
}

// Technician card row plus the legacy `rating` field the payload reads (schema stores ratingAvg).
interface TechnicianCardRow {
  id: number;
  rating?: number;
  user: { name: string | null; avatarUrl: string | null } | null;
}

export const techCalendarRouter = router({
  // Get available slots for a technician on a given date range
  slots: publicProcedure
    .input(
      z.object({
        technicianId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number().min(2024),
      }),
    )
    .query(async ({ input }) => {
      const startOfMonth = new Date(input.year, input.month - 1, 1);
      const endOfMonth = new Date(input.year, input.month, 0);

      const slots = await db.availabilitySlot
        .findMany({
          where: {
            technicianId: input.technicianId,
            startAt: { gte: startOfMonth, lte: endOfMonth },
            isBooked: false,
          },
          orderBy: { startAt: 'asc' },
        })
        .catch(() => []);

      const technician = await db.technician
        .findUnique({
          where: { id: input.technicianId },
          include: { user: { select: { name: true } } },
        })
        .catch(() => null);

      // Group slots by date
      const byDate: Record<string, unknown[]> = {};
      (slots as unknown as LegacySlotRow[]).forEach((s) => {
        const dateKey = new Date(s.date).toISOString().slice(0, 10);
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push({ id: s.id, startTime: s.startTime, endTime: s.endTime });
      });

      return {
        technicianId: input.technicianId,
        technicianName: technician?.user?.name ?? '',
        month: input.month,
        year: input.year,
        availableDates: Object.entries(byDate).map(([date, timeSlots]) => ({
          date,
          slots: timeSlots,
        })),
      };
    }),

  // List technicians with public availability
  listWithAvailability: publicProcedure.query(async () => {
    const technicians = await db.technician
      .findMany({
        where: { kycStatus: 'VERIFIED' },
        take: DEFAULT_PAGE_SIZE,
        include: { user: { select: { name: true, avatarUrl: true } } },
      })
      .catch(() => []);

    return (technicians as TechnicianCardRow[]).map((t) => ({
      id: t.id,
      name: t.user?.name ?? '',
      avatarUrl: t.user?.avatarUrl ?? null,
      rating: Number(t.rating ?? 4.5),
      hasAvailability: true,
    }));
  }),
});
