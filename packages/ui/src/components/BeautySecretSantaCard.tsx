'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Secret Santa Card — anonymous gift exchange among beauty circle members.
 * From Phase W4: Sisterhood & Community — Celebrating Each Other.
 *
 * Usage:
 *   <BeautySecretSantaCard group="عرايس الرياض" budget={200} participants={12} />
 */

interface BeautySecretSantaCardProps {
  group: string;
  budget: number;
  participants: number;
  onJoin?: () => void;
  onReveal?: () => void;
  className?: string;
  title?: string;
  budgetLabel?: string;
  currencySuffix?: string;
  participantsLabel?: string;
  joinButtonText?: string;
  revealButtonText?: string;
  footerText?: string;
}

export function BeautySecretSantaCard({
  group,
  budget,
  participants,
  onJoin,
  onReveal,
  className = '',
  title = 'الهدية السرية',
  budgetLabel = 'الميزانية',
  currencySuffix = 'ر.س',
  participantsLabel = 'المشاركات',
  joinButtonText = 'انضمي للعبة',
  revealButtonText = 'اكشفي هديتكِ',
  footerText = 'الهدية الأجمل هي التي تأتي من القلب',
}: BeautySecretSantaCardProps): JSX.Element {
  const isRevealed = false; // Would be date-gated in production

  return (
    <div
      className={cn(
        'rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-green-50 p-5 dark:border-red-900 dark:from-red-950 dark:to-green-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-red-700 dark:text-red-300">{title}</h4>
        <p className="text-[10px] text-red-500 dark:text-red-400">{group}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{budgetLabel}</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            {budget} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{participantsLabel}</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">{participants}</p>
        </div>
      </div>

      {!isRevealed ? (
        <button
          type="button"
          onClick={onJoin}
          className="mt-3 w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 active:scale-[0.98] transition-all"
        >
          {joinButtonText}
        </button>
      ) : (
        <button
          type="button"
          onClick={onReveal}
          className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          {revealButtonText}
        </button>
      )}

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {footerText}
      </p>
    </div>
  );
}
