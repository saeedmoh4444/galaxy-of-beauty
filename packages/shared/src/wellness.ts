/**
 * E4b — mental wellness + nutrition curated libraries, shared by the
 * wellnessContent router (same pattern as postCare's CARE_LIBRARY, hosted
 * in @galaxy/shared like E4a's cycle.ts). Pure data — no JSX, no server
 * imports.
 */

// ── Breathing exercises ────────────────────────────────────────────────────

export interface BreathingExercise {
  key: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  /** Seconds per phase. */
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  minutes: number;
  benefitAr: string;
  benefitEn: string;
}

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    key: 'box',
    nameAr: 'التنفس المربع',
    nameEn: 'Box Breathing',
    emoji: '🟦',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 4,
    minutes: 3,
    benefitAr: 'يهدئ الجهاز العصبي ويحسن التركيز',
    benefitEn: 'Calms the nervous system and sharpens focus',
  },
  {
    key: 'relaxing',
    nameAr: 'تنفس الاسترخاء ٤-٧-٨',
    nameEn: '4-7-8 Relaxing Breath',
    emoji: '🌙',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    minutes: 2,
    benefitAr: 'يساعد على النوم ويخفف القلق',
    benefitEn: 'Eases into sleep and softens anxiety',
  },
  {
    key: 'belly',
    nameAr: 'التنفس البطني العميق',
    nameEn: 'Deep Belly Breathing',
    emoji: '🌬️',
    inhale: 5,
    hold: 2,
    exhale: 5,
    cycles: 5,
    minutes: 3,
    benefitAr: 'يزيد الأكسجين ويريح عضلات البطن',
    benefitEn: 'Boosts oxygen flow and relaxes the core',
  },
  {
    key: 'equal',
    nameAr: 'التنفس المتوازن',
    nameEn: 'Equal Breathing',
    emoji: '⚖️',
    inhale: 5,
    hold: 0,
    exhale: 5,
    cycles: 6,
    minutes: 2,
    benefitAr: 'توازن سريع للمزاج قبل مناسبة أو تمرين',
    benefitEn: 'A quick mood reset before an event or workout',
  },
  {
    key: 'alternate',
    nameAr: 'التنفس بالمنخرين بالتناوب',
    nameEn: 'Alternate Nostril Breathing',
    emoji: '🌸',
    inhale: 4,
    hold: 2,
    exhale: 4,
    cycles: 5,
    minutes: 3,
    benefitAr: 'تصفية الذهن وتحسين جودة النوم',
    benefitEn: 'Clears the mind and improves sleep quality',
  },
];

// ── Short guided meditations ───────────────────────────────────────────────

export interface Meditation {
  key: string;
  titleAr: string;
  titleEn: string;
  emoji: string;
  minutes: number;
  stepsAr: string[];
  stepsEn: string[];
}

export const MEDITATIONS: Meditation[] = [
  {
    key: 'morning-glow',
    titleAr: 'تأمل توهج الصباح',
    titleEn: 'Morning Glow',
    emoji: '☀️',
    minutes: 3,
    stepsAr: [
      'اجلسي في مكان هادئ وأغلقي عينيكِ',
      'خذي خمسة أنفاس عميقة من الأنف',
      'تخيلي ضوءاً دافئاً يملأ وجهكِ ويمنحه النضارة',
      'ابتسمي بهدوء وافتحي عينيكِ ببطء',
    ],
    stepsEn: [
      'Sit somewhere quiet and close your eyes',
      'Take five slow breaths through your nose',
      'Imagine warm light filling your face with freshness',
      'Smile softly and open your eyes slowly',
    ],
  },
  {
    key: 'sleep-wind-down',
    titleAr: 'تأمل النوم الهادئ',
    titleEn: 'Sleep Wind-Down',
    emoji: '🌙',
    minutes: 5,
    stepsAr: [
      'استلقي على سريركِ وارخي كتفيكِ',
      'تنفسي ببطء: شهيق ٤ ثوانٍ وزفير ٦ ثوانٍ',
      'ابدئي بإرخاء عضلات وجهكِ ثم رقبتكِ ثم جسمكِ',
      'كرري حتى تشعري بالثقل المريح',
    ],
    stepsEn: [
      'Lie down and let your shoulders drop',
      'Breathe slowly: 4 seconds in, 6 seconds out',
      'Release your face, then neck, then whole body',
      'Repeat until you feel a comfortable heaviness',
    ],
  },
  {
    key: 'body-scan',
    titleAr: 'مسح الجسد',
    titleEn: 'Body Scan',
    emoji: '🫧',
    minutes: 4,
    stepsAr: [
      'لاحظي أحاسيس قدميكِ ثم ساقيكِ',
      'انتقلي ببطء نحو البطن والصدر',
      'أنهي بالوجه والرأس مع نفس عميق',
      'لاحظي الفرق في التوتر قبل وبعد',
    ],
    stepsEn: [
      'Notice the sensations in your feet, then legs',
      'Move slowly up through belly and chest',
      'Finish with the face and head on a deep breath',
      'Notice the difference in tension before and after',
    ],
  },
  {
    key: 'confidence',
    titleAr: 'تأمل الثقة',
    titleEn: 'Confidence Glow',
    emoji: '💎',
    minutes: 3,
    stepsAr: [
      'ضعي يدكِ على قلبكِ وتنفسي ثلاث مرات',
      'تذكري موقفاً شعرتِ فيه بالفخر بنفسكِ',
      'رددي داخلياً: أنا قوية وأستحق الأفضل',
      'أعيدي هذا الشعور مع كل شهيق',
    ],
    stepsEn: [
      'Place a hand on your heart and breathe three times',
      'Recall a moment you felt proud of yourself',
      'Repeat inside: I am strong and I deserve the best',
      'Bring that feeling back with each inhale',
    ],
  },
  {
    key: 'gratitude',
    titleAr: 'تأمل الامتنان',
    titleEn: 'Gratitude Pause',
    emoji: '💗',
    minutes: 3,
    stepsAr: [
      'فكري في ثلاثة أشياء صغيرة أسعدتكِ اليوم',
      'لاحظي أين تشعرين بالامتنان في جسدكِ',
      'ابقِ مع هذا الشعور دقيقة كاملة',
      'أنهي بابتسامة ونفس طويل',
    ],
    stepsEn: [
      'Think of three small things that made you smile today',
      'Notice where gratitude lives in your body',
      'Stay with that feeling for a full minute',
      'Finish with a smile and a long breath',
    ],
  },
];

