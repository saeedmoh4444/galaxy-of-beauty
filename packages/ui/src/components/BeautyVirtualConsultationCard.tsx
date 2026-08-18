'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Virtual Consultation Card — online beauty consultation booking.
 * From Phase W9: The Small Details & W3: Health & Wellness.
 *
 * Usage:
 *   <BeautyVirtualConsultationCard specialist="د. نورة" specialty="أمراض جلدية" />
 */

interface BeautyVirtualConsultationCardProps {
  specialist: string;
  specialty: string;
  price?: number;
  duration?: string;
  availableSlots?: string[];
  emoji?: string;
  onBook?: () => void;
  title?: string;
  onlineBadgeText?: string;
  priceLabel?: string;
  durationLabel?: string;
  currencySuffix?: string;
  availableSlotsLabel?: string;
  bookButtonText?: string;
  className?: string;
}

export function BeautyVirtualConsultationCard({
  specialist,
  specialty,
  price = 150,
  duration = '30 دقيقة',
  availableSlots = ['10:00', '14:00', '16:30'],
  emoji = '‍️',
  onBook,
  className = '',
  title = 'استشارة عن بُعد',
  onlineBadgeText = 'أونلاين',
  priceLabel = 'السعر',
  durationLabel = 'المدة',
  currencySuffix = 'ر.س',
  availableSlotsLabel = ' مواعيد متاحة',
  bookButtonText = 'احجزي استشارة',
}: BeautyVirtualConsultationCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-5 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-2xl dark:from-blue-900 dark:to-sky-900">
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{title}</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{specialist}</p>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">{specialty}</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {onlineBadgeText}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">{priceLabel}</p>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
            {price} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">{durationLabel}</p>
          <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{duration}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950">
        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
          {availableSlotsLabel}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {availableSlots.map((slot) => (
            <span
              key={slot}
              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-blue-700 dark:bg-gray-800 dark:text-blue-300"
            >
              {slot}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onBook}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {bookButtonText}
      </button>
    </div>
  );
}
