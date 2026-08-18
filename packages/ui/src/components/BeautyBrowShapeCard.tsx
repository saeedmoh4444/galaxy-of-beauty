'use client';
import { cn } from '@galaxy/shared';
export function BeautyBrowShapeCard({
  className = '',
  title = 'شكل الحواجب',
  subtitle = 'الحاجب المناسب لشكل وجهكِ',
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
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '',
            label: { ar: 'بيضاوي', en: 'Oval' },
            tip: { ar: 'حواجب طبيعية — قوس ناعم', en: 'Natural brows — a soft arch' },
          },
          {
            emoji: '',
            label: { ar: 'دائري', en: 'Round' },
            tip: { ar: 'قوس مرتفع — يطيل الوجه', en: 'High arch — elongates the face' },
          },
          {
            emoji: '⬜',
            label: { ar: 'مربع', en: 'Square' },
            tip: { ar: 'زوايا حادة — توازن الفك', en: 'Angled brows — balance the jaw' },
          },
          {
            emoji: '️',
            label: { ar: 'قلب', en: 'Heart' },
            tip: { ar: 'حواجب مقوسة — تلطف الجبهة', en: 'Arched brows — soften the forehead' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
