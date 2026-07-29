import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface SkinDiaryEntry { id: number; date: string; imageUrl: string; skinCondition: string; notes: string; hydration: number; concerns: string[]; }
type DiaryEntry = SkinDiaryEntry;
const diaryStore = new Map<number, DiaryEntry[]>();
let entryId = 1;

export const skinDiaryRouter = router({
  entries: customerProcedure.query(async ({ ctx }) => diaryStore.get(ctx.user.id) ?? []),
  add: customerProcedure
    .input(z.object({ imageUrl: z.string().url(), skinCondition: z.string(), notes: z.string().optional(), hydration: z.number().min(1).max(10).default(5), concerns: z.array(z.string()).default([]) }))
    .mutation(async ({ ctx, input }) => {
      const entry: DiaryEntry = { id: entryId++, date: new Date().toISOString(), ...input, notes: input.notes ?? '' };
      if (!diaryStore.has(ctx.user.id)) diaryStore.set(ctx.user.id, []);
      diaryStore.get(ctx.user.id)!.unshift(entry);
      return entry;
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const entries = diaryStore.get(ctx.user.id) ?? [];
    diaryStore.set(ctx.user.id, entries.filter((e) => e.id !== input.id));
    return { success: true };
  }),
  timeline: customerProcedure.query(async ({ ctx }) => {
    const entries = diaryStore.get(ctx.user.id) ?? [];
    return entries.slice(0, 30).map((e) => ({ date: e.date, hydration: e.hydration, skinCondition: e.skinCondition }));
  }),
});
