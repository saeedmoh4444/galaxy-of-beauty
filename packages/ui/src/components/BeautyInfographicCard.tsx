'use client';

import { cn } from '@galaxy/shared';

/**
 * Beauty Infographic Card — visual beauty education infographic.
 * From Phase W6: Education & Empowerment — Knowledge Hub.
 *
 * Usage:
 *   <BeautyInfographicCard
 *     topic="sun_protection"
 *     stats={[{ label: 'أشعة UVA', value: '95%', desc: 'تخترق الغيوم والزجاج' }]}
 *   />
 */

interface InfoStat {
  label: string;
  value: string;
  desc: string;
}

interface BeautyInfographicCardProps {
  topic: string;
  emoji?: string;
  stats: InfoStat[];
  source?: string;
  className?: string;
}

export function BeautyInfographicCard({
  topic,
  emoji = '',
  stats,
  source,
  className = '',
}: BeautyInfographicCardProps): JSX.Element {
  const colors = [
    'from-pink-400 to-rose-400',
    'from-blue-400 to-sky-400',
    'from-emerald-400 to-green-400',
    'from-amber-400 to-orange-400',
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {emoji}
        </span>
        <div>
          <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{topic}</h4>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400">معلومات بصرية سريعة</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl bg-indigo-50 p-3 text-center dark:bg-indigo-950"
          >
            <p
              className={cn(
                'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                colors[i % colors.length],
              )}
            >
              {stat.value}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
              {stat.label}
            </p>
            <p className="text-[9px] text-indigo-600 dark:text-indigo-400">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Source */}
      {source && (
        <p className="mt-2 text-center text-[9px] text-text-tertiary dark:text-gray-500">
          المصدر: {source}
        </p>
      )}

      {/* Share tip */}
      <p className="mt-1.5 text-center text-[9px] text-indigo-500 dark:text-indigo-400">
        المعرفة المرئية أسهل للتذكر — شاركيها مع صديقاتكِ
      </p>
    </div>
  );
}
