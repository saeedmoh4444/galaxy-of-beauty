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
  /** Heading when the user won */
  wonTitle?: string;
  /** Heading when no one won yet */
  surpriseTitle?: string;
  /** Prefix before the surprise name in the won description */
  wonPrefix?: string;
  /** Suffix after the surprise name in the won description */
  wonSuffix?: string;
  /** Description when eligible */
  eligibleText?: string;
  /** "Enjoy it" note */
  enjoyText?: string;
  /** Description when not won yet */
  anyServiceText?: string;
  /** Suffix after the given-this-month count */
  actsSuffix?: string;
  /** Check-eligibility button label */
  checkEligibilityText?: string;
  /** Book-gift button label */
  bookGiftText?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for surprise texts */
  locale?: 'ar' | 'en';
}

const SURPRISES = [
  { emoji: '', text: { ar: 'قصة شعر مجانية', en: 'Free haircut' } },
  { emoji: '', text: { ar: 'مانيكير مجاني', en: 'Free manicure' } },
  { emoji: '', text: { ar: 'جلسة عناية بالبشرة', en: 'Skincare session' } },
  { emoji: '', text: { ar: 'مساج استرخاء', en: 'Relaxing massage' } },
  { emoji: '', text: { ar: 'مكياج احترافي', en: 'Professional makeup' } },
];

export function RandomActOfBeauty({
  hasWon = false,
  givenThisMonth = 24,
  onCheckEligibility,
  className = '',
  wonTitle = 'أنتِ الفائزة!',
  surpriseTitle = 'لفتة جمال',
  wonPrefix = 'مبروك! فزتِ بـ ',
  wonSuffix = 'هذا الشهر',
  eligibleText = 'مرة في الشهر — خدمة مجانية لامرأة محظوظة',
  enjoyText = 'استمتعي بها — منا لكِ',
  anyServiceText = 'أي خدمة قد تكون مجانية لكِ هذا الشهر',
  actsSuffix = 'لفتة جمال هذا الشهر',
  checkEligibilityText = 'تفقدي أهليتكِ',
  bookGiftText = 'احجزي هديتكِ الآن',
  footerText = 'الجمال أحياناً يأتي كهدية غير متوقعة',
  locale = 'ar',
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
          {hasWon ? wonTitle : surpriseTitle}
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {hasWon ? `${wonPrefix}${surprise.text[locale]} ${wonSuffix}` : eligibleText}
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
              {surprise.text[locale]}
            </p>
            <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">{enjoyText}</p>
          </>
        ) : (
          <>
            <span className="text-4xl" aria-hidden="true"></span>
            <p className="mt-1 text-xs text-text-secondary dark:text-gray-300">{anyServiceText}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {SURPRISES.map((s) => (
                <span
                  key={s.text.ar}
                  className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  {s.emoji} {s.text[locale]}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-amber-700 dark:text-amber-300">
          {givenThisMonth} {actsSuffix}
        </p>
      </div>

      {/* CTA */}
      {!hasWon && (
        <button
          type="button"
          onClick={onCheckEligibility}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
        >
          {checkEligibilityText}
        </button>
      )}

      {hasWon && (
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          {bookGiftText}
        </button>
      )}

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}
