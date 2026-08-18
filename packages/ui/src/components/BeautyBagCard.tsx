'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Bag Card — essential beauty bag packing tips.
 * From Phase W9: The Small Details.
 */
interface BeautyBagCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyBagCard({
  className = '',
  title = 'حقيبة الجمال',
  subtitle = 'أساسيات لا تستغني عنها',
  locale = 'ar',
}: BeautyBagCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{title}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'أحمر شفاه', en: 'Lipstick' },
            tip: { ar: 'لون ناعم للإطلالة اليومية', en: 'A soft shade for everyday looks' },
          },
          {
            emoji: '🪞',
            label: { ar: 'مرآة صغيرة', en: 'Small mirror' },
            tip: { ar: 'للمسات السريعة', en: 'For quick touch-ups' },
          },
          {
            emoji: '',
            label: { ar: 'مرطب سفر', en: 'Travel moisturizer' },
            tip: { ar: 'حجم صغير للطوارئ', en: 'A travel size for emergencies' },
          },
          {
            emoji: '️',
            label: { ar: 'واقي شمس', en: 'Sunscreen' },
            tip: { ar: 'Mini size للشنطة', en: 'A mini size for your bag' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-indigo-50 px-2.5 py-2 dark:bg-indigo-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
