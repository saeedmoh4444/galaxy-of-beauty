'use client';

import { cn } from '@galaxy/shared';

/**
 * Quiet Hours Badge — designated quiet hours at partner salons.
 * From Phase W8: Accessibility & Inclusivity — Neurodivergent-Friendly.
 *
 * Usage:
 *   <QuietHoursBadge hours="9-11 صباحاً" days="الثلاثاء والخميس" />
 */

interface QuietHoursBadgeProps {
  hours: string;
  days: string;
  features?: string[];
  title?: string;
  subtitle?: string;
  timeLabel?: string;
  daysLabel?: string;
  featuresTitle?: string;
  bookButtonText?: string;
  footerText?: string;
  className?: string;
}

export function QuietHoursBadge({
  hours,
  days,
  features = ['موسيقى منخفضة', 'إضاءة خافتة', 'عدد أقل من الزبونات', 'بدون عطور قوية'],
  className = '',
  title = 'ساعات هادئة',
  subtitle = 'أوقات مخصصة لراحة الحواس',
  timeLabel = 'التوقيت',
  daysLabel = 'الأيام',
  featuresTitle = 'مميزات الساعات الهادئة',
  bookButtonText = 'احجزي في الساعات الهادئة',
  footerText = 'لأن الراحة الحسية حق للجميع',
}: QuietHoursBadgeProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-900 dark:from-purple-950 dark:to-indigo-950',
        className,
      )}
    >
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true"></span>
        <h4 className="mt-1 text-sm font-bold text-purple-800 dark:text-purple-200">{title}</h4>
        <p className="text-[10px] text-purple-500 dark:text-purple-400">{subtitle}</p>
      </div>

      {/* Schedule */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-purple-600 dark:text-purple-400">{timeLabel}</p>
          <p className="text-sm font-bold text-purple-800 dark:text-purple-200"> {hours}</p>
        </div>
        <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
          <p className="text-[9px] text-purple-600 dark:text-purple-400">{daysLabel}</p>
          <p className="text-sm font-bold text-purple-800 dark:text-purple-200"> {days}</p>
        </div>
      </div>

      {/* Features */}
      <div className="mt-2 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
          {featuresTitle}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {features.map((f) => (
            <span
              key={f}
              className="rounded-full bg-purple-100 px-2.5 py-1 text-[9px] font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Book */}
      <button
        type="button"
        className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 active:scale-[0.98] transition-all"
      >
        {bookButtonText}
      </button>

      <p className="mt-2 text-center text-[9px] text-purple-500 dark:text-purple-400">
        {footerText}
      </p>
    </div>
  );
}
