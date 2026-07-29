import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const TRACKED: Array<{ id: number; userId: number; serviceName: string; currentPrice: number; prevPrice: number; lowestPrice: number; emoji: string; createdAt: string }> = [
  { id: 1, userId: 1, serviceName: 'مكياج احترافي', currentPrice: 300, prevPrice: 350, lowestPrice: 250, emoji: '💄', createdAt: '2026-06-01' },
  { id: 2, userId: 1, serviceName: 'تنظيف بشرة', currentPrice: 200, prevPrice: 200, lowestPrice: 180, emoji: '✨', createdAt: '2026-06-15' },
];

export const serviceWishlistRouter = router({
  myWishlist: customerProcedure.query(async ({ ctx }) => TRACKED.filter((t) => t.userId === ctx.user.id).map((t) => ({ ...t, dropped: t.currentPrice < t.prevPrice, droppedBy: t.prevPrice - t.currentPrice }))),
  add: customerProcedure
    .input(z.object({ serviceName: z.string().min(1), currentPrice: z.number(), emoji: z.string().default('💅') }))
    .mutation(async ({ ctx, input }) => {
      const item = { id: TRACKED.length + 1, userId: ctx.user.id, serviceName: input.serviceName, currentPrice: input.currentPrice, prevPrice: input.currentPrice, lowestPrice: input.currentPrice, emoji: input.emoji, createdAt: new Date().toISOString().slice(0, 10) };
      TRACKED.push(item);
      return item;
    }),
  remove: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const idx = TRACKED.findIndex((t) => t.id === input.id && t.userId === ctx.user.id); if (idx >= 0) TRACKED.splice(idx, 1); return { success: true }; }),
});
