import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const TIERS = [
  {
    key: 'silver',
    nameAr: 'فضية',
    emoji: '',
    price: 0,
    benefits: ['خصم ٥٪ على الخدمات', 'هدية عيد ميلاد', 'نقاط ولاء ١x'],
    color: 'from-gray-300 to-gray-400',
  },
  {
    key: 'gold',
    nameAr: 'ذهبية',
    emoji: '',
    price: 199,
    benefits: [
      'خصم ١٥٪ على الخدمات',
      'أولوية الحجز',
      'استشارة شهرية مجانية',
      'هدية عيد ميلاد',
      'نقاط ولاء ٢x',
    ],
    color: 'from-yellow-400 to-amber-500',
  },
  {
    key: 'platinum',
    nameAr: 'بلاتينية',
    emoji: '',
    price: 499,
    benefits: [
      'خصم ٢٥٪ على الخدمات',
      'حجز VIP فوري',
      'استشارة أسبوعية',
      'جلسة مجانية شهرياً',
      'استشاري تجميل شخصي',
      'نقاط ولاء ٣x',
      'دخول حصري للفعاليات',
    ],
    color: 'from-purple-400 to-indigo-500',
  },
];

export const vipMembershipRouter = router({
  tiers: customerProcedure.query(() => TIERS),

  myTier: customerProcedure.query(async ({ ctx }) => {
    const m = await db.vipMembership.findUnique({ where: { userId: ctx.user.id } });
    return {
      currentTier: m?.tier || 'silver',
      expiresAt: m?.expiresAt || null,
      autoRenew: m?.autoRenew || false,
    };
  }),

  upgrade: customerProcedure
    .input(z.object({ tier: z.enum(['silver', 'gold', 'platinum']) }))
    .mutation(async ({ ctx, input }) => {
      await db.vipMembership.upsert({
        where: { userId: ctx.user.id },
        update: { tier: input.tier, autoRenew: true },
        create: { userId: ctx.user.id, tier: input.tier },
      });
      return { status: 'UPGRADED', message: 'تمت الترقية بنجاح', tier: input.tier };
    }),
});
