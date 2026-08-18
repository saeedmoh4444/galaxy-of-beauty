'use client';

import { cn } from '@galaxy/shared';

interface BeautyMeditationCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
  locale?: 'ar' | 'en';
}

export function BeautyMeditationCard({
  className = '',
  title = 'تأمل الجمال',
  subtitle = '5 دقائق فقط — لجمالكِ الداخلي',
  locale = 'ar',
}: BeautyMeditationCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl">‍️</span>
        <h4 className="mt-1 text-sm font-bold text-violet-800 dark:text-violet-200">{title}</h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">{subtitle}</p>
      </div>
      <div className="mt-3 space-y-2">
        {[
          {
            emoji: '🫁',
            text: {
              ar: 'خذي 3 أنفاس عميقة — شهيق 4 ثوانٍ، زفير 6 ثوانٍ',
              en: 'Take 3 deep breaths — inhale for 4 seconds, exhale for 6',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'ركزي على شيء جميل في نفسكِ — داخلياً أو خارجياً',
              en: 'Focus on something beautiful about yourself — inside or out',
            },
          },
          {
            emoji: '',
            text: {
              ar: 'كرري: "أنا جميلة، أنا قوية، أنا كافية"',
              en: 'Repeat: "I am beautiful, I am strong, I am enough"',
            },
          },
          {
            emoji: '',
            text: { ar: 'افتحي عينيكِ ببطء — وابتسمي', en: 'Slowly open your eyes — and smile' },
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <span className="text-sm shrink-0 mt-0.5">{s.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">
              {s.text[locale]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
