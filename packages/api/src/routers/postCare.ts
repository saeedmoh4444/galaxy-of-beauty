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
      emoji: '',
    },
    {
      id: 'hair_2',
      titleAr: 'استخدمي شامبو خالي من الكبريتات',
      titleEn: 'Use Sulfate-Free Shampoo',
      bodyAr:
        'الكبريتات تزيل الزيوت الطبيعية وتسبب بهتان اللون. اختاري شامبو لطيف خالي من الكبريتات.',
      bodyEn: 'Sulfates strip natural oils and fade color. Choose a gentle sulfate-free shampoo.',
      timeframe: '1w',
      emoji: '',
    },
    {
      id: 'hair_3',
      titleAr: 'تجنبي الحرارة العالية',
      titleEn: 'Avoid High Heat Styling',
      bodyAr: 'قللي من استخدام المكواة والمجفف لمدة أسبوع. إذا اضطررتِ، استخدمي واقي حرارة.',
      bodyEn:
        'Minimize flat iron and dryer use for a week. If needed, always use a heat protectant.',
      timeframe: '1w',
      emoji: '',
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
      emoji: '️',
    },
    {
      id: 'skin_2',
      titleAr: 'لا تلمسي وجهكِ',
      titleEn: 'Avoid Touching Your Face',
      bodyAr: 'تجنبي لمس الوجه أو وضع المكياج لمدة ٢٤ ساعة للسماح للمسام بالتنفس.',
      bodyEn: 'Avoid touching your face or applying makeup for 24 hours to let pores breathe.',
      timeframe: '24h',
      emoji: '',
    },
    {
      id: 'skin_3',
      titleAr: 'اشربي الماء بكثرة',
      titleEn: 'Stay Hydrated',
      bodyAr: 'اشربي ٨-١٠ أكواب من الماء يومياً للحفاظ على ترطيب بشرتكِ من الداخل.',
      bodyEn: 'Drink 8-10 glasses of water daily to maintain skin hydration from within.',
      timeframe: 'ongoing',
      emoji: '',
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
      emoji: '',
    },
    {
      id: 'makeup_2',
      titleAr: 'رطبي بشرتكِ',
      titleEn: 'Moisturize Well',
      bodyAr: 'بعد إزالة المكياج، طبقي مرطب غني للحفاظ على نضارة البشرة.',
      bodyEn: 'After removing makeup, apply a rich moisturizer to maintain skin freshness.',
      timeframe: '24h',
      emoji: '',
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
      emoji: '',
    },
    {
      id: 'nails_2',
      titleAr: 'رطبي أظافركِ',
      titleEn: 'Moisturize Cuticles',
      bodyAr: 'ضعي زيت البشرة يومياً حول الأظافر لمنع الجفاف والتشقق.',
      bodyEn: 'Apply cuticle oil daily around nails to prevent dryness and cracking.',
      timeframe: 'ongoing',
      emoji: '',
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
      emoji: '',
    },
    {
      id: 'massage_2',
      titleAr: 'خذي حمام دافئ',
      titleEn: 'Take a Warm Bath',
      bodyAr: 'حمام دافئ مع أملاح إبسوم يساعد على استرخاء العضلات بعد المساج.',
      bodyEn: 'A warm bath with Epsom salts helps relax muscles after massage.',
      timeframe: '24h',
      emoji: '',
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
      emoji: '',
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

    return { plans, timeframes: TIMEFRAMES };
  }),

  // Get care library for browsing
  library: customerProcedure.query(() => ({
    categories: Object.entries(CARE_LIBRARY).map(([key, tips]) => {
      const names: Record<string, { ar: string; en: string; emoji: string }> = {
        hair: { ar: 'الشعر', en: 'Hair', emoji: '‍️' },
        skincare: { ar: 'البشرة', en: 'Skincare', emoji: '' },
        makeup: { ar: 'المكياج', en: 'Makeup', emoji: '' },
        nails: { ar: 'الأظافر', en: 'Nails', emoji: '' },
        massage: { ar: 'المساج', en: 'Massage', emoji: '‍️' },
        waxing: { ar: 'إزالة الشعر', en: 'Waxing', emoji: '' },
      };
      return {
        key,
        nameAr: names[key]?.ar ?? key,
        nameEn: names[key]?.en ?? key,
        emoji: names[key]?.emoji ?? '‍️',
        tipsCount: tips.length,
      };
    }),
    timeframes: TIMEFRAMES,
  })),
});
