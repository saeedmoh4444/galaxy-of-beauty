import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const FAQS = [
  { q: 'كيف أختار كريم الأساس المناسب؟', a: 'اختاري درجة أقرب للون رقبتكِ وليس وجهكِ. جربيها على خط الفك في إضاءة طبيعية.', category: 'makeup' },
  { q: 'كم مرة أسوي تنظيف بشرة؟', a: 'مرة كل ٤-٦ أسابيع حسب نوع بشرتكِ. البشرة الدهنية تحتاج جلسات أكثر.', category: 'skincare' },
  { q: 'هل واقي الشمس ضروري في الشتاء؟', a: 'نعم! الأشعة فوق البنفسجية تخترق الغيوم. استخدمي SPF30+ يومياً.', category: 'skincare' },
  { q: 'كيف أحافظ على لون الصبغة؟', a: 'استخدمي شامبو خالي من الكبريتات، اغسلي شعركِ بماء بارد، وتجنبي الشمس المباشرة.', category: 'hair' },
  { q: 'متى أغير الماسكارا؟', a: 'كل ٣-٦ أشهر. إذا تغيرت رائحتها أو جفت، تخلصي منها فوراً.', category: 'makeup' },
  { q: 'هل المانيكير يضعف الأظافر؟', a: 'المانيكير المنتظم مع الترطيب يقوي الأظافر. تجنبي إزالة الجل بالقوة.', category: 'nails' },
  { q: 'كيف أجهز بشرتي للزفاف؟', a: 'ابدئي روتين عناية قبل ٦ أشهر: تنظيف، ترطيب، واقي شمس. أضيفي سيروم قبل ٣ أشهر.', category: 'bridal' },
  { q: 'ما الفرق بين المساج السويدي والتايلندي؟', a: 'السويدي لطيف للاسترخاء، التايلندي أعمق ويستخدم الضغط والتمدد.', category: 'massage' },
];

export const beautyFaqRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string().optional(), category: z.string().optional() }))
    .query(async ({ input }) => {
      let results = FAQS;
      if (input.category) results = results.filter((f) => f.category === input.category);
      if (input.query) {
        const q = input.query.toLowerCase();
        results = results.filter((f) => f.q.includes(q) || f.a.includes(q));
      }
      return results;
    }),
  categories: publicProcedure.query(() => [
    { key: 'makeup', nameAr: 'مكياج', emoji: '💄' },
    { key: 'skincare', nameAr: 'عناية', emoji: '✨' },
    { key: 'hair', nameAr: 'شعر', emoji: '💇‍♀️' },
    { key: 'nails', nameAr: 'أظافر', emoji: '💅' },
    { key: 'massage', nameAr: 'مساج', emoji: '💆‍♀️' },
    { key: 'bridal', nameAr: 'عرايس', emoji: '👰' },
  ]),
});
