'use client';

import { useEffect, useState } from 'react';

/**
 * Animated stats counter — counts up to target when visible.
 * Used on landing page for social proof.
 *
 * Usage:
 *   <StatsCounter stats={[{ label: 'حجز', value: 500, emoji: '📅' }]} />
 */

interface Stat {
  label: string;
  value: number;
  emoji?: string;
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
      <span className="text-2xl">{stat.emoji ?? '✨'}</span>
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
