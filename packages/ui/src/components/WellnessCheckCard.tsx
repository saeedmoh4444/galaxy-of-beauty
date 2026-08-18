'use client';

import { cn } from '@galaxy/shared';

/**
 * Wellness Check Card — monthly beauty wellness self-assessment.
 * From Phase W3: Health & Wellness Integration.
 *
 * Usage:
 *   <WellnessCheckCard lastCheck="2026-07" onStartCheck={() => {}} />
 */

interface WellnessCheckCardProps {
  lastCheck?: string;
  onStartCheck?: () => void;
  /** Display language for built-in labels */
  locale?: 'ar' | 'en';
  title?: string;
  subtitle?: string;
  startButtonText?: string;
  className?: string;
}

const CHECKS = [
  {
    emoji: '',
    label: { ar: 'شرب الماء', en: 'Water intake' },
    desc: { ar: '8 أكواب يومياً', en: '8 cups daily' },
  },
  {
    emoji: '',
    label: { ar: 'جودة النوم', en: 'Sleep quality' },
    desc: { ar: '7-8 ساعات', en: '7-8 hours' },
  },
  {
    emoji: '',
    label: { ar: 'روتين العناية', en: 'Skincare routine' },
    desc: { ar: 'صباح ومساء', en: 'Morning & evening' },
  },
  { emoji: '️', label: { ar: 'واقي شمس', en: 'Sunscreen' }, desc: { ar: 'SPF 30+', en: 'SPF 30+' } },
  {
    emoji: '',
    label: { ar: 'صحة نفسية', en: 'Mental health' },
    desc: { ar: 'تأمل أو راحة', en: 'Meditation or rest' },
  },
  {
    emoji: '',
    label: { ar: 'تغذية', en: 'Nutrition' },
    desc: { ar: 'طعام صحي متوازن', en: 'Balanced healthy food' },
  },
];

export function WellnessCheckCard({
  lastCheck,
  onStartCheck,
  className = '',
  locale = 'ar',
  title = 'الفحص الشهري',
  subtitle = 'تقييم سريع لصحة جمالكِ',
  startButtonText = 'ابدئي الفحص',
}: WellnessCheckCardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true"></span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{title}</h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">{subtitle}</p>
          </div>
        </div>
        {lastCheck && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            {lastCheck}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {CHECKS.map((c) => (
          <div
            key={c.label.ar}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950"
          >
            <span className="text-sm">{c.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
                {c.label[locale]}
              </p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{c.desc[locale]}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onStartCheck}
        className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        {startButtonText}
      </button>
    </div>
  );
}
