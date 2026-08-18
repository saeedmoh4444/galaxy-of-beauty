'use client';
import { cn } from '@galaxy/shared';
export function BeautySweatProofCard({
  className = '',
  locale = 'ar',
  title = 'مكياج مقاوم للعرق',
  subtitle = 'إطلالة ثابتة أثناء التمرين',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
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
              ar: 'برايمر مات — أساس أي مكياج رياضي',
              en: 'Matte primer — the base of any workout makeup',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تينت شفاه وخدود — بدل الكريمي الثقيل',
              en: 'Lip and cheek tint — instead of heavy cream',
            },
          },
          {
            emoji: '️',
            text: { ar: 'ماسكارا مقاومة للماء — ضرورية', en: 'Waterproof mascara — a must' },
          },
          {
            emoji: '',
            text: { ar: 'ورق نشاف — للما بعد التمرين', en: 'Blotting paper — for post-workout' },
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
