import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const EPISODES = [
  {
    id: 1,
    titleAr: 'أسرار العناية بالبشرة مع د. ليلى',
    titleEn: 'Skincare Secrets with Dr. Layla',
    host: 'د. ليلى القحطاني',
    duration: '٣٢ دقيقة',
    category: 'skincare',
    audioUrl: '',
    description: 'نقاش معمق عن روتين العناية اليومي وأهمية واقي الشمس',
  },
  {
    id: 2,
    titleAr: 'تطور المكياج السعودي',
    titleEn: 'Evolution of Saudi Makeup',
    host: 'نورة العمري',
    duration: '٢٥ دقيقة',
    category: 'makeup',
    audioUrl: '',
    description: 'رحلة المكياج في المملكة من التقليدي للعصري',
  },
  {
    id: 3,
    titleAr: 'العناية بالشعر في الصيف',
    titleEn: 'Summer Hair Care',
    host: 'سارة الحربي',
    duration: '١٨ دقيقة',
    category: 'hair',
    audioUrl: '',
    description: 'نصائح لحماية الشعر من حرارة الصيف والرطوبة',
  },
  {
    id: 4,
    titleAr: 'جمال طبيعي بدون مواد كيميائية',
    titleEn: 'Natural Beauty Without Chemicals',
    host: 'مريم الشمري',
    duration: '٢٨ دقيقة',
    category: 'natural',
    audioUrl: '',
    description: 'بدائل طبيعية للعناية بالبشرة والشعر',
  },
  {
    id: 5,
    titleAr: 'تحضير العروس قبل الزفاف',
    titleEn: 'Bridal Preparation',
    host: 'نورة العمري',
    duration: '٣٥ دقيقة',
    category: 'bridal',
    audioUrl: '',
    description: 'خطة متكاملة للعناية بالعروس قبل شهر من الزفاف',
  },
];

export const beautyPodcastRouter = router({
  episodes: publicProcedure.query(() => EPISODES),
  get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const ep = EPISODES.find((e) => e.id === input.id);
    if (!ep) throw new Error('الحلقة غير موجودة');
    return ep;
  }),
});
