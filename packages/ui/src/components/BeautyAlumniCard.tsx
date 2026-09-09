'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Alumni Card — spotlight for Academy graduates.
 * From Phase W10: Saudi Women Leadership & W6: Education.
 *
 * Usage:
 *   <BeautyAlumniCard alumna={{ name: 'نورة', graduationYear: '2025', currentRole: 'مديرة صالون', story: 'من خبيرة إلى مالكة' }} />
 */

interface Alumna {
  name: string;
  graduationYear: string;
  currentRole: string;
  story: string;
  emoji?: string;
  city?: string;
}

interface BeautyAlumniCardProps {
  alumna: Alumna;
  onViewProfile?: () => void;
  graduatePrefix?: string;
  viewProfileText?: string;
  className?: string;
}

export function BeautyAlumniCard({
  alumna,
  onViewProfile,
  graduatePrefix = 'خريجة',
  viewProfileText = 'شاهدِي قصتها',
  className = '',
}: BeautyAlumniCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-4 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-200 to-indigo-200 text-xl dark:from-brand-800 dark:to-indigo-800">
          {alumna.emoji || ''}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-brand-700 dark:text-brand-300">{alumna.name}</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">
            {alumna.currentRole}
          </p>
          <p className="text-[10px] text-text-tertiary dark:text-text-secondary">
            {graduatePrefix} {alumna.graduationYear}
            {alumna.city && ` ·  ${alumna.city}`}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-brand-50 p-3 dark:bg-brand-950">
        <p className="text-[10px] leading-relaxed text-brand-700 dark:text-brand-300">
          &ldquo;{alumna.story}&rdquo;
        </p>
      </div>

      <button
        type="button"
        onClick={onViewProfile}
        className="mt-3 w-full rounded-lg border border-brand-200 py-1.5 text-[10px] font-bold text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 transition-colors"
      >
        {viewProfileText}
      </button>
    </div>
  );
}
