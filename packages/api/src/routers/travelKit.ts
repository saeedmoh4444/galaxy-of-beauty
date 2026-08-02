import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

const KITS: Record<string, Array<{ nameAr: string; emoji: string; essential: boolean; size: string }>> = {
  beach: [
    { nameAr: 'واقي شمس SPF50', emoji: '☀️', essential: true, size: 'حجم سفر ٥٠مل' },
    { nameAr: 'مرطب خفيف', emoji: '🧴', essential: true, size: 'حجم سفر ٣٠مل' },
    { nameAr: 'مزيل مكياج', emoji: '🧽', essential: true, size: 'مناديل' },
    { nameAr: 'بلسم شعر', emoji: '💆‍♀️', essential: false, size: 'حجم سفر ٥٠مل' },
    { nameAr: 'ماسكارا مقاومة للماء', emoji: '👁️', essential: false, size: 'حجم عادي' },
  ],
  business: [
    { nameAr: 'كريم أساس', emoji: '🎨', essential: true, size: 'حجم سفر ١٥مل' },
    { nameAr: 'أحمر شفاه', emoji: '💄', essential: true, size: 'حجم عادي' },
    { nameAr: 'مزيل عرق', emoji: '✨', essential: true, size: 'حجم سفر ٣٠مل' },
    { nameAr: 'عطر صغير', emoji: '🌸', essential: false, size: 'حجم سفر ١٠مل' },
  ],
  adventure: [
    { nameAr: 'واقي شمس مقاوم للماء', emoji: '☀️', essential: true, size: 'حجم سفر ٥٠مل' },
    { nameAr: 'مرطب شفاه SPF', emoji: '💋', essential: true, size: 'حجم عادي' },
    { nameAr: 'طارد حشرات طبيعي', emoji: '🦟', essential: true, size: 'حجم سفر ٣٠مل' },
    { nameAr: 'شامبو جاف', emoji: '🧴', essential: false, size: 'حجم سفر ٥٠مل' },
  ],
};

const DESTINATIONS = [
  { key: 'beach', nameAr: 'شاطئ 🏖️', tips: 'حماية من الشمس أولوية! واقي شمس ومرطب شفاه SPF أساسيان' },
  { key: 'business', nameAr: 'عمل 💼', tips: 'منتجات متعددة الاستخدام توفر مساحة' },
  { key: 'adventure', nameAr: 'مغامرة 🏔️', tips: 'منتجات مقاومة للماء ومتينة' },
];

export const travelKitRouter = router({
  destinations: customerProcedure.query(() => DESTINATIONS),
  build: customerProcedure
    .input(z.object({ destination: z.string(), days: z.number().min(1).max(30).default(7) }))
    .query(async ({ input }) => {
      const items = KITS[input.destination] ?? KITS['beach']!;
      const dest = DESTINATIONS.find((d) => d.key === input.destination);
      return { destination: input.destination, days: input.days, items, tip: dest?.tips ?? '' };
    }),

  save: customerProcedure
    .input(z.object({ destination: z.string(), days: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const items = KITS[input.destination] ?? KITS['beach']!;
      return prisma.travelKitItem.create({ data: { userId: ctx.user.id, destination: input.destination, days: input.days, items } });
    }),

  myKits: customerProcedure.query(({ ctx }) =>
    prisma.travelKitItem.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' } })
  ),
});
