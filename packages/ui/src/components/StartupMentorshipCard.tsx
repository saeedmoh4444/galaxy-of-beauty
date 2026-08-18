'use client';

import { cn } from '@galaxy/shared';

/**
 * Startup Mentorship Card — mentorship for beauty startup founders.
 * From Phase W10: Saudi Women Leadership — Women in Beauty Leadership.
 *
 * Usage:
 *   <StartupMentorshipCard mentors={12} startups={8} />
 */

interface StartupMentorshipCardProps {
  mentors: number;
  startups: number;
  onApplyMentor?: () => void;
  onApplyStartup?: () => void;
  className?: string;
  /** Card heading */
  title?: string;
  /** Subtitle under the heading */
  subtitle?: string;
  /** Mentors count label */
  mentorsLabel?: string;
  /** Startups count label */
  startupsLabel?: string;
  /** "We offer" heading */
  weOfferTitle?: string;
  /** What we offer bullets */
  offer1?: string;
  offer2?: string;
  offer3?: string;
  offer4?: string;
  /** Apply as startup button label */
  applyStartupButtonText?: string;
  /** Apply as mentor button label */
  applyMentorButtonText?: string;
}

export function StartupMentorshipCard({
  mentors,
  startups,
  onApplyMentor,
  onApplyStartup,
  className = '',
  title = 'حاضنة الجمال',
  subtitle = 'دعم وتمويل لرائدات الأعمال في التجميل',
  mentorsLabel = 'مرشدات',
  startupsLabel = 'مشاريع ناشئة',
  weOfferTitle = ' نقدم',
  offer1 = '• إرشاد من خبيرات في المجال',
  offer2 = '• مساحة عمل مشتركة',
  offer3 = '• دعم قانوني ومحاسبي',
  offer4 = '• تمويل أولي يصل إلى 100,000 ر.س',
  applyStartupButtonText = 'قدمي مشروعكِ',
  applyMentorButtonText = 'كوني مرشدة',
}: StartupMentorshipCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">{title}</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">{subtitle}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{mentorsLabel}</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{mentors}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">{startupsLabel}</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{startups}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">{weOfferTitle}</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-amber-700 dark:text-amber-300">
          <p>{offer1}</p>
          <p>{offer2}</p>
          <p>{offer3}</p>
          <p>{offer4}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onApplyStartup}
          className="flex-1 rounded-xl bg-amber-600 py-2 text-[10px] font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all"
        >
          {applyStartupButtonText}
        </button>
        <button
          type="button"
          onClick={onApplyMentor}
          className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-gray-800 dark:text-amber-300"
        >
          {applyMentorButtonText}
        </button>
      </div>
    </div>
  );
}
