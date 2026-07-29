import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const techCalendarRouter = router({
  // Get available slots for a technician on a given date range
  slots: publicProcedure
    .input(z.object({ technicianId: z.number(), month: z.number().min(1).max(12), year: z.number().min(2024) }))
    .query(async ({ input }) => {
      const startOfMonth = new Date(input.year, input.month - 1, 1);
      const endOfMonth = new Date(input.year, input.month, 0);

      const slots = await db.availabilitySlot.findMany({
        where: {
          technicianId: input.technicianId,
          date: { gte: startOfMonth, lte: endOfMonth },
          isBooked: false,
        },
        orderBy: { date: 'asc' },
      }).catch(() => []);

      const technician = await db.technician.findUnique({
        where: { id: input.technicianId },
        include: { user: { select: { name: true } } },
      }).catch(() => null);

      // Group slots by date
      const byDate: Record<string, unknown[]> = {};
      (slots as any[]).forEach((s: any) => {
        const dateKey = new Date(s.date).toISOString().slice(0, 10);
        if (!byDate[dateKey]) byDate[dateKey] = [];
        byDate[dateKey].push({ id: s.id, startTime: s.startTime, endTime: s.endTime });
      });

      return {
        technicianId: input.technicianId,
        technicianName: (technician as any)?.user?.name ?? '',
        month: input.month,
        year: input.year,
        availableDates: Object.entries(byDate).map(([date, timeSlots]) => ({ date, slots: timeSlots })),
      };
    }),

  // List technicians with public availability
  listWithAvailability: publicProcedure.query(async () => {
    const technicians = await db.technician.findMany({
      where: { isVerified: true },
      take: 10,
      include: { user: { select: { name: true, avatarUrl: true } } },
    }).catch(() => []);

    return (technicians as any[]).map((t: any) => ({
      id: t.id,
      name: t.user?.name ?? '',
      avatarUrl: t.user?.avatarUrl ?? null,
      rating: Number(t.rating ?? 4.5),
      hasAvailability: true,
    }));
  }),
});
