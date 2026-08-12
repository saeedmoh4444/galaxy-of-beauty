'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Friend Activity Card — see what friends are booking in beauty circles.
 * From Phase W4: Sisterhood & Community.
 *
 * Usage:
 *   <BeautyFriendActivityCard activities={[{ friend: 'نورة', action: 'حجزت مكياج', time: 'منذ ساعة' }]} />
 */

interface FriendActivity {
  friend: string;
  emoji?: string;
  action: string;
  time: string;
}

interface BeautyFriendActivityCardProps {
  activities: FriendActivity[];
  className?: string;
}

export function BeautyFriendActivityCard({
  activities,
  className = '',
}: BeautyFriendActivityCardProps): JSX.Element | null {
  if (!activities.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-white p-4 dark:border-fuchsia-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          ‍️
        </span>
        <div>
          <h4 className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
            نشاط الصديقات
          </h4>
          <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">
            {activities.length} نشاط حديث
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {activities.slice(0, 4).map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-fuchsia-50 px-3 py-2 dark:bg-fuchsia-950"
          >
            <span className="text-sm">{a.emoji || ''}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-fuchsia-800 dark:text-fuchsia-200">
                <span className="font-bold">{a.friend}</span> {a.action}
              </p>
            </div>
            <span className="text-[9px] text-fuchsia-500 dark:text-fuchsia-400 shrink-0">
              {a.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
