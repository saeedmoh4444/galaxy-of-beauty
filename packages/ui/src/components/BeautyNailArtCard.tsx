'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailArtCard({
  className = '',
  title = 'فن الأظافر',
  subtitle = 'أفكار وأساليب',
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
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{title}</h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'فرنسي', en: 'French' },
            tip: { ar: 'كلاسيك — طرف أبيض', en: 'Classic — white tips' },
          },
          {
            emoji: '',
            label: { ar: 'جليتر', en: 'Glitter' },
            tip: { ar: 'لامع — للمناسبات', en: 'Shiny — for events' },
          },
          {
            emoji: '',
            label: { ar: 'Ombre', en: 'Ombre' },
            tip: { ar: 'تدرج لونين', en: 'A gradient of two colors' },
          },
          {
            emoji: '',
            label: { ar: 'طبيعي', en: 'Natural' },
            tip: { ar: 'Nude — لكل يوم', en: 'Nude — for everyday' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-fuchsia-50 px-2.5 py-2 dark:bg-fuchsia-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-fuchsia-800 dark:text-fuchsia-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-fuchsia-600 dark:text-fuchsia-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
