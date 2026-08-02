import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, publicProcedure, router } from '../trpc';

const QUESTIONS = [
  { id: 'age', q: 'ما هي فئتكِ العمرية؟', opts: [
    { k: 'under18', l: 'أقل من ١٨ سنة 👧', tags: ['teen', 'student', 'first_beauty', 'kids'] },
    { k: '18_25', l: '١٨-٢٥ سنة 👩', tags: ['student', 'young', 'working_woman', 'university'] },
    { k: '26_35', l: '٢٦-٣٥ سنة 👩‍💼', tags: ['bridal', 'working_woman', 'pregnancy', 'entrepreneur', 'career'] },
    { k: '36_50', l: '٣٦-٥٠ سنة 👩‍💻', tags: ['mommy', 'career', 'postpartum', 'luxury', 'mature'] },
    { k: 'over50', l: 'أكثر من ٥٠ سنة 👵', tags: ['grandmother', 'mature_skin', 'menopause', 'retirement', 'luxury'] },
  ]},
  { id: 'stage', q: 'ما هي مرحلة حياتكِ؟', opts: [
    { k: 'student', l: 'طالبة 📚', tags: ['student', 'teen', 'first_beauty', 'budget'] },
    { k: 'working', l: 'موظفة 💼', tags: ['working_woman', 'express', 'career', 'entrepreneur'] },
    { k: 'newlywed', l: 'عروس جديدة 👰', tags: ['bridal', 'new_bride', 'romantic', 'beauty'] },
    { k: 'mom', l: 'أم 👩‍👧', tags: ['mommy', 'pregnancy', 'postpartum', 'breastfeeding', 'kids'] },
    { k: 'homemaker', l: 'ربة منزل 🏠', tags: ['homemaker', 'natural', 'budget', 'wellness'] },
    { k: 'retired', l: 'متقاعدة 🌺', tags: ['retirement', 'grandmother', 'luxury', 'travel'] },
  ]},
  { id: 'style', q: 'ما هو أسلوبكِ في الجمال؟', opts: [
    { k: 'natural', l: 'طبيعي وبسيط 🌿', tags: ['natural', 'minimal', 'eco', 'organic'] },
    { k: 'classic', l: 'كلاسيكي وأنيق 👗', tags: ['classic', 'elegant', 'luxury', 'bridal'] },
    { k: 'trendy', l: 'عصري ومتجدد 📱', tags: ['trendy', 'kbeauty', 'influencer', 'fashion'] },
    { k: 'bold', l: 'جريء ومميز 🎨', tags: ['bold', 'creative', 'artist', 'gamer'] },
    { k: 'traditional', l: 'تقليدي وأصيل 🧕', tags: ['traditional', 'hijab', 'bedouin', 'henna'] },
  ]},
];

const CATEGORY_MAP: Record<string, string[]> = {
  teen: ['teen_beauty', 'first_beauty', 'student_beauty'],
  student: ['student_beauty', 'first_beauty', 'teen_beauty'],
  working_woman: ['working_woman', 'entrepreneur_beauty', 'tech_woman'],
  bridal: ['bridal_prep', 'mother_of_bride', 'new_bride', 'henna', 'bridal_party'],
  pregnancy: ['pregnancy_safe', 'baby_shower', 'fertility_wellness', 'breastfeeding_safe'],
  postpartum: ['postpartum', 'mommy_makeover', 'breastfeeding_safe', 'single_mother'],
  mommy: ['mommy_makeover', 'homemaker_beauty', 'single_mother', 'twins_mom'],
  grandmother: ['grandmother_beauty', 'mature_skin', 'grandmother_bride', 'retirement_beauty'],
  luxury: ['luxury_spa', 'entrepreneur_beauty', 'designer_beauty', 'event_host_beauty'],
  natural: ['natural_beauty', 'eco_beauty', 'gardener_beauty', 'florist_beauty'],
  traditional: ['henna', 'hijab_care', 'nomad_beauty', 'ramadan_beauty', 'eid_prep'],
};

