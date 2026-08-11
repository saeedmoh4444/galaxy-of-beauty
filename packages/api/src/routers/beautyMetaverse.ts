import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const SALONS = [
  { id: 1, name: 'صالون نورة', technician: 'نورة العمري', emoji: '💄', visitors: 450, rating: 4.9 },
  {
    id: 2,
    name: 'استوديو سارة',
    technician: 'سارة الحربي',
    emoji: '💇‍♀️',
    visitors: 320,
    rating: 4.8,
  },
  {
    id: 3,
    name: 'عيادة د. ليلى',
    technician: 'د. ليلى القحطاني',
    emoji: '✨',
    visitors: 280,
    rating: 4.9,
  },
];

const AVATARS = [
  { id: 'skin1', name: 'بشرة فاتحة', emoji: '🏻' },
  { id: 'skin2', name: 'بشرة متوسطة', emoji: '🏽' },
  { id: 'skin3', name: 'بشرة غامقة', emoji: '🏿' },
];

export const beautyMetaverseRouter = router({
  salons: publicProcedure.query(() => SALONS),
  avatars: customerProcedure.query(() => AVATARS),
  enter: customerProcedure
    .input(z.object({ salonId: z.number(), avatar: z.string() }))
    .mutation(async ({ input }) => {
      const salon = SALONS.find((s) => s.id === input.salonId);
      return {
        sessionId: `META-${Date.now()}`,
        salon: salon?.name,
        avatar: input.avatar,
        welcomeMessage: `أهلاً بكِ في ${salon?.name}! ${salon?.technician} في انتظاركِ ✨`,
        availableActions: ['تجربة مكياج', 'استشارة', 'جولة في الصالون', 'حجز موعد'],
      };
    }),
});
