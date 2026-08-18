'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincarePeptideCard({
  className = '',
  title = 'الببتيدات',
  subtitle = 'بروتينات صغيرة — نتائج كبيرة',
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
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'تحفز الكولاجين — بشرة أكثر شباباً',
              en: 'Stimulate collagen — more youthful skin',
            },
          },
          {
            emoji: '️',
            text: { ar: 'يمكن استخدامها صباحاً ومساءً', en: 'Can be used morning and evening' },
          },
          {
            emoji: '',
            text: { ar: 'آمنة مع معظم المكونات الأخرى', en: 'Safe with most other ingredients' },
          },
          { emoji: '', text: { ar: 'النتائج تحتاج 4-8 أسابيع', en: 'Results take 4-8 weeks' } },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
