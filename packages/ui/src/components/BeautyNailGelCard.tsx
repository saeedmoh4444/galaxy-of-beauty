'use client';
import { cn } from '@galaxy/shared';
export function BeautyNailGelCard({
  className = '',
  title = 'جل الأظافر',
  subtitle = 'عناية خاصة للجل',
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
            emoji: '️',
            text: {
              ar: 'لا تعرضي الجل للشمس — يبهت',
              en: 'Do not expose gel to sunlight — it fades',
            },
          },
          {
            emoji: '',
            text: { ar: 'قفازات للتنظيف — تحمي الجل', en: 'Cleaning gloves — protect the gel' },
          },
          {
            emoji: '',
            text: { ar: 'زيّتي البشرة حول الظفر يومياً', en: 'Oil the skin around the nail daily' },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تقشري الجل — يضعف الظفر',
              en: 'Do not peel the gel — it weakens the nail',
            },
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
