'use client';

import { cn } from '@galaxy/shared';

/**
 * Handwritten Note — scanned handwritten thank you after 10th booking.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <HandwrittenNote bookingCount={10} technicianName="نورة" />
 */

interface HandwrittenNoteProps {
  bookingCount: number;
  technicianName?: string;
  message?: string;
  className?: string;
  /** Prefix before the technician name */
  withLovePrefix?: string;
  /** Prefix before the booking count */
  bookingCountPrefix?: string;
  /** Suffix for the next-milestone hint */
  nextMilestoneSuffix?: string;
  /** Footer text */
  footerText?: string;
  /** Display locale for milestone titles and messages */
  locale?: 'ar' | 'en';
}

const MILESTONE_MESSAGES: Record<
  number,
  { emoji: string; title: { ar: string; en: string }; message: { ar: string; en: string } }
> = {
  10: {
    emoji: '',
    title: { ar: '10 حجوزات!', en: '10 bookings!' },
    message: {
      ar: 'شكراً لكِ على ثقتكِ بنا. أنتِ جزء من عائلة جالاكسي بيوتي الآن.',
      en: 'Thank you for trusting us. You are now part of the Galaxy Beauty family.',
    },
  },
  25: {
    emoji: '',
    title: { ar: '25 حجوزات!', en: '25 bookings!' },
    message: {
      ar: 'أنتِ من أروع عميلاتنا. شكراً لوجودكِ معنا في كل مرة.',
      en: 'You are one of our most wonderful clients. Thank you for being with us every time.',
    },
  },
  50: {
    emoji: '',
    title: { ar: '50 حجوزات!', en: '50 bookings!' },
    message: {
      ar: 'لا نجد كلمات توفيكِ حقكِ. شكراً من القلب — أنتِ ملكة جالاكسي بيوتي.',
      en: 'Words cannot do you justice. Thank you from the heart — you are the queen of Galaxy Beauty.',
    },
  },
  100: {
    emoji: '',
    title: { ar: '100 حجوزات!', en: '100 bookings!' },
    message: {
      ar: 'مئة مرة! أنتِ لستِ عميلة — أنتِ أخت وصديقة. شكراً لكل مرة.',
      en: 'A hundred times! You are not a client — you are a sister and a friend. Thank you for every time.',
    },
  },
};

export function HandwrittenNote({
  bookingCount,
  technicianName,
  message,
  className = '',
  withLovePrefix = '️ مع حب، ',
  bookingCountPrefix = 'حجز #',
  nextMilestoneSuffix = 'حجوزات متبقية لمفاجأتكِ القادمة',
  footerText = 'لأن كل حجز هو قصة جميلة بيننا',
  locale = 'ar',
}: HandwrittenNoteProps): JSX.Element | null {
  // Find the relevant milestone
  const milestones = Object.keys(MILESTONE_MESSAGES)
    .map(Number)
    .sort((a, b) => a - b);
  const milestone = milestones.find((m) => bookingCount >= m && bookingCount < m + 15);

  if (!milestone) return null;

  const note = MILESTONE_MESSAGES[milestone]!;
  const displayMessage = message ?? note.message[locale];

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 dark:border-rose-900 dark:from-rose-950 dark:via-gray-900 dark:to-pink-950',
        className,
      )}
    >
      {/* Paper texture feel */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          {note.emoji}
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {note.title[locale]}
        </h4>
      </div>

      {/* Handwritten-style message */}
      <div className="mt-3 rounded-xl bg-white/80 p-4 dark:bg-gray-800/80">
        <p
          className="text-center text-sm leading-relaxed text-rose-800 dark:text-rose-200"
          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
        >
          &ldquo;{displayMessage}&rdquo;
        </p>
        {technicianName && (
          <p className="mt-2 text-center text-xs text-text-tertiary dark:text-gray-400">
            {withLovePrefix}
            {technicianName}
          </p>
        )}
      </div>

      {/* Booking count */}
      <div className="mt-2 text-center">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          {bookingCountPrefix}
          {bookingCount}
        </span>
      </div>

      {/* Next milestone */}
      {bookingCount < 100 && (
        <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
          {milestone + 15 - bookingCount} {nextMilestoneSuffix}
        </p>
      )}

      <p className="mt-1 text-center text-[9px] italic text-rose-500 dark:text-rose-400">
        {footerText}
      </p>
    </div>
  );
}
