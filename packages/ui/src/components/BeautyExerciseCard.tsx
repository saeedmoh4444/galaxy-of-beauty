'use client';

import { cn } from '@galaxy/shared';

interface BeautyExerciseCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyExerciseCard({
  className = '',
  title = 'رياضة الجمال',
  subtitle = 'الحركة تغذي بشرتك',
  locale = 'ar',
}: BeautyExerciseCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">‍️</span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'مشي 30 دقيقة', en: '30-minute walk' },
            tip: { ar: 'ينشط الدورة الدموية', en: 'Boosts circulation' },
          },
          {
            emoji: '',
            label: { ar: 'يوغا', en: 'Yoga' },
            tip: { ar: 'تقلل التوتر = بشرة أفضل', en: 'Reduces stress = better skin' },
          },
          {
            emoji: '',
            label: { ar: 'سباحة', en: 'Swimming' },
            tip: { ar: 'تمرين كامل للجسم', en: 'Full-body workout' },
          },
          {
            emoji: '',
            label: { ar: 'رقص', en: 'Dancing' },
            tip: { ar: 'يفرز هرمونات السعادة', en: 'Releases happiness hormones' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-orange-50 px-2.5 py-2 dark:bg-orange-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-orange-800 dark:text-orange-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-orange-600 dark:text-orange-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
