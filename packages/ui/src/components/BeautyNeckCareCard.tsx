'use client';
import { cn } from '@galaxy/shared';
export function BeautyNeckCareCard({
  className = '',
  title = 'عناية الرقبة',
  subtitle = 'لا تهمليها — تظهر العمر قبل الوجه',
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
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'مددي منتجات الوجه للأسفل — الرقبة والصدر',
              en: 'Extend face products downward — neck and chest',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كريمات مشدودة — ببتيدات وريتينول',
              en: 'Firming creams — peptides and retinol',
            },
          },
          {
            emoji: '️',
            text: { ar: 'واقي شمس — للرقبة أيضاً', en: 'Sunscreen — for the neck too' },
          },
          {
            emoji: '️',
            text: {
              ar: 'نامي على الظهر — تجاعيد النوم على الجانب',
              en: 'Sleep on your back — side-sleeping creases',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-amber-800 dark:text-amber-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
