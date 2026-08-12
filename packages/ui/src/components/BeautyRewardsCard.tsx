'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Rewards Card — loyalty points & rewards redemption.
 * From Phase W5: Financial Empowerment — Loyalty Dividend.
 *
 * Usage:
 *   <BeautyRewardsCard points={1250} tier="gold" />
 */

type RewardTier = 'silver' | 'gold' | 'diamond';

interface Reward {
  name: string;
  emoji: string;
  points: number;
}

const REWARDS: Reward[] = [
  { name: 'مانيكير مجاني', emoji: '', points: 500 },
  { name: 'قناع وجه', emoji: '', points: 300 },
  { name: 'خصم 50 ر.س', emoji: '', points: 400 },
  { name: 'خدمة سريعة', emoji: '', points: 250 },
  { name: 'هدية شهرية', emoji: '', points: 800 },
  { name: 'يوم سبا مصغر', emoji: '', points: 1500 },
];

interface BeautyRewardsCardProps {
  points: number;
  tier?: RewardTier;
  onRedeem?: (reward: string) => void;
  className?: string;
}

const TIER_COLORS: Record<RewardTier, string> = {
  silver: 'from-gray-400 to-slate-500',
  gold: 'from-amber-400 to-yellow-500',
  diamond: 'from-sky-400 to-blue-500',
};

export function BeautyRewardsCard({
  points,
  tier = 'gold',
  onRedeem,
  className = '',
}: BeautyRewardsCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg text-white',
              TIER_COLORS[tier],
            )}
          >
            
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">مكافآتي</h4>
            <p className="text-[10px] text-amber-500 dark:text-amber-400">
              {points.toLocaleString('ar-SA')} نقطة
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {REWARDS.map((r) => {
          const canRedeem = points >= r.points;
          return (
            <button
              key={r.name}
              type="button"
              disabled={!canRedeem}
              onClick={() => onRedeem?.(r.name)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all',
                canRedeem
                  ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900'
                  : 'bg-gray-50 opacity-50 cursor-not-allowed dark:bg-gray-800',
              )}
            >
              <span className="text-sm">{r.emoji}</span>
              <div>
                <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
                  {r.name}
                </p>
                <p className="text-[9px] text-text-tertiary dark:text-gray-500">{r.points} نقطة</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
