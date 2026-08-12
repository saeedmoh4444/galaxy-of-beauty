import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const CHECKLISTS: Record<string, Array<{ emoji: string; textAr: string; textEn: string }>> = {
  makeup: [
    { emoji: '', textAr: 'صوري إطلالات للرجوع إليها', textEn: 'Bring reference photos' },
    { emoji: '', textAr: 'اغسلي وجهكِ قبل الموعد', textEn: 'Wash face before appointment' },
    { emoji: '', textAr: 'لا تضعي مكياج قبل الحضور', textEn: 'Arrive without makeup' },
    { emoji: '', textAr: 'احضري قبل ١٠ دقائق', textEn: 'Arrive 10 minutes early' },
  ],
  hair: [
    { emoji: '', textAr: 'صوري تسريحات تعجبكِ', textEn: 'Bring hairstyle reference photos' },
    {
      emoji: '',
      textAr: 'لا تستخدمي منتجات تصفيف ثقيلة',
      textEn: 'Avoid heavy styling products before',
    },
    { emoji: '‍️', textAr: 'اغسلي شعركِ قبل ٢٤ ساعة', textEn: 'Wash hair 24 hours before' },
  ],
  skincare: [
    { emoji: '', textAr: 'نظفي وجهكِ قبل الجلسة', textEn: 'Cleanse face before session' },
    { emoji: '️', textAr: 'تجنبي الشمس قبل ٤٨ ساعة', textEn: 'Avoid sun exposure 48h before' },
    {
      emoji: '',
      textAr: 'أحضري قائمة منتجاتكِ الحالية',
      textEn: 'Bring list of current products',
    },
  ],
  nails: [
    { emoji: '', textAr: 'لا تقصي أظافركِ قبل الموعد', textEn: "Don't trim nails before" },
    { emoji: '', textAr: 'تجنبي الماء الساخن قبل الموعد', textEn: 'Avoid hot water before' },
  ],
  massage: [
    { emoji: '', textAr: 'اشربي ماء قبل الجلسة', textEn: 'Hydrate before session' },
    { emoji: '', textAr: 'ارتدي ملابس مريحة', textEn: 'Wear comfortable clothing' },
  ],
};

export const bookingChecklistRouter = router({
  get: customerProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => ({
    category: input.category,
    items: CHECKLISTS[input.category] ?? CHECKLISTS['makeup']!,
  })),
  categories: customerProcedure.query(() => [
    { key: 'makeup', nameAr: 'مكياج', emoji: '' },
    { key: 'hair', nameAr: 'شعر', emoji: '‍️' },
    { key: 'skincare', nameAr: 'بشرة', emoji: '' },
    { key: 'nails', nameAr: 'أظافر', emoji: '' },
    { key: 'massage', nameAr: 'مساج', emoji: '‍️' },
  ]),
});
