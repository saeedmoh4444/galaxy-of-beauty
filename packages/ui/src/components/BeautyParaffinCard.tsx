'use client';
import { cn } from '@galaxy/shared';
export function BeautyParaffinCard({
  className = '',
  title = 'حمام البارافين',
  subtitle = 'شمع دافئ — أيدي ناعمة',
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
        <span className="text-xl">️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'شمع دافئ — يفتح المسام ويرطب بعمق',
              en: 'Warm wax — opens pores and deeply hydrates',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'يعالج الجفاف — ممتاز للشتاء',
              en: 'Treats dryness — excellent for winter',
            },
          },
          {
            emoji: '️',
            text: {
              ar: '15-20 دقيقة — تغمس الأيدي 3-5 مرات',
              en: '15-20 minutes — dip hands 3-5 times',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'بعد الجلسة — كريم مرطب لليدين',
              en: 'After the session — moisturizing hand cream',
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
