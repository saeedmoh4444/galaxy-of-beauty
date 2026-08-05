'use client';

import { cn } from '@galaxy/shared';

/**
 * Women Employer Badge — badge for salons that employ and empower Saudi women.
 * From Phase W10: Saudi Women Leadership — Social Impact.
 *
 * Usage:
 *   <WomenEmployerBadge womenEmployed={8} totalStaff={10} />
 */

interface WomenEmployerBadgeProps {
  womenEmployed: number;
  totalStaff: number;
  /** Does salon provide benefits (insurance, training, etc.) */
  hasBenefits?: boolean;
  /** Does salon have women in management */
  womenInManagement?: number;
  className?: string;
}

export function WomenEmployerBadge({
  womenEmployed,
  totalStaff,
  hasBenefits = false,
  womenInManagement,
  className = '',
}: WomenEmployerBadgeProps): JSX.Element {
  const pct = Math.round((womenEmployed / totalStaff) * 100);
  const isChampion = pct >= 80;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        isChampion
          ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950'
          : 'border-emerald-100 bg-white dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {isChampion ? '🏆' : '👩‍💼'}
          </span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
              {isChampion ? 'بطل تمكين المرأة' : 'مُشغّل للنساء'}
            </h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              {womenEmployed} من {totalStaff} موظفة سعودية
            </p>
          </div>
        </div>
        <span className={cn(
          'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
          isChampion
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        )}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isChampion
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
              : 'bg-gradient-to-r from-emerald-400 to-green-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap gap-1">
        {hasBenefits && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            ✅ تأمين ومزايا
          </span>
        )}
        {womenInManagement !== undefined && womenInManagement > 0 && (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            👑 {womenInManagement} في الإدارة
          </span>
        )}
      </div>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        👩‍💼 ندعم الصالونات التي توظف وتمكّن المرأة السعودية
      </p>
    </div>
  );
}
