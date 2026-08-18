'use client';
import { cn } from '@galaxy/shared';
export function BeautyHairWashCard({
  className = '',
  title = 'غسيل الشعر',
  subtitle = 'الطريقة الصحيحة',
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
              ar: 'بللي الشعر تماماً — 1-2 دقيقة',
              en: 'Wet the hair thoroughly — for 1-2 minutes',
            },
          },
          { emoji: '', text: { ar: 'الشامبو لفروة الرأس فقط', en: 'Shampoo the scalp only' } },
          {
            emoji: '',
            text: {
              ar: 'البلسم للأطراف فقط — وليس الجذور',
              en: 'Conditioner on the ends only — not the roots',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'اشطفي بماء بارد — يغلق البشرة ويضيف لمعان',
              en: 'Rinse with cold water — seals the cuticle and adds shine',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 dark:bg-sky-950"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[9px] font-bold text-sky-700 dark:bg-sky-800 dark:text-sky-300">
              {i + 1}
            </span>
            <span className="text-[10px] text-sky-800 dark:text-sky-200">{t.text[locale]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
