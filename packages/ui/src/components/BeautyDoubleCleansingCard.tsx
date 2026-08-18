'use client';
import { cn } from '@galaxy/shared';
export function BeautyDoubleCleansingCard({
  className = '',
  title = 'التنظيف المزدوج',
  subtitle = 'السر الكوري لبشرة نظيفة',
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
            emoji: '🫒',
            text: {
              ar: 'الخطوة 1: منظف زيتي — يذيب المكياج والواقي',
              en: 'Step 1: oil cleanser — dissolves makeup and SPF',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'الخطوة 2: منظف مائي — ينظف البشرة بعمق',
              en: 'Step 2: water cleanser — deeply cleanses skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'مساءً فقط — صباحاً اكتفي بغسول واحد',
              en: 'Evenings only — one cleanser in the morning',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'النتيجة: بشرة أنظف وأكثر إشراقاً',
              en: 'Result: cleaner, more radiant skin',
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
