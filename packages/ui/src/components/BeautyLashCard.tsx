'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Lash Card — eyelash care & extension tips.
 * From Phase W6: Education & Empowerment.
 */

interface BeautyLashCardProps {
  className?: string;
}

export function BeautyLashCard({ className = '' }: BeautyLashCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">👁️</span>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">عناية بالرموش</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">رموش كثيفة وصحية</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { emoji: '🧹', label: 'تنظيف لطيف', tip: 'مزيل مكياج خالٍ من الزيوت' },
          { emoji: '💆', label: 'زيت الخروع', tip: 'يطبق ليلاً لتقوية الرموش' },
          { emoji: '🚫', label: 'لا تفركي', tip: 'الفرك يسبب تساقط الرموش' },
          { emoji: '⏰', label: 'استراحة', tip: 'خذي استراحة من الرموش الصناعية' },
        ].map((t) => (
          <div key={t.label} className="rounded-lg bg-purple-50 px-2.5 py-2 dark:bg-purple-950">
            <span className="text-sm">{t.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-200">
              {t.label}
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400">{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
