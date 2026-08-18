'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Scarf Card — hijab and scarf styling tips.
 * From Phase W4: Sisterhood & Community — Hijabi Beauty.
 */
interface BeautyScarfCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyScarfCard({
  className = '',
  title = 'أناقة الحجاب',
  subtitle = 'أفكار لتنسيق حجابك',
  locale = 'ar',
}: BeautyScarfCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-4 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
          <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'ألوان متناسقة', en: 'Matching colors' },
            tip: { ar: 'الحجاب مع لون الفستان', en: 'Scarf matching the dress color' },
          },
          {
            emoji: '',
            label: { ar: 'تثبيت محكم', en: 'Secure pinning' },
            tip: { ar: 'دبابيس غير ظاهرة', en: 'Invisible pins' },
          },
          {
            emoji: '',
            label: { ar: 'بطانة حرير', en: 'Silk lining' },
            tip: { ar: 'تحمي الشعر من التكسر', en: 'Protects hair from breakage' },
          },
          {
            emoji: '',
            label: { ar: 'تغيير الأسلوب', en: 'Switch up your style' },
            tip: { ar: 'جربي لفات جديدة', en: 'Try new wrapping styles' },
          },
        ].map((t) => (
          <div
            key={t.label.ar}
            className="rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
