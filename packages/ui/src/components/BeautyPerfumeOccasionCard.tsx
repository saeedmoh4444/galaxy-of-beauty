'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeOccasionCard({
  className = '',
  title = 'العطر والمناسبة',
  subtitle = 'أي عطر لأي وقت',
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
        'rounded-2xl border border-pink-100 bg-white p-4 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'عمل', en: 'Work' },
            tip: { ar: 'خفيف، نظيف، غير مزعج', en: 'Light, clean, unobtrusive' },
          },
          {
            emoji: '',
            label: { ar: 'سهرة', en: 'Evening' },
            tip: { ar: 'شرقي، قوي، جذاب', en: 'Oriental, strong, alluring' },
          },
          {
            emoji: '️',
            label: { ar: 'نهار', en: 'Daytime' },
            tip: { ar: 'حمضيات، أزهار', en: 'Citrus, florals' },
          },
          {
            emoji: '',
            label: { ar: 'مناسبة', en: 'Occasions' },
            tip: { ar: 'فاخر، مميز، يدوم', en: 'Luxurious, distinctive, long-lasting' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-pink-50 px-2.5 py-2 dark:bg-pink-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-pink-800 dark:text-pink-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-pink-600 dark:text-pink-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
