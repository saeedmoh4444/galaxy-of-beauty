'use client';
import { cn } from '@galaxy/shared';
export function BeautyMaternityStyleCard({
  className = '',
  title = 'أناقة الحامل',
  subtitle = 'جميلة — في كل مرحلة',
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
              ar: 'فساتين Empire — تبرز الجمال وليس البطن',
              en: 'Empire dresses — highlight beauty, not the belly',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'إكسسوارات — تشتت الانتباه بأناقة',
              en: 'Accessories — draw attention elegantly',
            },
          },
          {
            emoji: '',
            text: { ar: 'مكياج خفيف — ركزي على العيون', en: 'Light makeup — focus on the eyes' },
          },
          {
            emoji: '',
            text: {
              ar: 'صوري حملكِ — ذكريات جميلة',
              en: 'Capture your pregnancy — beautiful memories',
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
