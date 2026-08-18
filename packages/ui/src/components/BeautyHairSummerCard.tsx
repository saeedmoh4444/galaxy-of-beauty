'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairSummerCard({
  className = '',
  title = 'الشعر في الصيف',
  subtitle = 'حماية الشعر من الشمس والبحر',
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
        'rounded-2xl border border-yellow-100 bg-white p-4 dark:border-yellow-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{title}</h4>
          <p className="text-[10px] text-yellow-500 dark:text-yellow-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'واقي شعر SPF — قبل التعرض للشمس',
              en: 'SPF hair protectant — before sun exposure',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'قبعة واسعة — تحمي الشعر وفروة الرأس',
              en: 'A wide hat — protects the hair and scalp',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اشطفي الشعر بماء عذب قبل وبعد البحر',
              en: 'Rinse the hair with fresh water before and after the sea',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ترطيب مكثف — الشمس تجفف الشعر',
              en: 'Intense hydration — the sun dries out hair',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-yellow-800 dark:text-yellow-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
