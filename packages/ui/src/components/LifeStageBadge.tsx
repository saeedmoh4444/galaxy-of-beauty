'use client';

/**
 * Life Stage Badge — shows which life stage a service/package is designed for.
 * From Phase W2: Life Stage Beauty.
 */

const LIFE_STAGES: Record<string, { emoji: string; label: string; color: string }> = {
  teen: { emoji: '🌸', label: 'مراهقة (١٥-١٨)', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  young_adult: { emoji: '✨', label: 'شابة (١٨-٢٥)', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  career: { emoji: '💼', label: 'مهنية (٢٥-٣٥)', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  bride: { emoji: '👰', label: 'عروس', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  mother: { emoji: '🤱', label: 'أمومة', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  confident: { emoji: '💫', label: 'ثقة (٤٠-٥٥)', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  golden: { emoji: '🌟', label: 'العصر الذهبي (٥٥+)', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

interface LifeStageBadgeProps {
  stage: string;
  className?: string;
}

export function LifeStageBadge({ stage, className = '' }: LifeStageBadgeProps): JSX.Element | null {
  const s = LIFE_STAGES[stage];
  if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.color} ${className}`}>
      {s.emoji} {s.label}
    </span>
  );
}
