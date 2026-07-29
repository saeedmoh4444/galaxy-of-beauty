import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

const QUESTIONS = [
  { id: 'occasion', questionAr: 'ما هي المناسبة؟', questionEn: 'What is the occasion?', options: [
    { key: 'birthday', labelAr: 'عيد ميلاد 🎂', labelEn: 'Birthday', tags: ['احتفالي', 'شخصي'] },
    { key: 'wedding', labelAr: 'زفاف 👰', labelEn: 'Wedding', tags: ['راقي', 'فخم'] },
    { key: 'graduation', labelAr: 'تخرج 🎓', labelEn: 'Graduation', tags: ['شبابي', 'عصري'] },
    { key: 'thankyou', labelAr: 'شكر وامتنان 💐', labelEn: 'Thank You', tags: ['لطيف', 'راقي'] },
    { key: 'baby', labelAr: 'بيبي شاور 👶', labelEn: 'Baby Shower', tags: ['لطيف', 'عناية'] },
    { key: 'justbecause', labelAr: 'بدون مناسبة 🎁', labelEn: 'Just Because', tags: ['متنوع', 'شخصي'] },
  ]},
  { id: 'recipient', questionAr: 'لمن الهدية؟', questionEn: 'Who is the gift for?', options: [
    { key: 'friend', labelAr: 'صديقة 👯‍♀️', labelEn: 'Friend', tags: ['عصري', 'مرح'] },
    { key: 'mom', labelAr: 'أمي 👩‍👧', labelEn: 'Mom', tags: ['فخم', 'عناية'] },
    { key: 'sister', labelAr: 'أختي 👭', labelEn: 'Sister', tags: ['شبابي', 'شخصي'] },
    { key: 'wife', labelAr: 'زوجتي 💑', labelEn: 'Wife', tags: ['رومانسي', 'فخم'] },
    { key: 'self', labelAr: 'نفسي 💝', labelEn: 'Myself', tags: ['شخصي', 'متنوع'] },
  ]},
  { id: 'budget', questionAr: 'ما هي ميزانيتك؟', questionEn: 'What is your budget?', options: [
    { key: 'low', labelAr: 'اقتصادية (حتى ٢٠٠ ر.س) 💰', labelEn: 'Budget (up to 200 SAR)', tags: ['اقتصادي'] },
    { key: 'mid', labelAr: 'متوسطة (٢٠٠-٥٠٠ ر.س) 💵', labelEn: 'Mid (200-500 SAR)', tags: ['متوسط'] },
    { key: 'high', labelAr: 'فاخرة (٥٠٠+ ر.س) 💎', labelEn: 'Premium (500+ SAR)', tags: ['فاخر'] },
  ]},
  { id: 'interest', questionAr: 'ما أكثر ما تهتم به؟', questionEn: 'What interests them most?', options: [
    { key: 'skincare', labelAr: 'العناية بالبشرة ✨', labelEn: 'Skincare', tags: ['عناية', 'بشرة'] },
    { key: 'makeup', labelAr: 'المكياج 💄', labelEn: 'Makeup', tags: ['مكياج', 'عصري'] },
    { key: 'hair', labelAr: 'العناية بالشعر 💇‍♀️', labelEn: 'Hair Care', tags: ['شعر', 'عناية'] },
    { key: 'fragrance', labelAr: 'العطور 🌸', labelEn: 'Fragrance', tags: ['عطور', 'فاخر'] },
    { key: 'wellness', labelAr: 'الاسترخاء والعناية 🧘', labelEn: 'Wellness & Relaxation', tags: ['استرخاء', 'صحة'] },
  ]},
];

const RECOMMENDATIONS = [
  { id: 1, nameAr: 'باقة عناية بالبشرة فاخرة', nameEn: 'Premium Skincare Set', descAr: 'مجموعة متكاملة من كريم وسيروم وتونر', price: 450, category: 'skincare', emoji: '✨', tags: ['فاخر', 'عناية', 'بشرة'] },
  { id: 2, nameAr: 'علبة مكياج احترافية', nameEn: 'Pro Makeup Kit', descAr: '١٨ لون ظلال عيون + ٦ ألوان أحمر شفاه', price: 320, category: 'makeup', emoji: '💄', tags: ['مكياج', 'عصري', 'شبابي'] },
  { id: 3, nameAr: 'جلسة مساج استرخائية', nameEn: 'Relaxation Massage', descAr: 'جلسة مساج ٦٠ دقيقة مع زيوت عطرية', price: 250, category: 'wellness', emoji: '💆‍♀️', tags: ['استرخاء', 'صحة'] },
  { id: 4, nameAr: 'مجموعة العطور العربية', nameEn: 'Arabic Perfume Set', descAr: '٣ عطور شرقية فاخرة مع بخور', price: 580, category: 'fragrance', emoji: '🌸', tags: ['فاخر', 'عطور', 'راقي'] },
  { id: 5, nameAr: 'صندوق تجميل شهري', nameEn: 'Monthly Beauty Box', descAr: 'اشتراك ٣ أشهر — منتجات تجميل متنوعة', price: 180, category: 'subscription', emoji: '📦', tags: ['متنوع', 'اقتصادي'] },
  { id: 6, nameAr: 'بطاقة هدية جالكسي بيوتي', nameEn: 'Galaxy Gift Card', descAr: 'قيمة ٣٠٠ ر.س — تختارين الخدمة اللي تحبينها', price: 300, category: 'giftcard', emoji: '🎁', tags: ['مرن', 'شخصي', 'متوسط'] },
  { id: 7, nameAr: 'روتين شعر كامل', nameEn: 'Complete Hair Routine', descAr: 'شامبو وبلسم وزيت وعلاج بروتين', price: 280, category: 'hair', emoji: '💇‍♀️', tags: ['شعر', 'عناية'] },
  { id: 8, nameAr: 'بوكيه ورد مع قسيمة تجميل', nameEn: 'Flowers + Beauty Voucher', descAr: 'باقة ورد طبيعي + قسيمة خدمة تجميل', price: 350, category: 'bundle', emoji: '💐', tags: ['رومانسي', 'راقي', 'فاخر'] },
];

export const giftQuizRouter = router({
  questions: publicProcedure.query(() => QUESTIONS),
  recommend: publicProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .query(async ({ input }) => {
      const allTags: string[] = [];
      for (const [questionId, optionKey] of Object.entries(input.answers)) {
        const question = QUESTIONS.find((q) => q.id === questionId);
        const option = question?.options.find((o) => o.key === optionKey);
        if (option) allTags.push(...option.tags);
      }

      const scored = RECOMMENDATIONS.map((rec) => {
        const matches = rec.tags.filter((t) => allTags.includes(t)).length;
        const score = Math.min(100, Math.round((matches / Math.max(1, allTags.length)) * 100));
        return { ...rec, score };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, 4);
    }),
});
