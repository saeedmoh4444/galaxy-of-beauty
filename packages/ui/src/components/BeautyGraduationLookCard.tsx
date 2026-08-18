'use client';
import { cn } from '@galaxy/shared';
export function BeautyGraduationLookCard({
  className = '',
  title = 'إطلالة التخرج',
  subtitle = 'صور تدوم — إطلالة تبقى',
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
      <div className="mt-3 space-y-1">
        {[
          {
            emoji: '',
            text: {
              ar: 'مكياج ثابت — الصور تبقى للأبد',
              en: 'Long-lasting makeup — the photos last forever',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'أحمر شفاه مات — يدوم ولا ينتقل للشهادة',
              en: 'Matte lipstick — lasts and will not smudge on your certificate',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'تسريحة تتحمل القبعة — وتبدو جميلة بدونها',
              en: 'A style that works with the cap — and looks great without it',
            },
          },
          {
            emoji: '️',
            text: {
              ar: 'واقي شمس — الحفل في النهار غالباً',
              en: 'Sunscreen — the ceremony is usually during the day',
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
