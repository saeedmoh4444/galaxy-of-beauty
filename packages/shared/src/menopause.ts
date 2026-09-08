/**
 * E6c — menopause/perimenopause content + symptom library (curated,
 * bilingual). Served read-only by the menopause router (the E6b postpartum
 * content pattern); symptoms are validated slugs for the symptom log.
 */

export const MENOPAUSE_SYMPTOMS: Array<{ slug: string; ar: string; en: string; emoji: string }> = [
  { slug: 'hot_flash', ar: 'هبات الحرارة', en: 'Hot flashes', emoji: '🔥' },
  { slug: 'night_sweats', ar: 'تعرق ليلي', en: 'Night sweats', emoji: '💦' },
  { slug: 'mood', ar: 'تقلبات المزاج', en: 'Mood swings', emoji: '🌦️' },
  { slug: 'sleep', ar: 'اضطراب النوم', en: 'Sleep disturbance', emoji: '🌙' },
  { slug: 'dryness', ar: 'جفاف البشرة', en: 'Dry skin', emoji: '🍂' },
  { slug: 'brain_fog', ar: 'تشوش الذهن', en: 'Brain fog', emoji: '☁️' },
];

export interface MenopausePhase {
  key: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  bodyAr: string;
  bodyEn: string;
}

export const MENOPAUSE_PHASES: MenopausePhase[] = [
  {
    key: 'perimenopause',
    titleAr: 'مرحلة ما قبل التوقف',
    titleEn: 'Perimenopause',
    emoji: '🌗',
    bodyAr:
      'الدورة تصبح غير منتظمة مع أعراض متقطعة. تتبع الأعراض يساعدكِ وطبيبتكِ على فهم المرحلة.',
    bodyEn:
      'Periods become irregular with on-and-off symptoms. Tracking helps you and your doctor understand the stage.',
  },
  {
    key: 'menopause',
    titleAr: 'انقطاع الطمث',
    titleEn: 'Menopause',
    emoji: '🌕',
    bodyAr:
      'تُحتسب بعد ١٢ شهراً كاملة من آخر دورة. الأعراض تكون أوضح هنا — والعناية الذاتية تصنع فرقاً حقيقياً.',
    bodyEn:
      'Counted 12 full months after the last period. Symptoms are clearest here — self-care makes a real difference.',
  },
  {
    key: 'postmenopause',
    titleAr: 'ما بعد انقطاع الطمث',
    titleEn: 'Postmenopause',
    emoji: '🌞',
    bodyAr: 'معظم الأعراض تهدأ. التركيز ينتقل لصحة العظام والقلب ونضارة البشرة على المدى الطويل.',
    bodyEn: 'Most symptoms ease. The focus shifts to long-term bone, heart and skin health.',
  },
];

export const MENOPAUSE_TIPS: Array<{ ar: string; en: string; emoji: string }> = [
  {
    ar: 'طبقات ملابس خفيفة قطنية تخفف الهبات الحرارية',
    en: 'Light cotton layers ease hot flashes',
    emoji: '👗',
  },
  {
    ar: 'الكالسيوم وفيتامين د لصحة العظام',
    en: 'Calcium and vitamin D for bone health',
    emoji: '🥛',
  },
  {
    ar: 'تمارين خفيفة منتظمة تحسن المزاج والنوم',
    en: 'Regular gentle exercise improves mood and sleep',
    emoji: '🚶‍♀️',
  },
  {
    ar: 'قللي الكافيين مساءً — يهيج الهبات ويؤخر النوم',
    en: 'Cut evening caffeine — it triggers flashes and delays sleep',
    emoji: '☕',
  },
  {
    ar: 'بشرتكِ تحتاج ترطيباً أعمق في هذه المرحلة',
    en: 'Your skin needs deeper hydration at this stage',
    emoji: '🧴',
  },
];

export const MENOPAUSE_SIGNALS: Array<{ ar: string; en: string; emoji: string }> = [
  {
    ar: 'نزيف غزير أو متكرر بعد أشهر من التوقف',
    en: 'Heavy or returning bleeding months after stopping',
    emoji: '🚨',
  },
  {
    ar: 'اكتئاب أو قلق يؤثر على يومك باستمرار',
    en: 'Depression or anxiety that persistently affects your days',
    emoji: '🫂',
  },
  {
    ar: 'هبات حرارة شديدة تعطل نومك وأعمالك',
    en: 'Severe hot flashes disrupting sleep and work',
    emoji: '🔥',
  },
  {
    ar: 'استشيري طبيبتك — العلاجات الهرمونية قرار طبي شخصي',
    en: 'Consult your doctor — hormonal treatments are a personal medical decision',
    emoji: '👩‍⚕️',
  },
];

/** Phase guess from the tracked data (simplified): >12 months since the
 *  last period → menopause/postmenopause; tracking while mode is on →
 *  perimenopause. */
export function guessMenopausePhase(input: {
  lastPeriodAt: Date | null;
  now?: Date;
}): 'perimenopause' | 'menopause' | 'postmenopause' {
  const now = input.now ?? new Date();
  if (!input.lastPeriodAt) return 'perimenopause';
  const monthsSince = (now.getTime() - new Date(input.lastPeriodAt).getTime()) / (30 * 86_400_000);
  if (monthsSince <= 12) return 'perimenopause';
  if (monthsSince <= 60) return 'menopause';
  return 'postmenopause';
}
