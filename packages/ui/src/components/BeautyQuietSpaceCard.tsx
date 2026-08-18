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
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  footerText?: string;
  className?: string;
}

const FEATURES_MAP: Record<string, { emoji: string; label: { ar: string; en: string } }> = {
  meditation_cushions: { emoji: '', label: { ar: 'وسائد تأمل', en: 'Meditation cushions' } },
  sound_machine: { emoji: '', label: { ar: 'جهاز أصوات مهدئة', en: 'Calming sound machine' } },
  dim_lights: { emoji: '', label: { ar: 'إضاءة خافتة', en: 'Dim lighting' } },
  aromatherapy: { emoji: '', label: { ar: 'علاج بالروائح', en: 'Aromatherapy' } },
  weighted_blanket: { emoji: '', label: { ar: 'بطانية ثقيلة', en: 'Weighted blanket' } },
  tea_station: { emoji: '', label: { ar: 'ركن شاي', en: 'Tea corner' } },
};

export function BeautyQuietSpaceCard({
  features,
  className = '',
  locale = 'ar',
  title = 'المساحة الهادئة',
  subtitle = 'مكان للتأمل والاسترخاء',
  footerText = 'خذي لحظة لنفسكِ',
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
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
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
                {def.label[locale]}
              </span>
            </div>
          ) : null;
        })}
      </div>
      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        {footerText}
      </p>
    </div>
  );
}
