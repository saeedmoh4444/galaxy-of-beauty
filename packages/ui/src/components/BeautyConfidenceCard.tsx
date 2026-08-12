'use client';

import { cn } from '@galaxy/shared';

interface BeautyConfidenceCardProps {
  className?: string;
}

export function BeautyConfidenceCard({ className = '' }: BeautyConfidenceCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-5 dark:border-fuchsia-900 dark:from-fuchsia-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-4xl">💪</span>
        <h4 className="mt-1 text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">ثقة وجمال</h4>
        <p className="mt-2 text-xs leading-relaxed text-fuchsia-700 dark:text-fuchsia-300">
          الجمال الحقيقي يبدأ من الداخل. ثقتكِ بنفسكِ هي أجمل ما يمكن أن ترتديه.
        </p>
        <div className="mt-3 space-y-1.5">
          {[
            'أنتِ فريدة — لا تقارني نفسكِ بأحد',
            'عيوبكِ جزء من جمالكِ',
            'ابتسمي — العالم يحتاج نوركِ',
            'كوني فخورة بكل ما أنجزته',
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-gray-800/60"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-200 text-[9px] font-bold text-fuchsia-700 dark:bg-fuchsia-800 dark:text-fuchsia-300">
                {i + 1}
              </span>
              <span className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
