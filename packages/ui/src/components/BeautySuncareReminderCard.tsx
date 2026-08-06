'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Suncare Reminder Card — SPF reapplication reminder.
 * From Phase W3: Health & Wellness.
 *
 * Usage:
 *   <BeautySuncareReminderCard spf={50} lastApplied="09:00" />
 */

interface BeautySuncareReminderCardProps {
  spf?: number;
  lastApplied?: string;
  onReapply?: () => void;
  className?: string;
}

export function BeautySuncareReminderCard({ spf = 50, lastApplied, onReapply, className = '' }: BeautySuncareReminderCardProps): JSX.Element {
  const needsReapply = lastApplied ? (Date.now() - new Date(`2026-01-01T${lastApplied}:00`).getTime()) > 7200000 : false;

  return (
    <div className={cn('rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900', className)}>
      <div className="flex items-center gap-3">
        <span className="text-3xl shrink-0">☀️</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">واقي الشمس</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">SPF {spf} · {lastApplied ? `آخر تطبيق ${lastApplied}` : 'لم يطبق اليوم'}</p>
        </div>
        {needsReapply && (
          <span className="shrink-0 animate-pulse rounded-full bg-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-200">
            ⏰ أعيدي
          </span>
        )}
      </div>
      <button type="button" onClick={onReapply} className="mt-3 w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all">
        سجلت تطبيق واقي الشمس ✅
      </button>
      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">☀️ أعيدي التطبيق كل ساعتين</p>
    </div>
  );
}
