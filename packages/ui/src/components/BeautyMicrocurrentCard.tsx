'use client';
import { cn } from '@galaxy/shared';
export function BeautyMicrocurrentCard({
  className = '',
  title = 'المايكروكرنت',
  subtitle = 'تيار كهربائي خفيف — شد فوري',
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
              ar: 'يحفز العضلات — يشد ملامح الوجه',
              en: 'Stimulates muscles — firms facial contours',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'يحرك للأعلى وللخارج — ضد الجاذبية',
              en: 'Move upward and outward — against gravity',
            },
          },
          {
            emoji: '️',
            text: { ar: '5-10 دقائق — 3-4 مرات أسبوعياً', en: '5-10 minutes — 3-4 times a week' },
          },
          {
            emoji: '',
            text: {
              ar: 'جل موصل — ضروري لتوصيل التيار',
              en: 'Conductive gel — essential for current flow',
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
