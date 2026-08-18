'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairHeatCard({
  className = '',
  title = 'حماية من الحرارة',
  subtitle = 'احمي شعرك من التلف',
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
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'واقي حراري — دائماً قبل المجفف أو المكواة',
              en: 'Heat protectant — always before the dryer or straightener',
            },
          },
          {
            emoji: '️',
            text: { ar: 'حرارة متوسطة — لا القصوى', en: 'Medium heat — not the maximum' },
          },
          {
            emoji: '',
            text: {
              ar: 'لا تمرري المكواة على نفس الخصلة مرتين',
              en: 'Do not run the straightener over the same strand twice',
            },
          },
          {
            emoji: '',
            text: { ar: 'يوم بدون حرارة في الأسبوع', en: 'One heat-free day per week' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
