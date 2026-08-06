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
}

export function StartupMentorshipCard({
  mentors,
  startups,
  onApplyMentor,
  onApplyStartup,
  className = '',
}: StartupMentorshipCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 dark:border-amber-900 dark:from-amber-950 dark:to-yellow-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🚀</span>
        <h4 className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">حاضنة الجمال</h4>
        <p className="text-[10px] text-amber-600 dark:text-amber-400">دعم وتمويل لرائدات الأعمال في التجميل</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">مرشدات</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{mentors}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-text-tertiary dark:text-gray-500">مشاريع ناشئة</p>
          <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{startups}</p>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-200">🎯 نقدم</p>
        <div className="mt-1 space-y-0.5 text-[10px] text-amber-700 dark:text-amber-300">
          <p>• إرشاد من خبيرات في المجال</p>
          <p>• مساحة عمل مشتركة</p>
          <p>• دعم قانوني ومحاسبي</p>
          <p>• تمويل أولي يصل إلى 100,000 ر.س</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onApplyStartup} className="flex-1 rounded-xl bg-amber-600 py-2 text-[10px] font-bold text-white hover:bg-amber-700 active:scale-[0.98] transition-all">قدمي مشروعكِ 🚀</button>
        <button type="button" onClick={onApplyMentor} className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-gray-800 dark:text-amber-300">كوني مرشدة</button>
      </div>
    </div>
  );
}
