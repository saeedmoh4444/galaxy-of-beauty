'use client';

import { cn } from '@galaxy/shared';

/**
 * Breast Health Card — breast self-exam reminder & awareness.
 * From Phase W3: Health & Wellness — Women's Health Awareness (W10 Social Impact).
 *
 * Usage:
 *   <BreastHealthCard lastExam="2026-07" />
 */

interface BreastHealthCardProps {
  lastExam?: string;
  nextReminder?: string;
  onLearnMore?: () => void;
  title?: string;
  subtitle?: string;
  examTitle?: string;
  examTip1?: string;
  examTip2?: string;
  examTip3?: string;
  lastExamLabel?: string;
  nextReminderLabel?: string;
  learnButtonText?: string;
  footerText?: string;
  className?: string;
}

export function BreastHealthCard({
  lastExam,
  nextReminder,
  onLearnMore,
  className = '',
  title = 'صحتكِ تهمنا',
  subtitle = 'تذكير شهري بالفحص الذاتي',
  examTitle = 'الفحص الذاتي للثدي',
  examTip1 = '• مرة شهرياً — بعد انتهاء الدورة',
  examTip2 = '• 5 دقائق فقط قد تنقذ حياتكِ',
  examTip3 = '• الكشف المبكر = شفاء 98%',
  lastExamLabel = ' آخر فحص: ',
  nextReminderLabel = 'التذكير القادم: ',
  learnButtonText = 'تعلمي طريقة الفحص',
  footerText = 'صحتكِ أغلى ما تملكين',
}: BreastHealthCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-5 dark:border-pink-900 dark:from-pink-950 dark:to-rose-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-pink-800 dark:text-pink-200">{title}</h4>
        <p className="text-[10px] text-pink-500 dark:text-pink-400">{subtitle}</p>
      </div>

      <div className="mt-3 rounded-xl bg-white/60 p-4 text-center dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300">{examTitle}</p>
        <div className="mt-2 space-y-1 text-[10px] text-pink-600 dark:text-pink-400">
          <p>{examTip1}</p>
          <p>{examTip2}</p>
          <p>{examTip3}</p>
        </div>
      </div>

      {lastExam && (
        <div className="mt-2 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-pink-700 dark:text-pink-300">
            {lastExamLabel}
            {lastExam}
          </p>
        </div>
      )}
      {nextReminder && (
        <div className="mt-1 rounded-lg bg-white/60 p-2 text-center dark:bg-gray-800/60">
          <p className="text-[10px] text-pink-700 dark:text-pink-300">
            {nextReminderLabel}
            {nextReminder}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onLearnMore}
        className="mt-3 w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 active:scale-[0.98] transition-all"
      >
        {learnButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-pink-500 dark:text-pink-400">{footerText}</p>
    </div>
  );
}
