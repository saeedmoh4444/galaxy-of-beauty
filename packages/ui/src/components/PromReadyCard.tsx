'use client';

import { cn } from '@galaxy/shared';

/**
 * Prom Ready Card — prom/graduation preparation beauty package for teens.
 * From Phase W7: Mother-Daughter & Family.
 *
 * Usage:
 *   <PromReadyCard event="prom" age={17} onBook={() => {}} />
 */

type Event = 'prom' | 'graduation' | 'eid' | 'wedding_guest' | 'birthday_party';

interface EventDef {
  emoji: string;
  title: string;
  description: string;
  look: string;
}

const EVENTS: Record<Event, EventDef> = {
  prom: {
    emoji: '',
    title: 'حفلة موسيقية',
    description: 'إطلالة راقية تخطف الأنظار',
    look: 'مكياج سهرة ناعم + تسريحة راقية',
  },
  graduation: {
    emoji: '',
    title: 'حفل تخرج',
    description: 'إشراقة تليق بإنجازكِ',
    look: 'مكياج طبيعي + تسريحة أنيقة',
  },
  eid: {
    emoji: '',
    title: 'عيد',
    description: 'إطلالة مبهجة للعيد',
    look: 'مكياج ناعم + ضفائر عصرية',
  },
  wedding_guest: {
    emoji: '',
    title: 'حضور زفاف',
    description: 'إطلالة أنيقة تليق بالمناسبة',
    look: 'مكياج راقٍ + تسريحة كلاسيكية',
  },
  birthday_party: {
    emoji: '',
    title: 'حفلة ميلاد',
    description: 'إطلالة مميزة ليومكِ الخاص',
    look: 'مكياج لامع + تسريحة مميزة',
  },
};

interface PromReadyCardProps {
  event: Event;
  age?: number;
  price?: number;
  onBook?: () => void;
  className?: string;
}

export function PromReadyCard({
  event,
  age,
  price = 350,
  onBook,
  className = '',
}: PromReadyCardProps): JSX.Element {
  const ev = EVENTS[event];
  const isTeen = age !== undefined && age >= 15 && age <= 19;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-violet-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {ev.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">{ev.title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{ev.description}</p>
        {isTeen && (
          <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
             مناسب لعمر {age} سنة
          </span>
        )}
      </div>

      {/* The look */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300"> الإطلالة</p>
        <p className="mt-1 text-xs text-text-primary dark:text-gray-100">{ev.look}</p>
      </div>

      {/* What's included */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300"> تشمل الباقة</p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          <span>• مكياج احترافي</span>
          <span>• تسريحة شعر</span>
          <span>• مانيكير سريع</span>
          <span>• لمسة عطر</span>
          <span>• تجربة قبل اليوم</span>
          <span>• لمسات أخيرة</span>
        </div>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">السعر</p>
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{price} ر.س</p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          احجزي إطلالتكِ 
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
         اجعلي مناسبتكِ الخاصة لا تُنسى
      </p>
    </div>
  );
}
