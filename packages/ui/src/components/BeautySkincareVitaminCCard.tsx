'use client';
import { cn } from '@galaxy/shared';
export function BeautySkincareVitaminCCard({
  className = '',
  title = 'فيتامين سي',
  subtitle = 'مضاد الأكسدة الأقوى',
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
        'rounded-2xl border border-orange-100 bg-white p-4 dark:border-orange-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300">{title}</h4>
          <p className="text-[10px] text-orange-500 dark:text-orange-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: { ar: 'صباحاً — قبل واقي الشمس', en: 'In the morning — before sunscreen' },
          },
          {
            emoji: '',
            text: {
              ar: 'يفتح التصبغات ويوحد اللون',
              en: 'Fades hyperpigmentation and evens skin tone',
            },
          },
          { emoji: '️', text: { ar: 'يعزز حماية واقي الشمس', en: 'Boosts sunscreen protection' } },
          {
            emoji: '',
            text: {
              ar: 'L-Ascorbic Acid — أقوى صيغة',
              en: 'L-Ascorbic Acid — the most potent form',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-orange-800 dark:text-orange-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
