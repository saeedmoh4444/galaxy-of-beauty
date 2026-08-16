'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Random Act of Beauty — monthly surprise free service for a lucky customer.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <RandomActOfBeauty />
 */

interface RandomActOfBeautyProps {
  /** Whether the user has already won this month */
  hasWon?: boolean;
  /** Total random acts given this month */
  givenThisMonth?: number;
  onCheckEligibility?: () => void;
  className?: string;
}

const SURPRISES = [
  { emoji: '', text: 'قصة شعر مجانية' },
  { emoji: '', text: 'مانيكير مجاني' },
  { emoji: '', text: 'جلسة عناية بالبشرة' },
  { emoji: '', text: 'مساج استرخاء' },
  { emoji: '', text: 'مكياج احترافي' },
];

export function RandomActOfBeauty({
  hasWon = false,
  givenThisMonth = 24,
  onCheckEligibility,
  className = '',
}: RandomActOfBeautyProps): JSX.Element {
  const [surpriseIndex] = useState(() => Math.floor(Math.random() * SURPRISES.length));
  const surprise = SURPRISES[surpriseIndex]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 dark:border-yellow-900 dark:from-yellow-950 dark:to-amber-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          {hasWon ? 'أنتِ الفائزة!' : 'لفتة جمال'}
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {hasWon
            ? `مبروك! فزتِ بـ ${surprise.text} هذا الشهر`
            : 'مرة في الشهر — خدمة مجانية لامرأة محظوظة'}
        </p>
      </div>

      {/* Surprise reveal */}
      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        {hasWon ? (
          <>
            <span className="text-4xl" aria-hidden="true">
              {surprise.emoji}
            </span>
            <p className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-200">
              {surprise.text}
            </p>
            <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">
              استمتعي بها — منا لكِ
            </p>
          </>
        ) : (
          <>
            <span className="text-4xl" aria-hidden="true"></span>
            <p className="mt-1 text-xs text-text-secondary dark:text-gray-300">
              أي خدمة قد تكون مجانية لكِ هذا الشهر
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {SURPRISES.map((s) => (
                <span
                  key={s.text}
                  className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  {s.emoji} {s.text}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-amber-700 dark:text-amber-300">
          {givenThisMonth} لفتة جمال هذا الشهر
        </p>
      </div>

      {/* CTA */}
      {!hasWon && (
        <button
          type="button"
          onClick={onCheckEligibility}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
        >
          تفقدي أهليتكِ
        </button>
      )}

      {hasWon && (
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          احجزي هديتكِ الآن
        </button>
      )}

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        الجمال أحياناً يأتي كهدية غير متوقعة
      </p>
    </div>
  );
}
