'use client';

import { cn } from '@galaxy/shared';

/**
 * Just Because Flowers — random bouquet delivered to loyal customers.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <JustBecauseFlowers bookingsCount={15} />
 */

interface JustBecauseFlowersProps {
  bookingsCount: number;
  /** Has the user already received flowers */
  received?: boolean;
  /** Last received date */
  lastReceived?: string;
  className?: string;
  /** Heading when flowers were sent */
  sentTitle?: string;
  /** Heading when a bouquet is a surprise */
  surpriseTitle?: string;
  /** Prefix before the bouquet name in the received description */
  receivedPrefix?: string;
  /** Description when no bouquet has arrived yet */
  surpriseDescription?: string;
  /** Prefix before the bouquet name in the sent status */
  sentToPrefix?: string;
  /** Prefix before the received date */
  inPrefix?: string;
  /** Thank-you text under the sent status */
  thankYouText?: string;
  /** Message for customers with 100+ bookings */
  loyaltyText?: string;
  /** Message for customers with 50+ bookings */
  greatCustomerText?: string;
  /** Message for the default case */
  anyMomentText?: string;
  /** Suffix after the booking count */
  bookingCountSuffix?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for bouquet names and colors */
  locale?: 'ar' | 'en';
}

const BOUQUETS = [
  {
    emoji: '',
    name: { ar: 'باقة ورد جوري', en: 'Rose bouquet' },
    color: { ar: 'من حدائق الطائف', en: 'From Taif gardens' },
  },
  {
    emoji: '',
    name: { ar: 'وردة حمراء', en: 'Red rose' },
    color: { ar: 'ملكة الزهور', en: 'Queen of flowers' },
  },
  {
    emoji: '',
    name: { ar: 'باقة زهور الربيع', en: 'Spring flower bouquet' },
    color: { ar: 'ألوان مبهجة', en: 'Cheerful colors' },
  },
  {
    emoji: '',
    name: { ar: 'زهرة استوائية', en: 'Tropical flower' },
    color: { ar: 'لون دافئ', en: 'Warm color' },
  },
  {
    emoji: '',
    name: { ar: 'عباد شمس', en: 'Sunflower' },
    color: { ar: 'إشراقة صفراء', en: 'Yellow radiance' },
  },
];

export function JustBecauseFlowers({
  bookingsCount,
  received = false,
  lastReceived,
  className = '',
  sentTitle = 'لقد أرسلنا لكِ!',
  surpriseTitle = 'فقط لأنكِ رائعة',
  receivedPrefix = 'استلمتِ ',
  surpriseDescription = 'باقة زهور قد تصلكِ في أي يوم — بدون مناسبة!',
  sentToPrefix = 'أرسلنا لكِ ',
  inPrefix = ' في ',
  thankYouText = 'شكراً لأنكِ جزء من عائلتنا',
  loyaltyText = ' أنتِ من أكثر عميلاتنا وفاءً — توقعي مفاجأة قريباً!',
  greatCustomerText = ' أنتِ عميلة رائعة — باقة زهور في طريقها إليكِ!',
  anyMomentText = ' قد تصلكِ باقة زهور في أي لحظة — فقط لأنكِ رائعة',
  bookingCountSuffix = 'حجز',
  footerText = 'بعض الأيام تحتاج زهوراً — بدون سبب',
  locale = 'ar',
}: JustBecauseFlowersProps): JSX.Element | null {
  if (bookingsCount < 10) return null;

  const bouquetIndex = bookingsCount % BOUQUETS.length;
  const bouquet = BOUQUETS[bouquetIndex]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-white p-5 dark:border-rose-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {bouquet.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {received ? sentTitle : surpriseTitle}
        </h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">
          {received
            ? `${receivedPrefix}${bouquet.name[locale]} — ${bouquet.color[locale]}`
            : surpriseDescription}
        </p>
      </div>

      {/* Status */}
      {received && lastReceived ? (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950">
          <span className="text-2xl" aria-hidden="true">
            {bouquet.emoji}
          </span>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            {sentToPrefix}
            {bouquet.name[locale]}
            {inPrefix}
            {lastReceived}
          </p>
          <p className="mt-0.5 text-[10px] text-rose-500 dark:text-rose-400">{thankYouText}</p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950">
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {bookingsCount >= 100
              ? loyaltyText
              : bookingsCount >= 50
                ? greatCustomerText
                : anyMomentText}
          </p>
        </div>
      )}

      {/* Booking counter */}
      <div className="mt-2 text-center">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          {bookingsCount} {bookingCountSuffix}
        </span>
      </div>

      <p className="mt-2 text-center text-[9px] text-rose-500 dark:text-rose-400">{footerText}</p>
    </div>
  );
}
