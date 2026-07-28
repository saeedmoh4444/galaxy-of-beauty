import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

// In-memory store per user — migrate to DB for production
const store = new Map<number, Array<{ date: string; water: number; sleep: number; mood: number; steps: number; skincare: boolean; notes: string }>>();

function getUserData(userId: number) {
  if (!store.has(userId)) store.set(userId, []);
  return store.get(userId)!;
}

export const wellnessTrackerRouter = router({
  // Today's entry
  today: customerProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().slice(0, 10);
    const data = getUserData(ctx.user.id);
    return data.find((d) => d.date === today) ?? null;
  }),

  // Log / update today's wellness
  checkin: customerProcedure
    .input(
      z.object({
        water: z.number().min(0).max(20).optional(),   // glasses
        sleep: z.number().min(0).max(24).optional(),    // hours
        mood: z.number().min(1).max(5).optional(),      // 1-5
        steps: z.number().min(0).max(100000).optional(),
        skincare: z.boolean().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      const data = getUserData(ctx.user.id);
      const idx = data.findIndex((d) => d.date === today);
      const entry = idx >= 0
        ? { ...data[idx]!, ...input }
        : { date: today, water: 0, sleep: 0, mood: 3, steps: 0, skincare: false, notes: '', ...input };
      if (idx >= 0) data[idx] = entry; else data.push(entry);
      return entry;
    }),

  // Weekly summary
  weekly: customerProcedure.query(async ({ ctx }) => {
    const data = getUserData(ctx.user.id);
    const today = new Date();
    const week: Array<{ date: string; water: number; sleep: number; mood: number; steps: number; skincare: boolean }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = data.find((e) => e.date === dateStr);
      week.push(entry ?? { date: dateStr, water: 0, sleep: 0, mood: 0, steps: 0, skincare: false });
    }
    const avgWater = Math.round(week.reduce((s, d) => s + d.water, 0) / 7);
    const avgSleep = Math.round((week.reduce((s, d) => s + d.sleep, 0) / 7) * 10) / 10;
    const avgMood = Math.round((week.reduce((s, d) => s + (d.mood || 0), 0) / week.filter((d) => d.mood > 0).length || 1) * 10) / 10;
    const totalSteps = week.reduce((s, d) => s + d.steps, 0);
    const skincareDays = week.filter((d) => d.skincare).length;
    const streak = week.filter((d) => d.skincare).length;
    return { week, avgWater, avgSleep, avgMood, totalSteps, skincareDays, streak };
  }),
});
