'use client';

import { cn } from '@galaxy/shared';

/**
 * DV Support Badge — free beauty services for domestic violence survivors.
 * From Phase W10: Saudi Women Leadership — Social Impact.
 *
 * Usage:
 *   <DVSupportBadge partnerShelter="جمعية حماية الأسرة" />
 */

interface DVSupportBadgeProps {
  partnerShelter: string;
  /** Number of survivors served this year */
  survivorsServed?: number;
  onLearnMore?: () => void;
  onGetHelp?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** "We offer for free" heading */
  freeServicesTitle?: string;
  /** Free services list items */
  service1?: string;
  service2?: string;
  service3?: string;
  service4?: string;
  service5?: string;
  service6?: string;
  /** "In partnership with" label */
  partnerLabel?: string;
  /** Prefix before the survivors count */
  servedPrefix?: string;
  /** Suffix after the survivors count */
  servedSuffix?: string;
  /** Confidentiality notice */
  confidentialityText?: string;
  /** Get-help button label */
  getHelpText?: string;
  /** Learn-more button label */
  learnMoreText?: string;
  /** Footer message */
  footerText?: string;
}

export function DVSupportBadge({
  partnerShelter,
  survivorsServed = 0,
  onLearnMore,
  onGetHelp,
  className = '',
  title = 'يداً بيد ننهض',
  subtitle = 'لأن كل امرأة تستحق بداية جديدة',
  freeServicesTitle = ' نقدم مجاناً',
  service1 = '• عناية بالبشرة',
  service2 = '• مكياج تعليمي',
  service3 = '• تسريحة شعر',
  service4 = '• استشارة إطلالة',
  service5 = '• مانيكير',
  service6 = '• يوم سبا مصغر',
  partnerLabel = 'بالشراكة مع',
  servedPrefix = 'ساعدنا ',
  servedSuffix = 'امرأة هذا العام',
  confidentialityText = 'سري تماماً — لا أحد يعرف أنكِ استخدمتِ هذه الخدمة',
  getHelpText = 'احصلي على مساعدة',
  learnMoreText = 'اعرفي أكثر',
  footerText = 'لستِ وحدكِ — نحن معكِ',
}: DVSupportBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-5 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header - subtle, no obvious labeling */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
      </div>

      {/* Services offered */}
      <div className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
        <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">
          {freeServicesTitle}
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-purple-700 dark:text-purple-300">
          <span>{service1}</span>
          <span>{service2}</span>
          <span>{service3}</span>
          <span>{service4}</span>
          <span>{service5}</span>
          <span>{service6}</span>
        </div>
      </div>

      {/* Partner */}
      <div className="mt-2 rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true"></span>
          <div>
            <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
              {partnerLabel}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">{partnerShelter}</p>
          </div>
        </div>
      </div>

      {/* Survivors served */}
      {survivorsServed > 0 && (
        <div className="mt-2 rounded-lg bg-purple-50 p-2 text-center dark:bg-purple-950">
          <p className="text-[10px] text-purple-700 dark:text-purple-300">
            {servedPrefix}
            {survivorsServed} {servedSuffix}
          </p>
        </div>
      )}

      {/* Confidentiality */}
      <div className="mt-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950">
        <p className="text-center text-[10px] text-amber-700 dark:text-amber-300">
          {confidentialityText}
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onGetHelp}
          className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          {getHelpText}
        </button>
        <button
          type="button"
          onClick={onLearnMore}
          className="rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-gray-800 dark:text-purple-300"
        >
          {learnMoreText}
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        {footerText}
      </p>
    </div>
  );
}
