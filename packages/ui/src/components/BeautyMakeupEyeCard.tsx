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
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">👀</span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{heading}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '🤍',
            text: { ar: 'اللون الفاتح — على كامل الجفن', en: 'Light shade — all over the lid' },
          },
          {
            emoji: '🤎',
            text: { ar: 'اللون المتوسط — على الثنية', en: 'Mid shade — in the crease' },
          },
          {
            emoji: '✨',
            text: {
              ar: 'اللون اللامع — في الزاوية الداخلية',
              en: 'Shimmer shade — in the inner corner',
            },
          },
          {
            emoji: '🖌️',
            text: { ar: 'ادمجي جيداً — لا خطوط قاسية', en: 'Blend well — no harsh lines' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-200 text-[9px] font-bold text-brand-700 dark:bg-brand-800 dark:text-brand-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