// ── Journaling prompts ─────────────────────────────────────────────────────

export interface JournalPrompt {
  key: string;
  category: 'selfLove' | 'gratitude' | 'goals' | 'beauty';
  ar: string;
  en: string;
  emoji: string;
  /** 1–5 mood band the prompt suits best (undefined = any mood). */
  mood?: number;
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  {
    key: 'p1',
    category: 'gratitude',
    ar: 'اكتبي ثلاثة أشياء تشكرين الله عليها اليوم',
    en: 'Write three things you are grateful for today',
    emoji: '💗',
    mood: 4,
  },
  {
    key: 'p2',
    category: 'selfLove',
    ar: 'ما أجمل صفة في شخصيتكِ؟ ولماذا؟',
    en: 'What is the loveliest trait in your character, and why?',
    emoji: '🪞',
  },
  {
    key: 'p3',
    category: 'beauty',
    ar: 'ما الروتين الذي يجعل بشرتكِ سعيدة هذا الأسبوع؟',
    en: 'Which routine made your skin happiest this week?',
    emoji: '✨',
  },
  {
    key: 'p4',
    category: 'goals',
    ar: 'هدف صغير واحد تريدين تحقيقه خلال أسبوعين',
    en: 'One small goal you want to reach within two weeks',
    emoji: '🎯',
  },
  {
    key: 'p5',
    category: 'selfLove',
    ar: 'اكتبي رسالة لطيفة لنفسكِ يوم كنتِ متعبة',
    en: 'Write a kind letter to yourself on a hard day',
    emoji: '💌',
    mood: 2,
  },
  {
    key: 'p6',
    category: 'gratitude',
    ar: 'من الذي صنع فارقاً جميلاً في حياتكِ مؤخراً؟',
    en: 'Who made a lovely difference in your life recently?',
    emoji: '🌷',
    mood: 3,
  },
  {
    key: 'p7',
    category: 'beauty',
    ar: 'ما إطلالة تجعلكِ تشعرين بأفضل نسخة منكِ؟',
    en: 'Which look makes you feel like the best version of you?',
    emoji: '💄',
    mood: 4,
  },
  {
    key: 'p8',
    category: 'goals',
    ar: 'ما أول خطوة صغيرة نحو حلم مؤجل؟',
    en: 'What is the first tiny step toward a postponed dream?',
    emoji: '🪜',
  },
  {
    key: 'p9',
    category: 'selfLove',
    ar: 'ما الذي يحتاجه جسدكِ اليوم ليشعر بالراحة؟',
    en: 'What does your body need today to feel at ease?',
    emoji: '🛁',
    mood: 1,
  },
  {
    key: 'p10',
    category: 'gratitude',
    ar: 'صفّي لحظة صغيرة من اليوم تستحق أن تُحفظ',
    en: 'Describe one small moment from today worth keeping',
    emoji: '📸',
    mood: 3,
  },
  {
    key: 'p11',
    category: 'beauty',
    ar: 'ما نصيحة جمالية ورثتها وتفخرين بها؟',
    en: 'Which beauty tip did you inherit and treasure?',
    emoji: '🧴',
  },
  {
    key: 'p12',
    category: 'goals',
    ar: 'كيف يبدو يومكِ المثالي بعد سنة من الآن؟',
    en: 'What does your ideal day look like a year from now?',
    emoji: '🗓️',
    mood: 5,
  },
];

