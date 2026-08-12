'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Quiet Space Card — dedicated quiet/meditation space in salons.
 * From Phase W8: Accessibility & Inclusivity.
 *
 * Usage:
 *   <BeautyQuietSpaceCard features={['meditation_cushions', 'sound_machine', 'dim_lights']} />
 */

interface BeautyQuietSpaceCardProps {
  features: string[];
  className?: string;
}

const FEATURES_MAP: Record<string, { emoji: string; label: string }> = {
  meditation_cushions: { emoji: '', label: 'وسائد تأمل' },
  sound_machine: { emoji: '', label: 'جهاز أصوات مهدئة' },
  dim_lights: { emoji: '', label: 'إضاءة خافتة' },
  aromatherapy: { emoji: '', label: 'علاج بالروائح' },
  weighted_blanket: { emoji: '', label: 'بطانية ثقيلة' },
  tea_station: { emoji: '', label: 'ركن شاي' },
};

export function BeautyQuietSpaceCard({
  features,
  className = '',
}: BeautyQuietSpaceCardProps): JSX.Element | null {
  if (!features.length) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-indigo-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          
        </span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">
          المساحة الهادئة
        </h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">مكان للتأمل والاسترخاء</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {features.map((f) => {
          const def = FEATURES_MAP[f];
          return def ? (
            <div
              key={f}
              className="flex items-center gap-2 rounded-lg bg-white/60 px-2.5 py-2 dark:bg-gray-800/60"
            >
              <span className="text-sm">{def.emoji}</span>
              <span className="text-[10px] font-medium text-purple-800 dark:text-purple-200">
                {def.label}
              </span>
            </div>
          ) : null;
        })}
      </div>
      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
         خذي لحظة لنفسكِ
      </p>
    </div>
  );
}
