'use client';
import { cn } from '@galaxy/shared';
export function BeautyHandMaskCard({
  className = '',
  title = 'قناع اليدين',
  subtitle = 'سبا منزلي ليديكِ',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كريم كثيف — طبقة سميكة على اليدين',
              en: 'Thick cream — a generous layer on your hands',
            },
          },
          {
            emoji: '',
            text: { ar: 'قفازات قطنية — للنوم طوال الليل', en: 'Cotton gloves — worn overnight' },
          },
          {
            emoji: '',
            text: {
              ar: 'صباحاً — أيدي ناعمة كالحرير',
              en: 'In the morning — hands as soft as silk',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مرة أسبوعياً — أو قبل المناسبات',
              en: 'Once a week — or before special occasions',
            },
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
