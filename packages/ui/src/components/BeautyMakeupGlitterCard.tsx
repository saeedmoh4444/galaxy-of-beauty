'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupGlitterCard({
  className = '',
  heading = 'مكياج لامع',
  subtitle = 'لمسة بريق للمناسبات',
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
        'rounded-2xl border border-yellow-100 bg-white p-4 dark:border-yellow-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{heading}</h4>
          <p className="text-[10px] text-yellow-500 dark:text-yellow-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '️',
            text: {
              ar: 'جليتر على الجفن — فقط في المنتصف',
              en: 'Glitter on the lid — center only',
            },
          },
          {
            emoji: '',
            text: { ar: 'هايلايتر — أعلى الوجنة', en: 'Highlighter — on the top of the cheekbone' },
          },
          {
            emoji: '',
            text: {
              ar: 'قاعدة لاصقة — تثبت الجليتر',
              en: 'Adhesive base — holds the glitter in place',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'شريط لاصق — لإزالة الجليتر بسهولة',
              en: 'Tape — for easy glitter removal',
            },
          },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 dark:bg-yellow-950"
          >
            <span className="text-sm shrink-0">{t.emoji}</span>
            <span className="text-[10px] text-yellow-800 dark:text-yellow-200">
              {t.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