export const serviceRecommenderRouter = router({
  questions: publicProcedure.query(() => QUESTIONS),
  recommend: publicProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .query(async ({ input }) => {
      const userTags: string[] = [];
      for (const [qId, optKey] of Object.entries(input.answers)) {
        const q = QUESTIONS.find((x) => x.id === qId);
        const opt = q?.opts.find((o) => o.k === optKey);
        if (opt) userTags.push(...opt.tags);
      }

      const categoryScores: Array<{ key: string; score: number; nameAr: string; emoji: string }> = [];
      for (const [tagKey, cats] of Object.entries(CATEGORY_MAP)) {
        if (userTags.includes(tagKey)) {
          cats.forEach((catKey) => {
            const existing = categoryScores.find((c) => c.key === catKey);
            if (existing) existing.score += 1;
            else {
              const names: Record<string, { ar: string; em: string }> = {
                teen_beauty: { ar: 'تجميل المراهقات', em: '👧' },
                first_beauty: { ar: 'أول مرة', em: '🦋' },
                student_beauty: { ar: 'عناية الطالبات', em: '📚' },
                working_woman: { ar: 'المرأة العاملة', em: '💼' },
                entrepreneur_beauty: { ar: 'رائدات الأعمال', em: '💼' },
                tech_woman: { ar: 'التقنيات', em: '💻' },
                bridal_prep: { ar: 'تحضير العروس', em: '👰‍♀️' },
                mother_of_bride: { ar: 'أم العروس', em: '👩‍👧' },
                new_bride: { ar: 'العروس الجديدة', em: '💝' },
                henna: { ar: 'فن الحناء', em: '🌿' },
                bridal_party: { ar: 'وصيفات العروس', em: '👯‍♀️' },
                pregnancy_safe: { ar: 'عناية الحامل', em: '🤰' },
                baby_shower: { ar: 'بيبي شاور', em: '🎀' },
                fertility_wellness: { ar: 'عناية الخصوبة', em: '🌱' },
                breastfeeding_safe: { ar: 'عناية المرضعة', em: '🍼' },
                postpartum: { ar: 'ما بعد الولادة', em: '🤱' },
                mommy_makeover: { ar: 'تجديد الأمومة', em: '👩‍👧' },
                homemaker_beauty: { ar: 'ربات البيوت', em: '🏠' },
                single_mother: { ar: 'الأم العزباء', em: '💪' },
                twins_mom: { ar: 'أم التوائم', em: '👯' },
                grandmother_beauty: { ar: 'عناية الجدات', em: '👵' },
                mature_skin: { ar: 'البشرة الناضجة', em: '✨' },
                grandmother_bride: { ar: 'الجدة العروس', em: '💍' },
                retirement_beauty: { ar: 'المتقاعدات', em: '🏖️' },
                luxury_spa: { ar: 'يوم سبا فاخر', em: '👑' },
                designer_beauty: { ar: 'المصممات', em: '👗' },
                event_host_beauty: { ar: 'مقدمات الحفلات', em: '🎤' },
                natural_beauty: { ar: 'الجمال الطبيعي', em: '🌿' },
                eco_beauty: { ar: 'الجمال المستدام', em: '🌍' },
                gardener_beauty: { ar: 'البستانيات', em: '🌻' },
                florist_beauty: { ar: 'بائعات الزهور', em: '💐' },
                hijab_care: { ar: 'عناية المحجبة', em: '🧕' },
                nomad_beauty: { ar: 'جمال البدويات', em: '🐪' },
                ramadan_beauty: { ar: 'عناية رمضان', em: '🌙' },
                eid_prep: { ar: 'تحضير العيد', em: '🎊' },
              };
              const n = names[catKey] ?? { ar: catKey, em: '💄' };
              categoryScores.push({ key: catKey, score: 1, nameAr: n.ar, emoji: n.em });
            }
          });
        }
      }

      return categoryScores.sort((a: any, b: any) => b.score - a.score).slice(0, 8).map((c: any) => ({ ...c, matchPct: Math.min(100, Math.round((c.score / 3) * 100)) }));
    }),

  save: customerProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const scores: Record<string, number> = {};
      for (const [qId, optKey] of Object.entries(input.answers)) {
        const q = QUESTIONS.find((x: any) => x.id === qId);
        const opt: any = q?.opts.find((o: any) => o.k === optKey);
        if (opt?.tags) opt.tags.forEach((t: string) => { scores[t] = (scores[t] || 0) + 1; });
      }
      const result = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([cat]) => cat);
      return prisma.serviceRecommendation.create({ data: { userId: ctx.user.id, answers: input.answers, result } });
    }),

  myResults: customerProcedure.query(({ ctx }) =>
    prisma.serviceRecommendation.findMany({ where: { userId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: DEFAULT_PAGE_SIZE })
  ),
});
