'use client';

import { cn } from '@galaxy/shared';

interface BeautySelfMassageCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautySelfMassageCard({
  className = '',
  title = 'مساج ذاتي',
  subtitle = '5 دقائق يومياً لبشرة مشرقة',
  locale = 'ar',
}: BeautySelfMassageCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">‍️</span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {[
          {
            emoji: '',
            name: { ar: 'تدليك دائري', en: 'Circular massage' },
            desc: { ar: 'بأطراف الأصابع على الوجنتين', en: 'With fingertips on the cheeks' },
          },
          {
            emoji: '️',
            name: { ar: 'رفع الجبهة', en: 'Forehead lift' },
            desc: { ar: 'من الحواجب لأعلى — 10 مرات', en: 'From brows upward — 10 times' },
          },
          {
            emoji: '',
            name: { ar: 'تدليك الفك', en: 'Jaw massage' },
            desc: { ar: 'حركات دائرية على مفصل الفك', en: 'Circular motions on the jaw joint' },
          },
          {
            emoji: '️',
            name: { ar: 'منطقة العين', en: 'Eye area' },
            desc: { ar: 'تربيت خفيف — لا تسحبِ', en: 'Gentle patting — do not pull' },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-rose-800 dark:text-rose-200">
                {t.name[locale]}
              </p>
              <p className="text-[9px] text-rose-600 dark:text-rose-400">{t.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
