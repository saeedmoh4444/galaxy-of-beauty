'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Gratitude Card — gratitude journaling for beauty & self-care.
 * From Phase W9: The Small Details & W3: Mental Wellness.
 *
 * Usage:
 *   <BeautyGratitudeCard onAddEntry={() => {}} />
 */

interface BeautyGratitudeCardProps {
  entries?: number;
  onAddEntry?: () => void;
  className?: string;
}

const PROMPTS = [
  'أنا ممتنة لبشرتي لأنها...',
  'اليوم أشعر بالجمال عندما...',
  'أحب في مظهري...',
  'جسدي قوي لأنه...',
];

export function BeautyGratitudeCard({
  entries = 0,
  onAddEntry,
  className = '',
}: BeautyGratitudeCardProps): JSX.Element {
  const prompt = PROMPTS[entries % PROMPTS.length]!;

  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          🙏
        </span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          يوميات الامتنان
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">{entries} مدخل</p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-lg" aria-hidden="true">
          ✍️
        </p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-amber-800 dark:text-amber-200">
          &ldquo;{prompt}&rdquo;
        </p>
      </div>

      <button
        type="button"
        onClick={onAddEntry}
        className="mt-3 w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
      >
        ✍️ اكتبي اليوم
      </button>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        🙏 الامتنان يجعل الجمال يدوم
      </p>
    </div>
  );
}
