'use client';
import { cn } from '@galaxy/shared';
export function BeautyPerfumeMixingCard({
  className = '',
  title = 'مزج العطور',
  subtitle = 'اصنعي عطرك الخاص',
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
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{title}</h4>
          <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'القاعدة: قاعدة + قلب + نفحة عليا',
              en: 'The rule: base + heart + top notes',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'النسب: 50% قاعدة، 30% قلب، 20% عليا',
              en: 'Ratios: 50% base, 30% heart, 20% top',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'اتركيه 48 ساعة — لتتجانس المكونات',
              en: 'Let it rest 48 hours — for the ingredients to blend',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'زيت جوجوبا — حامل مثالي للزيوت العطرية',
              en: 'Jojoba oil — an ideal carrier for essential oils',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
