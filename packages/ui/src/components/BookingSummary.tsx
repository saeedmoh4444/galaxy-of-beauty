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
}

export function BookingSummary({ booking, className = '' }: BookingSummaryProps): JSX.Element {
  const total = booking.total ?? booking.price - (booking.discount ?? 0);
  const statusVariant = booking.statusVariant ?? (booking.status === 'COMPLETED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : 'info');

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">ملخص الحجز</h3>
        {booking.status ? <Badge variant={statusVariant as any}>{booking.status}</Badge> : null}
      </div>

      <Divider className="my-3" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">كود الحجز</span>
          <span className="font-mono font-semibold text-text-primary dark:text-gray-100">{booking.code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">الخدمة</span>
          <span className="font-semibold text-text-primary dark:text-gray-100">{booking.service}</span>
        </div>
        {booking.technician ? (
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-gray-400">الفنية</span>
            <span className="font-semibold text-text-primary dark:text-gray-100">{booking.technician}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">التاريخ</span>
          <span className="text-text-primary dark:text-gray-100">{booking.date}</span>
        </div>
        {booking.address ? (
          <div className="flex justify-between">
            <span className="text-text-secondary dark:text-gray-400">العنوان</span>
            <span className="text-text-primary dark:text-gray-100">{booking.address}</span>
          </div>
        ) : null}
      </div>

      <Divider className="my-3" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary dark:text-gray-400">سعر الخدمة</span>
          <span className="text-text-primary dark:text-gray-100">{booking.price} ر.س</span>
        </div>
        {booking.discount && booking.discount > 0 ? (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>الخصم</span>
            <span>-{booking.discount} ر.س</span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-bold">
          <span className="text-text-primary dark:text-gray-100">الإجمالي</span>
          <span className="text-brand-600 dark:text-brand-400">{total} ر.س</span>
        </div>
      </div>
    </Card>
  );
}
