'use client';

import { useState } from 'react';
import { getServiceImage } from '@galaxy/shared';

/**
 * Renders a beauty service image from the shared image registry.
 * Falls back gracefully to a letter avatar if the image fails to load.
 *
 * Usage:
 *   <ServiceImage service="hairStyling" size="lg" />
 *   <ServiceImage src={customUrl} alt="Custom" size="md" />
 */
interface ServiceImageProps {
  /** Service key from the shared image registry (e.g. 'hairStyling', 'manicure') */
  service?: string | null;
  /** Direct image URL — overrides service key */
  src?: string | null;
  /** Alt text for accessibility */
  alt?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-40 w-40',
  full: 'h-full w-full',
};

const letterBg = 'bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-900';

export function ServiceImage({
  service,
  src,
  alt = '',
  size = 'md',
  className = '',
}: ServiceImageProps): JSX.Element {
  const [failed, setFailed] = useState(false);
  const imageSrc = src ?? getServiceImage(service);

  if (failed || !imageSrc) {
    const letter = alt?.[0] ?? service?.[0]?.toUpperCase() ?? '💄';
    return (
      <div
        className={`flex items-center justify-center rounded-xl ${letterBg} ${sizeClasses[size]} ${className}`}
        role="img"
        aria-label={alt || service || 'Beauty service'}
      >
        <span className="text-2xl font-bold text-brand-600 dark:text-brand-300">
          {letter}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt || service || 'Beauty service'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-xl object-cover ${sizeClasses[size]} ${className}`}
    />
  );
}
