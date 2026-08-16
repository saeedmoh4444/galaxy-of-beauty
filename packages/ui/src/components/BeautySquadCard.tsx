'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Squad Card — create and manage beauty squads for group bookings.
 * From Phase W4: Sisterhood & Community — Beauty Circles & W7: Friends Who Slay Together.
 *
 * Usage:
 *   <BeautySquadCard squad={{ name: 'فرقة الرياض', members: 4 }} />
 */

interface BeautySquad {
  name: string;
  members: number;
  emoji?: string;
  nextEvent?: string;
}

interface BeautySquadCardProps {
  squad: BeautySquad;
  onCreateEvent?: () => void;
  onInvite?: () => void;
  className?: string;
}

export function BeautySquadCard({
  squad,
  onCreateEvent,
  onInvite,
  className = '',
}: BeautySquadCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-purple-50 p-5 dark:border-fuchsia-900 dark:from-fuchsia-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-200 to-purple-200 text-2xl dark:from-fuchsia-800 dark:to-purple-800">
          {squad.emoji || '‍️'}
        </div>
        <h4 className="mt-2 text-sm font-bold text-fuchsia-800 dark:text-fuchsia-200">
          {squad.name}
        </h4>
        <p className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400">{squad.members} عضوات</p>
      </div>

      {squad.nextEvent && (
        <div className="mt-3 rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-fuchsia-700 dark:text-fuchsia-300"> اللقاء القادم</p>
          <p className="text-xs font-bold text-fuchsia-800 dark:text-fuchsia-200">
            {squad.nextEvent}
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCreateEvent}
          className="flex-1 rounded-xl bg-fuchsia-600 py-2 text-[10px] font-bold text-white hover:bg-fuchsia-700 active:scale-[0.98] transition-all"
        >
          لقاء جديد
        </button>
        <button
          type="button"
          onClick={onInvite}
          className="rounded-xl border border-fuchsia-200 bg-white px-4 py-2 text-[10px] font-bold text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:bg-gray-800 dark:text-fuchsia-300"
        >
          دعوة
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-fuchsia-500 dark:text-fuchsia-400">
        صديقاتكِ هن عائلتكِ المختارة
      </p>
    </div>
  );
}
