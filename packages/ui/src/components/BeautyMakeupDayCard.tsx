'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupDayCard({
  className = '',
  heading = 'مكياج النهار',
  subtitle = 'إطلالة طبيعية للعمل والجامعة',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{heading}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'BB كريم أو مرطب ملون — بدل الفاونديشن',
              en: 'BB cream or tinted moisturizer — instead of foundation',
            },
          },
          {
            emoji: '',
            text: { ar: 'كونسيلر — تحت العين فقط', en: 'Concealer — only under the eyes' },
          },
          {
            emoji: '',
            text: { ar: 'بلاش كريمي — يبدو طبيعياً', en: 'Creamy blush — looks natural' },
          },
          {
            emoji: '',
            text: {
              ar: 'أحمر شفاه ب tint — يدوم ويناسب النهار',
              en: 'Lip tint — long-wearing and day-appropriate',
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
