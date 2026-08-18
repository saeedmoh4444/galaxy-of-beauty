'use client';

import { cn } from '@galaxy/shared';

/**
 * Franchise Card — helps top technicians open their own Galaxy of Beauty franchise.
 * From Phase W10: Saudi Women Leadership — Franchise Program.
 *
 * Usage:
 *   <FranchiseCard benefits={['brand', 'training', 'support']} onApply={() => {}} />
 */

interface FranchiseBenefit {
  emoji: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
}

const BENEFITS: FranchiseBenefit[] = [
  {
    emoji: '️',
    title: { ar: 'العلامة التجارية', en: 'Brand' },
    description: {
      ar: 'استخدمي اسم جالاكسي بيوتي المعروف',
      en: 'Use the well-known Galaxy Beauty name',
    },
  },
  {
    emoji: '',
    title: { ar: 'تدريب وتأهيل', en: 'Training' },
    description: {
      ar: 'برنامج تدريبي شامل لكِ ولفريقكِ',
      en: 'A comprehensive training program for you and your team',
    },
  },
  {
    emoji: '',
    title: { ar: 'نظام حجز متكامل', en: 'Integrated booking' },
    description: {
      ar: 'منصتنا التقنية مع حجوزات ومدفوعات',
      en: 'Our tech platform with bookings and payments',
    },
  },
  {
    emoji: '',
    title: { ar: 'تسويق ودعم', en: 'Marketing and support' },
    description: {
      ar: 'حملات تسويقية وإعلانات على حساب المنصة',
      en: "Marketing campaigns and ads at the platform's expense",
    },
  },
  {
    emoji: '',
    title: { ar: 'تمويل ميسر', en: 'Easy financing' },
    description: {
      ar: 'شراكة مع بنوك سعودية للتمويل الصغير',
      en: 'Partnership with Saudi banks for micro-financing',
    },
  },
  {
    emoji: '‍',
    title: { ar: 'إرشاد مستمر', en: 'Ongoing mentorship' },
    description: {
      ar: 'مرشدة أعمال شخصية لمدة سنة كاملة',
      en: 'A personal business mentor for a full year',
    },
  },
];

const QUALIFYING: { ar: string; en: string }[] = [
  {
    ar: 'سنتين خبرة كخبيرة تجميل على منصتنا',
    en: 'Two years of experience as a beauty expert on our platform',
  },
  { ar: 'تقييم 4.5 نجوم فأعلى', en: 'A rating of 4.5 stars or higher' },
  { ar: 'إكمال برنامج "من خبيرة إلى CEO"', en: 'Completing the "From Expert to CEO" program' },
  { ar: 'اجتياز المقابلة الشخصية', en: 'Passing the personal interview' },
];

interface FranchiseCardProps {
  /** Investment range display */
  investmentRange?: string;
  /** Expected monthly revenue */
  expectedRevenue?: string;
  /** Number of franchises already open */
  existingFranchises?: number;
  onApply?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label for the investment box */
  investmentLabel?: string;
  /** Label for the revenue box */
  revenueLabel?: string;
  /** Text after the existing franchises count */
  existingFranchisesText?: string;
  /** Title of the qualifying section */
  qualifyTitle?: string;
  /** Apply button label */
  applyLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal benefit data strings */
  locale?: 'ar' | 'en';
}

export function FranchiseCard({
  investmentRange = '100,000 - 250,000 ر.س',
  expectedRevenue = '30,000 - 80,000 ر.س/شهرياً',
  existingFranchises = 12,
  onApply,
  className = '',
  title = 'برنامج الامتياز',
  subtitle = 'من خبيرة إلى مالكة — افتحي فرعكِ الخاص من جالاكسي بيوتي',
  investmentLabel = 'الاستثمار',
  revenueLabel = 'العائد المتوقع',
  existingFranchisesText = 'سيدة سبقوكِ وافتتحن فروعهنّ!',
  qualifyTitle = ' شروط التأهل',
  applyLabel = 'ابدئي رحلة الامتياز',
  footerText = 'نساعدكِ تبنين مشروعكِ الخاص وتحققين استقلالكِ المالي',
  locale = 'ar',
}: FranchiseCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">{subtitle}</p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{investmentLabel}</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200">{investmentRange}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{revenueLabel}</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {expectedRevenue}
          </p>
        </div>
      </div>

      {/* Existing franchises */}
      <div className="mt-2 rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-amber-700 dark:text-amber-300">
          {existingFranchises} {existingFranchisesText}
        </p>
      </div>

      {/* Benefits grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {BENEFITS.map((b) => (
          <div key={b.title.ar} className="rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60">
            <span className="text-lg" aria-hidden="true">
              {b.emoji}
            </span>
            <p className="mt-0.5 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {b.title[locale]}
            </p>
            <p className="text-[9px] text-text-tertiary dark:text-gray-400">
              {b.description[locale]}
            </p>
          </div>
        ))}
      </div>

      {/* How to qualify */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 p-3 dark:from-amber-900 dark:to-yellow-900">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{qualifyTitle}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-amber-700 dark:text-amber-300">
          {QUALIFYING.map((q) => (
            <p key={q.ar}>• {q[locale]}</p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onApply}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
      >
        {applyLabel}
      </button>

      {/* Women empowerment */}
      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">{footerText}</p>
    </div>
  );
}
