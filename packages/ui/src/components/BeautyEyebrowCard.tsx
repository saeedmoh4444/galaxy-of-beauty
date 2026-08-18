'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Eyebrow Card — eyebrow shaping & care tips.
 * From Phase W6: Education & Empowerment.
 */

interface BeautyEyebrowCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyEyebrowCard({
  className = '',
  title = 'عناية بالحواجب',
  subtitle = 'حواجب متناسقة — إطار الوجه',
  locale = 'ar',
}: BeautyEyebrowCardProps): JSX.Element {
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
            label: { ar: 'تحديد الشكل', en: 'Shape them' },
            tip: {
              ar: 'لا تتبعي الصيحة — اتبعي شكل وجهك',
              en: 'Do not follow trends — follow your face shape',
            },
          },
          {
            emoji: '🪞',
            label: { ar: 'لا تنتفي كثيراً', en: 'Do not over-pluck' },
            tip: { ar: 'الشعر قد لا ينمو مجدداً', en: 'Hair may not grow back' },
          },
          {
            emoji: '️',
            label: { ar: 'تعبئة الفراغات', en: 'Fill gaps' },
            tip: { ar: 'قلم حواجب بلون مطابق', en: 'A brow pencil in a matching shade' },
          },
          {
            emoji: '',
            label: { ar: 'زيت الخروع', en: 'Castor oil' },
            tip: { ar: 'يساعد على تكثيف الحواجب', en: 'Helps thicken brows' },
          },
        ].map((t) => (
          <div key={t.label.ar} className="rounded-lg bg-amber-50 px-2.5 py-2 dark:bg-amber-950">
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
