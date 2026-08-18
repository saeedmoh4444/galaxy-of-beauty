'use client';
import { cn } from '@galaxy/shared';
export function BeautyThirtiesCard({
  className = '',
  locale = 'ar',
  title = 'العناية في الثلاثينات',
  subtitle = 'وقاية وعلاج — بشرة متوازنة',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'ابدئي الريتينول — الكولاجين يبدأ بالانخفاض',
              en: 'Start retinoids — collagen begins to decline',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'كريم عيون — أولى علامات الخطوط الرفيعة',
              en: 'Eye cream — the first signs of fine lines',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تقشير منتظم — مرة أسبوعياً AHA/BHA',
              en: 'Regular exfoliation — once a week AHA/BHA',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'سيروم هيالورونيك — ترطيب مكثف',
              en: 'Hyaluronic serum — intense hydration',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2 dark:bg-purple-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-purple-800 dark:text-purple-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
