'use client';

import { cn } from '@galaxy/shared';

/**
 * Birthday Month Badge — 15% off all services during your birthday month.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BirthdayMonthBadge month="مارس" discount={15} />
 */

interface BirthdayMonthBadgeProps {
  month: string;
  discount?: number;
  daysRemaining?: number;
  onClaim?: () => void;
  title?: string;
  discountDuringText?: string;
  daysLeftText?: string;
  giftsTitle?: string;
  gift1Suffix?: string;
  gift2?: string;
  gift3?: string;
  gift4?: string;
  claimButtonText?: string;
  footerText?: string;
  className?: string;
}

export function BirthdayMonthBadge({
  month,
  discount = 15,
  daysRemaining,
  onClaim,
  className = '',
  title = 'شهر ميلادكِ',
  discountDuringText = ' خصم طوال شهر ',
  daysLeftText = 'يوم متبقي للاستفادة من خصمكِ',
  giftsTitle = 'هدايا شهر ميلادكِ',
  gift1Suffix = '% خصم على جميع الخدمات',
  gift2 = '• هدية مفاجأة مع كل حجز',
  gift3 = '• أولوية في الحجز',
  gift4 = '• رسالة تهنئة من فريقنا',
  claimButtonText = 'احجزي واستمتعي بخصمكِ',
  footerText = 'شهر كامل من الاحتفال بكِ — لأنكِ تستحقين',
}: BirthdayMonthBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {discount}%{discountDuringText}
          {month}
        </p>
      </div>

      {/* Countdown */}
      {daysRemaining !== undefined && daysRemaining > 0 && (
        <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
          <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{daysRemaining}</p>
          <p className="text-[10px] text-pink-500 dark:text-pink-400">{daysLeftText}</p>
        </div>
      )}

      {/* What's included */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{giftsTitle}</p>
        <div className="mt-1.5 space-y-1 text-[10px] text-text-secondary dark:text-gray-300">
          <p>
            • {discount}
            {gift1Suffix}
          </p>
          <p>{gift2}</p>
          <p>{gift3}</p>
          <p>{gift4}</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onClaim}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm shadow-pink-200 dark:shadow-pink-900"
      >
        {claimButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{footerText}</p>
    </div>
  );
}
