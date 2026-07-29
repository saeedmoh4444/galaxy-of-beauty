import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const alertStore = new Map<number, Array<{ id: number; categories: string[]; maxDiscount: number; active: boolean; createdAt: string }>>();
let alertId = 1;

const CATEGORIES = [
  { key: 'makeup', nameAr: 'مكياج', emoji: '💄' },
  { key: 'hair', nameAr: 'شعر', emoji: '💇‍♀️' },
  { key: 'skincare', nameAr: 'بشرة', emoji: '✨' },
  { key: 'nails', nameAr: 'أظافر', emoji: '💅' },
  { key: 'massage', nameAr: 'مساج', emoji: '💆‍♀️' },
  { key: 'all', nameAr: 'الكل', emoji: '🎯' },
];

// Simulated active deals
const ACTIVE_DEALS = [
  { id: 1, titleAr: 'خصم ٤٠٪ على المكياج', category: 'makeup', discount: 40, endsIn: 'ساعتين', emoji: '💄' },
  { id: 2, titleAr: 'خصم ٣٠٪ على العناية بالبشرة', category: 'skincare', discount: 30, endsIn: '٤ ساعات', emoji: '✨' },
  { id: 3, titleAr: 'خصم ٢٥٪ على الشعر', category: 'hair', discount: 25, endsIn: '٦ ساعات', emoji: '💇‍♀️' },
];

export const saleAlertsRouter = router({
  categories: customerProcedure.query(() => CATEGORIES),
  myAlerts: customerProcedure.query(async ({ ctx }) => alertStore.get(ctx.user.id) ?? []),
  create: customerProcedure
    .input(z.object({ categories: z.array(z.string()).min(1), maxDiscount: z.number().min(10).max(80).default(30) }))
    .mutation(async ({ ctx, input }) => {
      const alert = { id: alertId++, categories: input.categories, maxDiscount: input.maxDiscount, active: true, createdAt: new Date().toISOString() };
      if (!alertStore.has(ctx.user.id)) alertStore.set(ctx.user.id, []);
      alertStore.get(ctx.user.id)!.push(alert);
      return alert;
    }),
  toggle: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const alerts = alertStore.get(ctx.user.id) ?? [];
    const a = alerts.find((x) => x.id === input.id);
    if (a) a.active = !a.active;
    return { success: true };
  }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const alerts = alertStore.get(ctx.user.id) ?? [];
    alertStore.set(ctx.user.id, alerts.filter((a) => a.id !== input.id));
    return { success: true };
  }),
  activeDeals: customerProcedure.query(() => ACTIVE_DEALS),
});
