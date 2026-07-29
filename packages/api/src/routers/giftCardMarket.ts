import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const LISTINGS: Array<{ id: number; sellerId: number; sellerName: string; value: number; sellingPrice: number; discount: number; emoji: string; createdAt: string }> = [
  { id: 1, sellerId: 2, sellerName: 'سارة', value: 300, sellingPrice: 240, discount: 20, emoji: '🎁', createdAt: '2026-07-25' },
  { id: 2, sellerId: 3, sellerName: 'مريم', value: 500, sellingPrice: 400, discount: 20, emoji: '🎁', createdAt: '2026-07-24' },
];

export const giftCardMarketRouter = router({
  listings: customerProcedure.query(() => LISTINGS),
  myListings: customerProcedure.query(async ({ ctx }) => LISTINGS.filter((l) => l.sellerId === ctx.user.id)),
  list: customerProcedure
    .input(z.object({ value: z.number().min(50), sellingPrice: z.number().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const listing = { id: LISTINGS.length + 1, sellerId: ctx.user.id, sellerName: 'أنتِ', value: input.value, sellingPrice: input.sellingPrice, discount: Math.round(((input.value - input.sellingPrice) / input.value) * 100), emoji: '🎁', createdAt: new Date().toISOString().slice(0, 10) };
      LISTINGS.push(listing);
      return listing;
    }),
  buy: customerProcedure
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ input }) => {
      const idx = LISTINGS.findIndex((l) => l.id === input.listingId);
      if (idx >= 0) { const bought = LISTINGS[idx]!; LISTINGS.splice(idx, 1); return { bought: true, ...bought }; }
      throw new Error('غير متوفر');
    }),
});
