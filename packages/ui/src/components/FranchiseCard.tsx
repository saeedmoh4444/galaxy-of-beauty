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
  title: string;
  description: string;
}

const BENEFITS: FranchiseBenefit[] = [
  { emoji: '🏷️', title: 'العلامة التجارية', description: 'استخدمي اسم جالاكسي بيوتي المعروف' },
  { emoji: '📚', title: 'تدريب وتأهيل', description: 'برنامج تدريبي شامل لكِ ولفريقكِ' },
  { emoji: '💻', title: 'نظام حجز متكامل', description: 'منصتنا التقنية مع حجوزات ومدفوعات' },
  { emoji: '📣', title: 'تسويق ودعم', description: 'حملات تسويقية وإعلانات على حساب المنصة' },
  { emoji: '💰', title: 'تمويل ميسر', description: 'شراكة مع بنوك سعودية للتمويل الصغير' },
  { emoji: '👩‍🏫', title: 'إرشاد مستمر', description: 'مرشدة أعمال شخصية لمدة سنة كاملة' },
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
}

export function FranchiseCard({
  investmentRange = '100,000 - 250,000 ر.س',
  expectedRevenue = '30,000 - 80,000 ر.س/شهرياً',
  existingFranchises = 12,
  onApply,
  className = '',
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
        <span className="text-3xl" aria-hidden="true">🏪</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
          برنامج الامتياز
        </h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">
          من خبيرة إلى مالكة — افتحي فرعكِ الخاص من جالاكسي بيوتي
        </p>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">الاستثمار</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
            {investmentRange}
          </p>
        </div>
        <div className="rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">العائد المتوقع</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {expectedRevenue}
          </p>
        </div>
      </div>

      {/* Existing franchises */}
      <div className="mt-2 rounded-xl bg-white/60 p-2.5 text-center dark:bg-gray-800/60">
        <p className="text-[10px] text-amber-700 dark:text-amber-300">
          🎉 {existingFranchises} سيدة سبقوكِ وافتتحن فروعهنّ!
        </p>
      </div>

      {/* Benefits grid */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="rounded-xl bg-white/60 p-2.5 dark:bg-gray-800/60"
          >
            <span className="text-lg" aria-hidden="true">{b.emoji}</span>
            <p className="mt-0.5 text-[10px] font-bold text-text-primary dark:text-gray-100">
              {b.title}
            </p>
            <p className="text-[9px] text-text-tertiary dark:text-gray-400">
              {b.description}
            </p>
          </div>
        ))}
      </div>

      {/* How to qualify */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 p-3 dark:from-amber-900 dark:to-yellow-900">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">
          📋 شروط التأهل
        </p>
        <div className="mt-1 space-y-0.5 text-[10px] text-amber-700 dark:text-amber-300">
          <p>• سنتين خبرة كخبيرة تجميل على منصتنا</p>
          <p>• تقييم 4.5 نجوم فأعلى</p>
          <p>• إكمال برنامج "من خبيرة إلى CEO"</p>
          <p>• اجتياز المقابلة الشخصية</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onApply}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-bold text-white hover:from-amber-600 hover:to-yellow-600 active:scale-[0.98] transition-all shadow-sm"
      >
        ابدئي رحلة الامتياز 💪
      </button>

      {/* Women empowerment */}
      <p className="mt-2 text-center text-[9px] text-amber-600 dark:text-amber-400">
        👑 نساعدكِ تبنين مشروعكِ الخاص وتحققين استقلالكِ المالي
      </p>
    </div>
  );
}
