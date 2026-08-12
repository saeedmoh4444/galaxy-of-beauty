'use client';

import { useEffect, useState } from 'react';

/**
 * Animated stats counter — counts up to target when visible.
 * Uses real images instead of emojis for professional appearance.
 *
 * Usage:
 *   <StatsCounter stats={[
 *     { label: 'حجز', value: 500, image: '/images/stats/bookings.webp' }
 *   ]} />
 */

interface Stat {
  label: string;
  value: number;
  image?: string;
  suffix?: string;
}

interface StatsCounterProps {
  stats: Stat[];
  className?: string;
}

function useCountUp(target: number, duration = 2000): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function CountUpItem({ stat }: { stat: Stat }) {
  const count = useCountUp(stat.value);
  return (
    <div className="text-center">
      {stat.image ? (
        <img
          src={stat.image}
          alt={stat.label}
          className="mx-auto mb-2 h-10 w-10 rounded-lg object-cover"
          loading="lazy"
        />
      ) : (
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900">
          <span className="text-lg font-bold text-brand-500">{stat.label[0]}</span>
        </div>
      )}
      <div className="mt-1 text-3xl font-extrabold text-brand-600 dark:text-brand-400">
        {count.toLocaleString('ar-SA')}
        {stat.suffix ?? '+'}
      </div>
      <div className="mt-1 text-sm font-medium text-text-secondary dark:text-gray-400">
        {stat.label}
      </div>
    </div>
  );
}

export function StatsCounter({ stats, className = '' }: StatsCounterProps): JSX.Element {
  return (
    <div
      className={`grid gap-8 ${stats.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} ${className}`}
    >
      {stats.map((s, i) => (
        <CountUpItem key={i} stat={s} />
      ))}
    </div>
  );
}
