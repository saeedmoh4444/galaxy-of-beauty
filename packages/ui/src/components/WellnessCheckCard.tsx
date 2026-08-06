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
  className?: string;
}

const CHECKS = [
  { emoji: '💧', label: 'شرب الماء', desc: '8 أكواب يومياً' },
  { emoji: '😴', label: 'جودة النوم', desc: '7-8 ساعات' },
  { emoji: '🧴', label: 'روتين العناية', desc: 'صباح ومساء' },
  { emoji: '☀️', label: 'واقي شمس', desc: 'SPF 30+' },
  { emoji: '🧘', label: 'صحة نفسية', desc: 'تأمل أو راحة' },
  { emoji: '🥗', label: 'تغذية', desc: 'طعام صحي متوازن' },
];

export function WellnessCheckCard({
  lastCheck,
  onStartCheck,
  className = '',
}: WellnessCheckCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-emerald-100 bg-white p-5 dark:border-emerald-900 dark:bg-gray-900', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🌿</span>
          <div>
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">الفحص الشهري</h4>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400">تقييم سريع لصحة جمالكِ</p>
          </div>
        </div>
        {lastCheck && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">📅 {lastCheck}</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {CHECKS.map((c) => (
          <div key={c.label} className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 dark:bg-emerald-950">
            <span className="text-sm">{c.emoji}</span>
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">{c.label}</p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={onStartCheck} className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all">
        ابدئي الفحص 🌿
      </button>
    </div>
  );
}
