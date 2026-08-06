'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Routine Timeline Card — AM/PM skincare routine visual timeline.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyRoutineTimelineCard
 *     morning={['غسول', 'تونر', 'سيروم', 'مرطب', 'واقي شمس']}
 *     evening={['مزيل مكياج', 'غسول', 'تونر', 'سيروم', 'مرطب']}
 *   />
 */

interface BeautyRoutineTimelineCardProps {
  morning: string[];
  evening: string[];
  skinType?: string;
  className?: string;
}

export function BeautyRoutineTimelineCard({ morning, evening, skinType, className = '' }: BeautyRoutineTimelineCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-sky-100 bg-white p-5 dark:border-sky-900 dark:bg-gray-900', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">⏰</span>
          <div>
            <h4 className="text-sm font-bold text-sky-700 dark:text-sky-300">روتيني اليومي</h4>
            {skinType && <p className="text-[10px] text-sky-500 dark:text-sky-400">{skinType}</p>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Morning */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">☀️</span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">صباحاً</span>
          </div>
          <div className="space-y-1">
            {morning.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">{i + 1}</span>
                <span className="text-[10px] text-text-secondary dark:text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evening */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">🌙</span>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">مساءً</span>
          </div>
          <div className="space-y-1">
            {evening.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{i + 1}</span>
                <span className="text-[10px] text-text-secondary dark:text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
