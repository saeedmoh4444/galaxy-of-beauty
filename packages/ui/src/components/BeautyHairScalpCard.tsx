'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairScalpCard({
  className = '',
  title = 'فروة الرأس',
  subtitle = 'بشرة صحية = شعر صحي',
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
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">‍️</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: { ar: 'تقشير فروة الرأس — مرة شهرياً', en: 'Scalp exfoliation — once a month' },
          },
          {
            emoji: '',
            text: {
              ar: 'تدليك يومي — 5 دقائق بزيت دافئ',
              en: 'Daily massage — 5 minutes with warm oil',
            },
          },
          { emoji: '️', text: { ar: 'ماء فاتر — ليس ساخناً', en: 'Lukewarm water — not hot' } },
          {
            emoji: '',
            text: { ar: 'سيروم لفروة الرأس — قبل النوم', en: 'Scalp serum — before bed' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-teal-800 dark:text-teal-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
