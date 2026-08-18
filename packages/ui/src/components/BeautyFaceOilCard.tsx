'use client';
import { cn } from '@galaxy/shared';
export function BeautyFaceOilCard({
  className = '',
  title = 'زيت الوجه',
  subtitle = 'هل هو مناسب لبشرتك؟',
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
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🫒</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'دهنية', en: 'Oily' },
            tip: { ar: 'تجنبي — أو زيت خفيف جداً', en: 'Avoid — or a very light oil' },
          },
          {
            emoji: '',
            label: { ar: 'جافة', en: 'Dry' },
            tip: { ar: 'ممتاز — زيوت غنية', en: 'Excellent — rich oils' },
          },
          {
            emoji: '',
            label: { ar: 'وقت الاستخدام', en: 'When to use' },
            tip: { ar: 'آخر خطوة في المساء', en: 'Last step in the evening' },
          },
          {
            emoji: '🫒',
            label: { ar: 'أنواع', en: 'Types' },
            tip: { ar: 'أرغان، جوجوبا، ثمر الورد', en: 'Argan, jojoba, rosehip' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
