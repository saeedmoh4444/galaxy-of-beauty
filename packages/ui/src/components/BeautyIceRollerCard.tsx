'use client';
import { cn } from '@galaxy/shared';
export function BeautyIceRollerCard({
  className = '',
  heading = 'آيس رولر',
  subtitle = 'فوائد الثلج للبشرة',
  locale = 'ar',
}: {
  className?: string;
  heading?: string;
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
          <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">{heading}</h4>
          <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          {
            emoji: '️',
            label: { ar: 'يقلص المسام', en: 'Tightens pores' },
            tip: { ar: 'يغلق المسام بعد التنظيف', en: 'Closes pores after cleansing' },
          },
          {
            emoji: '',
            label: { ar: 'يهدئ البشرة', en: 'Calms the skin' },
            tip: { ar: 'يخفف الاحمرار والالتهاب', en: 'Reduces redness and inflammation' },
          },
          {
            emoji: '',
            label: { ar: 'ينشط الدورة', en: 'Boosts circulation' },
            tip: { ar: 'يمنح البشرة إشراقة فورية', en: 'Gives an instant glow' },
          },
          {
            emoji: '',
            label: { ar: '3 دقائق', en: '3 minutes' },
            tip: { ar: 'صباحاً — قبل المكياج', en: 'In the morning — before makeup' },
          },
        ].map((t, i) => (
          <div key={i} className="rounded-lg bg-sky-50 px-2.5 py-2 dark:bg-sky-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-200">
              {t.label[locale]}
            </p>
            <p className="text-[9px] text-sky-600 dark:text-sky-400">{t.tip[locale]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
