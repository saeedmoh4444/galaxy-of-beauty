'use client';
import { cn } from '@galaxy/shared';
export function BeautyMakeupEyelinerCard({
  className = '',
  heading = 'الآيلاينر',
  subtitle = 'تقنيات لرسمة مثالية',
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
        <span className="text-xl">️</span>
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
              ar: 'ابدئي من المنتصف — ثم ارسمي الجناح',
              en: 'Start from the middle — then draw the wing',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'القلم أسهل للمبتدئات — جففي بعد الرسم',
              en: 'A pencil is easier for beginners — set it with shadow',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'ارفعي الجفن قليلاً — لخط مستقيم',
              en: 'Gently lift the lid — for a straight line',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'عود قطني بمزيل — لتصحيح الأخطاء',
              en: 'Cotton swab with remover — to fix mistakes',
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
