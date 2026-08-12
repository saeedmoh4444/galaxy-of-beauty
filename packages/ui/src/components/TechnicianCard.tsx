'use client';

import { Card } from './Card';
import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';
import { Badge } from './Badge';

/**
 * Technician Card — pre-built card for technician listings.
 *
 * Usage:
 *   <TechnicianCard tech={{ id, name: 'نورة', rating: 4.9, city: 'الرياض' }} onSelect={(t) => ...} />
 */

interface TechData {
  id: number;
  name: string;
  avatarUrl?: string | null;
  speciality?: string;
  city?: string;
  rating?: number;
  completedBookings?: number;
  verified?: boolean;
  minPrice?: number;
}

interface TechnicianCardProps {
  tech: TechData;
  onSelect: (tech: TechData) => void;
  className?: string;
}

export function TechnicianCard({
  tech,
  onSelect,
  className = '',
}: TechnicianCardProps): JSX.Element {
  return (
    <Card padding="md" hover className={`text-center ${className}`}>
      <Avatar src={tech.avatarUrl} name={tech.name} size="xl" className="mx-auto" />
      <h3 className="mt-3 text-sm font-bold text-text-primary dark:text-gray-100">{tech.name}</h3>

      {tech.speciality ? (
        <Badge variant="brand" size="sm" className="mt-1">
          {tech.speciality}
        </Badge>
      ) : null}

      <div className="mt-2 flex items-center justify-center gap-2">
        {tech.rating ? <RatingStars rating={tech.rating} size="sm" /> : null}
        {tech.completedBookings ? (
          <span className="text-xs text-text-tertiary">{tech.completedBookings}+ حجز</span>
        ) : null}
      </div>

      {tech.city ? (
        <p className="mt-1 text-xs text-text-secondary dark:text-gray-400"> {tech.city}</p>
      ) : null}

      {tech.minPrice ? (
        <p className="mt-1 text-xs text-text-secondary dark:text-gray-400">
          من {tech.minPrice} ر.س
        </p>
      ) : null}

      <button
        onClick={() => onSelect(tech)}
        className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-95"
      >
        عرض الملف
      </button>
    </Card>
  );
}
