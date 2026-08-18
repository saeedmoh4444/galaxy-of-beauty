'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Career Path Card — career paths in the beauty industry.
 * From Phase W6: Education & Empowerment — Galaxy Beauty Academy.
 *
 * Usage:
 *   <BeautyCareerPathCard path="makeup_artist" />
 */

type CareerPath =
  | 'makeup_artist'
  | 'skincare_specialist'
  | 'salon_manager'
  | 'henna_artist'
  | 'beauty_blogger'
  | 'product_developer';

interface PathDef {
  emoji: string;
  title: { ar: string; en: string };
  avgSalary: string;
  courses: { ar: string; en: string }[];
  duration: { ar: string; en: string };
}

const PATHS: Record<CareerPath, PathDef> = {
  makeup_artist: {
    emoji: '',
    title: { ar: 'خبيرة مكياج', en: 'Makeup artist' },
    avgSalary: '5000-15000',
    courses: [
      { ar: 'أساسيات المكياج', en: 'Makeup basics' },
      { ar: 'مكياج المناسبات', en: 'Occasion makeup' },
      { ar: 'مكياج HD', en: 'HD makeup' },
    ],
    duration: { ar: '6 أشهر', en: '6 months' },
  },
  skincare_specialist: {
    emoji: '',
    title: { ar: 'أخصائية بشرة', en: 'Skincare specialist' },
    avgSalary: '6000-18000',
    courses: [
      { ar: 'علوم البشرة', en: 'Skin science' },
      { ar: 'تحليل البشرة', en: 'Skin analysis' },
      { ar: 'علاجات متقدمة', en: 'Advanced treatments' },
    ],
    duration: { ar: '9 أشهر', en: '9 months' },
  },
  salon_manager: {
    emoji: '',
    title: { ar: 'مديرة صالون', en: 'Salon manager' },
    avgSalary: '8000-20000',
    courses: [
      { ar: 'إدارة الأعمال', en: 'Business management' },
      { ar: 'قيادة الفريق', en: 'Team leadership' },
      { ar: 'التسويق', en: 'Marketing' },
    ],
    duration: { ar: '12 شهر', en: '12 months' },
  },
  henna_artist: {
    emoji: '',
    title: { ar: 'فنانة حناء', en: 'Henna artist' },
    avgSalary: '4000-12000',
    courses: [
      { ar: 'أساسيات الحناء', en: 'Henna basics' },
      { ar: 'نقوش متقدمة', en: 'Advanced patterns' },
      { ar: 'حناء المناسبات', en: 'Occasion henna' },
    ],
    duration: { ar: '3 أشهر', en: '3 months' },
  },
  beauty_blogger: {
    emoji: '',
    title: { ar: 'مدونة جمال', en: 'Beauty blogger' },
    avgSalary: '3000-20000',
    courses: [
      { ar: 'صناعة المحتوى', en: 'Content creation' },
      { ar: 'التصوير', en: 'Photography' },
      { ar: 'التسويق الرقمي', en: 'Digital marketing' },
    ],
    duration: { ar: '4 أشهر', en: '4 months' },
  },
  product_developer: {
    emoji: '',
    title: { ar: 'مطورة منتجات', en: 'Product developer' },
    avgSalary: '10000-25000',
    courses: [
      { ar: 'كيمياء التجميل', en: 'Cosmetic chemistry' },
      { ar: 'تطوير المنتجات', en: 'Product development' },
      { ar: 'سلامة المنتجات', en: 'Product safety' },
    ],
    duration: { ar: '12 شهر', en: '12 months' },
  },
};

interface BeautyCareerPathCardProps {
  path: CareerPath;
  onLearnMore?: () => void;
  className?: string;
  /** Subtitle under the path title */
  subtitle?: string;
  /** Label for the salary box */
  salaryLabel?: string;
  /** Currency suffix shown after the salary */
  currencySuffix?: string;
  /** Label for the duration box */
  durationLabel?: string;
  /** Label for the courses section */
  coursesLabel?: string;
  /** Learn more button label */
  learnMoreLabel?: string;
  /** Locale for internal path data strings */
  locale?: 'ar' | 'en';
}

export function BeautyCareerPathCard({
  path,
  onLearnMore,
  className = '',
  subtitle = 'مسار مهني في التجميل',
  salaryLabel = 'متوسط الدخل',
  currencySuffix = 'ر.س',
  durationLabel = 'المدة',
  coursesLabel = ' الدورات',
  learnMoreLabel = 'اكتشفي المسار',
  locale = 'ar',
}: BeautyCareerPathCardProps): JSX.Element {
  const p = PATHS[path];

  return (
    <div
      className={cn(
        'rounded-2xl border border-teal-100 bg-white p-4 dark:border-teal-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 text-xl dark:from-teal-900 dark:to-emerald-900">
          {p.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{p.title[locale]}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">{subtitle}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">{salaryLabel}</p>
          <p className="text-xs font-bold text-teal-800 dark:text-teal-200">
            {p.avgSalary} {currencySuffix}
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">{durationLabel}</p>
          <p className="text-xs font-bold text-teal-800 dark:text-teal-200">{p.duration[locale]}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-teal-50 p-2.5 dark:bg-teal-950">
        <p className="text-[10px] font-bold text-teal-700 dark:text-teal-300">{coursesLabel}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {p.courses.map((c) => (
            <span
              key={c.ar}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-teal-700 dark:bg-gray-800 dark:text-teal-300"
            >
              {c[locale]}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
        {learnMoreLabel}
      </button>
    </div>
  );
}
