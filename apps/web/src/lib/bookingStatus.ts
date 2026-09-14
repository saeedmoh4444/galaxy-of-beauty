import type { TranslationKey } from '@galaxy/shared';

/**
 * Catalog key for a booking status label.
 * 'ALL' (filter pseudo-status) → 'booking.all'; otherwise `booking.status.<STATUS>`.
 */
export const bookingStatusLabelKey = (status: string): TranslationKey =>
  status === 'ALL' ? 'booking.all' : (`booking.status.${status}` as TranslationKey);
