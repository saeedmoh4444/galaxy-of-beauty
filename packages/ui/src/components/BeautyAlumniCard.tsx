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
  className?: string;
}

export function BeautyAlumniCard({ alumna, onViewProfile, className = '' }: BeautyAlumniCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-purple-100 bg-white p-4 dark:border-purple-900 dark:bg-gray-900', className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 text-xl dark:from-purple-800 dark:to-indigo-800">
          {alumna.emoji || '🎓'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{alumna.name}</h4>
          <p className="text-xs font-bold text-text-primary dark:text-gray-100">{alumna.currentRole}</p>
          <p className="text-[10px] text-text-tertiary dark:text-gray-500">
            🎓 خريجة {alumna.graduationYear}
            {alumna.city && ` · 📍 ${alumna.city}`}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
        <p className="text-[10px] leading-relaxed text-purple-700 dark:text-purple-300">
          &ldquo;{alumna.story}&rdquo;
        </p>
      </div>

      <button type="button" onClick={onViewProfile} className="mt-3 w-full rounded-lg border border-purple-200 py-1.5 text-[10px] font-bold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 transition-colors">
        شاهدِي قصتها 🎓
      </button>
    </div>
  );
}
