'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupEyeCard({
  className = '',
  heading = 'مكياج العيون',
  subtitle = 'تقنيات أساسية',
  locale = 'ar',
}: {
  className?: string;
  heading?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{heading}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'اللون الفاتح — على كامل الجفن', en: 'Light shade — all over the lid' },
          },
          {
            emoji: '',
            text: { ar: 'اللون المتوسط — على الثنية', en: 'Mid shade — in the crease' },
          },
          {
            emoji: '',
            text: {
              ar: 'اللون اللامع — في الزاوية الداخلية',
              en: 'Shimmer shade — in the inner corner',
            },
          },
          {
            emoji: '️',
            text: { ar: 'ادمجي جيداً — لا خطوط قاسية', en: 'Blend well — no harsh lines' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-200 text-[9px] font-bold text-purple-700 dark:bg-purple-800 dark:text-purple-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
