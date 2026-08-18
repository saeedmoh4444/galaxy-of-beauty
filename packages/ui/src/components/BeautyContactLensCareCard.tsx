'use client';
import { cn } from '@galaxy/shared';
export function BeautyContactLensCareCard({
  className = '',
  title = 'العدسات والمكياج',
  subtitle = 'عناية آمنة لعيون جميلة',
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
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'العدسات أولاً — ثم المكياج',
              en: 'Lenses first — then makeup',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قطرات مرطبة — قبل وبعد المكياج',
              en: 'Moisturizing drops — before and after makeup',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تجنبي الجليتر — يسقط في العين',
              en: 'Avoid glitter — it can fall into the eye',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'جديدي الماسكارا — كل 3 أشهر',
              en: 'Replace mascara — every 3 months',
            },
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
