'use client';

import { Card } from './Card';
import { PriceTag } from './PriceTag';
import { RatingStars } from './RatingStars';
import { PopularityBadge } from './PopularityBadge';

/**
 * Service Card — pre-built card for service listings.
 * Displays emoji/image, title, description, price, rating, and booking CTA.
 *
 * Usage:
 *   <ServiceCard service={{ id, title: 'مساج', price: 200, rating: 4.8 }} onBook={(s) => ...} />
 */

interface ServiceData {
  id: number;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  durationMin?: number;
  emoji?: string;
  imageUrl?: string;
  popular?: boolean;
  popularCount?: number;
}

interface ServiceCardProps {
  service: ServiceData;
  onBook: (service: ServiceData) => void;
  durationSuffix?: string;
  bookText?: string;
  className?: string;
}

export function ServiceCard({
  service,
  onBook,
  durationSuffix = 'دقيقة',
  bookText = 'احجزي الآن',
  className = '',
}: ServiceCardProps): JSX.Element {
  return (
    <Card padding="md" hover className={`group ${className}`}>
      {/* Image / Emoji */}
      <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-5xl dark:from-brand-950 dark:to-brand-900">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="h-full w-full rounded-xl object-cover"
            loading="lazy"
          />
        ) : (
          <span>{service.emoji ?? ''}</span>
        )}
      </div>

      {/* Title + Description */}
      <h3 className="text-sm font-bold text-text-primary dark:text-gray-100 line-clamp-1">
        {service.title}
      </h3>
      {service.description ? (
        <p className="mt-1 text-xs text-text-secondary dark:text-gray-400 line-clamp-2">
          {service.description}
        </p>
      ) : null}

      {/* Rating */}
      {service.rating ? (
        <div className="mt-2">
          <RatingStars rating={service.rating} size="sm" showNumeric />
        </div>
      ) : null}

      {/* Duration */}
      {service.durationMin ? (
        <span className="mt-1 text-xs text-text-tertiary">
          {service.durationMin} {durationSuffix}
        </span>
      ) : null}

      {/* Popularity + Price */}
      <div className="mt-3 flex items-end justify-between">
        {service.popular && service.popularCount ? (
          <PopularityBadge count={service.popularCount} />
        ) : (
          <span />
        )}
        <PriceTag price={service.price} originalPrice={service.originalPrice} />
      </div>

      {/* Book Button */}
      <button
        onClick={() => onBook(service)}
        className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-95"
      >
        {bookText}
      </button>
    </Card>
  );
}
