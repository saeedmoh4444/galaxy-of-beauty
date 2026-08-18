'use client';
import { cn } from '@galaxy/shared';
export function BeautyChlorophyllCard({
  className = '',
  title = 'الكلوروفيل',
  subtitle = 'دم النبات الأخضر — لبشرة نقية',
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
        <span className="text-xl"></span>
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
              ar: 'ينقي البشرة من الداخل — يقلل الحبوب',
              en: 'Purifies skin from within — reduces breakouts',
            },
          },
          {
            emoji: '🩸',
            text: {
              ar: 'يشبه الهيموجلوبين — ينقي الدم',
              en: 'Resembles hemoglobin — purifies the blood',
            },
          },
          {
            emoji: '',
            text: {
              ar: '15 قطرة في كوب ماء — صباحاً',
              en: '15 drops in a glass of water — in the morning',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'طبيعي 100% — مستخلص من البرسيم',
              en: '100% natural — extracted from alfalfa',
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
