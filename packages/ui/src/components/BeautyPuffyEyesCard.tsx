'use client';
import { cn } from '@galaxy/shared';
export function BeautyPuffyEyesCard({
  className = '',
  title = 'انتفاخ العيون',
  subtitle = 'صباح منتفخ — حل سريع',
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
            emoji: '',
            text: {
              ar: 'ملعقتان باردتان — على الجفون 5 دقائق',
              en: 'Two cold spoons — on the eyelids for 5 minutes',
            },
          },
          {
            emoji: '🫖',
            text: {
              ar: 'أكياس شاي أخضر — كافيين يقلص الانتفاخ',
              en: 'Green tea bags — caffeine constricts puffiness',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'نامي على وسادة مرتفعة — تقلل تجمع السوائل',
              en: 'Sleep on an elevated pillow — reduces fluid pooling',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريم عيون بكافيين — نتائج فورية',
              en: 'A caffeine eye cream — instant results',
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
