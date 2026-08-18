'use client';
import { cn } from '@galaxy/shared';
export function BeautySkinFastingCard({
  className = '',
  title = 'صيام البشرة',
  subtitle = 'اتركي بشرتك تتنفس',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'يوم في الأسبوع — بدون أي منتجات',
              en: 'One day a week — with no products at all',
            },
          },
          { emoji: '', text: { ar: 'ماء فقط — للتنظيف', en: 'Water only — for cleansing' } },
          {
            emoji: '',
            text: { ar: 'دعي بشرتك تتوازن طبيعياً', en: 'Let your skin rebalance naturally' },
          },
          {
            emoji: '',
            text: { ar: 'مناسب لجميع أنواع البشرة', en: 'Suitable for all skin types' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
