import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

const db = prisma;

const CHALLENGES = [
  {
    id: '7day_skincare',
    nameAr: 'تحدي ٧ أيام للعناية بالبشرة',
    nameEn: '7-Day Skincare Challenge',
    descAr: 'أكملي روتين العناية بالبشرة لمدة ٧ أيام متتالية',
    descEn: 'Complete your skincare routine for 7 consecutive days',
    target: 7,
    reward: 'خصم ١٥٪ على خدمات البشرة',
    rewardValue: 15,
  },
  {
    id: '5bookings',
    nameAr: 'تحدي ٥ حجوزات',
    nameEn: '5 Bookings Challenge',
    descAr: 'احجزي ٥ خدمات تجميل خلال ٣٠ يوم',
    descEn: 'Book 5 beauty services in 30 days',
    target: 5,
    reward: 'جلسة عناية مجانية',
    rewardValue: 0,
  },
  {
    id: 'first_review',
    nameAr: 'تحدي المراجعة الأولى',
    nameEn: 'First Review Challenge',
    descAr: 'اكتبي مراجعتكِ الأولى بعد الحجز',
    descEn: 'Write your first review after a booking',
    target: 1,
    reward: '٥٠ نقطة ولاء',
    rewardValue: 50,
  },
  {
    id: 'streak_4weeks',
    nameAr: 'تحدي ٤ أسابيع متواصلة',
    nameEn: '4-Week Streak',
    descAr: 'احجزي خدمة واحدة على الأقل كل أسبوع لمدة ٤ أسابيع',
    descEn: 'Book at least 1 service per week for 4 weeks',
    target: 4,
    reward: 'خصم ٢٥٪ على الحجز الخامس',
    rewardValue: 25,
  },
  {
    id: 'refer_3friends',
    nameAr: 'تحدي دعوة ٣ صديقات',
    nameEn: 'Refer 3 Friends',
    descAr: 'دعي ٣ صديقات يسجلن ويحجزن',
    descEn: 'Refer 3 friends who sign up and book',
    target: 3,
    reward: '١٠٠ ر.س رصيد في المحفظة',
    rewardValue: 100,
  },
];

export const challengesRouter = router({
  list: publicProcedure.query(async () => CHALLENGES),
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => CHALLENGES.find((c) => c.id === input.id) || null),
  myProgress: customerProcedure.query(async ({ ctx }) => {
    const bookingCount = await db.booking.count({ where: { customerId: ctx.user.id } });
    const reviewCount = await db.review.count({ where: { customerId: ctx.user.id } });
    return { bookingCount, reviewCount };
  }),
  join: customerProcedure
    .input(z.object({ challengeId: z.string() }))
    .mutation(async ({ ctx, input }) => ({
      challengeId: input.challengeId,
      userId: ctx.user.id,
      status: 'JOINED',
      startedAt: new Date().toISOString(),
    })),
});
