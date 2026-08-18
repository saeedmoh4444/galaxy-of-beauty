'use client';
import { cn } from '@galaxy/shared';
export function BeautyJapaneseRoutineCard({
  className = '',
  heading = 'الروتين الياباني',
  subtitle = 'جمال هادئ — بشرة كالخزف',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{heading}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'طبقات خفيفة — لوشن، سيروم، كريم',
              en: 'Light layers — lotion, serum, cream',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس — أساس الجمال الياباني',
              en: 'Sunscreen — the core of Japanese beauty',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مساج الوجه — يومياً لتصريف السوائل',
              en: 'Facial massage — daily to drain fluids',
            },
          },
          {
            emoji: '',
            text: { ar: 'الشاي الأخضر — من الداخل والخارج', en: 'Green tea — inside and out' },
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
