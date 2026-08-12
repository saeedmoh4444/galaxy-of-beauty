'use client';

import { cn } from '@galaxy/shared';

interface BeautyMeditationCardProps {
  className?: string;
}

export function BeautyMeditationCard({ className = '' }: BeautyMeditationCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl">‍️</span>
        <h4 className="mt-1 text-sm font-bold text-violet-800 dark:text-violet-200">تأمل الجمال</h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">
          5 دقائق فقط — لجمالكِ الداخلي
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {[
          { emoji: '🫁', text: 'خذي 3 أنفاس عميقة — شهيق 4 ثوانٍ، زفير 6 ثوانٍ' },
          { emoji: '', text: 'ركزي على شيء جميل في نفسكِ — داخلياً أو خارجياً' },
          { emoji: '', text: 'كرري: "أنا جميلة، أنا قوية، أنا كافية"' },
          { emoji: '', text: 'افتحي عينيكِ ببطء — وابتسمي' },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <span className="text-sm shrink-0 mt-0.5">{s.emoji}</span>
            <span className="text-[10px] text-violet-800 dark:text-violet-200">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
