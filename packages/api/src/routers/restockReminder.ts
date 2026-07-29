import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface RestockReminderItem { id: number; productName: string; category: string; purchaseDate: string; lifespanDays: number; notifyDays: number; emoji: string; }
type RestockItem = RestockReminderItem;
const items: RestockItem[] = []; let itemId = 1;

const CATEGORIES = [
  { key: 'moisturizer', nameAr: 'مرطب', emoji: '🧴', lifespan: 60 },
  { key: 'serum', nameAr: 'سيروم', emoji: '✨', lifespan: 45 },
  { key: 'sunscreen', nameAr: 'واقي شمس', emoji: '☀️', lifespan: 30 },
  { key: 'cleanser', nameAr: 'غسول', emoji: '🧼', lifespan: 60 },
  { key: 'shampoo', nameAr: 'شامبو', emoji: '🧴', lifespan: 60 },
  { key: 'lipstick', nameAr: 'أحمر شفاه', emoji: '💄', lifespan: 180 },
  { key: 'mascara', nameAr: 'ماسكارا', emoji: '👁️', lifespan: 90 },
];

export const restockReminderRouter = router({
  categories: customerProcedure.query(() => CATEGORIES),
  myItems: customerProcedure.query(() => {
    const now = new Date();
    return items.map((i) => {
      const purchasedDate = new Date(i.purchaseDate);
      const daysSince = Math.floor((now.getTime() - purchasedDate.getTime()) / 86400000);
      const daysLeft = Math.max(0, i.lifespanDays - daysSince);
      const needsRestock = daysLeft <= i.notifyDays;
      return { ...i, daysSince, daysLeft, needsRestock };
    });
  }),
  add: customerProcedure
    .input(z.object({ productName: z.string().min(1), category: z.string(), lifespanDays: z.number().optional(), notifyDays: z.number().default(7) }))
    .mutation(async ({ input }) => {
      const cat = CATEGORIES.find((c) => c.key === input.category);
      const item: RestockItem = {
        id: itemId++, productName: input.productName, category: input.category,
        purchaseDate: new Date().toISOString(), lifespanDays: input.lifespanDays ?? cat?.lifespan ?? 60,
        notifyDays: input.notifyDays, emoji: cat?.emoji ?? '📦',
      };
      items.push(item);
      return item;
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const idx = items.findIndex((i) => i.id === input.id);
    if (idx >= 0) items.splice(idx, 1);
    return { success: true };
  }),
});
