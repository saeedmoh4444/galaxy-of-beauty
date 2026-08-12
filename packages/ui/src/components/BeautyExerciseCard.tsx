'use client';

import { cn } from '@galaxy/shared';

interface BeautyExerciseCardProps {
  className?: string;
}

export function BeautyExerciseCard({ className = '' }: BeautyExerciseCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🏃‍♀️</span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">رياضة الجمال</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">الحركة تغذي بشرتك</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🚶', label: 'مشي 30 دقيقة', tip: 'ينشط الدورة الدموية' },
          { emoji: '🧘', label: 'يوغا', tip: 'تقلل التوتر = بشرة أفضل' },
          { emoji: '🏊', label: 'سباحة', tip: 'تمرين كامل للجسم' },
          { emoji: '💃', label: 'رقص', tip: 'يفرز هرمونات السعادة' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-orange-50 px-2.5 py-2 dark:bg-orange-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-orange-800 dark:text-orange-200">
              {t.label}
            </p>
            <p className="text-[9px] text-orange-600 dark:text-orange-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
