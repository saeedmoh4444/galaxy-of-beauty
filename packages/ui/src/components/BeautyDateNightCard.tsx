'use client';
import { cn } from '@galaxy/shared';
export function BeautyDateNightCard({
  className = '',
  title = 'إطلالة الموعد',
  subtitle = 'جاذبية — بدون مبالغة',
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
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'بشرة متوهجة — هايلايتر على عظمة الخد',
              en: 'Glowing skin — highlighter on cheekbones',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'عيون سموكي ناعمة — ألوان دافئة',
              en: 'Soft smoky eyes — warm tones',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شفاه طبيعية — تينت أو لون شفاه شفاف',
              en: 'Natural lips — a tint or clear gloss',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'عطر على نقاط النبض — وراء الأذن والرسغ',
              en: 'Perfume on pulse points — behind ears and wrists',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-rose-800 dark:text-rose-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
