'use client';

/**
 * Seasonal badge — shows time-limited/seasonal offers.
 *
 * Usage:
 *   <SeasonalBadge season="EID" />
 *   → "🌙 عرض العيد"
 */

const SEASONS: Record<string, { emoji: string; labelAr: string; labelEn: string; color: string }> =
  {
    EID: {
      emoji: '🌙',
      labelAr: 'عرض العيد',
      labelEn: 'Eid Offer',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    RAMADAN: {
      emoji: '🌟',
      labelAr: 'عرض رمضان',
      labelEn: 'Ramadan Offer',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    WEDDING: {
      emoji: '👰',
      labelAr: 'باقة عرايس',
      labelEn: 'Bridal Package',
      color: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300',
    },
    GRADUATION: {
      emoji: '🎓',
      labelAr: 'عرض التخرج',
      labelEn: 'Graduation Offer',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    WEEKEND: {
      emoji: '🎉',
      labelAr: 'عرض نهاية الأسبوع',
      labelEn: 'Weekend Deal',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    SUMMER: {
      emoji: '☀️',
      labelAr: 'عرض الصيف',
      labelEn: 'Summer Deal',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    },
  };

interface SeasonalBadgeProps {
  season: string;
  className?: string;
}

export function SeasonalBadge({ season, className = '' }: SeasonalBadgeProps): JSX.Element | null {
  const s = SEASONS[season];
  if (!s) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${s.color} ${className}`}
    >
      {s.emoji} {s.labelAr}
    </span>
  );
}
