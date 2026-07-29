import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const COMPARE_PRODUCTS = [
  { id: 1, nameAr: 'كريم ترطيب يومي', brand: 'Nivea', price: 89, rating: 4.5, category: 'skincare', emoji: '🧴', features: { hydration: 85, absorption: 80, value: 90, gentle: 75 }, ingredients: 12, crueltyFree: false, vegan: false },
  { id: 2, nameAr: 'مرطب طبيعي', brand: 'Organic Beauty', price: 120, rating: 4.8, category: 'skincare', emoji: '🌿', features: { hydration: 92, absorption: 88, value: 75, gentle: 95 }, ingredients: 6, crueltyFree: true, vegan: true },
  { id: 3, nameAr: 'سيروم فيتامين C', brand: 'The Ordinary', price: 145, rating: 4.9, category: 'skincare', emoji: '✨', features: { hydration: 70, absorption: 95, value: 85, gentle: 80 }, ingredients: 8, crueltyFree: true, vegan: true },
  { id: 4, nameAr: 'أحمر شفاه مطفي', brand: 'MAC', price: 110, rating: 4.3, category: 'makeup', emoji: '💄', features: { hydration: 60, absorption: 70, value: 65, gentle: 60 }, ingredients: 18, crueltyFree: false, vegan: false },
];

export const productCompareRouter = router({
  list: publicProcedure.query(() => COMPARE_PRODUCTS),
  compare: publicProcedure
    .input(z.object({ ids: z.array(z.number()).min(2).max(4) }))
    .query(async ({ input }) => ({
      products: COMPARE_PRODUCTS.filter((p) => input.ids.includes(p.id)),
      dimensions: ['hydration', 'absorption', 'value', 'gentle'],
    })),
});
