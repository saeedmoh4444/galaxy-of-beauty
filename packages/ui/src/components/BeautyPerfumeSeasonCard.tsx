'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeSeasonCard({
  className = '',
  title = 'العطر والموسم',
  subtitle = 'أي عطر في أي فصل',
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
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'ربيع', en: 'Spring' },
            tip: { ar: 'زهري، أخضر، منعش', en: 'Floral, green, fresh' },
          },
          {
            emoji: '️',
            label: { ar: 'صيف', en: 'Summer' },
            tip: { ar: 'حمضيات، بحري، خفيف', en: 'Citrus, marine, light' },
          },
          {
            emoji: '',
            label: { ar: 'خريف', en: 'Autumn' },
            tip: { ar: 'خشبي، حار، دافئ', en: 'Woody, spicy, warm' },
          },
          {
            emoji: '️',
            label: { ar: 'شتاء', en: 'Winter' },
            tip: { ar: 'شرقي، ثقيل، مسك', en: 'Oriental, heavy, musky' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-sky-600 dark:text-sky-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
