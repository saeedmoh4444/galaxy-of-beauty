import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

const DEFAULT_FAQS = [
  { q: 'كيف أختار كريم الأساس المناسب؟', a: 'اختاري درجة أقرب للون رقبتكِ وليس وجهكِ. جربيها على خط الفك في إضاءة طبيعية.', category: 'makeup' },
  { q: 'كم مرة أسوي تنظيف بشرة؟', a: 'مرة كل ٤-٦ أسابيع حسب نوع بشرتكِ. البشرة الدهنية تحتاج جلسات أكثر.', category: 'skincare' },
  { q: 'هل واقي الشمس ضروري في الشتاء؟', a: 'نعم! الأشعة فوق البنفسجية تخترق الغيوم. استخدمي SPF30+ يومياً.', category: 'skincare' },
  { q: 'كيف أحافظ على لون الصبغة؟', a: 'استخدمي شامبو خالي من الكبريتات، اغسلي شعركِ بماء بارد، وتجنبي الشمس المباشرة.', category: 'hair' },
  { q: 'متى أغير الماسكارا؟', a: 'كل ٣-٦ أشهر. إذا تغيرت رائحتها أو جفت، تخلصي منها فوراً.', category: 'makeup' },
  { q: 'هل المانيكير يضعف الأظافر؟', a: 'المانيكير المنتظم مع الترطيب يقوي الأظافر. تجنبي إزالة الجل بالقوة.', category: 'nails' },
  { q: 'ما الفرق بين المساج السويدي والتايلندي؟', a: 'السويدي لطيف للاسترخاء، التايلندي أعمق ويستخدم الضغط والتمدد.', category: 'massage' },
];

export const beautyFaqRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string().optional(), category: z.string().optional() }))
    .query(async ({ input }) => {
      const where: any = {};
      if (input.category) where.category = input.category;
      let results = await prisma.beautyFaq.findMany({ where, orderBy: { sortOrder: 'asc' } });
      if (results.length === 0) results = DEFAULT_FAQS.map(f => ({ ...f, id: 0, sortOrder: 0, createdAt: new Date() }));
      if (input.query) results = results.filter((f: any) => f.question?.includes(input.query!) || f.answer?.includes(input.query!));
      return results;
    }),

  create: adminProcedure
    .input(z.object({ question: z.string(), answer: z.string(), category: z.string().default('general') }))
    .mutation(async ({ input }) =>
      prisma.beautyFaq.create({ data: { question: input.question, answer: input.answer, category: input.category } })
    ),
});
