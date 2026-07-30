import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

// --- Women-Specific Service Catalog ---
const SERVICES = {
  pregnancy_safe: {
    nameAr: 'عناية الحامل', nameEn: 'Pregnancy-Safe Beauty', emoji: '🤰',
    description: 'خدمات آمنة للحامل — منتجات طبيعية خالية من المواد الضارة',
    subServices: [
      { id: 'ps1', nameAr: 'مساج حمل آمن', nameEn: 'Safe Pregnancy Massage', price: 250, durationMin: 45, emoji: '💆‍♀️', precautions: 'ثلاثي الحمل الثاني والثالث فقط' },
      { id: 'ps2', nameAr: 'عناية بالبشرة للحامل', nameEn: 'Pregnancy-Safe Facial', price: 180, durationMin: 40, emoji: '✨', precautions: 'منتجات طبيعية ١٠٠٪' },
      { id: 'ps3', nameAr: 'باديكير آمن للحامل', nameEn: 'Pregnancy-Safe Pedicure', price: 120, durationMin: 30, emoji: '🦶', precautions: 'بدون تدليك عميق' },
    ],
  },
  postpartum: {
    nameAr: 'عناية ما بعد الولادة', nameEn: 'Postpartum Care', emoji: '🤱',
    description: 'خدمات عناية خاصة للأمهات الجدد — استعادة النشاط والجمال',
    subServices: [
      { id: 'pp1', nameAr: 'مساج استشفاء', nameEn: 'Recovery Massage', price: 280, durationMin: 60, emoji: '💆‍♀️', precautions: 'بعد ٦ أسابيع من الولادة' },
      { id: 'pp2', nameAr: 'علاج تشققات البطن', nameEn: 'Stretch Mark Treatment', price: 350, durationMin: 45, emoji: '🧴', precautions: 'بعد ٣ أشهر من الولادة' },
      { id: 'pp3', nameAr: 'عناية بالبشرة بعد الولادة', nameEn: 'Postpartum Facial', price: 200, durationMin: 45, emoji: '✨', precautions: 'مناسبة للرضاعة' },
    ],
  },
  henna: {
    nameAr: 'فن الحناء', nameEn: 'Henna Art', emoji: '🌿',
    description: 'تصاميم حناء تقليدية وعصرية — طبيعية وآمنة',
    subServices: [
      { id: 'hn1', nameAr: 'حناء عرائس كامل', nameEn: 'Full Bridal Henna', price: 500, durationMin: 120, emoji: '👰', precautions: 'حناء طبيعية سوداء' },
      { id: 'hn2', nameAr: 'حناء يدين', nameEn: 'Hands Henna', price: 180, durationMin: 45, emoji: '🤲', precautions: '' },
      { id: 'hn3', nameAr: 'حناء قدمين', nameEn: 'Feet Henna', price: 150, durationMin: 40, emoji: '🦶', precautions: '' },
      { id: 'hn4', nameAr: 'حناء مناسبات', nameEn: 'Occasion Henna', price: 250, durationMin: 60, emoji: '🎉', precautions: '' },
    ],
  },
  brows_lashes: {
    nameAr: 'حواجب ورموش', nameEn: 'Brows & Lashes', emoji: '👁️',
    description: 'خدمات الحواجب والرموش — تشكيل، صبغ، وتركيب',
    subServices: [
      { id: 'bl1', nameAr: 'تشكيل حواجب', nameEn: 'Eyebrow Shaping', price: 80, durationMin: 20, emoji: '✂️', precautions: '' },
      { id: 'bl2', nameAr: 'صبغ حواجب', nameEn: 'Eyebrow Tinting', price: 100, durationMin: 20, emoji: '🎨', precautions: '' },
      { id: 'bl3', nameAr: 'مايكروبليدينج', nameEn: 'Microblading', price: 800, durationMin: 120, emoji: '🖋️', precautions: 'جلسة تصحيح بعد شهر' },
      { id: 'bl4', nameAr: 'تركيب رموش', nameEn: 'Lash Extensions', price: 350, durationMin: 90, emoji: '✨', precautions: 'يدوم ٣-٤ أسابيع' },
      { id: 'bl5', nameAr: 'رفع رموش', nameEn: 'Lash Lift', price: 200, durationMin: 45, emoji: '⬆️', precautions: '' },
    ],
  },
  body_contouring: {
    nameAr: 'نحت الجسم', nameEn: 'Body Contouring', emoji: '💪',
    description: 'خدمات نحت وتشكيل الجسم غير جراحية',
    subServices: [
      { id: 'bc1', nameAr: 'كافيتيشن', nameEn: 'Cavitation', price: 400, durationMin: 60, emoji: '🔊', precautions: '٦-٨ جلسات للنتيجة' },
      { id: 'bc2', nameAr: 'راديوفريكونسي', nameEn: 'Radiofrequency', price: 450, durationMin: 45, emoji: '📡', precautions: '٤-٦ جلسات' },
      { id: 'bc3', nameAr: 'تصريف ليمفاوي', nameEn: 'Lymphatic Drainage', price: 300, durationMin: 60, emoji: '💧', precautions: '' },
      { id: 'bc4', nameAr: 'شد الجسم بالخيوط', nameEn: 'Thread Lifting', price: 1200, durationMin: 90, emoji: '🧵', precautions: 'نتيجة فورية' },
    ],
  },
  intimate_care: {
    nameAr: 'عناية شخصية', nameEn: 'Intimate Care', emoji: '🌸',
    description: 'خدمات عناية شخصية نسائية — بخصوصية وأمان تام',
    subServices: [
      { id: 'ic1', nameAr: 'تبييض المناطق الحساسة', nameEn: 'Intimate Whitening', price: 350, durationMin: 45, emoji: '✨', precautions: 'منتجات طبية آمنة' },
      { id: 'ic2', nameAr: 'تقشير الجسم كامل', nameEn: 'Full Body Scrub', price: 250, durationMin: 50, emoji: '🧖‍♀️', precautions: '' },
      { id: 'ic3', nameAr: 'حمام بخار مهبلي', nameEn: 'V-Steam', price: 180, durationMin: 30, emoji: '♨️', precautions: 'أعشاب طبيعية' },
    ],
  },
  mommy_makeover: {
    nameAr: 'تجديد الأمومة', nameEn: 'Mommy Makeover', emoji: '👩‍👧',
    description: 'باقة متكاملة لاستعادة جمالكِ بعد الولادة',
    subServices: [
      { id: 'mm1', nameAr: 'باقة تجديد الأمومة', nameEn: 'Mommy Makeover Package', price: 1200, durationMin: 180, emoji: '💝', precautions: '٣ خدمات في جلسة واحدة' },
      { id: 'mm2', nameAr: 'جلسة استرخاء للأمهات', nameEn: 'Mom Relaxation Session', price: 350, durationMin: 90, emoji: '🧘‍♀️', precautions: 'مساج + قناع + عناية' },
    ],
  },
  teen_beauty: {
    nameAr: 'تجميل المراهقات', nameEn: 'Teen Beauty', emoji: '👧',
    description: 'خدمات مناسبة للشابات — عناية لطيفة ومناسبة للعمر',
    subServices: [
      { id: 'tb1', nameAr: 'عناية بشرة للمراهقات', nameEn: 'Teen Facial', price: 120, durationMin: 30, emoji: '✨', precautions: 'منتجات لطيفة' },
      { id: 'tb2', nameAr: 'مكياج مناسبات', nameEn: 'Occasion Makeup', price: 180, durationMin: 45, emoji: '💄', precautions: 'إطلالة طبيعية' },
      { id: 'tb3', nameAr: 'تنظيف بشرة خفيف', nameEn: 'Gentle Cleansing', price: 100, durationMin: 25, emoji: '🧼', precautions: '' },
    ],
  },
};

