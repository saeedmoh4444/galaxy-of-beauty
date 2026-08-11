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
  title: string;
  avgSalary: string;
  courses: string[];
  duration: string;
}

const PATHS: Record<CareerPath, PathDef> = {
  makeup_artist: {
    emoji: '💄',
    title: 'خبيرة مكياج',
    avgSalary: '5000-15000',
    courses: ['أساسيات المكياج', 'مكياج المناسبات', 'مكياج HD'],
    duration: '6 أشهر',
  },
  skincare_specialist: {
    emoji: '🧴',
    title: 'أخصائية بشرة',
    avgSalary: '6000-18000',
    courses: ['علوم البشرة', 'تحليل البشرة', 'علاجات متقدمة'],
    duration: '9 أشهر',
  },
  salon_manager: {
    emoji: '🏪',
    title: 'مديرة صالون',
    avgSalary: '8000-20000',
    courses: ['إدارة الأعمال', 'قيادة الفريق', 'التسويق'],
    duration: '12 شهر',
  },
  henna_artist: {
    emoji: '🤚',
    title: 'فنانة حناء',
    avgSalary: '4000-12000',
    courses: ['أساسيات الحناء', 'نقوش متقدمة', 'حناء المناسبات'],
    duration: '3 أشهر',
  },
  beauty_blogger: {
    emoji: '📱',
    title: 'مدونة جمال',
    avgSalary: '3000-20000',
    courses: ['صناعة المحتوى', 'التصوير', 'التسويق الرقمي'],
    duration: '4 أشهر',
  },
  product_developer: {
    emoji: '🧪',
    title: 'مطورة منتجات',
    avgSalary: '10000-25000',
    courses: ['كيمياء التجميل', 'تطوير المنتجات', 'سلامة المنتجات'],
    duration: '12 شهر',
  },
};

interface BeautyCareerPathCardProps {
  path: CareerPath;
  onLearnMore?: () => void;
  className?: string;
}

export function BeautyCareerPathCard({
  path,
  onLearnMore,
  className = '',
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
          <h4 className="text-sm font-bold text-teal-700 dark:text-teal-300">{p.title}</h4>
          <p className="text-[10px] text-teal-500 dark:text-teal-400">مسار مهني في التجميل</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">متوسط الدخل</p>
          <p className="text-xs font-bold text-teal-800 dark:text-teal-200">{p.avgSalary} ر.س</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-2.5 text-center dark:bg-teal-950">
          <p className="text-[9px] text-teal-600 dark:text-teal-400">المدة</p>
          <p className="text-xs font-bold text-teal-800 dark:text-teal-200">{p.duration}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-teal-50 p-2.5 dark:bg-teal-950">
        <p className="text-[10px] font-bold text-teal-700 dark:text-teal-300">📚 الدورات</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {p.courses.map((c) => (
            <span
              key={c}
              className="rounded-full bg-white px-2 py-0.5 text-[9px] text-teal-700 dark:bg-gray-800 dark:text-teal-300"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 active:scale-[0.98] transition-all"
      >
        اكتشفي المسار 💼
      </button>
    </div>
  );
}
