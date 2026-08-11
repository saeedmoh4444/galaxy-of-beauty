'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Vision Board Card — visual goal-setting for beauty aspirations.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyVisionBoardCard goals={[{ emoji: '👰', text: 'إطلالة زفاف مثالية', year: '2027' }]} />
 */

interface VisionGoal {
  emoji: string;
  text: string;
  year: string;
  achieved?: boolean;
}

interface BeautyVisionBoardCardProps {
  goals: VisionGoal[];
  onAddGoal?: () => void;
  className?: string;
}

export function BeautyVisionBoardCard({
  goals,
  onAddGoal,
  className = '',
}: BeautyVisionBoardCardProps): JSX.Element {
  const achieved = goals.filter((g) => g.achieved).length;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-5 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🌟
          </span>
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">لوحة الرؤية</h4>
            <p className="text-[10px] text-amber-500 dark:text-amber-400">
              {goals.length} هدف · {achieved} محقق
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {goals.map((goal, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5',
              goal.achieved ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-amber-50 dark:bg-amber-950',
            )}
          >
            <span className="text-lg">{goal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-[10px] font-bold',
                  goal.achieved
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-amber-700 dark:text-amber-300',
                )}
              >
                {goal.text}
              </p>
              <p className="text-[9px] text-text-tertiary dark:text-gray-500">{goal.year}</p>
            </div>
            <span className="text-xs">{goal.achieved ? '✅' : '⏳'}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddGoal}
        className="mt-3 w-full rounded-xl border border-dashed border-amber-300 py-2 text-[10px] font-bold text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950 transition-colors"
      >
        + أضيفي هدفاً
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        🌟 ارسمي مستقبل جمالكِ — وحققيه
      </p>
    </div>
  );
}
