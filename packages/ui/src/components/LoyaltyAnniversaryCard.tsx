'use client';

import { cn } from '@galaxy/shared';

/**
 * Loyalty Anniversary Card — celebrate customer's anniversary with the platform.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <LoyaltyAnniversaryCard years={2} joinedDate="أغسطس 2024" />
 */

interface LoyaltyAnniversaryCardProps {
  years: number;
  joinedDate: string;
  totalBookings?: number;
  onClaimGift?: () => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  sincePrefix?: string;
  yearSingular?: string;
  yearPlural?: string;
  withYouText?: string;
  bookingsSuffix?: string;
  giftLabel?: string;
  claimGiftButtonText?: string;
  footerText?: string;
  className?: string;
}

const YEAR_MESSAGES: Record<
  number,
  { emoji: string; title: { ar: string; en: string }; gift: { ar: string; en: string } }
> = {
  1: {
    emoji: '',
    title: { ar: 'ذكرى سنوية أولى', en: 'First anniversary' },
    gift: { ar: 'خصم 20% على خدمتكِ القادمة', en: '20% off your next service' },
  },
  2: {
    emoji: '',
    title: { ar: 'ذكرى سنوية ثانية', en: 'Second anniversary' },
    gift: { ar: 'خدمة مجانية صغيرة من اختياركِ', en: 'A small free service of your choice' },
  },
  3: {
    emoji: '',
    title: { ar: 'ذكرى سنوية ثالثة', en: 'Third anniversary' },
    gift: { ar: 'يوم سبا مصغر مجاني', en: 'A free mini spa day' },
  },
  5: {
    emoji: '',
    title: { ar: '5 سنوات من الجمال', en: '5 years of beauty' },
    gift: { ar: 'باقة VIP شاملة', en: 'Full VIP package' },
  },
};

export function LoyaltyAnniversaryCard({
  years,
  joinedDate,
  totalBookings,
  onClaimGift,
  className = '',
  locale = 'ar',
  sincePrefix = 'منذ ',
  yearSingular = 'سنة',
  yearPlural = 'سنوات',
  withYouText = 'من جمالكِ معنا',
  bookingsSuffix = ' حجز',
  giftLabel = ' هديتكِ',
  claimGiftButtonText = 'استلمي هديتكِ',
  footerText = 'شكراً لأنكِ جزء من عائلتنا',
}: LoyaltyAnniversaryCardProps): JSX.Element {
  const closestMilestone = Object.keys(YEAR_MESSAGES)
    .map(Number)
    .filter((m) => m <= years)
    .sort((a, b) => b - a)[0];
  const celebration = YEAR_MESSAGES[closestMilestone || 1]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {celebration.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">
          {celebration.title[locale]}
        </h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {sincePrefix}
          {joinedDate}
        </p>
      </div>

      {/* Years */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{years}</p>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {years === 1 ? yearSingular : years <= 10 ? yearPlural : yearSingular} {withYouText}
        </p>
        {totalBookings && (
          <p className="mt-1 text-[10px] text-text-tertiary dark:text-gray-500">
            {totalBookings}
            {bookingsSuffix}
          </p>
        )}
      </div>

      {/* Gift */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{giftLabel}</p>
        <p className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">
          {celebration.gift[locale]}
        </p>
      </div>

      <button
        type="button"
        onClick={onClaimGift}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm"
      >
        {claimGiftButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{footerText}</p>
    </div>
  );
}
