'use client';
import { cn } from '@galaxy/shared';
export function BeautyVeganBeautyCard({
  className = '',
  locale = 'ar',
  title = 'الجمال النباتي',
  subtitle = 'منتجات خالية من المكونات الحيوانية',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-green-100 bg-white p-4 dark:border-green-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-green-700 dark:text-green-300">{title}</h4>
          <p className="text-[10px] text-green-500 dark:text-green-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بدون مكونات حيوانية — شمع عسل، لانولين، كولاجين',
              en: 'No animal ingredients — beeswax, lanolin, collagen',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'بدائل نباتية — شمع الصويا، زبدة الشيا',
              en: 'Plant-based alternatives — soy wax, shea butter',
            },
          },
          {
            emoji: '',
            text: { ar: 'ابحثي عن شعار Vegan Certified', en: 'Look for the Vegan Certified logo' },
          },
          {
            emoji: '',
            text: {
              ar: 'نباتي ≠ طبيعي — اقرئي المكونات',
              en: 'Vegan ≠ natural — read the ingredients',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-green-800 dark:text-green-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
