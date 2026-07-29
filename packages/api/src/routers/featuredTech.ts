import { publicProcedure, router } from '../trpc';

const FEATURED = {
  id: 1, name: 'نورة العمري', titleAr: 'خبيرة تجميل', titleEn: 'Beauty Expert', emoji: '💄',
  bio: 'نورة العمري خبيرة تجميل سعودية معتمدة بخبرة ١٢ سنة في المكياج الاحترافي. حاصلة على عدة جوائز في مسابقات التجميل الخليجية.',
  highlights: ['١٢ سنة خبرة', '+٥٠٠٠ حجز مكتمل', 'تقييم ٤.٩ ⭐', 'متخصصة في مكياج الأعراس'],
  services: ['مكياج عرايس', 'مكياج سهرة', 'مكياج طبيعي', 'دروس مكياج'],
  portfolio: ['s1', 's2', 's3'],
  interview: { q: 'ما سر المكياج المثالي؟', a: 'البشرة النظيفة والمرطبة هي الأساس. المكياج الجميل يبدأ بعناية!' },
  weekOf: new Date().toISOString().slice(0, 10),
};

const PAST_TECHS = [
  { id: 2, name: 'د. ليلى القحطاني', titleAr: 'طبيبة جلدية', emoji: '✨', weekOf: '2026-07-20' },
  { id: 3, name: 'سارة الحربي', titleAr: 'مصففة شعر', emoji: '💇‍♀️', weekOf: '2026-07-13' },
  { id: 4, name: 'هند المطيري', titleAr: 'أخصائية أظافر', emoji: '💅', weekOf: '2026-07-06' },
];

export const featuredTechRouter = router({
  current: publicProcedure.query(() => FEATURED),
  past: publicProcedure.query(() => PAST_TECHS),
});
