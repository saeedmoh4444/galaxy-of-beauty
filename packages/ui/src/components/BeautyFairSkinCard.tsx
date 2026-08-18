'use client';
import { cn } from '@galaxy/shared';
export function BeautyFairSkinCard({
  className = '',
  title = 'البشرة الفاتحة',
  subtitle = 'عناية خاصة بالبشرة الفاتحة',
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
              ar: 'SPF 50+ — البشرة الفاتحة تحترق بسرعة',
              en: 'SPF 50+ — fair skin burns quickly',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ميل للاحمرار — منتجات مهدئة بالسنيتلا',
              en: 'Prone to redness — soothing products with cica',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ألوان: وردي، خوخي، بيج فاتح — تجنبي البرونزي',
              en: 'Shades: pink, peach, light beige — avoid bronzy tones',
            },
          },
          {
            emoji: '',
            text: { ar: 'هايلايتر شمباني — وليس ذهبي', en: 'Champagne highlighter — not gold' },
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
