import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const CATEGORIES = [
  { key: 'makeup', nameAr: 'مكياج', emoji: '💄' }, { key: 'hair', nameAr: 'شعر', emoji: '💇‍♀️' }, { key: 'skincare', nameAr: 'بشرة', emoji: '✨' }, { key: 'nails', nameAr: 'أظافر', emoji: '💅' }, { key: 'massage', nameAr: 'مساج', emoji: '💆‍♀️' }, { key: 'all', nameAr: 'الكل', emoji: '🎯' },
];

const ACTIVE_DEALS = [
  { id: 1, titleAr: 'خصم ٤٠٪ على المكياج', category: 'makeup', discount: 40, endsIn: 'ساعتين', emoji: '💄' },
  { id: 2, titleAr: 'خصم ٣٠٪ على العناية بالبشرة', category: 'skincare', discount: 30, endsIn: '٤ ساعات', emoji: '✨' },
  { id: 3, titleAr: 'خصم ٢٥٪ على الشعر', category: 'hair', discount: 25, endsIn: '٦ ساعات', emoji: '💇‍♀️' },
];

export const saleAlertsRouter = router({
  categories: customerProcedure.query(() => CATEGORIES),

  myAlerts: customerProcedure.query(({ ctx }) =>
    prisma.saleAlert.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } })
  ),

  create: customerProcedure
    .input(z.object({ categories: z.array(z.string()).min(1), maxDiscount: z.number().min(10).max(80).default(30) }))
    .mutation(async ({ ctx, input }) =>
      prisma.saleAlert.create({ data: { userId: ctx.user.id, categories: input.categories, maxDiscount: input.maxDiscount } })
    ),

  toggle: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const alert = await prisma.saleAlert.findUnique({ where: { id: input.id } });
      if (alert && alert.userId === ctx.user.id) {
        await prisma.saleAlert.update({ where: { id: input.id }, data: { active: !alert.active } });
      }
      return { success: true };
    }),

  delete: customerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.saleAlert.deleteMany({ where: { id: input.id, userId: ctx.user.id } });
      return { success: true };
    }),

  activeDeals: customerProcedure.query(() => ACTIVE_DEALS),
});
