'use client';

import { cn } from '@galaxy/shared';

interface BeautyConfidenceCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyConfidenceCard({
  className = '',
  title = 'ثقة وجمال',
  subtitle = 'الجمال الحقيقي يبدأ من الداخل. ثقتكِ بنفسكِ هي أجمل ما يمكن أن ترتديه.',
  locale = 'ar',
}: BeautyConfidenceCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-5 dark:border-fuchsia-900 dark:from-fuchsia-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-4xl"></span>
        <h4 className="mt-1 text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">{title}</h4>
        <p className="mt-2 text-xs leading-relaxed text-fuchsia-700 dark:text-fuchsia-300">
          {subtitle}
        </p>
        <div className="mt-3 space-y-1.5">
          {[
            {
              ar: 'أنتِ فريدة — لا تقارني نفسكِ بأحد',
              en: 'You are unique — do not compare yourself to anyone',
            },
            { ar: 'عيوبكِ جزء من جمالكِ', en: 'Your flaws are part of your beauty' },
            { ar: 'ابتسمي — العالم يحتاج نوركِ', en: 'Smile — the world needs your light' },
            { ar: 'كوني فخورة بكل ما أنجزته', en: 'Be proud of everything you have accomplished' },
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-gray-800/60"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-200 text-[9px] font-bold text-fuchsia-700 dark:bg-fuchsia-800 dark:text-fuchsia-300">
                {i + 1}
              </span>
              <span className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">
                {t[locale]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
