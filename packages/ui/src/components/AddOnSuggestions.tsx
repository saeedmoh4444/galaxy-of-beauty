'use client';

/**
 * Smart add-on suggestions — "Customers who booked this also added..."
 *
 * Usage:
 *   <AddOnSuggestions serviceId={1} addOns={[...]} onAdd={(addon) => {...}} />
 */

interface AddOn {
  id: number;
  name: string;
  price: number;
  emoji?: string;
  popularity?: number;
}

interface AddOnSuggestionsProps {
  serviceId: number;
  addOns: AddOn[];
  onAdd: (addOn: AddOn) => void;
  className?: string;
}

export function AddOnSuggestions({ serviceId, addOns, onAdd, className = '' }: AddOnSuggestionsProps): JSX.Element | null {
  if (addOns.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-edge bg-surface-muted p-4 dark:border-gray-700 dark:bg-gray-900 ${className}`}>
      <h4 className="text-sm font-semibold text-text-primary dark:text-gray-100">
        💡 العناية تقترح عليكِ
      </h4>
      <p className="mt-1 text-xs text-text-secondary dark:text-gray-400">
        العميلات أضفن هذه الخدمات مع هذا الحجز
      </p>
      <div className="mt-3 space-y-2">
        {addOns.map((addOn) => (
          <div key={addOn.id} className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-800">
            <div>
              <span className="text-sm font-medium text-text-primary dark:text-gray-100">
                {addOn.emoji ? `${addOn.emoji} ` : ''}{addOn.name}
              </span>
              {addOn.popularity ? (
                <span className="ml-2 text-[10px] text-amber-600">🔥 {addOn.popularity}+ حجز</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-600">{addOn.price} ر.س</span>
              <button
                onClick={() => onAdd(addOn)}
                className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
              >
                + إضافة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
