'use client';

import { cn } from '@galaxy/shared';

/**
 * Fitness Beauty Card — post-workout beauty routine for active women.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <FitnessBeautyCard workoutType="gym" />
 */

type WorkoutType = 'gym' | 'yoga' | 'running' | 'swimming' | 'crossfit';

interface WorkoutDef {
  emoji: string;
  title: { ar: string; en: string };
  tips: { ar: string; en: string }[];
}

const WORKOUTS: Record<WorkoutType, WorkoutDef> = {
  gym: {
    emoji: '️',
    title: { ar: 'تمارين القوة', en: 'Strength training' },
    tips: [
      { ar: 'اغسلي وجهكِ فوراً بعد التمرين', en: 'Wash your face right after the workout' },
      { ar: 'استخدمي تونر منعش', en: 'Use a refreshing toner' },
      { ar: 'رطبي بشرتكِ جيداً', en: 'Moisturize your skin well' },
      { ar: 'لا تلمسي وجهكِ أثناء التمرين', en: 'Do not touch your face during the workout' },
    ],
  },
  yoga: {
    emoji: '',
    title: { ar: 'يوغا', en: 'Yoga' },
    tips: [
      { ar: 'نظفي بشرتكِ قبل الجلسة', en: 'Cleanse your skin before the session' },
      { ar: 'استخدمي ربطة شعر ناعمة', en: 'Use a soft hair tie' },
      { ar: 'اشربي ماء بعد الجلسة', en: 'Drink water after the session' },
      { ar: 'طبقي ماسك مهدئ', en: 'Apply a soothing mask' },
    ],
  },
  running: {
    emoji: '',
    title: { ar: 'جري', en: 'Running' },
    tips: [
      { ar: 'ضعي واقي شمس قبل الخروج', en: 'Apply sunscreen before going out' },
      { ar: 'استخدمي عصابة لامتصاص العرق', en: 'Use a sweatband' },
      { ar: 'اغسلي وجهكِ فور عودتكِ', en: 'Wash your face as soon as you return' },
      { ar: 'بردي بشرتكِ بماء الورد', en: 'Cool your skin with rose water' },
    ],
  },
  swimming: {
    emoji: '',
    title: { ar: 'سباحة', en: 'Swimming' },
    tips: [
      { ar: 'اشطفي شعركِ قبل النزول للمسبح', en: 'Rinse your hair before entering the pool' },
      { ar: 'استخدمي بلسم يترك على الشعر', en: 'Use a leave-in conditioner' },
      { ar: 'رطبي جسمكِ بالكامل بعد السباحة', en: 'Moisturize your whole body after swimming' },
      { ar: 'اشربي ماء كثيراً', en: 'Drink plenty of water' },
    ],
  },
  crossfit: {
    emoji: '',
    title: { ar: 'تدريب مكثف', en: 'Intense training' },
    tips: [
      { ar: 'اربطي شعركِ بإحكام', en: 'Tie your hair tightly' },
      { ar: 'استخدمي مزيل عرق طبيعي', en: 'Use a natural deodorant' },
      { ar: 'اغسلي جسمكِ فوراً', en: 'Wash your body immediately' },
      { ar: 'طبقي كريم مرطب للجسم', en: 'Apply a body moisturizer' },
    ],
  },
};

const PRODUCT_RECS: { ar: string; en: string }[] = [
  { ar: 'منظف لطيف', en: 'Gentle cleanser' },
  { ar: 'تونر منعش', en: 'Refreshing toner' },
  { ar: 'مرطب خفيف', en: 'Light moisturizer' },
  { ar: 'واقي شمس', en: 'Sunscreen' },
];

interface FitnessBeautyCardProps {
  workoutType: WorkoutType;
  className?: string;
  /** Header title */
  title?: string;
  /** Subtitle suffix shown after the workout title */
  subtitle?: string;
  /** Label for the product recommendations section */
  productsLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal workout data strings */
  locale?: 'ar' | 'en';
}

export function FitnessBeautyCard({
  workoutType,
  className = '',
  title = 'جمال الرياضة',
  subtitle = '— روتين العناية بعد التمرين',
  productsLabel = 'منتجات مقترحة',
  footerText = 'الجمال والصحة وجهان لعملة واحدة',
  locale = 'ar',
}: FitnessBeautyCardProps): JSX.Element {
  const w = WORKOUTS[workoutType];

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {w.emoji}
        </span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            {w.title[locale]} {subtitle}
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 space-y-1.5">
        {w.tips.map((tip, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {tip[locale]}
            </span>
          </div>
        ))}
      </div>

      {/* Quick product recs */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          {productsLabel}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {PRODUCT_RECS.map((p) => (
            <span
              key={p.ar}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
            >
              {p[locale]}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
