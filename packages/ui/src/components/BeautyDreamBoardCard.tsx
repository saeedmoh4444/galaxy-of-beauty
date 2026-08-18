'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Dream Board Card — visual board for beauty goals & dreams.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyDreamBoardCard dreams={[{ emoji: '', text: 'شعر طويل صحي' }]} />
 */

interface Dream {
  emoji: string;
  text: string;
}

interface BeautyDreamBoardCardProps {
  dreams: Dream[];
  onAddDream?: () => void;
  className?: string;
  title?: string;
  dreamCountText?: string;
  addDreamText?: string;
  footerText?: string;
}

export function BeautyDreamBoardCard({
  dreams,
  onAddDream,
  className = '',
  title = 'لوحة الأحلام',
  dreamCountText = 'حلم',
  addDreamText = 'أضيفي حلماً',
  footerText = 'احلمي — ثم حققي',
}: BeautyDreamBoardCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 dark:border-violet-900 dark:from-violet-950 dark:to-fuchsia-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-violet-800 dark:text-violet-200">{title}</h4>
        <p className="text-[10px] text-violet-500 dark:text-violet-400">
          {dreams.length} {dreamCountText}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {dreams.slice(0, 6).map((dream, i) => (
          <div key={i} className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
            <span className="text-2xl">{dream.emoji}</span>
            <p className="mt-1 text-[10px] font-medium text-violet-800 dark:text-violet-200">
              {dream.text}
            </p>
          </div>
        ))}
        {dreams.length < 6 && (
          <button
            type="button"
            onClick={onAddDream}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-200 p-3 text-violet-400 hover:border-violet-300 dark:border-violet-800"
          >
            <span className="text-2xl">+</span>
            <span className="mt-1 text-[10px]">{addDreamText}</span>
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[9px] text-violet-500 dark:text-violet-400">
        {footerText}
      </p>
    </div>
  );
}
