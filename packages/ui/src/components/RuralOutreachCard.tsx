'use client';

import { cn } from '@galaxy/shared';

/**
 * Rural Outreach Card — train and employ women from villages and small towns.
 * From Phase W10: Saudi Women Leadership — Rural Women Outreach.
 *
 * Usage:
 *   <RuralOutreachCard trained={87} employed={52} villages={14} />
 */

interface RuralOutreachCardProps {
  trained: number;
  employed: number;
  villages: number;
  target?: number;
  onLearnMore?: () => void;
  onDonate?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Label for the trained count */
  trainedLabel?: string;
  /** Label for the employed count */
  employedLabel?: string;
  /** Label for the villages count */
  villagesLabel?: string;
  /** Prefix before the employment target */
  targetPrefix?: string;
  /** Suffix after the employment target */
  targetSuffix?: string;
  /** "How we reach them" heading */
  howTitle?: string;
  /** Outreach steps */
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  /** Learn-more button label */
  learnMoreText?: string;
  /** Donate button label */
  donateText?: string;
  /** Footer text */
  footerText?: string;
}

export function RuralOutreachCard({
  trained,
  employed,
  villages,
  target = 200,
  onLearnMore,
  onDonate,
  className = '',
  title = 'تمكين المرأة الريفية',
  subtitle = 'نصل إلى النساء في القرى والمدن الصغيرة',
  trainedLabel = 'متدربة',
  employedLabel = 'موظفة',
  villagesLabel = 'قرية',
  targetPrefix = 'هدف توظيف ',
  targetSuffix = 'امرأة ريفية',
  howTitle = 'كيف نصل إليهن',
  step1 = '• عيادات متنقلة تزور القرى أسبوعياً',
  step2 = '• تدريب عن بعد عبر الجوال',
  step3 = '• شراكات مع جمعيات التنمية المحلية',
  step4 = '• توفير معدات تجميل مجانية للمتدربات',
  learnMoreText = 'اعرفي المزيد',
  donateText = 'تبرعي',
  footerText = 'كل امرأة تستحق فرصة — أينما كانت',
}: RuralOutreachCardProps): JSX.Element {
  const employPct = Math.round((employed / target) * 100);

  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5 dark:border-emerald-900 dark:from-emerald-950 dark:to-green-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">{title}</h4>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{subtitle}</p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true"></p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{trained}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{trainedLabel}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true"></p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{employed}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{employedLabel}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-lg" aria-hidden="true"></p>
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{villages}</p>
          <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{villagesLabel}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-700 dark:text-emerald-300">
            {targetPrefix}
            {target} {targetSuffix}
          </span>
          <span className="font-bold text-emerald-800 dark:text-emerald-200">{employPct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-1000"
            style={{ width: `${Math.min(100, employPct)}%` }}
          />
        </div>
      </div>

      {/* How it works */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">{howTitle}</p>
        <div className="mt-1 space-y-1 text-[10px] text-emerald-700 dark:text-emerald-300">
          <p>{step1}</p>
          <p>{step2}</p>
          <p>{step3}</p>
          <p>{step4}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onLearnMore}
          className="flex-1 rounded-xl bg-emerald-600 py-2 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          {learnMoreText}
        </button>
        <button
          type="button"
          onClick={onDonate}
          className="flex-1 rounded-xl border border-emerald-200 bg-white py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-800 dark:text-emerald-300"
        >
          {donateText}
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-emerald-600 dark:text-emerald-400">
        {footerText}
      </p>
    </div>
  );
}
