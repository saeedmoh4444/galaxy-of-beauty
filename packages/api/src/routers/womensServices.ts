import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';
import { WOMENS_SERVICES } from './womensServicesData';

export const womensServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(WOMENS_SERVICES).map(([key, cat]) => ({
      key,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      description: cat.description,
      serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const cat = WOMENS_SERVICES[input.category as keyof typeof WOMENS_SERVICES];
    if (!cat) throw new Error('القسم غير موجود');
    return cat;
  }),

  // Booking with special requirements
  book: customerProcedure
    .input(
      z.object({
        serviceId: z.string(),
        category: z.string(),
        preferredDate: z.string().optional(),
        specialNotes: z.string().optional(),
        pregnancyTrimester: z.number().min(1).max(3).optional(),
        postpartumWeeks: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const cat = WOMENS_SERVICES[input.category as keyof typeof WOMENS_SERVICES];
      const svc = cat?.subServices.find((s) => s.id === input.serviceId);
      if (!svc) throw new Error('الخدمة غير موجودة');

      return {
        bookingId: `WMN-${Date.now()}`,
        service: svc.nameAr,
        price: svc.price,
        durationMin: svc.durationMin,
        precautions: svc.precautions,
        status: 'CONFIRMED',
        specialRequirements: [
          input.pregnancyTrimester ? `ثلاثي الحمل: ${input.pregnancyTrimester}` : null,
          input.postpartumWeeks ? `أسابيع بعد الولادة: ${input.postpartumWeeks}` : null,
          input.specialNotes,
        ].filter(Boolean),
        message: 'تم الحجز بنجاح! سنراعي جميع احتياجاتكِ الخاصة',
      };
    }),

  safetyTips: publicProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const tips: Record<string, string[]> = {
      pregnancy_safe: ['تجنبي المنتجات المحتوية على الريتينول', 'استخدمي واقي شمس طبيعي', 'أخبري الفنية بحملكِ قبل الجلسة', 'تجنبي الزيوت العطرية القوية'],
      postpartum: ['انتظري ٦ أسابيع بعد الولادة الطبيعية', 'استشيري طبيبكِ قبل أي علاج', 'أخبري الفنية إذا كنتِ ترضعين طبيعياً'],
      henna: ['تأكدي من استخدام حناء طبيعية', 'تجنبي الحناء السوداء الكيميائية', 'اختبري على منطقة صغيرة أولاً'],
      brows_lashes: ['تأكدي من تعقيم الأدوات', 'أخبري الفنية عن أي حساسية', 'تجنبي الفرك بعد التركيب'],
      body_contouring: ['استشيري طبيب قبل الجلسات', 'اشربي ماء بكثرة بعد الجلسة', 'التزمي بعدد الجلسات الموصى به'],
      intimate_care: ['جميع الخدمات بخصوصية تامة', 'فنيات متخصصات ومعتمدات', 'منتجات طبية آمنة ومعقمة'],
      mommy_makeover: ['احجزي الجلسة في وقت تكونين فيه مرتاحة', 'أحضري صورة إطلالتكِ المفضلة', 'استمتعي بيومكِ الخاص'],
      teen_beauty: ['خدمات مناسبة للعمر', 'منتجات لطيفة وخالية من العطور', 'استشارة مجانية للروتين المناسب'],
      menopause: ['استخدمي منتجات غنية بالكولاجين', 'الترطيب المكثف ضروري', 'تجنبي المنتجات القاسية'],
      hijab_care: ['جلسات بخصوصية تامة', 'اهتمي بفروة الرأس', 'جففي شعركِ جيداً قبل الارتداء', 'استخدمي أغطية حرير'],
      pcos_care: ['استشيري طبيبكِ قبل العلاج', 'منتجات طبية مخصصة', 'متابعة دورية للبشرة'],
      bridal_prep: ['ابدئي قبل ٦ أشهر من الزفاف', 'جلسات منتظمة أفضل من جلسة واحدة', 'جربي المكياج قبل الزفاف بشهر'],
      working_woman: ['خدمات سريعة في ٢٠-٦٠ دقيقة', 'احجزي خلال استراحة الغداء', 'باقات موفرة للوقت'],
      breastfeeding_safe: ['تجنبي الريتينول والساليسيليك', 'أخبري الفنية أنكِ مرضعة', 'استخدمي منتجات طبيعية ١٠٠٪'],
      fertility_wellness: ['استخدمي منتجات طبيعية فقط', 'تجنبي الزيوت العطرية القوية', 'استشيري طبيبكِ قبل أي علاج'],
      post_surgery: ['استشيري طبيبكِ أولاً', 'لا تبدأي قبل التئام الجروح', 'أخبري الفنية عن العملية'],
      cycle_synced: ['تجنبي العلاجات القوية خلال الدورة', 'المساج الدافئ يخفف الآلام', 'البشرة تكون أكثر حساسية'],
      mature_skin: ['استخدمي منتجات غنية بمضادات الأكسدة', 'الترطيب العميق أساسي', 'تجنبي المنتجات القاسية'],
      ramadan_beauty: ['احجزي قبل الإفطار أو بعد التراويح', 'اهتمي بالترطيب خلال الصيام', 'تجنبي العلاجات المجهدة'],
    };
    return tips[input.category] ?? [];
  }),
});
