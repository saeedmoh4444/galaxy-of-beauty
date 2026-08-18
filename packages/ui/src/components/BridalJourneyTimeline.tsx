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
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  services: { ar: string; en: string }[];
  tip: { ar: string; en: string };
}

const MILESTONES: Milestone[] = [
  {
    month: 6,
    emoji: '',
    title: { ar: 'خطة العناية', en: 'Care plan' },
    description: {
      ar: 'نضع خطة عناية متكاملة لبشرتكِ قبل الزفاف',
      en: 'We build a complete skincare plan before the wedding',
    },
    services: [
      { ar: 'استشارة جمالية', en: 'Beauty consultation' },
      { ar: 'تحليل بشرة', en: 'Skin analysis' },
      { ar: 'خطة تغذية', en: 'Nutrition plan' },
    ],
    tip: {
      ar: 'ابدئي بشرب 8 أكواب ماء يومياً من اليوم',
      en: 'Start drinking 8 glasses of water daily from today',
    },
  },
  {
    month: 5,
    emoji: '',
    title: { ar: 'روتين العناية', en: 'Care routine' },
    description: {
      ar: 'بناء روتين عناية يومي بالبشرة',
      en: 'Building a daily skincare routine',
    },
    services: [
      { ar: 'تنظيف شهري', en: 'Monthly facial' },
      { ar: 'تقشير لطيف', en: 'Gentle exfoliation' },
      { ar: 'سيروم فيتامين سي', en: 'Vitamin C serum' },
    ],
    tip: {
      ar: 'لا تجربي منتجات جديدة — استمري على المعروف',
      en: 'Do not try new products — stick with what works',
    },
  },
  {
    month: 4,
    emoji: '‍️',
    title: { ar: 'علاجات متقدمة', en: 'Advanced treatments' },
    description: {
      ar: 'بدء العلاجات التجميلية المتقدمة',
      en: 'Starting advanced cosmetic treatments',
    },
    services: [
      { ar: 'تقشير كيميائي', en: 'Chemical peel' },
      { ar: 'ميزوثيرابي', en: 'Mesotherapy' },
      { ar: 'عناية بالرقبة', en: 'Neck care' },
    ],
    tip: {
      ar: 'هذا أفضل وقت للعلاجات القوية — بشرتكِ تتعافى قبل الزفاف',
      en: 'This is the best time for strong treatments — your skin will recover before the wedding',
    },
  },
  {
    month: 3,
    emoji: '',
    title: { ar: 'تجربة الإطلالة', en: 'Look trial' },
    description: {
      ar: 'تجربة كاملة لإطلالة الزفاف',
      en: 'A complete wedding look trial',
    },
    services: [
      { ar: 'تجربة مكياج', en: 'Makeup trial' },
      { ar: 'تجربة تسريحة', en: 'Hair trial' },
      { ar: 'تجربة فستان', en: 'Dress fitting' },
    ],
    tip: {
      ar: 'صوري إطلالتكِ التجريبية لتري كيف تبدين في الصور',
      en: 'Photograph your trial look to see how you appear in photos',
    },
  },
  {
    month: 2,
    emoji: '',
    title: { ar: 'اللمسات النهائية', en: 'Final touches' },
    description: {
      ar: 'التركيز على التفاصيل الدقيقة',
      en: 'Focusing on the fine details',
    },
    services: [
      { ar: 'تبييض أسنان', en: 'Teeth whitening' },
      { ar: 'عناية بالأظافر', en: 'Nail care' },
      { ar: 'تشقير حواجب', en: 'Eyebrow shaping' },
    ],
    tip: {
      ar: 'لا تجربي أي شيء جديد قبل الزفاف بشهرين',
      en: 'Do not try anything new two months before the wedding',
    },
  },
  {
    month: 1,
    emoji: '',
    title: { ar: 'الأسبوع الأخير', en: 'The final week' },
    description: {
      ar: 'الاستعداد النهائي والاسترخاء',
      en: 'Final preparation and relaxation',
    },
    services: [
      { ar: 'تنظيف عميق', en: 'Deep cleansing' },
      { ar: 'ماسك ذهبي', en: 'Gold mask' },
      { ar: 'مساج استرخاء', en: 'Relaxing massage' },
    ],
    tip: {
      ar: 'نامي 8 ساعات يومياً — النوم سر الجمال',
      en: 'Sleep 8 hours daily — sleep is the secret to beauty',
    },
  },
];

interface BridalJourneyTimelineProps {
  weddingDate?: string;
  completedMonths?: number[];
  onBookMilestone?: (month: number) => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Label prefixing the wedding date */
  dateLabel?: string;
  /** Word preceding the month count */
  beforeLabel?: string;
  /** Word for months (plural) */
  monthsWord?: string;
  /** Badge for the current milestone */
  nowLabel?: string;
  /** Booking button label */
  bookLabel?: string;
  /** Footer text */
  footerText?: string;
  /** Locale for internal milestone data strings */
  locale?: 'ar' | 'en';
}

export function BridalJourneyTimeline({
  weddingDate,
  completedMonths = [],
  onBookMilestone,
  className = '',
  title = 'رحلة العروس',
  subtitle = 'خطة متكاملة لـ 6 أشهر قبل الزفاف',
  dateLabel = 'تاريخ الزفاف:',
  beforeLabel = 'قبل',
  monthsWord = 'أشهر',
  nowLabel = 'الآن',
  bookLabel = 'احجزي هذه المرحلة',
  footerText = '"يوم زفافكِ هو بداية أجمل قصة"',
  locale = 'ar',
}: BridalJourneyTimelineProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl bg-white p-5 dark:bg-gray-900', className)}>
      {/* Header */}
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">
          ‍️
        </span>
        <h4 className="mt-1 text-sm font-bold text-rose-700 dark:text-rose-300">{title}</h4>
        <p className="text-[10px] text-rose-500 dark:text-rose-400">{subtitle}</p>
        {weddingDate && (
          <p className="mt-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
            {dateLabel} {weddingDate}
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
                      {isCompleted ? '' : m.emoji}
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
                        {beforeLabel} {m.month} {monthsWord}
                      </span>
                      <span className="ml-2 text-[10px] text-text-tertiary dark:text-gray-500">
                        {m.title[locale]}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                        {nowLabel}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[10px] text-text-secondary dark:text-gray-300">
                    {m.description[locale]}
                  </p>

                  {/* Services */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.services.map((s) => (
                      <span
                        key={s.ar}
                        className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      >
                        {s[locale]}
                      </span>
                    ))}
                  </div>

                  {/* Tip */}
                  <p className="mt-1 text-[9px] italic text-text-tertiary dark:text-gray-500">
                    {m.tip[locale]}
                  </p>

                  {/* Book button for current */}
                  {isCurrent && (
                    <button
                      type="button"
                      onClick={() => onBookMilestone?.(m.month)}
                      className="mt-1.5 rounded-lg bg-rose-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-rose-700"
                    >
                      {bookLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-2 text-center text-[9px] text-rose-500 dark:text-rose-400">{footerText}</p>
    </div>
  );
}
