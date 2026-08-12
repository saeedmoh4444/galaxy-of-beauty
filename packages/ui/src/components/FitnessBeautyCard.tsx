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
  title: string;
  tips: string[];
}

const WORKOUTS: Record<WorkoutType, WorkoutDef> = {
  gym: {
    emoji: '️',
    title: 'تمارين القوة',
    tips: [
      'اغسلي وجهكِ فوراً بعد التمرين',
      'استخدمي تونر منعش',
      'رطبي بشرتكِ جيداً',
      'لا تلمسي وجهكِ أثناء التمرين',
    ],
  },
  yoga: {
    emoji: '',
    title: 'يوغا',
    tips: [
      'نظفي بشرتكِ قبل الجلسة',
      'استخدمي ربطة شعر ناعمة',
      'اشربي ماء بعد الجلسة',
      'طبقي ماسك مهدئ',
    ],
  },
  running: {
    emoji: '',
    title: 'جري',
    tips: [
      'ضعي واقي شمس قبل الخروج',
      'استخدمي عصابة لامتصاص العرق',
      'اغسلي وجهكِ فور عودتكِ',
      'بردي بشرتكِ بماء الورد',
    ],
  },
  swimming: {
    emoji: '',
    title: 'سباحة',
    tips: [
      'اشطفي شعركِ قبل النزول للمسبح',
      'استخدمي بلسم يترك على الشعر',
      'رطبي جسمكِ بالكامل بعد السباحة',
      'اشربي ماء كثيراً',
    ],
  },
  crossfit: {
    emoji: '',
    title: 'تدريب مكثف',
    tips: [
      'اربطي شعركِ بإحكام',
      'استخدمي مزيل عرق طبيعي',
      'اغسلي جسمكِ فوراً',
      'طبقي كريم مرطب للجسم',
    ],
  },
};

interface FitnessBeautyCardProps {
  workoutType: WorkoutType;
  className?: string;
}

export function FitnessBeautyCard({
  workoutType,
  className = '',
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
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">جمال الرياضة</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
            {w.title} — روتين العناية بعد التمرين
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
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">{tip}</span>
          </div>
        ))}
      </div>

      {/* Quick product recs */}
      <div className="mt-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
           منتجات مقترحة
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {['منظف لطيف', 'تونر منعش', 'مرطب خفيف', 'واقي شمس'].map((p) => (
            <span
              key={p}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         الجمال والصحة وجهان لعملة واحدة
      </p>
    </div>
  );
}
