'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Pen Pal Card — connect women across Saudi cities through beauty.
 * From Phase W4: Sisterhood & Community — Beauty Circles.
 *
 * Usage:
 *   <BeautyPenPalCard match={{ city: 'جدة', interest: 'مكياج' }} />
 */

interface PenPalMatch {
  city: string;
  interest: string;
  emoji?: string;
}

interface BeautyPenPalCardProps {
  match: PenPalMatch;
  onConnect?: () => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  youText?: string;
  friendText?: string;
  cityLabel?: string;
  interestLabel?: string;
  connectButtonText?: string;
  footerText?: string;
  className?: string;
}

const CITIES: { ar: string; en: string }[] = [
  { ar: 'الرياض', en: 'Riyadh' },
  { ar: 'جدة', en: 'Jeddah' },
  { ar: 'الدمام', en: 'Dammam' },
  { ar: 'مكة', en: 'Mecca' },
  { ar: 'المدينة', en: 'Medina' },
  { ar: 'أبها', en: 'Abha' },
  { ar: 'تبوك', en: 'Tabuk' },
  { ar: 'القصيم', en: 'Qassim' },
];

export function BeautyPenPalCard({
  match,
  onConnect,
  className = '',
  locale = 'ar',
  title = 'صديقة الجمال',
  subtitle = 'تعرفي على نساء يشاركنكِ شغف الجمال',
  youText = 'أنتِ',
  friendText = 'صديقتكِ',
  cityLabel = 'المدينة',
  interestLabel = 'الاهتمام',
  connectButtonText = 'تواصلي معها',
  footerText = 'الصداقة أجمل هدية — من الرياض إلى جدة إلى الدمام',
}: BeautyPenPalCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-5 dark:border-brand-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ️
        </span>
        <h4 className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-300">{title}</h4>
        <p className="text-[10px] text-brand-500 dark:text-brand-400">{subtitle}</p>
      </div>

      {/* Match card */}
      <div className="mt-3 rounded-xl bg-gradient-to-br from-brand-50 to-pink-50 p-4 dark:from-brand-950 dark:to-pink-950">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-200 text-lg dark:bg-brand-800"></div>
            <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {youText}
            </p>
          </div>
          <span className="text-brand-400 text-xl" aria-hidden="true"></span>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-200 text-lg dark:bg-pink-800">
              ‍
            </div>
            <p className="mt-1 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {friendText}
            </p>
          </div>
        </div>
      </div>

      {/* Interest + city */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-brand-50 p-2.5 text-center dark:bg-brand-950">
          <p className="text-[9px] text-text-tertiary dark:text-text-secondary">{cityLabel}</p>
          <p className="text-xs font-bold text-brand-700 dark:text-brand-300"> {match.city}</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-2.5 text-center dark:bg-brand-950">
          <p className="text-[9px] text-text-tertiary dark:text-text-secondary">{interestLabel}</p>
          <p className="text-xs font-bold text-brand-700 dark:text-brand-300">
            {match.emoji || ''} {match.interest}
          </p>
        </div>
      </div>

      {/* Cities */}
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {CITIES.map((c) => (
          <span
            key={c.ar}
            className={cn(
              'rounded-full px-2 py-0.5 text-[9px] font-medium',
              c.ar === match.city
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
                : 'bg-surface-muted text-text-tertiary dark:bg-gray-800 dark:text-text-secondary',
            )}
          >
            {c[locale]}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onConnect}
        className="mt-3 w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 active:scale-[0.98] transition-all"
      >
        {connectButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-text-secondary">
        {footerText}
      </p>
    </div>
  );
}
