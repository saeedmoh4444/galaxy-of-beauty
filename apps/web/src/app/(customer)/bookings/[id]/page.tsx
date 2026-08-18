'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';
import { localize } from '@galaxy/shared';

const STATUS_LABELS: Record<string, TranslationKey> = {
  REQUESTED: 'booking.status.REQUESTED',
  ACCEPTED: 'booking.status.ACCEPTED',
  PAYMENT_AUTHORIZED: 'booking.status.PAYMENT_AUTHORIZED',
  CONFIRMED_OFFLINE: 'booking.status.CONFIRMED_OFFLINE',
  PAID: 'booking.status.PAID',
  IN_PROGRESS: 'booking.status.IN_PROGRESS',
  COMPLETED: 'booking.status.COMPLETED',
  REJECTED: 'booking.status.REJECTED',
  CANCELLED: 'booking.status.CANCELLED',
  NO_SHOW: 'booking.status.NO_SHOW',
};

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function BookingDetailPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const query = api.bookings.getById.useQuery({ id: bookingId }, { enabled: !isNaN(bookingId) });
  const booking = query.data;

  if (query.isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <DetailSkeleton />
      </DashboardLayout>
    );
  if (query.isError || !booking)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <ErrorAlert message={t('booking.detail-error')} onRetry={() => query.refetch()} />
      </DashboardLayout>
    );

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('booking.details')}
          </h1>
          <Link href="/bookings">
            <Button variant="outline">{t('booking.back-to-bookings')}</Button>
          </Link>
        </div>

        <Card padding="lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.code')}</span>
              <span className="font-mono font-bold text-brand-600">
                {booking.bookingCode ?? `GOB-${String(booking.id).padStart(6, '0')}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.status-label')}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
              >
                {t(STATUS_LABELS[booking.status] ?? (booking.status as TranslationKey))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.service')}</span>
              <span className="font-semibold">
                {localize(
                  (booking.service as unknown as { titleJson?: Record<string, string> } | null)
                    ?.titleJson,
                  locale,
                ) || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.amount')}</span>
              <span className="font-bold text-brand-600">
                {formatCurrency(Number(booking.totalAmount || 0))}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.date')}</span>
              <span className="text-sm">
                {new Date(booking.startAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t('booking.time')}</span>
              <span className="text-sm">
                {new Date(booking.startAt).toLocaleTimeString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {booking.notes && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('booking.notes')}</span>
                <span className="text-sm text-gray-700">{booking.notes}</span>
              </div>
            )}
          </div>
        </Card>

        {booking.status === 'REQUESTED' && (
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => {}} className="flex-1">
              {t('booking.cancel-booking')}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
