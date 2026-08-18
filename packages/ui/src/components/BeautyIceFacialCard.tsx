'use client';
import { cn } from '@galaxy/shared';
export function BeautyIceFacialCard({
  className = '',
  heading = 'مكعبات الثلج للوجه',
  subtitle = 'سر إشراقة الصباح',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'يقلص المسام — بشرة أنعم فوراً',
              en: 'Tightens pores — instantly smoother skin',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'صباحاً — يقلل الانتفاخ تحت العين',
              en: 'In the morning — reduces under-eye puffiness',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ثلج ماء الورد — مهدئ للبشرة',
              en: 'Rose water ice — soothing for the skin',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '30 ثانية لكل منطقة — لا تطيلي',
              en: "30 seconds per area — don't overdo it",
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
