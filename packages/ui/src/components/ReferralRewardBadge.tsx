'use client';

import { cn } from '@galaxy/shared';

/**
 * Referral Reward Badge — refer a friend, both get 15% off.
 * From Phase W4: Sisterhood & Community — Sisterhood Discount.
 *
 * Usage:
 *   <ReferralRewardBadge referralCode="SARA123" referrals={5} />
 */

interface ReferralRewardBadgeProps {
  referralCode: string;
  referrals: number;
  discount?: number;
  onShare?: () => void;
  onCopyCode?: () => void;
  className?: string;
  title?: string;
  invitePrefix?: string;
  discountSuffix?: string;
  codeLabel?: string;
  referralsLabel?: string;
  discountEarnedLabel?: string;
  shareButtonText?: string;
  footerText?: string;
}

export function ReferralRewardBadge({
  referralCode,
  referrals,
  discount = 15,
  onShare,
  onCopyCode,
  className = '',
  title = 'دعوة صديقة',
  invitePrefix = 'ادعي صديقاتكِ — لكما ',
  discountSuffix = '% خصم',
  codeLabel = 'رمز الدعوة الخاص بكِ',
  referralsLabel = 'صديقة مدعوة',
  discountEarnedLabel = 'خصم مكتسب',
  shareButtonText = 'شاركي رمزكِ',
  footerText = 'الجمال يكبر عندما نتشاركه',
}: ReferralRewardBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-5 dark:border-fuchsia-900 dark:from-fuchsia-950 dark:to-pink-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">{title}</h4>
        <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">
          {invitePrefix}
          {discount}
          {discountSuffix}
        </p>
      </div>

      {/* Referral code */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-center text-[10px] text-text-tertiary dark:text-gray-500">{codeLabel}</p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <code className="rounded-lg bg-fuchsia-100 px-3 py-1.5 text-sm font-bold tracking-wider text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300">
            {referralCode}
          </code>
          <button
            type="button"
            onClick={onCopyCode}
            className="rounded-lg bg-fuchsia-100 p-1.5 text-fuchsia-600 hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-400"
          ></button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg font-bold text-fuchsia-700 dark:text-fuchsia-300">{referrals}</p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{referralsLabel}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {referrals * discount}%
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{discountEarnedLabel}</p>
        </div>
      </div>

      {/* Share CTA */}
      <button
        type="button"
        onClick={onShare}
        className="mt-3 w-full rounded-xl bg-fuchsia-600 py-2.5 text-xs font-bold text-white hover:bg-fuchsia-700 active:scale-[0.98] transition-all shadow-sm"
      >
        {shareButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-fuchsia-500 dark:text-fuchsia-400">
        {footerText}
      </p>
    </div>
  );
}
