import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8am - 9pm
const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const bookingHeatmapRouter = router({
  data: publicProcedure
    .input(z.object({ technicianId: z.number().optional() }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {};
      if (input.technicianId) where.technicianId = input.technicianId;

      const bookings = await prisma.booking.findMany({
        where: where as never,
        select: { startAt: true },
      });

      // Aggregate real bookings into day-hour buckets
      const buckets = new Map<string, number>();
      for (const b of bookings) {
        const d = new Date(b.startAt);
        const day = d.getDay(); // 0=Sun … 6=Sat
        const hour = d.getHours();
        if (hour >= 8 && hour <= 21) {
          const key = `${day}-${hour}`;
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
      }

      const heatmap = DAYS.map((_day, di) =>
        HOURS.map((hour) => ({
          day: di,
          hour,
          value: buckets.get(`${di}-${hour}`) || 0,
        })),
      );
      return { days: DAYS, hours: HOURS, heatmap };
    }),
});
