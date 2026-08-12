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
  className?: string;
}

const YEAR_MESSAGES: Record<number, { emoji: string; title: string; gift: string }> = {
  1: { emoji: '', title: 'ذكرى سنوية أولى', gift: 'خصم 20% على خدمتكِ القادمة' },
  2: { emoji: '', title: 'ذكرى سنوية ثانية', gift: 'خدمة مجانية صغيرة من اختياركِ' },
  3: { emoji: '', title: 'ذكرى سنوية ثالثة', gift: 'يوم سبا مصغر مجاني' },
  5: { emoji: '', title: '5 سنوات من الجمال', gift: 'باقة VIP شاملة' },
};

export function LoyaltyAnniversaryCard({
  years,
  joinedDate,
  totalBookings,
  onClaimGift,
  className = '',
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
          {celebration.title}
        </h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">منذ {joinedDate}</p>
      </div>

      {/* Years */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">{years}</p>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">
          {years === 1 ? 'سنة' : years <= 10 ? 'سنوات' : 'سنة'} من جمالكِ معنا
        </p>
        {totalBookings && (
          <p className="mt-1 text-[10px] text-text-tertiary dark:text-gray-500">
             {totalBookings} حجز
          </p>
        )}
      </div>

      {/* Gift */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300"> هديتكِ</p>
        <p className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">
          {celebration.gift}
        </p>
      </div>

      <button
        type="button"
        onClick={onClaimGift}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-2.5 text-xs font-bold text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] transition-all shadow-sm"
      >
        استلمي هديتكِ 
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">
         شكراً لأنكِ جزء من عائلتنا
      </p>
    </div>
  );
}
