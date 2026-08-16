'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Grateful Circle Card — share gratitude within beauty circles.
 * From Phase W4: Sisterhood & Community — Celebrating Each Other.
 *
 * Usage:
 *   <BeautyGratefulCircleCard thanks={[{ from: 'نورة', to: 'مها', message: 'شكراً لنصيحة العناية!' }]} />
 */

interface ThanksNote {
  from: string;
  to: string;
  message: string;
  emoji?: string;
}

interface BeautyGratefulCircleCardProps {
  thanks: ThanksNote[];
  onSend?: () => void;
  className?: string;
}

export function BeautyGratefulCircleCard({
  thanks,
  onSend,
  className = '',
}: BeautyGratefulCircleCardProps): JSX.Element | null {
  if (!thanks.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">دائرة الامتنان</h4>
            <p className="text-[10px] text-rose-500 dark:text-rose-400">
              {thanks.length} رسالة شكر
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {thanks.slice(0, 3).map((t, i) => (
          <div key={i} className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                {t.from}
              </span>
              <span className="text-[10px] text-rose-400">→</span>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">{t.to}</span>
              <span className="text-sm">{t.emoji || ''}</span>
            </div>
            <p className="mt-1 text-[10px] text-rose-600 dark:text-rose-400">
              &ldquo;{t.message}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSend}
        className="mt-3 w-full rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
      >
        أرسلي شكراً
      </button>
    </div>
  );
}
