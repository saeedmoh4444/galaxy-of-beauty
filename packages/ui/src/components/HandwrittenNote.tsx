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
}

const MILESTONE_MESSAGES: Record<number, { emoji: string; title: string; message: string }> = {
  10: {
    emoji: '💌',
    title: '10 حجوزات!',
    message: 'شكراً لكِ على ثقتكِ بنا. أنتِ جزء من عائلة جالاكسي بيوتي الآن.',
  },
  25: {
    emoji: '💐',
    title: '25 حجوزات!',
    message: 'أنتِ من أروع عميلاتنا. شكراً لوجودكِ معنا في كل مرة.',
  },
  50: {
    emoji: '👑',
    title: '50 حجوزات!',
    message: 'لا نجد كلمات توفيكِ حقكِ. شكراً من القلب — أنتِ ملكة جالاكسي بيوتي.',
  },
  100: {
    emoji: '💎',
    title: '100 حجوزات!',
    message: 'مئة مرة! أنتِ لستِ عميلة — أنتِ أخت وصديقة. شكراً لكل مرة.',
  },
};

export function HandwrittenNote({
  bookingCount,
  technicianName,
  message,
  className = '',
}: HandwrittenNoteProps): JSX.Element | null {
  // Find the relevant milestone
  const milestones = Object.keys(MILESTONE_MESSAGES).map(Number).sort((a, b) => a - b);
  const milestone = milestones.find((m) => bookingCount >= m && bookingCount < m + 15);

  if (!milestone) return null;

  const note = MILESTONE_MESSAGES[milestone]!;
  const displayMessage = message ?? note.message;

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 dark:border-rose-900 dark:from-rose-950 dark:via-gray-900 dark:to-pink-950',
        className,
      )}
    >
      {/* Paper texture feel */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">{note.emoji}</span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          {note.title}
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
            ✍️ مع حب، {technicianName}
          </p>
        )}
      </div>

      {/* Booking count */}
      <div className="mt-2 text-center">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          🎀 حجز #{bookingCount}
        </span>
      </div>

      {/* Next milestone */}
      {bookingCount < 100 && (
        <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
          💕 {milestone + 15 - bookingCount} حجوزات متبقية لمفاجأتكِ القادمة
        </p>
      )}

      <p className="mt-1 text-center text-[9px] italic text-rose-500 dark:text-rose-400">
        ✨ لأن كل حجز هو قصة جميلة بيننا
      </p>
    </div>
  );
}
