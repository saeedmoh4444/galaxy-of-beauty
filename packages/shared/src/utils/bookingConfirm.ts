/**
 * W2-4 (audit 2026-11-11) — booking confirm screens showed a placeholder
 * '———' code because the create flows never passed ?code=&date=.
 *
 * Builds the confirm-screen href from the created booking's fields.
 * Web appends it to /bookings/confirm, mobile to /customer/bookings/confirm
 * (expo-router parses query strings into useLocalSearchParams).
 */
export function buildBookingConfirmHref(
  pathname: string,
  code?: string | null,
  date?: string | Date | null,
): string {
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (date) params.set('date', new Date(date).toISOString());
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
