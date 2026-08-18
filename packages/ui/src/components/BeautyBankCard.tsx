'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Bank Card — community-funded services for women in need.
 * From Phase W8: Accessibility & Inclusivity — Financial Accessibility.
 * Also ties to W10: Social Impact — Domestic Violence Support.
 *
 * Usage:
 *   <BeautyBankCard funded={127} goal={200} onPassForward={() => {}} />
 */

interface BeautyBankCardProps {
  /** Number of services funded by community */
  funded: number;
  /** Monthly goal */
  goal: number;
  /** Number of women currently on waitlist */
  waitlist?: number;
  onPassForward?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Label for the funded-services progress */
  fundedLabel?: string;
  /** Prefix before the monthly goal */
  goalPrefix?: string;
  /** Label for the waitlist count */
  waitlistLabel?: string;
  /** Suffix after the waitlist count */
  waitlistCountSuffix?: string;
  /** "How you can help" heading */
  howTitle?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
  /** Impact example names */
  example1?: string;
  example2?: string;
  example3?: string;
  /** Pass-it-forward button label */
  passForwardText?: string;
  /** Impact stories link text */
  storiesLinkText?: string;
}

export function BeautyBankCard({
  funded,
  goal,
  waitlist,
  onPassForward,
  className = '',
  title = 'بنك الجمال',
  subtitle = 'المجتمع يمكّن المجتمع — ادفعي الثمن لامرأة لا تستطيع',
  fundedLabel = 'خدمات ممولة هذا الشهر',
  goalPrefix = 'الهدف ',
  waitlistLabel = 'نساء بانتظار المساعدة',
  waitlistCountSuffix = 'امرأة',
  howTitle = ' كيف تساعدين',
  currencySuffix = 'ر.س',
  example1 = 'قصة شعر',
  example2 = 'مكياج مقابلة',
  example3 = 'يوم سبا',
  passForwardText = 'ادفعي الثمن لأخت',
  storiesLinkText = 'اقرئي قصص النساء اللواتي ساعدناها',
}: BeautyBankCardProps): JSX.Element {
  const pct = Math.min(100, Math.round((funded / goal) * 100));

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      {/* Heart icon */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-600 dark:text-pink-400">{subtitle}</p>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300">
            {fundedLabel}
          </span>
          <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{pct}%</span>
        </div>

        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-pink-100 dark:bg-pink-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-pink-800 dark:text-pink-200">{funded}</span>
          <span className="text-[10px] text-pink-500 dark:text-pink-400">
            {goalPrefix}
            {goal}
          </span>
        </div>
      </div>

      {/* Waitlist */}
      {waitlist !== undefined && waitlist > 0 && (
        <div className="mt-2 rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-secondary dark:text-gray-300">
              {waitlistLabel}
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {waitlist} {waitlistCountSuffix}
            </span>
          </div>
        </div>
      )}

      {/* Impact examples */}
      <div className="mt-2 space-y-1">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{howTitle}</p>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true"></p>
            <p className="font-bold text-pink-800 dark:text-pink-200">50 {currencySuffix}</p>
            <p className="text-pink-500 dark:text-pink-400">{example1}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true"></p>
            <p className="font-bold text-pink-800 dark:text-pink-200">150 {currencySuffix}</p>
            <p className="text-pink-500 dark:text-pink-400">{example2}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-2 dark:bg-gray-800/60">
            <p className="text-lg" aria-hidden="true"></p>
            <p className="font-bold text-pink-800 dark:text-pink-200">300 {currencySuffix}</p>
            <p className="text-pink-500 dark:text-pink-400">{example3}</p>
          </div>
        </div>
      </div>

      {/* Pass it forward CTA */}
      <button
        type="button"
        onClick={onPassForward}
        className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all shadow-sm shadow-pink-200 dark:shadow-pink-900"
      >
        {passForwardText}
      </button>

      {/* Impact stories link */}
      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400 underline cursor-pointer">
        {storiesLinkText}
      </p>
    </div>
  );
}
