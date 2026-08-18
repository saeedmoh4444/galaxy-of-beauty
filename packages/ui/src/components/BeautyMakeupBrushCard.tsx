'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupBrushCard({
  className = '',
  heading = 'فرش المكياج',
  subtitle = 'دليل التنظيف والاستخدام',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{heading}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'نظفي الفرش أسبوعياً — بشامبو أطفال',
              en: 'Wash brushes weekly — with baby shampoo',
            },
          },
          {
            emoji: '️',
            text: { ar: 'جففيها أفقياً — لا عمودياً', en: 'Dry them flat — not standing up' },
          },
          {
            emoji: '',
            text: { ar: 'استبدلي الفرش كل 6-12 شهر', en: 'Replace brushes every 6-12 months' },
          },
          {
            emoji: '',
            text: { ar: 'لا تشاركي فرشك مع أحد', en: 'Never share your brushes' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
