'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupDewyCard({
  className = '',
  heading = 'مكياج ندِي',
  subtitle = 'إشراقة طبيعية رطبة',
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
        'rounded-2xl border border-sky-100 bg-white p-4 dark:border-sky-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{heading}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'ترطيب عميق — أساس المكياج الندي',
              en: 'Deep hydration — the base of dewy makeup',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'هايلايتر سائل — يخلط مع الفاونديشن',
              en: 'Liquid highlighter — mix with foundation',
            },
          },
          {
            emoji: '',
            text: { ar: 'فاونديشن مضيء — وليس مطفي', en: 'Luminous foundation — not matte' },
          },
          {
            emoji: '',
            text: { ar: 'سبراي مرطب — لتثبيت اللمعة', en: 'Hydrating mist — to lock in the glow' },
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
