'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Night Out Card — last-minute beauty for a night out.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyNightOutCard available={true} onBook={() => {}} />
 */

interface BeautyNightOutCardProps {
  available?: boolean;
  onBook?: () => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  availableBadgeText?: string;
  currencySuffix?: string;
  bookNowText?: string;
  unavailableText?: string;
  footerText?: string;
  className?: string;
}

const SERVICES = [
  {
    emoji: '',
    name: { ar: 'مكياج سريع', en: 'Quick makeup' },
    time: { ar: '30 دقيقة', en: '30 minutes' },
    price: 150,
  },
  {
    emoji: '',
    name: { ar: 'تسريحة سهرة', en: 'Evening hairstyle' },
    time: { ar: '20 دقيقة', en: '20 minutes' },
    price: 100,
  },
  {
    emoji: '',
    name: { ar: 'مانيكير سريع', en: 'Quick manicure' },
    time: { ar: '20 دقيقة', en: '20 minutes' },
    price: 80,
  },
];

export function BeautyNightOutCard({
  available = true,
  onBook,
  className = '',
  locale = 'ar',
  title = 'ليلة خارجاً',
  subtitle = 'خدمات سريعة لليلتكِ الخاصة',
  availableBadgeText = 'متوفر الآن',
  currencySuffix = 'ر.س',
  bookNowText = 'احجزي الآن ',
  unavailableText = 'غير متوفر حالياً',
  footerText = 'الليلة ليلتكِ — تألقي',
}: BeautyNightOutCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-900 dark:from-indigo-950 dark:to-purple-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">{title}</h4>
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400">{subtitle}</p>
        {available && (
          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            {availableBadgeText}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5">
        {SERVICES.map((s) => (
          <div
            key={s.name.ar}
            className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2.5 dark:bg-gray-800/60"
          >
            <span className="text-lg shrink-0">{s.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
                {s.name[locale]}
              </p>
              <p className="text-[9px] text-text-tertiary dark:text-gray-500">{s.time[locale]}</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {s.price} {currencySuffix}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onBook}
        disabled={!available}
        className={cn(
          'mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]',
          available
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700',
        )}
      >
        {available ? bookNowText : unavailableText}
      </button>

      <p className="mt-2 text-center text-[9px] text-indigo-500 dark:text-indigo-400">
        {footerText}
      </p>
    </div>
  );
}
