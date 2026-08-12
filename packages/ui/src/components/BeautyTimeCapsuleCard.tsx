'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Time Capsule Card — save your current beauty routine to revisit later.
 * From Phase W4: Sisterhood & Community — Beauty Stories.
 *
 * Usage:
 *   <BeautyTimeCapsuleCard savedDate="2026-08-06" onOpen={() => {}} />
 */

interface BeautyTimeCapsuleCardProps {
  savedDate: string;
  onSave?: () => void;
  onOpen?: () => void;
  className?: string;
}

export function BeautyTimeCapsuleCard({
  savedDate,
  onSave,
  onOpen,
  className = '',
}: BeautyTimeCapsuleCardProps): JSX.Element {
  const isFuture = new Date(savedDate) > new Date();

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-indigo-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {isFuture ? '⏳' : '📦'}
        </span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">
          كبسولة الزمن
        </h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">
          {isFuture ? `ستفتح في ${savedDate}` : `محفوظة منذ ${savedDate} — افتحيها!`}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-2xl" aria-hidden="true">
          {isFuture ? '🔒' : '🔓'}
        </p>
        <p className="mt-1 text-xs text-text-secondary dark:text-gray-300">
          {isFuture ? 'احفظي روتينكِ الحالي لتعودي إليه لاحقاً' : 'روتينكِ القديم بانتظاركِ'}
        </p>
      </div>

      <button
        type="button"
        onClick={isFuture ? onSave : onOpen}
        className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
      >
        {isFuture ? 'احفظي الروتين 📦' : 'افتحي الكبسولة 📦'}
      </button>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        💜 بعض الروتينات تستحق أن نتذكرها
      </p>
    </div>
  );
}
