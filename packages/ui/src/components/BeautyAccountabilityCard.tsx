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
  title?: string;
  encouragesText?: string;
  singleDayText?: string;
  multiDayText?: string;
  consecutiveText?: string;
  buttonText?: string;
  footerText?: string;
}

export function BeautyAccountabilityCard({
  partner,
  goal,
  streak,
  onCheckIn,
  className = '',
  title = 'شريكة المساءلة',
  encouragesText = 'تشجعكِ على:',
  singleDayText = 'يوم',
  multiDayText = 'أيام',
  consecutiveText = 'متتالية',
  buttonText = 'سجلي إنجاز اليوم',
  footerText = 'معاً أقوى — شريكتكِ تنتظر تحديثكِ',
}: BeautyAccountabilityCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-5 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-teal-700 dark:text-teal-300">{title}</h4>
        <p className="text-[10px] text-teal-500 dark:text-teal-400">
          {partner} {encouragesText} {goal}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-teal-50 p-4 text-center dark:bg-teal-950">
        <p className="text-3xl font-bold text-teal-700 dark:text-teal-300"> {streak}</p>
        <p className="text-[10px] text-teal-600 dark:text-teal-400">
          {streak === 1 ? singleDayText : multiDayText} {consecutiveText}
        </p>
      </div>

      <button
        type="button"
        onClick={onCheckIn}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
        {buttonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
