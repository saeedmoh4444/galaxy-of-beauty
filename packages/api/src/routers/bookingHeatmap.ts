import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8am - 9pm
const DAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const bookingHeatmapRouter = router({
  data: publicProcedure
    .input(z.object({ technicianId: z.number().optional() }))
    .query(async ({ input }) => {
      const heatmap = DAYS.map((_day, di) =>
        HOURS.map((hour) => ({
          day: di, hour, value: Math.floor(Math.random() * 10) + (di >= 4 ? 6 : 2) + (hour >= 16 && hour <= 20 ? 4 : 0) + (input.technicianId ? (input.technicianId % 3) : 0),
        })),
      );
      return { days: DAYS, hours: HOURS, heatmap };
    }),
});
