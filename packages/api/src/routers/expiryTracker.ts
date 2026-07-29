import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface ExpiryTrackerItem { id: number; productName: string; category: string; openDate: string; expiryMonths: number; emoji: string; }
type ExpiryItem = ExpiryTrackerItem;
const items: ExpiryItem[] = []; let eId = 1;

const CATEGORIES = [
  { key: 'mascara', nameAr: 'ماسكارا', emoji: '👁️', months: 6 },
  { key: 'lipstick', nameAr: 'أحمر شفاه', emoji: '💄', months: 18 },
  { key: 'foundation', nameAr: 'كريم أساس', emoji: '🎨', months: 12 },
  { key: 'skincare', nameAr: 'عناية بالبشرة', emoji: '🧴', months: 12 },
  { key: 'sunscreen', nameAr: 'واقي شمس', emoji: '☀️', months: 12 },
  { key: 'eyeshadow', nameAr: 'ظلال عيون', emoji: '🎨', months: 24 },
];

export const expiryTrackerRouter = router({
  categories: customerProcedure.query(() => CATEGORIES),
  myItems: customerProcedure.query(() => {
    const now = new Date();
    return items.map((i) => {
      const opened = new Date(i.openDate);
      const expires = new Date(opened); expires.setMonth(expires.getMonth() + i.expiryMonths);
      const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / 86400000);
      return { ...i, daysLeft, expired: daysLeft <= 0, isClose: daysLeft > 0 && daysLeft <= 30 };
    });
  }),
  add: customerProcedure
    .input(z.object({ productName: z.string().min(1), category: z.string() }))
    .mutation(async ({ input }) => {
      const cat = CATEGORIES.find((c) => c.key === input.category);
      const item: ExpiryItem = { id: eId++, productName: input.productName, category: input.category, openDate: new Date().toISOString(), expiryMonths: cat?.months ?? 12, emoji: cat?.emoji ?? '📦' };
      items.push(item);
      return item;
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const idx = items.findIndex((i) => i.id === input.id); if (idx >= 0) items.splice(idx, 1); return { success: true }; }),
});
