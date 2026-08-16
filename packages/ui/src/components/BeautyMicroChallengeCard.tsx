'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Micro Challenge Card — quick 5-minute beauty challenges.
 * From Phase W6: Education & Empowerment.
 *
 * Usage:
 *   <BeautyMicroChallengeCard challenge={{ title: 'تحدي الترطيب', emoji: '', duration: '5 دقائق' }} />
 */

interface MicroChallenge {
  title: string;
  emoji: string;
  duration: string;
  completed?: boolean;
}

interface BeautyMicroChallengeCardProps {
  challenge: MicroChallenge;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function BeautyMicroChallengeCard({
  challenge,
  onComplete,
  onSkip,
  className = '',
}: BeautyMicroChallengeCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl shrink-0">{challenge.emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
            {challenge.title}
          </h4>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">️ {challenge.duration}</p>
        </div>
        {challenge.completed && <span className="text-lg shrink-0"></span>}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onComplete}
          className="flex-1 rounded-lg bg-teal-600 py-2 text-[10px] font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
        >
          أنجزتها!
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-gray-200 px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
        >
          تخطي
        </button>
      </div>
    </div>
  );
}
