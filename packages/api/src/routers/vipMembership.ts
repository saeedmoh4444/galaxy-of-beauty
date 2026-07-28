import { customerProcedure, router } from '../trpc';

const TIERS = [
  { key: 'silver', nameAr: 'فضية', emoji: '🥈', price: 0, benefits: ['خصم ٥٪ على الخدمات', 'هدية عيد ميلاد', 'نقاط ولاء ١x'], color: 'from-gray-300 to-gray-400' },
  { key: 'gold', nameAr: 'ذهبية', emoji: '🥇', price: 199, benefits: ['خصم ١٥٪ على الخدمات', 'أولوية الحجز', 'استشارة شهرية مجانية', 'هدية عيد ميلاد', 'نقاط ولاء ٢x'], color: 'from-yellow-400 to-amber-500' },
  { key: 'platinum', nameAr: 'بلاتينية', emoji: '💎', price: 499, benefits: ['خصم ٢٥٪ على الخدمات', 'حجز VIP فوري', 'استشارة أسبوعية', 'جلسة مجانية شهرياً', 'استشاري تجميل شخصي', 'نقاط ولاء ٣x', 'دخول حصري للفعاليات'], color: 'from-purple-400 to-indigo-500' },
];

export const vipMembershipRouter = router({
  tiers: customerProcedure.query(() => TIERS),
  myTier: customerProcedure.query(async () => ({
    currentTier: 'silver',
    expiresAt: null,
    autoRenew: false,
  })),
  upgrade: customerProcedure.mutation(async () => ({ status: 'UPGRADED', message: 'تمت الترقية بنجاح' })),
});
