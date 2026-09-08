/**
 * E6b — postpartum care content library (curated, bilingual). Healing
 * timeline phases, self-care tips and when-to-seek-help signals — served
 * read-only by the postpartum router (the E4b wellness-content pattern).
 */

export interface PostpartumPhase {
  key: string;
  rangeAr: string;
  rangeEn: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  bodyAr: string;
  bodyEn: string;
}

export const POSTPARTUM_PHASES: PostpartumPhase[] = [
  {
    key: 'week-1-2',
    rangeAr: 'الأسبوع ١–٢',
    rangeEn: 'Week 1–2',
    titleAr: 'الراحة والتعافي',
    titleEn: 'Rest & recovery',
    emoji: '🛏️',
    bodyAr:
      'جسدكِ يتعافى من الولادة — الأولوية للراحة والترطيب وعدم حمل الأشياء الثقيلة. المشي الخفيف داخل المنزل كافٍ.',
    bodyEn:
      'Your body is healing — rest, hydrate and avoid lifting. Gentle walking around the house is enough.',
  },
  {
    key: 'week-2-6',
    rangeAr: 'الأسبوع ٢–٦',
    rangeEn: 'Week 2–6',
    titleAr: 'استعادة القوة',
    titleEn: 'Rebuilding strength',
    emoji: '🌱',
    bodyAr:
      'بإذن الطبيب: تمارين قاع الحوض وتمارين خفيفة، وتدليك التعافي. استمعي لجسدكِ ولا تتعجلي العودة الكاملة.',
    bodyEn:
      'With your doctor’s approval: pelvic-floor and gentle exercises, recovery massage. Listen to your body.',
  },
  {
    key: 'week-6-plus',
    rangeAr: 'بعد ٦ أسابيع',
    rangeEn: 'Week 6+',
    titleAr: 'عودتكِ لنفسكِ',
    titleEn: 'Back to yourself',
    emoji: '💗',
    bodyAr:
      'معظم التعافي اكتمل — عودي تدريجياً لروتينكِ الجمالي والرياضي، وخصصي وقتاً لكِ ولو صغيراً كل يوم.',
    bodyEn:
      'Most healing is done — ease back into your beauty and fitness routines, and keep a small daily moment for yourself.',
  },
];

export const POSTPARTUM_TIPS: Array<{ ar: string; en: string; emoji: string }> = [
  {
    ar: 'اشربي الماء بكثرة — خاصة مع الرضاعة',
    en: 'Drink plenty of water — especially when breastfeeding',
    emoji: '💧',
  },
  {
    ar: 'نمّي عندما ينام طفلك — حتى قيلولة قصيرة تفرق',
    en: 'Sleep when the baby sleeps — even a short nap helps',
    emoji: '😴',
  },
  {
    ar: 'تقبلي المساعدة من العائلة والأخوات',
    en: 'Accept help from family and sisters',
    emoji: '🤲',
  },
  {
    ar: 'بشرة ما بعد الولادة حساسة — منتجات لطيفة بلا عطور قوية',
    en: 'Postpartum skin is sensitive — gentle, low-fragrance products',
    emoji: '🧴',
  },
  {
    ar: 'احجزي زيارة منزلية — لا داعي للخروج مع المولود',
    en: 'Book a home visit — no need to go out with a newborn',
    emoji: '🏠',
  },
];

export const POSTPARTUM_SIGNALS: Array<{ ar: string; en: string; emoji: string }> = [
  {
    ar: 'حزن مستمر يزيد عن أسبوعين أو شعور باليأس',
    en: 'Persistent sadness for over two weeks or hopelessness',
    emoji: '🫂',
  },
  {
    ar: 'نزيف حاد أو ألم متزايد في موضع الولادة',
    en: 'Heavy bleeding or increasing pain at the birth site',
    emoji: '🚨',
  },
  {
    ar: 'حمى أو احمرار وتورم في الثدي',
    en: 'Fever, or breast redness and swelling',
    emoji: '🌡️',
  },
  {
    ar: 'صعوبة في التنفس أو ألم في الصدر',
    en: 'Difficulty breathing or chest pain',
    emoji: '⚠️',
  },
  {
    ar: 'لا تترددي في مراجعة طبيبتك فوراً',
    en: 'Never hesitate to see your doctor right away',
    emoji: '👩‍⚕️',
  },
];
