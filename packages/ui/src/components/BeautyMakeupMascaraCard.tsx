'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupMascaraCard({
  className = '',
  heading = 'الماسكارا',
  subtitle = 'رموش طويلة وكثيفة',
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
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{heading}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '〰️',
            text: {
              ar: 'حركي العصا بشكل متعرج — من الجذور للأطراف',
              en: 'Wiggle the wand — from roots to tips',
            },
          },
          {
            emoji: '',
            text: { ar: 'جددِي الماسكارا كل 3 أشهر', en: 'Replace your mascara every 3 months' },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تضخي الهواء في الأنبوب — يجففها',
              en: "Don't pump the wand — it dries it out",
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ماسكارا مقاومة للماء = مزيل زيتي',
              en: 'Waterproof mascara = oil-based remover',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
