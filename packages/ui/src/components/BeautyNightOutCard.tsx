'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Night Out Card — last-minute beauty for a night out.
 * From Phase W9: The Small Details — Delightful Surprises.
 *
 * Usage:
 *   <BeautyNightOutCard available={true} onBook={() => {}} />
 */

interface BeautyNightOutCardProps {
  available?: boolean;
  onBook?: () => void;
  className?: string;
}

const SERVICES = [
  { emoji: '💄', name: 'مكياج سريع', time: '30 دقيقة', price: 150 },
  { emoji: '💇', name: 'تسريحة سهرة', time: '20 دقيقة', price: 100 },
  { emoji: '💅', name: 'مانيكير سريع', time: '20 دقيقة', price: 80 },
];

export function BeautyNightOutCard({ available = true, onBook, className = '' }: BeautyNightOutCardProps): JSX.Element {
  return (
    <div className={cn('rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-900 dark:from-indigo-950 dark:to-purple-950', className)}>
      <div className="text-center">
        <span className="text-3xl" aria-hidden="true">🌙</span>
        <h4 className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">ليلة خارجاً</h4>
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400">خدمات سريعة لليلتكِ الخاصة</p>
        {available && <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">🟢 متوفر الآن</span>}
      </div>

      <div className="mt-3 space-y-1.5">
        {SERVICES.map((s) => (
          <div key={s.name} className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2.5 dark:bg-gray-800/60">
            <span className="text-lg shrink-0">{s.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-text-primary dark:text-gray-100">{s.name}</p>
              <p className="text-[9px] text-text-tertiary dark:text-gray-500">{s.time}</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{s.price} ر.س</span>
          </div>
        ))}
      </div>

      <button type="button" onClick={onBook} disabled={!available} className={cn('mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]', available ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700')}>
        {available ? 'احجزي الآن 🌙' : 'غير متوفر حالياً'}
      </button>

      <p className="mt-2 text-center text-[9px] text-indigo-500 dark:text-indigo-400">🌙 الليلة ليلتكِ — تألقي</p>
    </div>
  );
}
