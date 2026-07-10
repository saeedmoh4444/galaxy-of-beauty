/**
 * Format a number as SAR currency.
 */
export function formatCurrency(amount: number, locale = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
  }).format(amount);
}
