'use client';
import { cn } from '@galaxy/shared';
export function BeautyTravelClimateCard({
  className = '',
  locale = 'ar',
  title = 'عناية المسافرة',
  subtitle = 'بشرتكِ بين المناخات',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
          <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '🧴',
            text: {
              ar: 'منتجات متعددة — ترطب وتحمي في آن واحد',
              en: 'Multi-purpose products — moisturize and protect at once',
            },
          },
          {
            emoji: '💧',
            text: {
              ar: 'اشربي ماء في الطائرة — الجو جاف جداً',
              en: 'Drink water on the plane — the air is very dry',
            },
          },
          {
            emoji: '🧖',
            text: {
              ar: 'قناع ورقي — في الطائرة لترطيب فوري',
              en: 'A sheet mask — on the plane for instant hydration',
            },
          },
          {
            emoji: '🧳',
            text: {
              ar: 'عدلي روتينك — حسب مناخ وجهتك',
              en: "Adjust your routine — to your destination's climate",
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-brand-800 dark:text-brand-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
