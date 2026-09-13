'use client';

/**
 * TrustBadges — the platform's trust signals (Phase 3 sprint 1).
 * Rose Blush tokens; replaces the inline hero spans and becomes the
 * reusable trust row for service detail + technician cards (sprints 2–4).
 * Labels come from the i18n catalog — the component holds no copy.
 */

export type TrustBadgeVariant = 'womenOnly' | 'private' | 'verified' | 'rating' | 'safeSpace';

const VARIANT_GLYPH: Record<TrustBadgeVariant, string> = {
  womenOnly: '🌸',
  private: '🔒',
  verified: '✓',
  rating: '★',
  safeSpace: '✨',
};

export function TrustBadge({
  variant,
  label,
  value,
  className = '',
}: {
  variant: TrustBadgeVariant;
  label: string;
  /** Optional value, e.g. the platform rating "4.8". */
  value?: string | number;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-4 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 ${className}`}
    >
      <span aria-hidden>{VARIANT_GLYPH[variant]}</span>
      <span>{label}</span>
      {value != null && (
        <span aria-hidden className="font-extrabold text-accent-500">
          {value}
        </span>
      )}
    </span>
  );
}

export function TrustBadges({
  items,
  className = '',
}: {
  items: Array<{ variant: TrustBadgeVariant; label: string; value?: string | number }>;
  className?: string;
}): JSX.Element {
  return (
    <div
      data-testid="trust-badges"
      className={`flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-semibold text-text-secondary ${className}`}
    >
      {items.map((item) => (
        <TrustBadge key={item.variant + item.label} {...item} />
      ))}
    </div>
  );
}
