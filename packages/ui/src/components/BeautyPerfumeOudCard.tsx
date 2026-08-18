'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeOudCard({
  className = '',
  title = 'دهن العود',
  subtitle = 'ملك العطور الشرقية',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🪵</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'ضعيه على نقاط النبض — قطرة صغيرة تكفي',
              en: 'Apply to pulse points — a tiny drop is enough',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'دفء الجسم — يفوح العطر طوال اليوم',
              en: 'Body warmth — the scent lasts all day',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'العود السعودي — من أفخر الأنواع',
              en: 'Saudi oud — among the finest varieties',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'استثمار — العود الحقيقي ثمين ويدوم',
              en: 'An investment — real oud is precious and long-lasting',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
