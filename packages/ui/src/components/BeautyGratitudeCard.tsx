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
  /** Display language for built-in prompts */
  locale?: 'ar' | 'en';
  title?: string;
  entriesLabel?: string;
  addEntryText?: string;
  footerText?: string;
  className?: string;
}

const PROMPTS = [
  { ar: 'أنا ممتنة لبشرتي لأنها...', en: 'I am grateful for my skin because...' },
  { ar: 'اليوم أشعر بالجمال عندما...', en: 'Today I feel beautiful when...' },
  { ar: 'أحب في مظهري...', en: 'I love about my appearance...' },
  { ar: 'جسدي قوي لأنه...', en: 'My body is strong because...' },
];

export function BeautyGratitudeCard({
  entries = 0,
  onAddEntry,
  className = '',
  locale = 'ar',
  title = 'يوميات الامتنان',
  entriesLabel = 'مدخل',
  addEntryText = '️ اكتبي اليوم',
  footerText = 'الامتنان يجعل الجمال يدوم',
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
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          {entries} {entriesLabel}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-lg" aria-hidden="true">
          ️
        </p>
        <p className="mt-1 text-sm font-bold leading-relaxed text-amber-800 dark:text-amber-200">
          &ldquo;{prompt[locale]}&rdquo;
        </p>
      </div>

      <button
        type="button"
        onClick={onAddEntry}
        className="mt-3 w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
      >
        {addEntryText}
      </button>

      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}
