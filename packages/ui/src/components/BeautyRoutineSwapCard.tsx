'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Routine Swap Card — seasonal routine swap suggestions.
 * From Phase W9: The Small Details.
 *
 * Usage:
 *   <BeautyRoutineSwapCard swaps={[{ from: 'مرطب ثقيل', to: 'مرطب جل خفيف', reason: 'الصيف' }]} />
 */

interface RoutineSwap {
  from: string;
  to: string;
  reason: string;
  emoji?: string;
}

interface BeautyRoutineSwapCardProps {
  swaps: RoutineSwap[];
  className?: string;
}

export function BeautyRoutineSwapCard({
  swaps,
  className = '',
}: BeautyRoutineSwapCardProps): JSX.Element | null {
  if (!swaps.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">تبديل الروتين</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">حدثي روتينكِ مع المواسم</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {swaps.slice(0, 3).map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 dark:bg-amber-950"
          >
            <span className="text-sm shrink-0">{s.emoji || ''}</span>
            <div className="flex-1 min-w-0 text-center">
              <span className="text-[10px] text-gray-400 line-through dark:text-gray-600">
                {s.from}
              </span>
              <span className="mx-2 text-amber-400">→</span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {s.to}
              </span>
            </div>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 shrink-0">
              {s.reason}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
