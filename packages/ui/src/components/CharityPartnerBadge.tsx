'use client';

import { cn } from '@galaxy/shared';

/**
 * Charity Partner Badge — NGO partnerships supporting women.
 * From Phase W10: Saudi Women Leadership — Social Impact.
 *
 * Usage:
 *   <CharityPartnerBadge
 *     charity={{ name: 'جمعية حماية الأسرة', cause: 'دعم الناجيات' }}
 *   />
 */

interface Charity {
  name: string;
  cause: string;
  emoji?: string;
}

interface CharityPartnerBadgeProps {
  charity: Charity;
  raised?: number;
  onDonate?: () => void;
  className?: string;
}

export function CharityPartnerBadge({
  charity,
  raised,
  onDonate,
  className = '',
}: CharityPartnerBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-4 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {charity.emoji || ''}
        </span>
        <div>
          <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">شراكة مجتمعية</h4>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">مع {charity.name}</p>
        </div>
      </div>

      {/* Cause */}
      <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950">
        <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300"> {charity.cause}</p>
      </div>

      {/* Raised amount */}
      {raised !== undefined && (
        <div className="mt-2 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">تم جمع</p>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-300">
            {raised.toLocaleString('ar-SA')} ر.س
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onDonate}
        className="mt-3 w-full rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-[0.98] transition-all"
      >
        تبرعي الآن 
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         معاً نصنع فرقاً في حياة النساء
      </p>
    </div>
  );
}
