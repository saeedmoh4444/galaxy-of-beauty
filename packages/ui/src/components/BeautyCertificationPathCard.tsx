'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Certification Path Card — accredited certification tracks for beauty careers.
 * From Phase W6: Education & Empowerment — Paid Certifications.
 *
 * Usage:
 *   <BeautyCertificationPathCard path="makeup" />
 */

type CertPath = 'makeup' | 'skincare' | 'henna' | 'salon_management' | 'lash_tech';

interface PathDef {
  emoji: string;
  title: { ar: string; en: string };
  levels: { ar: string; en: string }[];
  duration: { ar: string; en: string };
  accredited: boolean;
}

const PATHS: Record<CertPath, PathDef> = {
  makeup: {
    emoji: '',
    title: { ar: 'مكياج احترافي', en: 'Professional makeup' },
    levels: [
      { ar: 'أساسي', en: 'Foundation' },
      { ar: 'متقدم', en: 'Advanced' },
      { ar: 'ماستر', en: 'Master' },
    ],
    duration: { ar: '6-12 شهر', en: '6-12 months' },
    accredited: true,
  },
  skincare: {
    emoji: '',
    title: { ar: 'عناية بالبشرة', en: 'Skincare' },
    levels: [
      { ar: 'أساسي', en: 'Foundation' },
      { ar: 'متقدم', en: 'Advanced' },
      { ar: 'أخصائي', en: 'Specialist' },
    ],
    duration: { ar: '9-18 شهر', en: '9-18 months' },
    accredited: true,
  },
  henna: {
    emoji: '',
    title: { ar: 'فن الحناء', en: 'Henna art' },
    levels: [
      { ar: 'تقليدي', en: 'Traditional' },
      { ar: 'عصري', en: 'Modern' },
      { ar: 'مناسبات', en: 'Occasions' },
    ],
    duration: { ar: '3-6 شهر', en: '3-6 months' },
    accredited: false,
  },
  salon_management: {
    emoji: '',
    title: { ar: 'إدارة الصالونات', en: 'Salon management' },
    levels: [
      { ar: 'مشرفة', en: 'Supervisor' },
      { ar: 'مديرة', en: 'Manager' },
      { ar: 'مالكة', en: 'Owner' },
    ],
    duration: { ar: '12 شهر', en: '12 months' },
    accredited: true,
  },
  lash_tech: {
    emoji: '️',
    title: { ar: 'تقنية الرموش', en: 'Lash technology' },
    levels: [
      { ar: 'كلاسيك', en: 'Classic' },
      { ar: 'فوليوم', en: 'Volume' },
      { ar: 'هايبريد', en: 'Hybrid' },
    ],
    duration: { ar: '3-6 شهر', en: '3-6 months' },
    accredited: false,
  },
};

interface BeautyCertificationPathCardProps {
  path: CertPath;
  onEnroll?: () => void;
  className?: string;
  /** Subtitle under the path title */
  subtitle?: string;
  /** Badge showing the path is accredited */
  accreditedLabel?: string;
  /** Label for the levels box */
  levelsLabel?: string;
  /** Label for the duration box */
  durationLabel?: string;
  /** Enroll button label */
  enrollLabel?: string;
  /** Locale for internal path data strings */
  locale?: 'ar' | 'en';
}

export function BeautyCertificationPathCard({
  path,
  onEnroll,
  className = '',
  subtitle = 'مسار شهادة معتمدة',
  accreditedLabel = '️ معتمد',
  levelsLabel = 'المستويات',
  durationLabel = 'المدة',
  enrollLabel = 'سجلي في المسار',
  locale = 'ar',
}: BeautyCertificationPathCardProps): JSX.Element {
  const p = PATHS[path];

  return (
    <div
      className={cn(
        'rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-xl dark:from-blue-900 dark:to-indigo-900">
          {p.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{p.title[locale]}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">{subtitle}</p>
        </div>
        {p.accredited && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {accreditedLabel}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">{levelsLabel}</p>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-200">
            {p.levels.map((l) => l[locale]).join(' → ')}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">{durationLabel}</p>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-200">{p.duration[locale]}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEnroll}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {enrollLabel}
      </button>
    </div>
  );
}
