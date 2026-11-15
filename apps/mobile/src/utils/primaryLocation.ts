/**
 * W4-9 — the customer screens hardcoded DEFAULT_SAUDI_CITY with TODOs.
 * The honest default is the customer's REAL primary address (their saved
 * city), falling back to Riyadh only when they have none.
 */
export const DEFAULT_CITY = 'الرياض';

export interface AddressLike {
  city?: string | null;
  label?: string | null;
}

export function pickPrimaryCity(addresses?: AddressLike[] | null): string {
  const city = addresses?.[0]?.city?.trim();
  return city || DEFAULT_CITY;
}

export function pickPrimaryAddress(addresses?: AddressLike[] | null): string {
  const first = addresses?.[0];
  if (!first) return DEFAULT_CITY;
  const line = [first.city, first.label].filter(Boolean).join(' — ');
  return line || DEFAULT_CITY;
}
