'use client';

/**
 * Related Services — cross-sell component showing similar services.
 *
 * Usage:
 *   <RelatedServices services={related} onSelect={(s) => router.push(`/services/${s.id}`)} />
 */

interface RelatedService {
  id: number;
  title: string;
  price: number;
  duration?: string;
  emoji?: string;
}

interface RelatedServicesProps {
  services: RelatedService[];
  onSelect: (service: RelatedService) => void;
  className?: string;
}

export function RelatedServices({
  services,
  onSelect,
  className = '',
}: RelatedServicesProps): JSX.Element | null {
  if (services.length === 0) return null;

  return (
    <div className={className}>
      <h3 className="mb-3 text-lg font-bold text-text-primary dark:text-gray-100">
         قد يعجبكِ أيضاً
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="flex items-center gap-3 rounded-xl border border-edge bg-white p-4 text-right transition-all hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-700"
          >
            <span className="text-2xl">{s.emoji ?? ''}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary dark:text-gray-100">
                {s.title}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-brand-600">{s.price} ر.س</span>
                {s.duration ? (
                  <span className="text-xs text-text-tertiary">{s.duration}</span>
                ) : null}
              </div>
            </div>
            <span className="text-lg text-text-tertiary">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
