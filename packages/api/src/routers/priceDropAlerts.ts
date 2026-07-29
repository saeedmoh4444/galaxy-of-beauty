import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

export interface PriceDropAlert { id: number; serviceName: string; targetPrice: number; currentPrice: number; emoji: string; active: boolean; createdAt: string; }
type PriceAlert = PriceDropAlert;
const alerts: PriceAlert[] = []; let alertId = 1;

const TRACKED_SERVICES = [
  { id: 1, nameAr: 'مكياج احترافي', price: 300, prevPrice: 350, emoji: '💄', dropped: true },
  { id: 2, nameAr: 'تنظيف بشرة', price: 200, prevPrice: 220, emoji: '✨', dropped: true },
  { id: 3, nameAr: 'مساج استرخائي', price: 250, prevPrice: 250, emoji: '💆‍♀️', dropped: false },
];

export const priceDropAlertsRouter = router({
  tracked: customerProcedure.query(() => TRACKED_SERVICES),
  myAlerts: customerProcedure.query(() => alerts),
  create: customerProcedure
    .input(z.object({ serviceName: z.string().min(1), targetPrice: z.number().min(1), currentPrice: z.number(), emoji: z.string().default('💅') }))
    .mutation(async ({ input }) => {
      const a: PriceAlert = { id: alertId++, serviceName: input.serviceName, targetPrice: input.targetPrice, currentPrice: input.currentPrice, emoji: input.emoji, active: true, createdAt: new Date().toISOString() };
      alerts.push(a);
      return a;
    }),
  delete: customerProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const idx = alerts.findIndex((a) => a.id === input.id); if (idx >= 0) alerts.splice(idx, 1); return { success: true }; }),
});
