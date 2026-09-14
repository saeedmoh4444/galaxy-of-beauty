import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, router } from '../trpc';

// Curated aftercare tips by service category — vetted by beauty professionals
const CARE_LIBRARY: Record<
  string,
  Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    timeframe: string;
    emoji: string;
  }>
> = {
  hair: [
    {
      id: 'hair_1',
      titleAr: 'لا تغسلي شعركِ لمدة ٤٨ ساعة',
      titleEn: 'Wait 48h Before Washing',
      bodyAr:
        'بعد الصبغة أو البروتين، انتظري ٤٨ ساعة على الأقل قبل غسل الشعر للحفاظ على اللون والعلاج.',
      bodyEn:
        'After color or protein treatment, wait at least 48 hours before washing to preserve color and treatment.',
      timeframe: '48h',
      emoji: '🚿',
    },
    {
      id: 'hair_2',
      titleAr: 'استخدمي شامبو خالي من الكبريتات',
      titleEn: 'Use Sulfate-Free Shampoo',
      bodyAr:
        'الكبريتات تزيل الزيوت الطبيعية وتسبب بهتان اللون. اختاري شامبو لطيف خالي من الكبريتات.',
      bodyEn: 'Sulfates strip natural oils and fade color. Choose a gentle sulfate-free shampoo.',
      timeframe: '1w',
      emoji: '🧴',
    },
    {
      id: 'hair_3',
      titleAr: 'تجنبي الحرارة العالية',
      titleEn: 'Avoid High Heat Styling',
      bodyAr: 'قللي من استخدام المكواة والمجفف لمدة أسبوع. إذا اضطررتِ، استخدمي واقي حرارة.',
      bodyEn:
        'Minimize flat iron and dryer use for a week. If needed, always use a heat protectant.',
      timeframe: '1w',
      emoji: '🔥',
    },
  ],
  skincare: [
    {
      id: 'skin_1',
      titleAr: 'تجنبي الشمس المباشرة',
      titleEn: 'Avoid Direct Sun Exposure',
      bodyAr:
        'بعد جلسة العناية بالبشرة، بشرتكِ حساسة. استخدمي واقي شمس SPF50 وتجنبي الشمس لمدة ٤٨ ساعة.',
      bodyEn:
        'After facial treatment, your skin is sensitive. Use SPF50 sunscreen and avoid sun for 48 hours.',
      timeframe: '48h',
      emoji: '🌞',
    },
    {
      id: 'skin_2',
      titleAr: 'لا تلمسي وجهكِ',
      titleEn: 'Avoid Touching Your Face',
      bodyAr: 'تجنبي لمس الوجه أو وضع المكياج لمدة ٢٤ ساعة للسماح للمسام بالتنفس.',
      bodyEn: 'Avoid touching your face or applying makeup for 24 hours to let pores breathe.',
      timeframe: '24h',
      emoji: '🚫',
    },
    {
      id: 'skin_3',
      titleAr: 'اشربي الماء بكثرة',
      titleEn: 'Stay Hydrated',
      bodyAr: 'اشربي ٨-١٠ أكواب من الماء يومياً للحفاظ على ترطيب بشرتكِ من الداخل.',
      bodyEn: 'Drink 8-10 glasses of water daily to maintain skin hydration from within.',
      timeframe: 'ongoing',
      emoji: '💧',
    },
  ],
  makeup: [
    {
      id: 'makeup_1',
      titleAr: 'نظفي بشرتكِ جيداً',
      titleEn: 'Cleanse Thoroughly',
      bodyAr: 'أزيلي المكياج بمزيل لطيف ثم اغسلي وجهكِ بغسول مناسب لنوع بشرتكِ قبل النوم.',
      bodyEn:
        'Remove makeup with a gentle remover, then wash with a cleanser suitable for your skin type before bed.',
      timeframe: '24h',
      emoji: '🧼',
    },
    {
      id: 'makeup_2',
      titleAr: 'رطبي بشرتكِ',
      titleEn: 'Moisturize Well',
      bodyAr: 'بعد إزالة المكياج، طبقي مرطب غني للحفاظ على نضارة البشرة.',
      bodyEn: 'After removing makeup, apply a rich moisturizer to maintain skin freshness.',
      timeframe: '24h',
      emoji: '🧴',
    },
  ],
  nails: [
    {
      id: 'nails_1',
      titleAr: 'تجنبي الماء الساخن',
      titleEn: 'Avoid Hot Water',
      bodyAr: 'الماء الساخن يضعف طلاء الأظافر. استخدمي ماء فاتر وارتدي قفازات للغسيل.',
      bodyEn: 'Hot water weakens nail polish. Use lukewarm water and wear gloves for washing.',
      timeframe: '48h',
      emoji: '🧤',
    },
    {
      id: 'nails_2',
      titleAr: 'رطبي أظافركِ',
      titleEn: 'Moisturize Cuticles',
      bodyAr: 'ضعي زيت البشرة يومياً حول الأظافر لمنع الجفاف والتشقق.',
      bodyEn: 'Apply cuticle oil daily around nails to prevent dryness and cracking.',
      timeframe: 'ongoing',
      emoji: '💅',
    },
  ],
  massage: [
    {
      id: 'massage_1',
      titleAr: 'اشربي الماء بعد المساج',
      titleEn: 'Hydrate After Massage',
      bodyAr: 'المساج يحرر السموم — اشربي الكثير من الماء للمساعدة في طردها.',
      bodyEn: 'Massage releases toxins — drink plenty of water to help flush them out.',
      timeframe: '24h',
      emoji: '💧',
    },
    {
      id: 'massage_2',
      titleAr: 'خذي حمام دافئ',
      titleEn: 'Take a Warm Bath',
      bodyAr: 'حمام دافئ مع أملاح إبسوم يساعد على استرخاء العضلات بعد المساج.',
      bodyEn: 'A warm bath with Epsom salts helps relax muscles after massage.',
      timeframe: '24h',
      emoji: '🛁',
    },
  ],
  waxing: [
    {
      id: 'wax_1',
      titleAr: 'تجنبي التقشير',
      titleEn: 'Avoid Exfoliation',
      bodyAr: 'لا تقشري المنطقة المعالجة لمدة ٤٨ ساعة لتجنب التهيج.',
      bodyEn: 'Do not exfoliate the treated area for 48 hours to avoid irritation.',
      timeframe: '48h',
      emoji: '🚫',
    },
  ],
  // E2 — medical clinic aftercare, keyed by consultation treatment type.
  dermatology: [
    {
      id: 'derm_1',
      titleAr: 'استخدمي واقي الشمس يومياً',
      titleEn: 'Wear Sunscreen Daily',
      bodyAr: 'بعد علاجات الجلد، بشرتكِ أكثر حساسية للشمس. ضعي SPF50 كل صباح لمدة أسبوعين.',
      bodyEn:
        'After dermatological treatments, your skin is more sun-sensitive. Apply SPF50 every morning for two weeks.',
      timeframe: '1w',
      emoji: '🧴',
    },
    {
      id: 'derm_2',
      titleAr: 'تجنبي التقشير والمنتجات القوية',
      titleEn: 'Avoid Harsh Actives',
      bodyAr: 'أوقفي الريتينول وأحماض التقشير لمدة أسبوع بعد الجلسة لتجنب التهيج.',
      bodyEn:
        'Pause retinol and exfoliating acids for a week after the session to avoid irritation.',
      timeframe: '1w',
      emoji: '🚫',
    },
  ],
  laser: [
    {
      id: 'laser_1',
      titleAr: 'تجنبي الشمس تماماً',
      titleEn: 'Avoid Sun Completely',
      bodyAr:
        'لمدة ٤٨ ساعة بعد جلسة الليزر، تجنبي التعرض المباشر للشمس وضعي واقي شمس عالي الحماية.',
      bodyEn:
        'For 48 hours after a laser session, avoid direct sun exposure and use a high-SPF sunscreen.',
      timeframe: '48h',
      emoji: '🌞',
    },
    {
      id: 'laser_2',
      titleAr: 'لا تزيلي الشعر بالشمع',
      titleEn: 'No Waxing or Plucking',
      bodyAr: 'بين جلسات الليزر، لا تستخدمي الشمع أو الملقط — الحلاقة فقط مسموحة.',
      bodyEn: 'Between laser sessions, avoid waxing or plucking — shaving only.',
      timeframe: 'ongoing',
      emoji: '🪒',
    },
  ],
  injectables: [
    {
      id: 'inj_1',
      titleAr: 'تجنبي التمارين والمكياج',
      titleEn: 'Skip Exercise & Makeup',
      bodyAr: 'لمدة ٢٤ ساعة بعد الحقن، تجنبي التمارين الرياضية ووضع المكياج على المنطقة المعالجة.',
      bodyEn:
        'For 24 hours after injections, avoid exercise and applying makeup on the treated area.',
      timeframe: '24h',
      emoji: '🚫',
    },
    {
      id: 'inj_2',
      titleAr: 'نامي ورأسكِ مرفوع',
      titleEn: 'Sleep Upright',
      bodyAr: 'ارفعي رأسكِ على وسادتين عند النوم في الليلة الأولى لتقليل التورم.',
      bodyEn: 'Prop your head on two pillows the first night to reduce swelling.',
      timeframe: '24h',
      emoji: '🛏',
    },
  ],
  dental: [
    {
      id: 'dent_1',
      titleAr: 'تجنبي الأطعمة الصلبة',
      titleEn: 'Avoid Hard Foods',
      bodyAr: 'لمدة ٤٨ ساعة بعد علاج الأسنان، التزمي بالأطعمة اللينة وتجنبي الساخن جداً.',
      bodyEn:
        'For 48 hours after dental treatment, stick to soft foods and avoid very hot food and drinks.',
      timeframe: '48h',
      emoji: '🍎',
    },
    {
      id: 'dent_2',
      titleAr: 'اشطفي بالماء والملح',
      titleEn: 'Salt-Water Rinses',
      bodyAr: 'اشطفي فمكِ بمحلول ملحي دافئ مرتين يومياً للحفاظ على نظافة المنطقة المعالجة.',
      bodyEn: 'Rinse with a warm salt-water solution twice a day to keep the treated area clean.',
      timeframe: '1w',
      emoji: '🦷',
    },
  ],
  nutrition: [
    {
      id: 'nutr_1',
      titleAr: 'اشربي الماء بانتظام',
      titleEn: 'Hydrate Consistently',
      bodyAr: 'التزمي بـ ٨-١٠ أكواب ماء يومياً لدعم الخطة الغذائية.',
      bodyEn: 'Stick to 8-10 glasses of water daily to support your nutrition plan.',
      timeframe: 'ongoing',
      emoji: '💧',
    },
    {
      id: 'nutr_2',
      titleAr: 'سجلي وجباتكِ',
      titleEn: 'Track Your Meals',
      bodyAr: 'سجلي وجباتكِ يومياً لمراجعة التقدم مع أخصائية التغذية في الزيارة القادمة.',
      bodyEn: 'Log your meals daily to review progress with the nutritionist at the next visit.',
      timeframe: 'ongoing',
      emoji: '📝',
    },
  ],
};

