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
    emoji: '🔍',
    status: 'disconnected',
    lastSync: null,
    features: ['قياس الترطيب', 'تحليل المسام', 'تقييم التجاعيد'],
  },
  {
    key: 'led_mask',
    nameAr: 'قناع LED',
    emoji: '💡',
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
      // No IoT backend is wired — fail closed: never claim a device paired,
      // and never mutate shared device state for the whole process.
      return {
        connected: false,
        device: input.deviceKey,
        status: 'NOT_CONFIGURED',
        reason: 'DEVICE_NOT_SUPPORTED',
      };
    }),
  syncData: customerProcedure
    .input(
      z.object({ deviceKey: z.string(), metrics: z.record(z.string(), z.number()).optional() }),
    )
    .mutation(async ({ input }) => {
      // Skin health data is medical — never invent hydration/elasticity
      // numbers or wellness insights from nothing.
      return {
        synced: false,
        deviceKey: input.deviceKey,
        status: 'NOT_CONFIGURED',
        reason: 'NOT_CONFIGURED',
      };
    }),
});
