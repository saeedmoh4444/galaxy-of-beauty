'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Circle Card — private women-only beauty groups.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <BeautyCircleCard
 *     circle={{ name: 'عرايس الرياض 2026', topic: 'wedding', members: 34, cover: '' }}
 *   />
 */

type CircleTopic =
  | 'wedding'
  | 'new_mom'
  | 'curly_hair'
  | 'skincare'
  | 'makeup'
  | 'teen_beauty'
  | 'wellness'
  | 'professional'
  | 'hijabi_beauty'
  | 'budget_beauty';

interface TopicDef {
  emoji: string;
  label: string;
  color: string;
}

const TOPICS: Record<CircleTopic, TopicDef> = {
  wedding: {
    emoji: '',
    label: 'عرايس',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  },
  new_mom: {
    emoji: '',
    label: 'أمهات جدد',
    color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  curly_hair: {
    emoji: '',
    label: 'شعر مجعد',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  skincare: {
    emoji: '',
    label: 'عناية بالبشرة',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  makeup: {
    emoji: '',
    label: 'مكياج',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  },
  teen_beauty: {
    emoji: '',
    label: 'جمال المراهقات',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  wellness: {
    emoji: '',
    label: 'صحة شاملة',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  },
  professional: {
    emoji: '',
    label: 'خبيرات تجميل',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  },
  hijabi_beauty: {
    emoji: '',
    label: 'جمال المحجبات',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  },
  budget_beauty: {
    emoji: '',
    label: 'جمال اقتصادي',
    color: 'bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300',
  },
};

interface BeautyCircle {
  name: string;
  topic: CircleTopic;
  members: number;
  cover: string;
  /** City in Arabic */
  city?: string;
  /** Next meetup date */
  nextMeetup?: string;
  /** Book together discount percentage */
  groupDiscount?: number;
  /** Member avatars — initials */
  recentMembers?: string[];
}

interface BeautyCircleCardProps {
  circle: BeautyCircle;
  onJoin?: () => void;
  className?: string;
}

export function BeautyCircleCard({
  circle,
  onJoin,
  className = '',
}: BeautyCircleCardProps): JSX.Element {
  const topic = TOPICS[circle.topic];
  const isAlmostFull = circle.members >= 40;
  const isNew = circle.members <= 5;

  return (
    <div
      className={cn(
        'group rounded-2xl border border-pink-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Cover */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 text-2xl dark:from-pink-900 dark:to-rose-900">
          {circle.cover}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-bold text-text-primary dark:text-gray-100">
            {circle.name}
          </h4>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                topic.color,
              )}
            >
              {topic.emoji} {topic.label}
            </span>
            {circle.city && (
              <span className="text-[10px] text-text-tertiary dark:text-gray-500">
                 {circle.city}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Member count + avatars */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mini avatar stack */}
          {circle.recentMembers && circle.recentMembers.length > 0 && (
            <div className="flex -space-x-1.5">
              {circle.recentMembers.slice(0, 4).map((initials, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-200 to-rose-200 text-[9px] font-bold text-pink-700 dark:border-gray-900 dark:from-pink-800 dark:to-rose-800 dark:text-pink-200"
                >
                  {initials}
                </span>
              ))}
              {circle.recentMembers.length > 4 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-bold text-gray-500 dark:border-gray-900 dark:bg-gray-800">
                  +{circle.recentMembers.length - 4}
                </span>
              )}
            </div>
          )}
          <span className="text-xs font-semibold text-text-secondary dark:text-gray-300">
            {circle.members} عضوة
          </span>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5">
          {isNew && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              🆕 جديدة
            </span>
          )}
          {isAlmostFull && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
               أوشكت على الامتلاء
            </span>
          )}
        </div>
      </div>

      {/* Next meetup */}
      {circle.nextMeetup && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-pink-50 px-2.5 py-1.5 dark:bg-pink-950">
          <span className="text-xs" aria-hidden="true">
            
          </span>
          <span className="text-[10px] text-text-secondary dark:text-gray-300">
            اللقاء القادم: {circle.nextMeetup}
          </span>
        </div>
      )}

      {/* Group discount */}
      {circle.groupDiscount && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
          <span aria-hidden="true"></span>
          خصم {circle.groupDiscount}% عند الحجز الجماعي
        </div>
      )}

      {/* Join button */}
      <button
        type="button"
        onClick={onJoin}
        className={cn(
          'mt-3 w-full rounded-xl py-2 text-xs font-bold transition-all',
          'bg-pink-600 text-white hover:bg-pink-700',
          'group-hover:shadow-sm',
          'active:scale-[0.98]',
        )}
      >
        انضمي للدائرة 
      </button>
    </div>
  );
}
