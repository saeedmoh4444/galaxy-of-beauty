'use client';

import { cn } from '@galaxy/shared';

/**
 * Loyalty Dividend Badge — annual cashback based on yearly spend.
 * From Phase W5: Financial Empowerment — Loyalty Dividend.
 *
 * Usage:
 *   <LoyaltyDividendBadge yearlySpend={4500} cashbackRate={5} />
 */

interface LoyaltyDividendBadgeProps {
  /** Total spend this year in SAR */
  yearlySpend: number;
  /** Cashback percentage */
  cashbackRate?: number;
  /** Loyalty tier */
  tier?: 'silver' | 'gold' | 'diamond';
  /** Month of payout */
  payoutMonth?: string;
  className?: string;
  /** Header title */
  title?: string;
  /** Word before the tier label */
  rankLabel?: string;
  /** Word after the cashback percentage */
  cashbackWord?: string;
  /** Label under the cashback amount */
  annualCashbackLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Label for the spend box */
  spendLabel?: string;
  /** Label for the refund box */
  refundLabel?: string;
  /** Label for the payout box */
  payoutLabel?: string;
  /** Prefix before the next tier label */
  toNextTierPrefix?: string;
  /** Word before the remaining amount */
  remainingLabel?: string;
  /** Word after the remaining amount */
  upgradeWord?: string;
  /** Text shown when at the top tier */
  topTierText?: string;
  /** Prefix before the payout month */
  payoutInfoPrefix?: string;
  /** Suffix after the payout month */
  payoutInfoSuffix?: string;
  /** Locale for internal tier data strings */
  locale?: 'ar' | 'en';
}

interface TierDef {
  emoji: string;
  label: { ar: string; en: string };
  minSpend: number;
  rate: number;
  color: string;
  gradient: string;
}

const TIERS: Record<'silver' | 'gold' | 'diamond', TierDef> = {
  silver: {
    emoji: '',
    label: { ar: 'فضية', en: 'Silver' },
    minSpend: 1000,
    rate: 3,
    color:
      'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
    gradient: 'from-gray-400 to-slate-500',
  },
  gold: {
    emoji: '',
    label: { ar: 'ذهبية', en: 'Gold' },
    minSpend: 3000,
    rate: 5,
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    gradient: 'from-amber-400 to-yellow-500',
  },
  diamond: {
    emoji: '',
    label: { ar: 'ماسية', en: 'Diamond' },
    minSpend: 8000,
    rate: 8,
    color:
      'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    gradient: 'from-sky-400 to-blue-500',
  },
};

export function LoyaltyDividendBadge({
  yearlySpend,
  cashbackRate,
  tier,
  payoutMonth = 'يناير',
  className = '',
  title = 'أرباح الولاء',
  rankLabel = 'المرتبة ',
  cashbackWord = 'استرداد نقدي',
  annualCashbackLabel = 'أرباحكِ السنوية',
  currencySuffix = 'ر.س',
  spendLabel = 'إنفاقكِ',
  refundLabel = 'الاسترداد',
  payoutLabel = 'الدفع',
  toNextTierPrefix = 'للوصول للمرتبة ',
  remainingLabel = 'متبقي',
  upgradeWord = 'للترقية',
  topTierText = 'أنتِ في أعلى مرتبة — تهانينا!',
  payoutInfoPrefix = 'تصرف أرباحكِ السنوية في ',
  payoutInfoSuffix = 'من كل عام',
  locale = 'ar',
}: LoyaltyDividendBadgeProps): JSX.Element {
  // Auto-detect tier from spend or use provided tier
  const detectedTier = (tier ??
    (yearlySpend >= 8000 ? 'diamond' : yearlySpend >= 3000 ? 'gold' : 'silver')) as
    'silver' | 'gold' | 'diamond';

  const tierDef = TIERS[detectedTier];
  const rate = cashbackRate ?? tierDef.rate;
  const cashback = Math.round(yearlySpend * (rate / 100));

  // Progress toward next tier
  const nextTierKey =
    detectedTier === 'silver' ? 'gold' : detectedTier === 'gold' ? 'diamond' : null;
  const nextTier = nextTierKey ? TIERS[nextTierKey] : null;
  const progressToNext = nextTier
    ? Math.min(100, Math.round((yearlySpend / nextTier.minSpend) * 100))
    : 100;

  return (
    <div className={cn('rounded-2xl border bg-white p-5 dark:bg-gray-900', className)}>
      {/* Tier header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg text-white',
              tierDef.gradient,
            )}
          >
            {tierDef.emoji}
          </span>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">{title}</h4>
            <p className="text-[10px] text-text-tertiary dark:text-gray-400">
              {rankLabel}
              {tierDef.label[locale]} · {rate}% {cashbackWord}
            </p>
          </div>
        </div>

        {/* Cashback amount */}
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary dark:text-gray-100">
            {cashback} {currencySuffix}
          </p>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{annualCashbackLabel}</p>
        </div>
      </div>

      {/* Yearly spend summary */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{spendLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {yearlySpend.toLocaleString('ar-SA')} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{refundLabel}</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rate}%</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{payoutLabel}</p>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{payoutMonth}</p>
        </div>
      </div>

      {/* Next tier progress */}
      {nextTier && (
        <div className="mt-3 rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-secondary dark:text-gray-300">
              {toNextTierPrefix}
              {nextTier.label[locale]}
            </span>
            <span className="font-bold text-text-primary dark:text-gray-100">
              {progressToNext}%
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                nextTier.gradient,
              )}
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          <p className="mt-1 text-[9px] text-text-tertiary dark:text-gray-500">
            {remainingLabel}{' '}
            {nextTier.minSpend - yearlySpend > 0
              ? (nextTier.minSpend - yearlySpend).toLocaleString('ar-SA')
              : 0}{' '}
            {currencySuffix} {upgradeWord}
          </p>
        </div>
      )}

      {/* Already top tier */}
      {!nextTier && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 p-3 text-center dark:from-sky-950 dark:to-blue-950">
          <p className="text-xs font-bold text-sky-700 dark:text-sky-300">{topTierText}</p>
        </div>
      )}

      {/* Payout info */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {payoutInfoPrefix}
        {payoutMonth} {payoutInfoSuffix}
      </p>
    </div>
  );
}
