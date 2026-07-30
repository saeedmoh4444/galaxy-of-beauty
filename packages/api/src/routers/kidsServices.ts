import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const KIDS_CATEGORIES = {
  baby: {
    nameAr: 'عناية الرضع (0-2)', nameEn: 'Baby Care (0-2)', emoji: '🍼',
    description: 'خدمات لطيفة وآمنة للرضع — منتجات طبيعية ١٠٠٪',
    subServices: [
      { id: 'bb1', nameAr: 'قص شعر أول مرة', nameEn: 'First Haircut', price: 80, durationMin: 15, ageMin: 0, emoji: '✂️' },
      { id: 'bb2', nameAr: 'تدليك رضيع', nameEn: 'Baby Massage', price: 120, durationMin: 25, ageMin: 1, emoji: '🤲' },
      { id: 'bb3', nameAr: 'عناية بالأظافر', nameEn: 'Baby Nail Care', price: 60, durationMin: 15, ageMin: 0, emoji: '💅' },
    ],
  },
  toddler: {
    nameAr: 'عناية الأطفال (3-6)', nameEn: 'Toddler Care (3-6)', emoji: '🧒',
    description: 'خدمات ممتعة وآمنة للأطفال الصغار',
    subServices: [
      { id: 'td1', nameAr: 'قص شعر أطفال', nameEn: 'Kids Haircut', price: 70, durationMin: 20, ageMin: 3, emoji: '💇' },
      { id: 'td2', nameAr: 'تسريحة شعر', nameEn: 'Kids Hairstyling', price: 100, durationMin: 25, ageMin: 3, emoji: '🎀' },
      { id: 'td3', nameAr: 'مانيكير أطفال', nameEn: 'Kids Manicure', price: 60, durationMin: 20, ageMin: 4, emoji: '💅' },
      { id: 'td4', nameAr: 'رسم على الوجه', nameEn: 'Face Painting', price: 50, durationMin: 15, ageMin: 3, emoji: '🎨' },
    ],
  },
  kids: {
    nameAr: 'عناية البنات (7-12)', nameEn: 'Girls Care (7-12)', emoji: '👧',
    description: 'أولى خطوات العناية بالجمال — تعليم ومرح',
    subServices: [
      { id: 'kd1', nameAr: 'قص وتصفيف شعر', nameEn: 'Haircut & Style', price: 90, durationMin: 30, ageMin: 7, emoji: '💇‍♀️' },
      { id: 'kd2', nameAr: 'عناية بالأظافر', nameEn: 'Manicure', price: 70, durationMin: 25, ageMin: 7, emoji: '💅' },
      { id: 'kd3', nameAr: 'جلسة تعليم عناية', nameEn: 'Beauty Lesson', price: 120, durationMin: 40, ageMin: 7, emoji: '📚' },
      { id: 'kd4', nameAr: 'تسريحة مناسبة', nameEn: 'Party Hairstyle', price: 110, durationMin: 30, ageMin: 7, emoji: '🎉' },
    ],
  },
  teens: {
    nameAr: 'عناية المراهقات (13-17)', nameEn: 'Teen Care (13-17)', emoji: '👩',
    description: 'خدمات عناية مناسبة للمراهقات — بشرة وشعر وأظافر',
    subServices: [
      { id: 'tn1', nameAr: 'عناية بالبشرة', nameEn: 'Teen Facial', price: 120, durationMin: 35, ageMin: 13, emoji: '✨' },
      { id: 'tn2', nameAr: 'مكياج خفيف', nameEn: 'Light Makeup', price: 130, durationMin: 35, ageMin: 14, emoji: '💄' },
      { id: 'tn3', nameAr: 'تصفيف شعر', nameEn: 'Hair Styling', price: 100, durationMin: 35, ageMin: 13, emoji: '💇‍♀️' },
      { id: 'tn4', nameAr: 'مانيكير', nameEn: 'Manicure', price: 80, durationMin: 25, ageMin: 13, emoji: '💅' },
      { id: 'tn5', nameAr: 'استشارة عناية', nameEn: 'Beauty Consultation', price: 80, durationMin: 25, ageMin: 13, emoji: '💬' },
    ],
  },
};

export const kidsServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(KIDS_CATEGORIES).map(([key, cat]) => ({
      key, nameAr: cat.nameAr, emoji: cat.emoji,
      description: cat.description, serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const cat = KIDS_CATEGORIES[input.category as keyof typeof KIDS_CATEGORIES];
      if (!cat) throw new Error('غير موجود');
      return cat;
    }),

  book: customerProcedure
    .input(z.object({
      serviceId: z.string(), category: z.string(),
      childName: z.string().min(1), childAge: z.number().min(0).max(17),
      parentNotes: z.string().optional(), preferredDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const cat = KIDS_CATEGORIES[input.category as keyof typeof KIDS_CATEGORIES];
      const svc = cat?.subServices.find((s) => s.id === input.serviceId);
      if (!svc) throw new Error('الخدمة غير موجودة');

      return {
        bookingId: `KID-${Date.now()}`,
        childName: input.childName,
        service: svc.nameAr,
        price: svc.price,
        durationMin: svc.durationMin,
        status: 'CONFIRMED',
        message: `تم حجز "${svc.nameAr}" لـ ${input.childName} بنجاح! 🌸`,
        tip: svc.ageMin > 0 ? `مناسبة من عمر ${svc.ageMin} سنوات` : 'مناسبة لجميع الأعمار',
      };
    }),

  safetyTips: publicProcedure.query(() => [
    'جميع المنتجات طبيعية وآمنة للأطفال',
    'فنيات متخصصات في التعامل مع الأطفال',
    'بيئة آمنة ومريحة وممتعة',
    'يمكن للأم البقاء مع الطفل طوال الجلسة',
    'تعقيم كامل لجميع الأدوات',
  ]),
});
