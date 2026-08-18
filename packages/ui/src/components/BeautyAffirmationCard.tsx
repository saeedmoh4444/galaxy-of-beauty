'use client';

import { useState } from 'react';
import { cn } from '@galaxy/shared';

/**
 * Beauty Affirmation Card — daily positive affirmations for self-love.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyAffirmationCard />
 */

const AFFIRMATIONS = [
  { ar: 'أنا جميلة كما أنا', en: 'I am beautiful as I am' },
  { ar: 'بشرتي متوهجة وصحية', en: 'My skin is glowing and healthy' },
  { ar: 'أنا أستحق العناية بنفسي', en: 'I deserve to care for myself' },
  { ar: 'جمالي الداخلي يشرق للخارج', en: 'My inner beauty shines outward' },
  { ar: 'كل يوم أزداد جمالاً وثقة', en: 'Every day I grow more beautiful and confident' },
  { ar: 'أنا ممتنة لجسدي وصحتي', en: 'I am grateful for my body and health' },
  { ar: 'عيوبي تجعلني فريدة', en: 'My imperfections make me unique' },
  { ar: 'أنا أحب نفسي بدون شروط', en: 'I love myself unconditionally' },
];

interface BeautyAffirmationCardProps {
  /** Display language for built-in affirmations */
  locale?: 'ar' | 'en';
  title?: string;
  nextButtonText?: string;
  className?: string;
}

export function BeautyAffirmationCard({
  className = '',
  locale = 'ar',
  title = 'توكيدات إيجابية',
  nextButtonText = 'التأكيد التالي ←',
}: BeautyAffirmationCardProps): JSX.Element {
  const [index, setIndex] = useState(0);
  const affirmation = AFFIRMATIONS[index]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-5 text-center dark:bg-gray-800/60">
        <p className="text-lg font-bold leading-relaxed text-pink-800 dark:text-pink-200">
          &ldquo;{affirmation[locale]}&rdquo;
        </p>
        <p className="mt-2 text-2xl" aria-hidden="true"></p>
      </div>

      <div className="mt-2 flex justify-center gap-1">
        {AFFIRMATIONS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'bg-pink-500 w-3' : 'bg-pink-200 dark:bg-pink-800 w-1.5',
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIndex((p) => (p + 1) % AFFIRMATIONS.length)}
        className="mt-3 w-full rounded-xl border border-pink-200 py-2 text-[10px] font-bold text-pink-700 hover:bg-white/60 dark:hover:bg-gray-800/60 dark:border-pink-800 dark:text-pink-300 transition-colors"
      >
        {nextButtonText}
      </button>
    </div>
  );
}