const TIMEFRAMES = [
  {
    key: '24h',
    labelAr: 'أول ٢٤ ساعة',
    labelEn: 'First 24 Hours',
    color: 'from-red-400 to-orange-400',
  },
  { key: '48h', labelAr: '٤٨ ساعة', labelEn: '48 Hours', color: 'from-amber-400 to-yellow-400' },
  {
    key: '1w',
    labelAr: 'الأسبوع الأول',
    labelEn: 'First Week',
    color: 'from-green-400 to-emerald-400',
  },
  { key: 'ongoing', labelAr: 'مستمر', labelEn: 'Ongoing', color: 'from-blue-400 to-cyan-400' },
];

type CareKey = keyof typeof CARE_LIBRARY;

// Category slugs → care keys. Slug matching is checked BEFORE name matching:
// the seeded categories have Arabic nameJson, and the legacy name map below
// is English-only — feeding it an Arabic name always fell back to skincare.
const SLUG_PATTERNS: Array<{ pattern: RegExp; key: CareKey }> = [
  { pattern: /hair|haircut|hairstyling|henna|groom/, key: 'hair' },
  { pattern: /skin|facial|cleansing/, key: 'skincare' },
  { pattern: /makeup|make-up|bridal|lash|brow/, key: 'makeup' },
  { pattern: /nail|manicure|pedicure/, key: 'nails' },
  { pattern: /massage|spa|relax|body/, key: 'massage' },
  { pattern: /wax|hair-removal|threading|sugaring/, key: 'waxing' },
];

