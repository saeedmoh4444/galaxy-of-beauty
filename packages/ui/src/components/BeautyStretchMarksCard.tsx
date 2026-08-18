'use client';
import { cn } from '@galaxy/shared';
export function BeautyStretchMarksCard({
  className = '',
  locale = 'ar',
  title = 'علامات التمدد',
  subtitle = 'علاج وتخفيف الخطوط',
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
        <span className="text-xl">〰️</span>
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
              ar: 'زبدة الكاكاو — ترطيب يومي أثناء الحمل',
              en: 'Cocoa butter — daily moisture during pregnancy',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'زيت ثمر الورد — يحسن مظهر العلامات',
              en: 'Rosehip oil — improves the appearance of marks',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مايكرونيدلنغ — لتحفيز الكولاجين',
              en: 'Microneedling — to stimulate collagen',
            },
          },
          {
            emoji: '',
            text: { ar: 'العلاج المبكر — أفضل النتائج', en: 'Early treatment — best results' },
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
