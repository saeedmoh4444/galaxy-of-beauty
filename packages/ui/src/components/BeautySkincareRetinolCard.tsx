'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincareRetinolCard({
  className = '',
  title = 'الريتينول',
  subtitle = 'المكون السحري للبشرة',
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
              ar: 'مساءً فقط — يتحسس من الشمس',
              en: 'Evenings only — sensitizes in sunlight',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كمية حبة بازلاء — للوجه كله',
              en: 'A pea-sized amount — for the whole face',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ابدئي مرة أسبوعياً — ثم زيدي تدريجياً',
              en: 'Start once a week — then increase gradually',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس في الصباح — ضروري جداً',
              en: 'Sunscreen in the morning — absolutely essential',
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
