'use client';

import { useState, useEffect } from 'react';

/**
 * Countdown Timer — for flash deals, limited offers, campaign expiry.
 *
 * Usage:
 *   <CountdownTimer expiresAt={new Date(Date.now() + 3600000)} />
 *   → "01:30:00" (1.5 hours remaining)
 */

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
  showLabels?: boolean;
  className?: string;
  expiredText?: string;
  locale?: 'ar' | 'en';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(expiresAt: Date): TimeLeft {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  showLabels = true,
  className = '',
  expiredText = 'انتهى العرض',
  locale = 'ar',
}: CountdownTimerProps): JSX.Element {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const t = calcTimeLeft(expiresAt);
      setTime(t);
      if (t.expired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (time.expired)
    return <span className={`text-sm text-danger ${className}`}>{expiredText}</span>;

  const pad = (n: number) => String(n).padStart(2, '0');

  const parts = [];
  if (time.days > 0) parts.push({ v: pad(time.days), l: { ar: 'يوم', en: 'day' } });
  parts.push({ v: pad(time.hours), l: { ar: 'ساعة', en: 'hour' } });
  parts.push({ v: pad(time.minutes), l: { ar: 'دقيقة', en: 'minute' } });
  parts.push({ v: pad(time.seconds), l: { ar: 'ثانية', en: 'second' } });

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-sm font-bold text-brand-600 dark:text-brand-400 ${className}`}
      dir="ltr"
    >
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-brand-50 px-1.5 py-0.5 dark:bg-brand-950">{p.v}</span>
          {showLabels ? (
            <span className="text-[10px] text-text-tertiary">{p.l[locale]}</span>
          ) : null}
          {i < parts.length - 1 ? <span className="text-text-tertiary">:</span> : null}
        </span>
      ))}
    </span>
  );
}
