'use client';

/**
 * Rating Stars — consistent star display with half-star support.
 *
 * Usage:
 *   <RatingStars rating={4.5} />
 *   <RatingStars rating={3.0} max={5} size="sm" showNumeric />
 */

interface RatingStarsProps {
  rating: number; // 0-5
  max?: number; // default 5
  size?: 'sm' | 'md' | 'lg';
  showNumeric?: boolean; // show "4.5" next to stars
  className?: string;
}

const SIZE_CLASSES = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showNumeric = false,
  className = '',
}: RatingStarsProps): JSX.Element {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = max - full - (hasHalf ? 1 : 0);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${SIZE_CLASSES[size]} ${className}`}
      dir="ltr"
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className="text-amber-400">
          
        </span>
      ))}
      {hasHalf ? <span className="text-amber-400"></span> : null}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className="text-gray-300 dark:text-gray-600">
          
        </span>
      ))}
      {showNumeric ? (
        <span className="ml-1 text-xs text-text-secondary dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
