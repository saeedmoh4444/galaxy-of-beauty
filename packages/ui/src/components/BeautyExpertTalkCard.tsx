'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Expert Talk Card — expert lecture & masterclass series.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyExpertTalkCard talk={{ title: 'أسرار البشرة', expert: 'د. نورة', date: '15 سبتمبر' }} />
 */

interface ExpertTalk {
  title: string;
  expert: string;
  date: string;
  emoji?: string;
  seats?: number;
  isFree?: boolean;
}

interface BeautyExpertTalkCardProps {
  talk: ExpertTalk;
  onRegister?: () => void;
  freeText?: string;
  seatsSuffix?: string;
  registerText?: string;
  className?: string;
}

export function BeautyExpertTalkCard({
  talk,
  onRegister,
  freeText = 'مجاني',
  seatsSuffix = 'مقعد متبقي',
  registerText = 'سجلي حضوركِ',
  className = '',
}: BeautyExpertTalkCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-xl dark:from-indigo-900 dark:to-blue-900">
          {talk.emoji || ''}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{talk.title}</h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">
            ️ {talk.expert} · {talk.date}
          </p>
        </div>
        {talk.isFree && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {freeText}
          </span>
        )}
      </div>

      {talk.seats !== undefined && (
        <div className="mt-2 rounded-lg bg-indigo-50 p-2 text-center dark:bg-indigo-950">
          <p className="text-[10px] text-indigo-700 dark:text-indigo-300">
            ️ {talk.seats} {seatsSuffix}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onRegister}
        className="mt-3 w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
      >
        {registerText}
      </button>
    </div>
  );
}
