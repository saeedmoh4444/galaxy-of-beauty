'use client';

import { Card } from './Card';
import { Divider } from './Divider';
import { Badge } from './Badge';

/**
 * Booking Summary — confirmation card for booking detail page.
 *
 * Usage:
 *   <BookingSummary booking={{ code: 'GOB-ABC123', service: 'مساج', date: '...', price: 200 }} />
 */

interface BookingSummaryData {
  code: string;
  service: string;
  technician?: string;
  date: string;
  time?: string;
  price: number;
  discount?: number;
  total?: number;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'info' | 'danger';
  address?: string;
  notes?: string;
}

interface BookingSummaryProps {
  booking: BookingSummaryData;
  className?: string;
  /** Card heading */
  title?: string;
  /** Booking code label */
  codeLabel?: string;
  /** Service label */
  serviceLabel?: string;
  /** Technician label */
  technicianLabel?: string;
  /** Date label */
  dateLabel?: string;
  /** Address label */
  addressLabel?: string;
  /** Service price label */
  priceLabel?: string;
  /** Discount label */
  discountLabel?: string;
  /** Total label */
  totalLabel?: string;
  /** Currency suffix for amounts */
  currencySuffix?: string;
}

export function BookingSummary({
  booking,
  className = '',
  title = 'ملخص الحجز',
  codeLabel = 'كود الحجز',
  serviceLabel = 'الخدمة',
  technicianLabel = 'الفنية',
  dateLabel = 'التاريخ',
  addressLabel = 'العنوان',
  priceLabel = 'سعر الخدمة',
  discountLabel = 'الخصم',
  totalLabel = 'الإجمالي',
  currencySuffix = 'ر.س',
}: BookingSummaryProps): JSX.Element {
  const total = booking.total ?? booking.price - (booking.discount ?? 0);
  const statusVariant =
    booking.statusVariant ??
    (booking.status === 'COMPLETED'
      ? 'success'
      : booking.status === 'CANCELLED'
        ? 'danger'
        : 'info');

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">{title}</h3>
        {booking.status ? <Badge variant={statusVariant as any}>{booking.status}</Badge> : null}
      </div>

      <Divider className="my-3" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">{codeLabel}</span>
          <span className="font-mono font-semibold text-text-primary dark:text-gray-100">
            {booking.code}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">{serviceLabel}</span>
          <span className="font-semibold text-text-primary dark:text-gray-100">
            {booking.service}
          </span>
        </div>
        {booking.technician ? (
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-gray-400">{technicianLabel}</span>
            <span className="font-semibold text-text-primary dark:text-gray-100">
              {booking.technician}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">{dateLabel}</span>
          <span className="text-text-primary dark:text-gray-100">{booking.date}</span>
        </div>
        {booking.address ? (
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-gray-400">{addressLabel}</span>
            <span className="text-text-primary dark:text-gray-100">{booking.address}</span>
          </div>
        ) : null}
      </div>

      <Divider className="my-3" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">{priceLabel}</span>
          <span className="text-text-primary dark:text-gray-100">
            {booking.price} {currencySuffix}
          </span>
        </div>
        {booking.discount && booking.discount > 0 ? (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>{discountLabel}</span>
            <span>
              -{booking.discount} {currencySuffix}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-bold">
          <span className="text-text-primary dark:text-gray-100">{totalLabel}</span>
          <span className="text-brand-600 dark:text-brand-400">
            {total} {currencySuffix}
          </span>
        </div>
      </div>
    </Card>
  );
}
