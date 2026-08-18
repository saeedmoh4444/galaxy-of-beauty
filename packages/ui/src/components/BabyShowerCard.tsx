'use client';

import { cn } from '@galaxy/shared';

/**
 * Baby Shower Card — beauty packages for baby showers & gender reveals.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <BabyShowerCard momName="نورة" onBook={() => {}} />
 */

interface BabyShowerCardProps {
  momName: string;
  guests?: number;
  onBook?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Suffix after the guests count */
  guestsSuffix?: string;
  /** "Package includes" heading */
  includesTitle?: string;
  /** Included service bullets */
  include1?: string;
  include2?: string;
  include3?: string;
  include4?: string;
  include5?: string;
  include6?: string;
  /** "Starting from" label */
  startingAtLabel?: string;
  /** Currency suffix for the price */
  currencySuffix?: string;
  /** Book button label */
  bookButtonText?: string;
}

export function BabyShowerCard({
  momName: _momName,
  guests,
  onBook,
  className = '',
  title = 'بيبي شاور',
  subtitle = 'إطلالة مميزة للأم المنتظرة',
  guestsSuffix = 'ضيفة',
  includesTitle = ' تشمل الباقة',
  include1 = '• مكياج ناعم',
  include2 = '• تسريحة',
  include3 = '• مانيكير',
  include4 = '• تنسيق ديكور',
  include5 = '• كيكة',
  include6 = '• هدايا',
  startingAtLabel = 'تبدأ من',
  currencySuffix = 'ر.س',
  bookButtonText = 'احجزي',
}: BabyShowerCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-pink-50 p-5 dark:border-sky-900 dark:from-sky-950 dark:to-pink-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-sky-800 dark:text-sky-200">{title}</h4>
        <p className="text-[10px] text-sky-500 dark:text-sky-400">{subtitle}</p>
        {guests && (
          <p className="mt-0.5 text-[10px] text-text-tertiary dark:text-gray-500">
            {guests} {guestsSuffix}
          </p>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-sky-800 dark:text-sky-200">{includesTitle}</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-sky-700 dark:text-sky-300">
          <span>{include1}</span>
          <span>{include2}</span>
          <span>{include3}</span>
          <span>{include4}</span>
          <span>{include5}</span>
          <span>{include6}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{startingAtLabel}</p>
          <p className="text-lg font-bold text-sky-800 dark:text-sky-200">500 {currencySuffix}</p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 active:scale-[0.98] transition-all"
        >
          {bookButtonText}
        </button>
      </div>
    </div>
  );
}
