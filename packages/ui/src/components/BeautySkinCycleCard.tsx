'use client';
import { cn } from '@galaxy/shared';
export function BeautySkinCycleCard({
  className = '',
  subtitle = 'روتين 4 ليالٍ متجدد',
  locale = 'ar',
}: {
  className?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">Skin Cycling</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'ليلة 1: تقشير — AHA/BHA', en: 'Night 1: Exfoliate — AHA/BHA' },
          },
          {
            emoji: '',
            text: { ar: 'ليلة 2: ريتينول — مكافحة الشيخوخة', en: 'Night 2: Retinol — anti-aging' },
          },
          {
            emoji: '',
            text: { ar: 'ليلة 3: ترطيب — إصلاح البشرة', en: 'Night 3: Moisturize — skin repair' },
          },
          {
            emoji: '',
            text: { ar: 'ليلة 4: ترطيب — إصلاح البشرة', en: 'Night 4: Moisturize — skin repair' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-200 text-[9px] font-bold text-violet-700 dark:bg-violet-800 dark:text-violet-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
