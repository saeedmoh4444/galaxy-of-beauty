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
}

const BOUQUETS = [
  { emoji: '💐', name: 'باقة ورد جوري', color: 'من حدائق الطائف' },
  { emoji: '🌹', name: 'وردة حمراء', color: 'ملكة الزهور' },
  { emoji: '🌸', name: 'باقة زهور الربيع', color: 'ألوان مبهجة' },
  { emoji: '🌺', name: 'زهرة استوائية', color: 'لون دافئ' },
  { emoji: '🌻', name: 'عباد شمس', color: 'إشراقة صفراء' },
];

export function JustBecauseFlowers({
  bookingsCount,
  received = false,
  lastReceived,
  className = '',
}: JustBecauseFlowersProps): JSX.Element | null {
  if (bookingsCount < 10) return null;

  const eligible = bookingsCount >= 10;
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
        <span className="text-3xl" aria-hidden="true">{bouquet.emoji}</span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {received ? 'لقد أرسلنا لكِ!' : 'فقط لأنكِ رائعة'}
        </h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">
          {received
            ? `استلمتِ ${bouquet.name} — ${bouquet.color}`
            : 'باقة زهور قد تصلكِ في أي يوم — بدون مناسبة!'}
        </p>
      </div>

      {/* Status */}
      {received && lastReceived ? (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950">
          <span className="text-2xl" aria-hidden="true">{bouquet.emoji}</span>
          <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
            أرسلنا لكِ {bouquet.name} في {lastReceived}
          </p>
          <p className="mt-0.5 text-[10px] text-rose-500 dark:text-rose-400">
            💕 شكراً لأنكِ جزء من عائلتنا
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-950">
          <p className="text-xs text-rose-700 dark:text-rose-300">
            {bookingsCount >= 100
              ? '🌹 أنتِ من أكثر عميلاتنا وفاءً — توقعي مفاجأة قريباً!'
              : bookingsCount >= 50
                ? '💐 أنتِ عميلة رائعة — باقة زهور في طريقها إليكِ!'
                : '🌸 قد تصلكِ باقة زهور في أي لحظة — فقط لأنكِ رائعة'}
          </p>
        </div>
      )}

      {/* Booking counter */}
      <div className="mt-2 text-center">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          🎀 {bookingsCount} حجز
        </span>
      </div>

      <p className="mt-2 text-center text-[9px] text-rose-500 dark:text-rose-400">
        💐 بعض الأيام تحتاج زهوراً — بدون سبب
      </p>
    </div>
  );
}
