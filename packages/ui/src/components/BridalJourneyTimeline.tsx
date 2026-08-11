'use client';

import { cn } from '@galaxy/shared';

/**
 * Bridal Journey Timeline — 6-month beauty preparation plan for brides.
 * From Phase W2: Life Stage Beauty — Wedding & Motherhood.
 *
 * Usage:
 *   <BridalJourneyTimeline weddingDate="2027-03-15" onBookMilestone={() => {}} />
 */

interface Milestone {
  month: number;
  emoji: string;
  title: string;
  description: string;
  services: string[];
  tip: string;
}

const MILESTONES: Milestone[] = [
  {
    month: 6,
    emoji: '📋',
    title: 'خطة العناية',
    description: 'نضع خطة عناية متكاملة لبشرتكِ قبل الزفاف',
    services: ['استشارة جمالية', 'تحليل بشرة', 'خطة تغذية'],
    tip: 'ابدئي بشرب 8 أكواب ماء يومياً من اليوم',
  },
  {
    month: 5,
    emoji: '🧴',
    title: 'روتين العناية',
    description: 'بناء روتين عناية يومي بالبشرة',
    services: ['تنظيف شهري', 'تقشير لطيف', 'سيروم فيتامين سي'],
    tip: 'لا تجربي منتجات جديدة — استمري على المعروف',
  },
  {
    month: 4,
    emoji: '💆‍♀️',
    title: 'علاجات متقدمة',
    description: 'بدء العلاجات التجميلية المتقدمة',
    services: ['تقشير كيميائي', 'ميزوثيرابي', 'عناية بالرقبة'],
    tip: 'هذا أفضل وقت للعلاجات القوية — بشرتكِ تتعافى قبل الزفاف',
  },
  {
    month: 3,
    emoji: '👰',
    title: 'تجربة الإطلالة',
    description: 'تجربة كاملة لإطلالة الزفاف',
    services: ['تجربة مكياج', 'تجربة تسريحة', 'تجربة فستان'],
    tip: 'صوري إطلالتكِ التجريبية لتري كيف تبدين في الصور',
  },
  {
    month: 2,
    emoji: '💅',
    title: 'اللمسات النهائية',
    description: 'التركيز على التفاصيل الدقيقة',
    services: ['تبييض أسنان', 'عناية بالأظافر', 'تشقير حواجب'],
    tip: 'لا تجربي أي شيء جديد قبل الزفاف بشهرين',
  },
  {
    month: 1,
    emoji: '✨',
    title: 'الأسبوع الأخير',
    description: 'الاستعداد النهائي والاسترخاء',
    services: ['تنظيف عميق', 'ماسك ذهبي', 'مساج استرخاء'],
    tip: 'نامي 8 ساعات يومياً — النوم سر الجمال',
  },
];

interface BridalJourneyTimelineProps {
  weddingDate?: string;
  completedMonths?: number[];
  onBookMilestone?: (month: number) => void;
  className?: string;
}

export function BridalJourneyTimeline({
  weddingDate,
  completedMonths = [],
  onBookMilestone,
  className = '',
}: BridalJourneyTimelineProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          👰‍♀️
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">رحلة العروس</h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">
          خطة متكاملة لـ 6 أشهر قبل الزفاف
        </p>
        {weddingDate && (
          <p className="mt-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            💒 تاريخ الزفاف: {weddingDate}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-4 space-y-0">
        {MILESTONES.map((m, i) => {
          const isCompleted = completedMonths.includes(m.month);
          const isPast = completedMonths.length > 0 && m.month > Math.max(...completedMonths);
          const isCurrent =
            completedMonths.length > 0
              ? m.month === Math.max(...completedMonths) + 1
              : m.month === 6;

          return (
            <div key={m.month} className="relative">
              {/* Line + dot */}
              <div className="flex gap-3">
                {/* Dot column */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-all',
                      isCompleted
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
                        : isCurrent
                          ? 'border-rose-400 bg-rose-50 dark:border-rose-800 dark:bg-rose-950'
                          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
                    )}
                  >
                    <span className={cn(isPast && !isCurrent && 'opacity-40')}>
                      {isCompleted ? '✅' : m.emoji}
                    </span>
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div
                      className={cn(
                        'h-full min-h-[16px] w-0.5',
                        isCompleted
                          ? 'bg-emerald-200 dark:bg-emerald-800'
                          : 'bg-gray-200 dark:bg-gray-700',
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn('pb-3 flex-1', isPast && !isCurrent && 'opacity-50')}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-text-primary dark:text-gray-100">
                        قبل {m.month} أشهر
                      </span>
                      <span className="ml-2 text-[10px] text-text-tertiary dark:text-gray-500">
                        {m.title}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                        الآن
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[10px] text-text-secondary dark:text-gray-300">
                    {m.description}
                  </p>

                  {/* Services */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.services.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Tip */}
                  <p className="mt-1 text-[9px] italic text-text-tertiary dark:text-gray-500">
                    💡 {m.tip}
                  </p>

                  {/* Book button for current */}
                  {isCurrent && (
                    <button
                      type="button"
                      onClick={() => onBookMilestone?.(m.month)}
                      className="mt-1.5 rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-rose-700"
                    >
                      احجزي هذه المرحلة
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-rose-500 dark:text-rose-400">
        💒 &ldquo;يوم زفافكِ هو بداية أجمل قصة&rdquo;
      </p>
    </div>
  );
}
