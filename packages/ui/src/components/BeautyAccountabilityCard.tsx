'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Accountability Card — find an accountability partner for beauty goals.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <BeautyAccountabilityCard partner="نورة" goal="روتين عناية يومي" streak={12} />
 */

interface BeautyAccountabilityCardProps {
  partner: string;
  goal: string;
  streak: number;
  onCheckIn?: () => void;
  className?: string;
}

export function BeautyAccountabilityCard({
  partner,
  goal,
  streak,
  onCheckIn,
  className = '',
}: BeautyAccountabilityCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-5 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">شريكة المساءلة</h4>
        <p className="text-[10px] text-teal-500 dark:text-teal-400">
          {partner} تشجعكِ على: {goal}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-teal-50 p-4 text-center dark:bg-teal-950">
        <p className="text-3xl font-bold text-teal-700 dark:text-teal-300"> {streak}</p>
        <p className="text-[10px] text-teal-600 dark:text-teal-400">
          {streak === 1 ? 'يوم' : 'أيام'} متتالية
        </p>
      </div>

      <button
        type="button"
        onClick={onCheckIn}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
         سجلي إنجاز اليوم
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
         معاً أقوى — شريكتكِ تنتظر تحديثكِ
      </p>
    </div>
  );
}
