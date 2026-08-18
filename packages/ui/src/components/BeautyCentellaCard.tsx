'use client';
import { cn } from '@galaxy/shared';
export function BeautyCentellaCard({
  className = '',
  title = 'سينتيلا (Cica)',
  subtitle = 'عشبة النمر — مهدئ خارق',
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
              ar: 'يهدئ الالتهابات — ممتاز للبشرة الحساسة',
              en: 'Soothes inflammation — excellent for sensitive skin',
            },
          },
          {
            emoji: '🩹',
            text: {
              ar: 'يسرع التئام الجروح — يحفز الكولاجين',
              en: 'Speeds wound healing — stimulates collagen',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يقلل الاحمرار — بشرة هادئة ومتجانسة',
              en: 'Reduces redness — calm, even skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يقوي حاجز البشرة — يمنع فقدان الرطوبة',
              en: 'Strengthens the skin barrier — prevents moisture loss',
            },
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
