'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairTrimCard({
  className = '',
  title = 'قص الأطراف',
  subtitle = 'كم مرة ولماذا',
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
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-pink-700 dark:text-pink-300">{title}</h4>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'كل 8-12 أسبوع — حتى لو تطولينه',
              en: 'Every 8-12 weeks — even if you are growing it out',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'الأطراف المتقصفة لا تصلح — قصيها',
              en: 'Split ends cannot be repaired — trim them',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'القص المنتظم = شعر أكثر كثافة',
              en: 'Regular trims = thicker-looking hair',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تحتاجين صالون — يمكنكِ قصه في البيت',
              en: 'No salon needed — you can trim it at home',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-pink-800 dark:text-pink-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
