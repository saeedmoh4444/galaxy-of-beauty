'use client';
import { cn } from '@galaxy/shared';
export function BeautyTwentiesCard({
  className = '',
  locale = 'ar',
  title = 'العناية في العشرينات',
  subtitle = 'أساس قوي لمستقبل بشرتك',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{title}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس يومي — أهم استثمار لبشرتك',
              en: 'Daily sunscreen — the most important investment for your skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'روتين أساسي — منظف، مرطب، واقي شمس',
              en: 'Basic routine — cleanser, moisturizer, sunscreen',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'فيتامين C — ابدئي مبكراً لمضادات الأكسدة',
              en: 'Vitamin C — start early for antioxidants',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'لا ريبتينول بعد — بشرتك تنتجه طبيعياً',
              en: 'No retinoids yet — your skin produces it naturally',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
