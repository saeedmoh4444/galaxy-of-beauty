'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Mirror Sticker Card — "You're Beautiful" mirror affirmations in every salon.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <MirrorStickerCard />
 */

const AFFIRMATIONS = [
  'أنتِ جميلة كما أنتِ',
  'ابتسامتكِ تضيء العالم',
  'جمالكِ الداخلي هو قوتكِ',
  'أنتِ أقوى مما تتصورين',
  'اليوم يومكِ — تألقي',
  'لا تقارني نفسكِ بأحد — أنتِ فريدة',
  'عيوبكِ جزء من جمالكِ',
  'أنتِ تستحقين كل خير',
  'كوني فخورة بنفسكِ',
  'جمالكِ لا يحتاج تفسيراً',
];

interface MirrorStickerCardProps {
  className?: string;
}

export function MirrorStickerCard({ className = '' }: MirrorStickerCardProps): JSX.Element {
  const [index] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const affirmation = AFFIRMATIONS[index]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-white p-5 dark:border-pink-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          🪞
        </span>
        <h4 className="mt-1 text-sm font-bold text-pink-700 dark:text-pink-300">مرآة الجمال</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">انظري في المرآة واقرئي</p>
      </div>

      {/* Mirror frame */}
      <div className="mt-3 mx-auto max-w-[200px] rounded-2xl border-4 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 text-center dark:border-pink-800 dark:from-pink-950 dark:to-rose-950">
        <p
          className="text-sm font-bold leading-relaxed text-pink-800 dark:text-pink-200"
          style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
        >
          &ldquo;{affirmation}&rdquo;
        </p>
        <p className="mt-2 text-2xl" aria-hidden="true"></p>
      </div>

      {/* Context */}
      <div className="mt-3 rounded-xl bg-pink-50 p-3 dark:bg-pink-950">
        <p className="text-center text-[10px] text-pink-700 dark:text-pink-300">
          🪞 هذه الرسالة على مرآة كل صالون شريك — لأنكِ تستحقين أن تسمعيها كل يوم
        </p>
      </div>

      {/* More affirmations */}
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {AFFIRMATIONS.slice(0, 5).map((a) => (
          <span
            key={a}
            className="rounded-full bg-pink-50 px-2 py-0.5 text-[9px] text-pink-600 dark:bg-pink-950 dark:text-pink-400"
          >
            {a}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">
        &ldquo;قفي أمام المرآة كل صباح وقولي: أنا جميلة، أنا قوية، أنا كافية&rdquo;
      </p>
    </div>
  );
}