function getCategoryKey(
  slug: string | null | undefined,
  nameEn?: string,
  nameAr?: string,
): CareKey {
  if (slug) {
    const s = slug.toLowerCase();
    for (const { pattern, key } of SLUG_PATTERNS) {
      if (pattern.test(s)) return key;
    }
  }
  // Legacy fallback: name-based mapping (English names match; Arabic won't,
  // so the slug path above carries the real-world cases).
  const map: Record<string, CareKey> = {
    hair: 'hair',
    haircare: 'hair',
    'hair-styling': 'hair',
    'hair-color': 'hair',
    skincare: 'skincare',
    facial: 'skincare',
    'skin-care': 'skincare',
    makeup: 'makeup',
    'make-up': 'makeup',
    bridal: 'makeup',
    nails: 'nails',
    manicure: 'nails',
    pedicure: 'nails',
    'nail-art': 'nails',
    massage: 'massage',
    spa: 'massage',
    relaxation: 'massage',
    waxing: 'waxing',
    'hair-removal': 'waxing',
    sugaring: 'waxing',
  };
  const key = map[(nameEn ?? nameAr ?? '').toLowerCase()] ?? 'skincare';
  return key;
}

function getCategoryTips(category: string) {
  const key = getCategoryKey(category);
  return CARE_LIBRARY[key] ?? CARE_LIBRARY['skincare']!;
}

