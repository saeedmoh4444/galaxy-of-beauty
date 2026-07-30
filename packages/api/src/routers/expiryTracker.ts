import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

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
  myItems: customerProcedure.query(async ({ ctx }) => {
    const items = await prisma.expiryTrackerItem.findMany({ where: { userId: ctx.user.id } });
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
    .mutation(async ({ ctx, input }) => {
      const cat = CATEGORIES.find((c) => c.key === input.category);
      return prisma.expiryTrackerItem.create({ data: { userId: ctx.user.id, productName: input.productName, category: input.category, expiryMonths: cat?.months ?? 12, emoji: cat?.emoji ?? '📦' } });
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.expiryTrackerItem.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
