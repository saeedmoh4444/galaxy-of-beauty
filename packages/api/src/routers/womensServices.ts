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
  menopause: {
    nameAr: 'عناية سن اليأس', nameEn: 'Menopause Care', emoji: '🦋',
    description: 'عناية متخصصة للبشرة والجسم خلال مرحلة انقطاع الطمث',
    subServices: [
      { id: 'mp1', nameAr: 'عناية بالبشرة لسن اليأس', nameEn: 'Menopause Facial', price: 220, durationMin: 50, emoji: '✨', precautions: 'منتجات غنية بالكولاجين' },
      { id: 'mp2', nameAr: 'مساج هرموني', nameEn: 'Hormonal Balance Massage', price: 280, durationMin: 60, emoji: '💆‍♀️', precautions: 'زيوت طبيعية متوازنة' },
      { id: 'mp3', nameAr: 'علاج جفاف البشرة', nameEn: 'Dryness Treatment', price: 200, durationMin: 45, emoji: '💧', precautions: 'ترطيب مكثف' },
    ],
  },
  hijab_care: {
    nameAr: 'عناية المحجبة', nameEn: 'Hijab-Friendly Haircare', emoji: '🧕',
    description: 'عناية متخصصة بالشعر للمحجبات — جلسات خاصة وخصوصية تامة',
    subServices: [
      { id: 'hj1', nameAr: 'علاج تساقط الشعر', nameEn: 'Hair Loss Treatment', price: 300, durationMin: 60, emoji: '💆‍♀️', precautions: 'جلسات شهرية' },
      { id: 'hj2', nameAr: 'حمام زيت عميق', nameEn: 'Deep Oil Treatment', price: 180, durationMin: 45, emoji: '🫒', precautions: 'زيوت طبيعية' },
      { id: 'hj3', nameAr: 'تصفيف خاص للمحجبات', nameEn: 'Hijab-Friendly Styling', price: 150, durationMin: 30, emoji: '💇‍♀️', precautions: 'خصوصية تامة' },
      { id: 'hj4', nameAr: 'قناع شعر مرطب', nameEn: 'Hydrating Hair Mask', price: 160, durationMin: 35, emoji: '🧴', precautions: 'لفروة الرأس الصحية' },
    ],
  },
  pcos_care: {
    nameAr: 'عناية تكيس المبايض', nameEn: 'PCOS Beauty', emoji: '🩺',
    description: 'عناية متخصصة للبشرة والشعر لحالات تكيس المبايض',
    subServices: [
      { id: 'pc1', nameAr: 'عناية بشرة دهنية', nameEn: 'Oily Skin Facial', price: 200, durationMin: 45, emoji: '✨', precautions: 'منظفات طبية' },
      { id: 'pc2', nameAr: 'علاج حب الشباب الهرموني', nameEn: 'Hormonal Acne Treatment', price: 250, durationMin: 50, emoji: '🔬', precautions: 'بإشراف طبي' },
      { id: 'pc3', nameAr: 'إزالة شعر زائد', nameEn: 'Excess Hair Removal', price: 300, durationMin: 60, emoji: '🌸', precautions: 'بشرة حساسة' },
    ],
  },
  bridal_prep: {
    nameAr: 'تحضير العروس', nameEn: 'Bridal Preparation', emoji: '👰‍♀️',
    description: 'برنامج متكامل لتحضير العروس — من ٦ أشهر حتى يوم الزفاف',
    subServices: [
      { id: 'br1', nameAr: 'باقة العروس الذهبية', nameEn: 'Golden Bride Package', price: 3500, durationMin: 300, emoji: '👑', precautions: '٦ جلسات على ٣ أشهر' },
      { id: 'br2', nameAr: 'باقة العروس الفضية', nameEn: 'Silver Bride Package', price: 2000, durationMin: 200, emoji: '💍', precautions: '٤ جلسات على شهرين' },
      { id: 'br3', nameAr: 'تجربة مكياج و تسريحة', nameEn: 'Makeup & Hair Trial', price: 400, durationMin: 90, emoji: '💄', precautions: 'جلسة تجربة قبل الزفاف' },
      { id: 'br4', nameAr: 'عناية بالأسنان', nameEn: 'Teeth Whitening', price: 600, durationMin: 60, emoji: '😁', precautions: 'تبييض آمن' },
    ],
  },
  working_woman: {
    nameAr: 'المرأة العاملة', nameEn: 'Working Woman Express', emoji: '💼',
    description: 'خدمات سريعة تناسب جدول المرأة العاملة — خلال استراحة الغداء',
    subServices: [
      { id: 'ww1', nameAr: 'مكياج سريع ٢٠ دقيقة', nameEn: '20-Min Express Makeup', price: 120, durationMin: 20, emoji: '💄', precautions: '' },
      { id: 'ww2', nameAr: 'مانيكير سريع', nameEn: 'Express Manicure', price: 80, durationMin: 20, emoji: '💅', precautions: '' },
      { id: 'ww3', nameAr: 'تصفيف سريع', nameEn: 'Express Styling', price: 100, durationMin: 25, emoji: '💇‍♀️', precautions: '' },
      { id: 'ww4', nameAr: 'باقة عاملة', nameEn: 'Working Woman Bundle', price: 250, durationMin: 60, emoji: '⏱️', precautions: 'مكياج + أظافر + شعر' },
    ],
  },
  first_beauty: {
    nameAr: 'أول مرة', nameEn: 'First Beauty Experience', emoji: '🦋',
    description: 'تجربة تجميل أولى للشابات — استشارة وتعليم بلطف',
    subServices: [
      { id: 'fb1', nameAr: 'استشارة تجميل أولى', nameEn: 'First Beauty Consultation', price: 80, durationMin: 30, emoji: '💬', precautions: 'تعليم روتين العناية' },
      { id: 'fb2', nameAr: 'جلسة تعليم مكياج', nameEn: 'Makeup Tutorial Session', price: 200, durationMin: 60, emoji: '📚', precautions: 'تعلم خطوة بخطوة' },
      { id: 'fb3', nameAr: 'أول عناية بالبشرة', nameEn: 'First Facial', price: 100, durationMin: 35, emoji: '✨', precautions: 'منتجات لطيفة جداً' },
    ],
  },
  breastfeeding_safe: {
    nameAr: 'عناية المرضعة', nameEn: 'Breastfeeding-Safe Beauty', emoji: '🍼',
    description: 'خدمات تجميل آمنة أثناء فترة الرضاعة الطبيعية',
    subServices: [
      { id: 'bf1', nameAr: 'عناية بشرة آمنة', nameEn: 'Nursing-Safe Facial', price: 180, durationMin: 40, emoji: '✨', precautions: 'خالي من الريتينول والساليسيليك' },
      { id: 'bf2', nameAr: 'مساج استرخاء', nameEn: 'Relaxation Massage', price: 250, durationMin: 50, emoji: '💆‍♀️', precautions: 'وضعية جانبية آمنة' },
      { id: 'bf3', nameAr: 'مانيكير آمن', nameEn: 'Safe Manicure', price: 100, durationMin: 30, emoji: '💅', precautions: 'منتجات غير سامة' },
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
    .mutation(async ({ input }) => {
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
        menopause: ['استخدمي منتجات غنية بالكولاجين', 'الترطيب المكثف ضروري', 'تجنبي المنتجات القاسية'],
        hijab_care: ['جلسات بخصوصية تامة', 'اهتمي بفروة الرأس', 'جففي شعركِ جيداً قبل الارتداء', 'استخدمي أغطية حرير'],
        pcos_care: ['استشيري طبيبكِ قبل العلاج', 'منتجات طبية مخصصة', 'متابعة دورية للبشرة'],
        bridal_prep: ['ابدئي قبل ٦ أشهر من الزفاف', 'جلسات منتظمة أفضل من جلسة واحدة', 'جربي المكياج قبل الزفاف بشهر'],
        working_woman: ['خدمات سريعة في ٢٠-٦٠ دقيقة', 'احجزي خلال استراحة الغداء', 'باقات موفرة للوقت'],
        first_beauty: ['تعلمي أساسيات العناية', 'لا تترددي في طرح الأسئلة', 'ابدئي بمنتجات بسيطة'],
        breastfeeding_safe: ['تجنبي الريتينول والساليسيليك', 'أخبري الفنية أنكِ مرضعة', 'استخدمي منتجات طبيعية ١٠٠٪'],
      };
      return tips[input.category] ?? [];
    }),
});
