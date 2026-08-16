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
  title: string;
  levels: string[];
  duration: string;
  accredited: boolean;
}

const PATHS: Record<CertPath, PathDef> = {
  makeup: {
    emoji: '',
    title: 'مكياج احترافي',
    levels: ['أساسي', 'متقدم', 'ماستر'],
    duration: '6-12 شهر',
    accredited: true,
  },
  skincare: {
    emoji: '',
    title: 'عناية بالبشرة',
    levels: ['أساسي', 'متقدم', 'أخصائي'],
    duration: '9-18 شهر',
    accredited: true,
  },
  henna: {
    emoji: '',
    title: 'فن الحناء',
    levels: ['تقليدي', 'عصري', 'مناسبات'],
    duration: '3-6 شهر',
    accredited: false,
  },
  salon_management: {
    emoji: '',
    title: 'إدارة الصالونات',
    levels: ['مشرفة', 'مديرة', 'مالكة'],
    duration: '12 شهر',
    accredited: true,
  },
  lash_tech: {
    emoji: '️',
    title: 'تقنية الرموش',
    levels: ['كلاسيك', 'فوليوم', 'هايبريد'],
    duration: '3-6 شهر',
    accredited: false,
  },
};

interface BeautyCertificationPathCardProps {
  path: CertPath;
  onEnroll?: () => void;
  className?: string;
}

export function BeautyCertificationPathCard({
  path,
  onEnroll,
  className = '',
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
          <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">{p.title}</h4>
          <p className="text-[10px] text-blue-500 dark:text-blue-400">مسار شهادة معتمدة</p>
        </div>
        {p.accredited && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            ️ معتمد
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">المستويات</p>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-200">
            {p.levels.join(' → ')}
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-center dark:bg-blue-950">
          <p className="text-[9px] text-blue-600 dark:text-blue-400">المدة</p>
          <p className="text-xs font-bold text-blue-800 dark:text-blue-200">{p.duration}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEnroll}
        className="mt-3 w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        سجلي في المسار
      </button>
    </div>
  );
}
