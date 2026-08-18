'use client';

import { cn } from '@galaxy/shared';

/**
 * Emergency Beauty Fund — free/discounted beauty for women in critical need.
 * From Phase W8: Accessibility — Emergency Beauty Fund.
 * For job interviews, court appearances, important life events.
 *
 * Usage:
 *   <EmergencyBeautyFund reason="interview" onApply={() => {}} />
 */

type EmergencyReason =
  'interview' | 'court' | 'wedding_guest' | 'medical' | 'graduation' | 'escape_violence';

interface ReasonDef {
  emoji: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  urgency: 'high' | 'medium';
  color: string;
}

const REASONS: Record<EmergencyReason, ReasonDef> = {
  interview: {
    emoji: '',
    title: { ar: 'مقابلة عمل', en: 'Job interview' },
    description: {
      ar: 'انطباع أول قوي لوظيفة جديدة',
      en: 'A strong first impression for a new job',
    },
    urgency: 'high',
    color:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  court: {
    emoji: '️',
    title: { ar: 'محكمة', en: 'Court' },
    description: { ar: 'إطلالة محترمة ليوم مهم', en: 'A respectful look for an important day' },
    urgency: 'high',
    color:
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  },
  wedding_guest: {
    emoji: '',
    title: { ar: 'حضور زفاف', en: 'Wedding guest' },
    description: { ar: 'إطلالة تليق بالمناسبة', en: 'A look worthy of the occasion' },
    urgency: 'medium',
    color:
      'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
  },
  medical: {
    emoji: '',
    title: { ar: 'موعد طبي مهم', en: 'Important medical appointment' },
    description: { ar: 'تشعرين بالثقة أمام الطبيب', en: 'Feel confident in front of your doctor' },
    urgency: 'medium',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  graduation: {
    emoji: '',
    title: { ar: 'حفل تخرج', en: 'Graduation ceremony' },
    description: { ar: 'إطلالة مشرقة ليومكِ الكبير', en: 'A radiant look for your big day' },
    urgency: 'medium',
    color:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  escape_violence: {
    emoji: '',
    title: { ar: 'بداية حياة جديدة', en: 'A new beginning' },
    description: {
      ar: 'دعم للناجيات من العنف الأسري',
      en: 'Support for survivors of domestic violence',
    },
    urgency: 'high',
    color:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  },
};

interface EmergencyBeautyFundProps {
  reason: EmergencyReason;
  /** Application status */
  status?: 'available' | 'applied' | 'approved' | 'completed';
  /** Number of women helped this month */
  womenHelped?: number;
  onApply?: () => void;
  className?: string;
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Badge shown for high urgency */
  urgentLabel?: string;
  /** Label for the included services section */
  includesLabel?: string;
  /** Included service 1 */
  item1?: string;
  /** Included service 2 */
  item2?: string;
  /** Included service 3 */
  item3?: string;
  /** Included service 4 */
  item4?: string;
  /** Text before the women-helped counter */
  helpedPrefix?: string;
  /** Text after the women-helped counter */
  helpedSuffix?: string;
  /** Apply CTA label */
  applyLabel?: string;
  /** Book CTA label */
  bookLabel?: string;
  /** Privacy footnote */
  privacyNote?: string;
  /** Locale for internal data strings */
  locale?: 'ar' | 'en';
}

export function EmergencyBeautyFund({
  reason,
  status = 'available',
  womenHelped = 47,
  onApply,
  className = '',
  title = 'صندوق الجمال الطارئ',
  subtitle = 'لأن بعض الأيام تحتاج أكثر من غيرها',
  urgentLabel = 'عاجل',
  includesLabel = ' تشمل الخدمة',
  item1 = 'مكياج احترافي',
  item2 = 'تسريحة شعر',
  item3 = 'عناية بالبشرة سريعة',
  item4 = 'ثقة وابتسامة ',
  helpedPrefix = 'ساعدنا',
  helpedSuffix = 'امرأة هذا الشهر',
  applyLabel = 'قدّمي طلباً سرياً',
  bookLabel = 'احجزي موعدكِ الآن',
  privacyNote = 'طلبكِ سري تماماً — لا أحد يعرف أنكِ استخدمتِ الصندوق',
  locale = 'ar',
}: EmergencyBeautyFundProps): JSX.Element {
  const r = REASONS[reason];

  const statusDisplay = {
    available: {
      emoji: '',
      label: { ar: 'متاح', en: 'Available' },
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    applied: {
      emoji: '',
      label: { ar: 'قيد المراجعة', en: 'Under review' },
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    approved: {
      emoji: '',
      label: { ar: 'تمت الموافقة', en: 'Approved' },
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    completed: {
      emoji: '',
      label: { ar: 'مكتمل', en: 'Completed' },
      className: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    },
  } as const;

  const st = statusDisplay[status];

  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-white p-5 dark:border-purple-900 dark:bg-gray-900',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-rose-100 text-2xl dark:from-purple-900 dark:to-rose-900">
          🆘
        </div>
        <div>
          <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300">{title}</h4>
          <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
        </div>
        <span
          className={cn(
            'ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
            st.className,
          )}
        >
          {st.emoji} {st.label[locale]}
        </span>
      </div>

      {/* Reason card */}
      <div className={cn('mt-3 rounded-xl border p-3', r.color)}>
        <div className="flex items-center gap-1.5">
          <span className="text-lg" aria-hidden="true">
            {r.emoji}
          </span>
          <div>
            <p className="text-xs font-bold">{r.title[locale]}</p>
            <p className="text-[10px] opacity-70">{r.description[locale]}</p>
          </div>
          {r.urgency === 'high' && (
            <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-900 dark:text-rose-300">
              {urgentLabel}
            </span>
          )}
        </div>
      </div>

      {/* What's included */}
      <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
        <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">
          {includesLabel}
        </p>
        <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-text-secondary dark:text-gray-300">
          <span>• {item1}</span>
          <span>• {item2}</span>
          <span>• {item3}</span>
          <span>• {item4}</span>
        </div>
      </div>

      {/* Women helped */}
      <div className="mt-2 rounded-lg bg-purple-50 p-2 text-center dark:bg-purple-950">
        <p className="text-[10px] text-purple-700 dark:text-purple-300">
          {helpedPrefix} {womenHelped} {helpedSuffix}
        </p>
      </div>

      {/* CTA */}
      {status === 'available' && (
        <button
          type="button"
          onClick={onApply}
          className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          {applyLabel}
        </button>
      )}

      {status === 'approved' && (
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          {bookLabel}
        </button>
      )}

      {/* Privacy */}
      <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
        {privacyNote}
      </p>
    </div>
  );
}