export const postCareRouter = router({
  // Get care plan for a specific category
  byCategory: customerProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => ({
      category: input.category,
      tips: getCategoryTips(input.category),
      timeframes: TIMEFRAMES,
    })),

  // Get personalized care plan from recent bookings
  myPlan: customerProcedure.query(async ({ ctx }) => {
    const recentBookings = await prisma.booking.findMany({
      where: { customerId: ctx.user.id, status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
      // Booking has no completedAt column (B.15 regression): completion
      // time ≈ endAt. The old orderBy threw and a silent catch returned [],
      // so the plan was always empty. No catch — real errors must surface.
      orderBy: { endAt: 'desc' },
      take: SMALL_PAGE_SIZE,
      include: {
        service: {
          select: {
            titleJson: true,
            categoryId: true,
            category: { select: { nameJson: true, slug: true } },
          },
        },
      },
    });

    const plans = recentBookings.map((b) => {
      const title = (b.service?.titleJson ?? {}) as Record<string, string>;
      const name = (b.service?.category?.nameJson ?? {}) as Record<string, string>;
      const tips = getCategoryTips(
        b.service?.category?.slug ?? name['en'] ?? name['ar'] ?? 'skincare',
      );
      return {
        bookingId: b.id,
        serviceNameAr: title['ar'] ?? '',
        serviceNameEn: title['en'] ?? '',
        categoryAr: name['ar'] ?? '',
        categoryEn: name['en'] ?? '',
        completedAt: b.endAt.toISOString(),
        tips,
      };
    });

    // E2 — clinic consultation aftercare (treatment type → library key).
    const consultations = await prisma.clinicConsultation.findMany({
      where: { customerId: ctx.user.id, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      orderBy: { scheduledAt: 'desc' },
      take: SMALL_PAGE_SIZE,
      include: { clinic: { select: { storeName: true } } },
    });

    const consultationPlans = consultations.map((c) => ({
      consultationId: c.id,
      code: c.code,
      clinicName: c.clinic.storeName,
      treatmentType: c.treatmentType,
      scheduledAt: c.scheduledAt.toISOString(),
      tips: CARE_LIBRARY[c.treatmentType] ?? CARE_LIBRARY['skincare']!,
    }));

    return { plans, consultationPlans, timeframes: TIMEFRAMES };
  }),

  // Get care library for browsing
  library: customerProcedure.query(() => ({
    categories: Object.entries(CARE_LIBRARY).map(([key, tips]) => {
      const names: Record<string, { ar: string; en: string; emoji: string }> = {
        hair: { ar: 'الشعر', en: 'Hair', emoji: '💇' },
        skincare: { ar: 'البشرة', en: 'Skincare', emoji: '🧴' },
        makeup: { ar: 'المكياج', en: 'Makeup', emoji: '💄' },
        nails: { ar: 'الأظافر', en: 'Nails', emoji: '💅' },
        massage: { ar: 'المساج', en: 'Massage', emoji: '💆' },
        waxing: { ar: 'إزالة الشعر', en: 'Waxing', emoji: '🍯' },
        dermatology: { ar: 'الجلدية', en: 'Dermatology', emoji: '🩺' },
        laser: { ar: 'الليزر', en: 'Laser', emoji: '⚡' },
        injectables: { ar: 'الحقن التجميلي', en: 'Injectables', emoji: '💉' },
        dental: { ar: 'تجميل الأسنان', en: 'Dental', emoji: '🦷' },
        nutrition: { ar: 'التغذية', en: 'Nutrition', emoji: '🥗' },
      };
      return {
        key,
        nameAr: names[key]?.ar ?? key,
        nameEn: names[key]?.en ?? key,
        emoji: names[key]?.emoji ?? '✨',
        tipsCount: tips.length,
      };
    }),
    timeframes: TIMEFRAMES,
  })),
});
