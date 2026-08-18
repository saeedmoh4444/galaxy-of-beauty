'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Quick Tip Card — single, impactful beauty tip in a compact card.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyQuickTipCard tip={{ emoji: '', title: 'الماء أولاً', body: 'اشربي كوب ماء قبل قهوتك الصباحية.' }} />
 */

interface QuickTip {
  emoji: string;
  title: string;
  body: string;
  source?: string;
}

interface BeautyQuickTipCardProps {
  tip: QuickTip;
  onNextTip?: () => void;
  nextTipText?: string;
  className?: string;
}

export function BeautyQuickTipCard({
  tip,
  onNextTip,
  nextTipText = 'النصيحة التالية ←',
  className = '',
}: BeautyQuickTipCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 dark:border-teal-900 dark:from-teal-950 dark:to-emerald-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-4xl" aria-hidden="true">
          {tip.emoji}
        </span>
        <h4 className="mt-2 text-sm font-bold text-teal-800 dark:text-teal-200">{tip.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-teal-700 dark:text-teal-300">{tip.body}</p>
        {tip.source && (
          <p className="mt-1 text-[9px] text-teal-500 dark:text-teal-400"> {tip.source}</p>
        )}
      </div>
      {onNextTip && (
        <button
          type="button"
          onClick={onNextTip}
          className="mt-3 w-full rounded-xl border border-teal-200 py-2 text-[10px] font-bold text-teal-700 hover:bg-white/60 dark:hover:bg-gray-800/60 dark:border-teal-800 dark:text-teal-300 transition-colors"
        >
          {nextTipText}
        </button>
      )}
    </div>
  );
}
