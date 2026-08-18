'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Referral Leaderboard Card — top referrers in the community.
 * From Phase W4: Sisterhood & Community — Referral Program.
 *
 * Usage:
 *   <BeautyReferralLeaderboardCard leaders={[{ name: 'نورة', referrals: 12, emoji: '' }]} />
 */

interface Leader {
  name: string;
  referrals: number;
  emoji?: string;
}

interface BeautyReferralLeaderboardCardProps {
  leaders: Leader[];
  userRank?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  referralsText?: string;
  rankText?: string;
}

export function BeautyReferralLeaderboardCard({
  leaders,
  userRank,
  className = '',
  title = 'قائمة الإحالات',
  subtitle = 'الأكثر دعوة لصديقاتهن',
  referralsText = 'إحالة',
  rankText = ' ترتيبكِ: #',
}: BeautyReferralLeaderboardCardProps): JSX.Element | null {
  if (!leaders.length) return null;

  const medals = ['', '', ''];

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true"></span>
        <div>
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">{title}</h4>
          <p className="text-[10px] text-amber-500 dark:text-amber-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {leaders.slice(0, 5).map((l, i) => (
          <div
            key={l.name}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2',
              i === 0 ? 'bg-amber-50 dark:bg-amber-950' : 'bg-gray-50 dark:bg-gray-800',
            )}
          >
            <span className="text-sm w-6 text-center">{medals[i] || `${i + 1}.`}</span>
            <span className="text-sm">{l.emoji || ''}</span>
            <span className="flex-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {l.name}
            </span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
              {l.referrals} {referralsText}
            </span>
          </div>
        ))}
      </div>

      {userRank && (
        <div className="mt-2 rounded-lg bg-amber-50 p-2 text-center dark:bg-amber-950">
          <p className="text-[10px] text-amber-700 dark:text-amber-300">
            {rankText}
            {userRank}
          </p>
        </div>
      )}
    </div>
  );
}