/** Daily prompt(s) — prefer prompts matching the mood band, fall back to all. */
export function getJournalPrompts(input?: {
  mood?: number | null;
  category?: JournalPrompt['category'] | null;
}): JournalPrompt[] {
  let pool = JOURNAL_PROMPTS;
  if (input?.category) pool = pool.filter((p) => p.category === input.category);
  if (input?.mood != null) {
    const matched = pool.filter((p) => p.mood === undefined || p.mood === input.mood);
    if (matched.length > 0) pool = matched;
  }
  return pool;
}

// ── Nutrition library (beauty goals → foods & meals) ───────────────────────

export type NutritionGoalKey = 'glow' | 'hair' | 'nails' | 'energy' | 'weight';

export interface NutritionGoal {
  key: NutritionGoalKey;
  nameAr: string;
  nameEn: string;
  emoji: string;
  foods: Array<{ ar: string; en: string; emoji: string }>;
  meals: Array<{
    key: string;
    titleAr: string;
    titleEn: string;
    emoji: string;
    ar: string;
    en: string;
  }>;
}

export const NUTRITION_LIBRARY: NutritionGoal[] = [
  {
    key: 'glow',
    nameAr: 'نضارة البشرة',
    nameEn: 'Skin Glow',
    emoji: '✨',
    foods: [
      {
        ar: 'الأفوكادو — دهون صحية للترطيب',
        en: 'Avocado — healthy fats for hydration',
        emoji: '🥑',
      },
      {
        ar: 'الطماطم — الليكوبين ضد التجاعيد',
        en: 'Tomatoes — lycopene against fine lines',
        emoji: '🍅',
      },
      {
        ar: 'الجزر — بيتا كاروتين لنضارة اللون',
        en: 'Carrots — beta-carotene for a fresh tone',
        emoji: '🥕',
      },
      {
        ar: 'المكسرات النيئة — فيتامين E للحماية',
        en: 'Raw nuts — vitamin E for protection',
        emoji: '🌰',
      },
      { ar: 'الماء بالليمون — ترطيب وتوهج', en: 'Lemon water — hydration and glow', emoji: '🍋' },
    ],
    meals: [
      {
        key: 'glow-1',
        titleAr: 'سلطة التوهج',
        titleEn: 'Glow Salad',
        emoji: '🥗',
        ar: 'طماطم، جزر مبشور، أفوكادو، زيت زيتون بكر',
        en: 'Tomatoes, grated carrot, avocado, cold-pressed olive oil',
      },
      {
        key: 'glow-2',
        titleAr: 'سموذي النضارة',
        titleEn: 'Radiance Smoothie',
        emoji: '🥤',
        ar: 'فراولة، موز، حليب اللوز، ملعقة شيا',
        en: 'Strawberries, banana, almond milk, a spoon of chia',
      },
    ],
  },
  {
    key: 'hair',
    nameAr: 'قوة الشعر',
    nameEn: 'Hair Strength',
    emoji: '💇‍♀️',
    foods: [
      {
        ar: 'البيض — بروتين وكيراتين طبيعي',
        en: 'Eggs — protein and natural keratin',
        emoji: '🥚',
      },
      { ar: 'السبانخ — حديد ضد التساقط', en: 'Spinach — iron against shedding', emoji: '🥬' },
      { ar: 'السلمون — أوميغا ٣ للمعان', en: 'Salmon — omega-3 for shine', emoji: '🐟' },
      { ar: 'العدس — زنك وحديد للجذور', en: 'Lentils — zinc and iron for the roots', emoji: '🍲' },
      {
        ar: 'بذور اليقطين — معادن لصحة الفروة',
        en: 'Pumpkin seeds — minerals for a healthy scalp',
        emoji: '🎃',
      },
    ],
    meals: [
      {
        key: 'hair-1',
        titleAr: 'شوربة العدس الغنية',
        titleEn: 'Iron-Rich Lentil Soup',
        emoji: '🍲',
        ar: 'عدس أحمر مع كركم وليمون',
        en: 'Red lentils with turmeric and lemon',
      },
      {
        key: 'hair-2',
        titleAr: 'طبق القوة',
        titleEn: 'Strength Bowl',
        emoji: '🥙',
        ar: 'بيض مسلوق، سبانخ، أفوكادو، حبوب كاملة',
        en: 'Boiled egg, spinach, avocado, whole grains',
      },
    ],
  },
  {
    key: 'nails',
    nameAr: 'أظافر صحية',
    nameEn: 'Healthy Nails',
    emoji: '💅',
    foods: [
      { ar: 'اللوز — بيوتين ومغنيسيوم', en: 'Almonds — biotin and magnesium', emoji: '🌰' },
      {
        ar: 'الزبادي اليوناني — كالسيوم وبروتين',
        en: 'Greek yogurt — calcium and protein',
        emoji: '🥣',
      },
      { ar: 'البطاطا الحلوة — بيتا كاروتين', en: 'Sweet potato — beta-carotene', emoji: '🍠' },
      { ar: 'الشوفان — حديد ومغنيسيوم', en: 'Oats — iron and magnesium', emoji: '🥣' },
      { ar: 'السمسم — زنك وكالسيوم', en: 'Sesame — zinc and calcium', emoji: '⚪' },
    ],
    meals: [
      {
        key: 'nails-1',
        titleAr: 'شوفان الصباح',
        titleEn: 'Morning Oats',
        emoji: '🥣',
        ar: 'شوفان مع زبادي ولوز ورشة سمسم',
        en: 'Oats with yogurt, almonds and a sprinkle of sesame',
      },
      {
        key: 'nails-2',
        titleAr: 'سناك الجمال',
        titleEn: 'Beauty Snack',
        emoji: '🍠',
        ar: 'بطاطا حلوة مشوية مع ملعقة طحينة',
        en: 'Roasted sweet potato with a spoon of tahini',
      },
    ],
  },
  {
    key: 'energy',
    nameAr: 'طاقة ونشاط',
    nameEn: 'Energy & Vitality',
    emoji: '⚡',
    foods: [
      {
        ar: 'الموز — بوتاسيوم وطاقة سريعة',
        en: 'Banana — potassium and quick energy',
        emoji: '🍌',
      },
      { ar: 'الشوفان — طاقة بطيئة تدوم', en: 'Oats — slow energy that lasts', emoji: '🥣' },
      { ar: 'التمر — سكر طبيعي متوازن', en: 'Dates — balanced natural sugar', emoji: '🌴' },
      {
        ar: 'الماء — الترطيب أول أسباب الخمول',
        en: 'Water — dehydration is the first cause of fatigue',
        emoji: '💧',
      },
      {
        ar: 'الشاي الأخضر — كافيين لطيف ومركز',
        en: 'Green tea — gentle, focused caffeine',
        emoji: '🍵',
      },
    ],
    meals: [
      {
        key: 'energy-1',
        titleAr: 'فطور الطاقة',
        titleEn: 'Power Breakfast',
        emoji: '🍳',
        ar: 'شوفان، موز، تمر، ملعقة عسل',
        en: 'Oats, banana, dates, a spoon of honey',
      },
      {
        key: 'energy-2',
        titleAr: 'سناك الظهيرة',
        titleEn: 'Afternoon Boost',
        emoji: '🍌',
        ar: 'موز مع ملعقة زبدة فول سوداني',
        en: 'Banana with a spoon of peanut butter',
      },
    ],
  },
  {
    key: 'weight',
    nameAr: 'وزن صحي',
    nameEn: 'Healthy Weight',
    emoji: '🌱',
    foods: [
      {
        ar: 'الخضار الورقية — شبع بلا سعرات',
        en: 'Leafy greens — fullness without calories',
        emoji: '🥬',
      },
      {
        ar: 'البروتين الخفيف — صدور دجاج أو بقول',
        en: 'Lean protein — chicken breast or legumes',
        emoji: '🍗',
      },
      { ar: 'الشوربات — شبع وترطيب', en: 'Soups — satiety and hydration', emoji: '🍜' },
      { ar: 'التفاح — ألياف تبطئ الجوع', en: 'Apples — fiber that slows hunger', emoji: '🍎' },
      {
        ar: 'الماء قبل الوجبة — يقلل الكمية',
        en: 'Water before meals — reduces portions',
        emoji: '💧',
      },
    ],
    meals: [
      {
        key: 'weight-1',
        titleAr: 'طبق التوازن',
        titleEn: 'Balance Plate',
        emoji: '🥗',
        ar: 'نصف خضار، ربع بروتين خفيف، ربع حبوب كاملة',
        en: 'Half vegetables, a quarter lean protein, a quarter whole grains',
      },
      {
        key: 'weight-2',
        titleAr: 'شوربة الخضار الدافئة',
        titleEn: 'Warm Veggie Soup',
        emoji: '🍜',
        ar: 'كوسة، جزر، كرفس مع شبت وليمون',
        en: 'Zucchini, carrot, celery with dill and lemon',
      },
    ],
  },
];

/** Goal → nutrition card; unknown goal falls back to glow. */
export function getNutritionForGoal(goal?: string | null): NutritionGoal {
  return (
    NUTRITION_LIBRARY.find((g) => g.key === goal) ??
    NUTRITION_LIBRARY.find((g) => g.key === 'glow')!
  );
}