export const womensServicesRouter = router({
  categories: publicProcedure.query(() =>
    Object.entries(SERVICES).map(([key, cat]) => ({
      key,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      emoji: cat.emoji,
      description: cat.description,
      serviceCount: cat.subServices.length,
    })),
  ),

  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const cat = SERVICES[input.category as keyof typeof SERVICES];
      if (!cat) throw new Error('القسم غير موجود');
      return cat;
    }),

  // Booking with special requirements
  book: customerProcedure
    .input(z.object({
      serviceId: z.string(),
      category: z.string(),
      preferredDate: z.string().optional(),
      specialNotes: z.string().optional(),
      pregnancyTrimester: z.number().min(1).max(3).optional(),
      postpartumWeeks: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const cat = SERVICES[input.category as keyof typeof SERVICES];
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
        message: 'تم الحجز بنجاح! سنراعي جميع احتياجاتكِ الخاصة 🌸',
      };
    }),

  // Safety tips for each category
  safetyTips: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const tips: Record<string, string[]> = {
        pregnancy_safe: ['تجنبي المنتجات المحتوية على الريتينول', 'استخدمي واقي شمس طبيعي', 'أخبري الفنية بحملكِ قبل الجلسة', 'تجنبي الزيوت العطرية القوية'],
        postpartum: ['انتظري ٦ أسابيع بعد الولادة الطبيعية', 'استشيري طبيبكِ قبل أي علاج', 'أخبري الفنية إذا كنتِ ترضعين طبيعياً'],
        henna: ['تأكدي من استخدام حناء طبيعية', 'تجنبي الحناء السوداء الكيميائية', 'اختبري على منطقة صغيرة أولاً'],
        brows_lashes: ['تأكدي من تعقيم الأدوات', 'أخبري الفنية عن أي حساسية', 'تجنبي الفرك بعد التركيب'],
        body_contouring: ['استشيري طبيب قبل الجلسات', 'اشربي ماء بكثرة بعد الجلسة', 'التزمي بعدد الجلسات الموصى به'],
        intimate_care: ['جميع الخدمات بخصوصية تامة', 'فنيات متخصصات ومعتمدات', 'منتجات طبية آمنة ومعقمة'],
        mommy_makeover: ['احجزي الجلسة في وقت تكونين فيه مرتاحة', 'أحضري صورة إطلالتكِ المفضلة', 'استمتعي بيومكِ الخاص'],
        teen_beauty: ['خدمات مناسبة للعمر', 'منتجات لطيفة وخالية من العطور', 'استشارة مجانية للروتين المناسب'],
      };
      return tips[input.category] ?? [];
    }),
});
