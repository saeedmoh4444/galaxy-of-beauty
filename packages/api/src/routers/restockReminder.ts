import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

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
  myItems: customerProcedure.query(async ({ ctx }) => {
    const items = await prisma.restockReminderItem.findMany({ where: { userId: ctx.user.id } });
    const now = new Date();
    return items.map((i) => {
      const purchasedDate = new Date(i.purchaseDate);
      const daysSince = Math.floor((now.getTime() - purchasedDate.getTime()) / 86400000);
      const daysLeft = Math.max(0, i.lifespanDays - daysSince);
      return { ...i, daysSince, daysLeft, needsRestock: daysLeft <= i.notifyDays };
    });
  }),
  add: customerProcedure
    .input(
      z.object({
        productName: z.string().min(1),
        category: z.string(),
        lifespanDays: z.number().optional(),
        notifyDays: z.number().default(7),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cat = CATEGORIES.find((c) => c.key === input.category);
      return prisma.restockReminderItem.create({
        data: {
          userId: ctx.user.id,
          productName: input.productName,
          category: input.category,
          lifespanDays: input.lifespanDays ?? cat?.lifespan ?? 60,
          notifyDays: input.notifyDays,
          emoji: cat?.emoji ?? '📦',
        },
      });
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    await prisma.restockReminderItem.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
    return { success: true };
  }),
});
