'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailShapeCard({
  className = '',
  title = 'أشكال الأظافر',
  subtitle = 'أي شكل يناسب يدك؟',
  locale = 'ar',
}: {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'دائري', en: 'Round' },
            tip: { ar: 'لأصابع قصيرة', en: 'For short fingers' },
          },
          {
            emoji: '⬜',
            label: { ar: 'مربع', en: 'Square' },
            tip: { ar: 'لأصابع طويلة', en: 'For long fingers' },
          },
          {
            emoji: '',
            label: { ar: 'بيضاوي', en: 'Oval' },
            tip: { ar: 'يناسب الجميع', en: 'Suits everyone' },
          },
          {
            emoji: '',
            label: { ar: 'لوزي', en: 'Almond' },
            tip: { ar: 'يطول الأصابع', en: 'Lengthens the fingers' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-rose-50 px-2.5 py-2 dark:bg-rose-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-rose-800 dark:text-rose-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
