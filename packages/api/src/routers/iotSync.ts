import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const DEVICES: Array<{
  key: string;
  nameAr: string;
  emoji: string;
  status: string;
  lastSync: string | null;
  features: string[];
}> = [
  {
    key: 'smart_mirror',
    nameAr: 'مرآة ذكية',
    emoji: '🪞',
    status: 'disconnected',
    lastSync: null,
    features: ['تحليل البشرة', 'تجربة مكياج افتراضي', 'تتبع الروتين'],
  },
  {
    key: 'skin_scanner',
    nameAr: 'ماسح بشرة',
    emoji: '',
    status: 'disconnected',
    lastSync: null,
    features: ['قياس الترطيب', 'تحليل المسام', 'تقييم التجاعيد'],
  },
  {
    key: 'led_mask',
    nameAr: 'قناع LED',
    emoji: '',
    status: 'disconnected',
    lastSync: null,
    features: ['علاج ضوء أزرق', 'علاج ضوء أحمر', 'جلسات مجدولة'],
  },
];

export const iotSyncRouter = router({
  devices: customerProcedure.query(() => DEVICES),
  connect: customerProcedure
    .input(z.object({ deviceKey: z.string() }))
    .mutation(async ({ input }) => {
      const device = DEVICES.find((d) => d.key === input.deviceKey);
      if (device) {
        device.status = 'connected';
        device.lastSync = new Date().toISOString();
      }
      return { connected: true, device: input.deviceKey };
    }),
  syncData: customerProcedure
    .input(
      z.object({ deviceKey: z.string(), metrics: z.record(z.string(), z.number()).optional() }),
    )
    .mutation(async ({ input }) => ({
      synced: true,
      deviceKey: input.deviceKey,
      metrics: input.metrics ?? { hydration: 72, elasticity: 65, poreSize: 45 },
      timestamp: new Date().toISOString(),
      insights: 'بشرتكِ بحالة جيدة! نسبة الترطيب ٧٢٪ — استمري على روتينكِ الحالي ',
    })),
});
