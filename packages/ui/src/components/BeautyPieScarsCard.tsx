'use client';
import { cn } from '@galaxy/shared';
export function BeautyPieScarsCard({
  className = '',
  title = 'علامات ما بعد الحبوب',
  subtitle = 'PIH و PIE — الفرق والعلاج',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'PIH: تصبغ بني — فيتامين C وأربيوتين',
              en: 'PIH: brown pigmentation — vitamin C and arbutin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'PIE: احمرار — نيوكسين، أزيليك أسيد',
              en: 'PIE: redness — niacinamide, azelaic acid',
            },
          },
          {
            emoji: '',
            text: { ar: 'ريتينول — يسرع تجدد الخلايا', en: 'Retinol — speeds up cell renewal' },
          },
          {
            emoji: '️',
            text: {
              ar: 'SPF يومي — يمنع تفاقم التصبغات',
              en: 'Daily SPF — prevents pigmentation from worsening',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
