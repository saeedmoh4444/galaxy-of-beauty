'use client';
import { cn } from '@galaxy/shared';
export function BeautySheetMaskCard({
  className = '',
  title = 'قناع الورقة',
  subtitle = 'علاج مكثف في 15 دقيقة',
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
              ar: 'بعد التنظيف — البشرة النظيفة تمتص أفضل',
              en: 'After cleansing — clean skin absorbs better',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '15-20 دقيقة — لا تتركيه حتى يجف',
              en: '15-20 minutes — do not let it dry out',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'دلكي الفائض — لا تغسلي وجهك بعده',
              en: 'Massage in the excess — do not rinse after',
            },
          },
          {
            emoji: '',
            text: { ar: '2-3 مرات أسبوعياً — لا يومياً', en: '2-3 times a week — not daily' },
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
