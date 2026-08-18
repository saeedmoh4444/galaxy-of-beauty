'use client';
import { cn } from '@galaxy/shared';
export function BeautyVampireFacialCard({
  className = '',
  locale = 'ar',
  title = 'فيشل البلازما',
  subtitle = 'PRP — بلازما دمكِ لجمالكِ',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-red-100 bg-white p-4 dark:border-red-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🩸</span>
        <div>
          <h4 className="text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
          <p className="text-[10px] text-red-500 dark:text-red-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'تسحب عينة دم — ثم تستخلص البلازما',
              en: 'A blood sample is drawn — then plasma is extracted',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'حقن البلازما — تحفز الكولاجين بقوة',
              en: 'Plasma injection — strongly boosts collagen',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'نتائج طبيعية 100% — من جسمكِ',
              en: '100% natural results — from your own body',
            },
          },
          { emoji: '️', text: { ar: '3-4 جلسات — بينها شهر', en: '3-4 sessions — a month apart' } },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-red-800 dark:text-red-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
