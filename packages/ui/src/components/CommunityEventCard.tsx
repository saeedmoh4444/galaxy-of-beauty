'use client';

import { cn } from '@galaxy/shared';

/**
 * Community Event Card — monthly meetups at partner salons.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <CommunityEventCard
 *     event={{ title: 'لقاء عرايس الرياض', date: '15 أغسطس', city: 'الرياض' }}
 *   />
 */

interface CommunityEvent {
  title: string;
  date: string;
  city: string;
  time?: string;
  attendees?: number;
  maxAttendees?: number;
  host?: string;
  emoji?: string;
}

interface CommunityEventCardProps {
  event: CommunityEvent;
  isRegistered?: boolean;
  onRegister?: () => void;
  className?: string;
}

export function CommunityEventCard({
  event,
  isRegistered = false,
  onRegister,
  className = '',
}: CommunityEventCardProps): JSX.Element {
  const isFull =
    event.maxAttendees !== undefined &&
    event.attendees !== undefined &&
    event.attendees >= event.maxAttendees;

  return (
    <div
      className={cn(
        'rounded-2xl border border-violet-100 bg-white p-4 dark:border-violet-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-2xl dark:from-violet-900 dark:to-purple-900">
          {event.emoji || '‍️'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-violet-700 dark:text-violet-300">{event.title}</h4>
          <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-text-tertiary dark:text-gray-500">
            <span> {event.date}</span>
            <span> {event.city}</span>
            {event.time && <span> {event.time}</span>}
          </div>
        </div>
      </div>

      {/* Attendees */}
      {event.attendees !== undefined && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-tertiary dark:text-gray-500">
              {event.attendees} مسجلة
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </span>
            {isFull && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                اكتمل
              </span>
            )}
          </div>
          {event.maxAttendees && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all"
                style={{ width: `${Math.round((event.attendees / event.maxAttendees) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Host */}
      {event.host && (
        <p className="mt-1.5 text-[10px] text-text-tertiary dark:text-gray-500">
          ‍ تستضيفها: {event.host}
        </p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onRegister}
        disabled={isFull && !isRegistered}
        className={cn(
          'mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all active:scale-[0.98]',
          isRegistered
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-violet-600 text-white hover:bg-violet-700',
        )}
      >
        {isRegistered ? ' مسجلة' : isFull ? 'القائمة مكتملة' : 'سجّلي الآن'}
      </button>

      <p className="mt-1.5 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        لقاءات حقيقية لنساء حقيقيات
      </p>
    </div>
  );
}
