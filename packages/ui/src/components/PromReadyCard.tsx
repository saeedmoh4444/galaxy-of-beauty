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
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  look: { ar: string; en: string };
}

const EVENTS: Record<Event, EventDef> = {
  prom: {
    emoji: '',
    title: { ar: 'حفلة موسيقية', en: 'Prom' },
    description: { ar: 'إطلالة راقية تخطف الأنظار', en: 'An elegant look that turns heads' },
    look: { ar: 'مكياج سهرة ناعم + تسريحة راقية', en: 'Soft evening makeup + elegant hairstyle' },
  },
  graduation: {
    emoji: '',
    title: { ar: 'حفل تخرج', en: 'Graduation' },
    description: { ar: 'إشراقة تليق بإنجازكِ', en: 'A glow worthy of your achievement' },
    look: { ar: 'مكياج طبيعي + تسريحة أنيقة', en: 'Natural makeup + chic hairstyle' },
  },
  eid: {
    emoji: '',
    title: { ar: 'عيد', en: 'Eid' },
    description: { ar: 'إطلالة مبهجة للعيد', en: 'A joyful look for Eid' },
    look: { ar: 'مكياج ناعم + ضفائر عصرية', en: 'Soft makeup + trendy braids' },
  },
  wedding_guest: {
    emoji: '',
    title: { ar: 'حضور زفاف', en: 'Wedding guest' },
    description: { ar: 'إطلالة أنيقة تليق بالمناسبة', en: 'An elegant look fitting the occasion' },
    look: { ar: 'مكياج راقٍ + تسريحة كلاسيكية', en: 'Refined makeup + classic hairstyle' },
  },
  birthday_party: {
    emoji: '',
    title: { ar: 'حفلة ميلاد', en: 'Birthday party' },
    description: { ar: 'إطلالة مميزة ليومكِ الخاص', en: 'A standout look for your special day' },
    look: { ar: 'مكياج لامع + تسريحة مميزة', en: 'Glowy makeup + signature hairstyle' },
  },
};

const INCLUDED_ITEMS: { ar: string; en: string }[] = [
  { ar: 'مكياج احترافي', en: 'Professional makeup' },
  { ar: 'تسريحة شعر', en: 'Hair styling' },
  { ar: 'مانيكير سريع', en: 'Quick manicure' },
  { ar: 'لمسة عطر', en: 'Fragrance touch' },
  { ar: 'تجربة قبل اليوم', en: 'Pre-event trial' },
  { ar: 'لمسات أخيرة', en: 'Final touches' },
];

interface PromReadyCardProps {
  event: Event;
  age?: number;
  price?: number;
  onBook?: () => void;
  className?: string;
  /** Text prefixing the age badge */
  ageLabel?: string;
  /** Years word appended to the age */
  ageYearsSuffix?: string;
  /** Label for the look section */
  lookLabel?: string;
  /** Label for the included items section */
  includesLabel?: string;
  /** Label for the price section */
  priceLabel?: string;
  /** Currency suffix shown after the price */
  currencySuffix?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal event data strings */
  locale?: 'ar' | 'en';
}

export function PromReadyCard({
  event,
  age,
  price = 350,
  onBook,
  className = '',
  ageLabel = 'مناسب لعمر',
  ageYearsSuffix = 'سنة',
  lookLabel = ' الإطلالة',
  includesLabel = ' تشمل الباقة',
  priceLabel = 'السعر',
  currencySuffix = 'ر.س',
  bookLabel = 'احجزي إطلالتكِ',
  footerText = 'اجعلي مناسبتكِ الخاصة لا تُنسى',
  locale = 'ar',
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
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">
          {ev.title[locale]}
        </h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{ev.description[locale]}</p>
        {isTeen && (
          <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            {ageLabel} {age} {ageYearsSuffix}
          </span>
        )}
      </div>

      {/* The look */}
      <div className="mt-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">{lookLabel}</p>
        <p className="mt-1 text-xs text-text-primary dark:text-gray-100">{ev.look[locale]}</p>
      </div>

      {/* What's included */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
          {includesLabel}
        </p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          {INCLUDED_ITEMS.map((item) => (
            <span key={item.ar}>• {item[locale]}</span>
          ))}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{priceLabel}</p>
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
            {price} {currencySuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          {bookLabel}
        </button>
      </div>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        {footerText}
      </p>
    </div>
  );
}
