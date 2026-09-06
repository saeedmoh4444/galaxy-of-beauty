'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  PageContainer,
  CardListSkeleton,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { bookingStatusLabelKey } from '@/lib/bookingStatus';

const STATUS_TABS = [
  'ALL',
  'REQUESTED',
  'ACCEPTED',
  'PAID',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

export default function BookingsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({
    status,
    page,
    limit: 10,
  });
  const cancelMut = api.bookings.transition.useMutation({
    onSuccess: () => {
      setCancelId(null);
      refetch();
    },
  });

  const bookings = (data?.bookings as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <h1 className="text-2xl font-bold text-text-primary">{t('booking.my-bookings')}</h1>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s === 'ALL' ? undefined : s);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (s === 'ALL' && !status) || s === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              {t(bookingStatusLabelKey(s))}
            </button>
          ))}
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('booking.load-error')} onRetry={() => refetch()} />
        ) : bookings.length === 0 ? (
          <div>
            <EmptyState title={t('booking.no-bookings')} />
            <div className="text-center">
              <Link href="/services">
                <Button>{t('booking.browse-services')}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b: Record<string, unknown>) => (
              <Card key={b.id as number} padding="md" hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{b.bookingCode as string}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(b.startAt as string).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      b.status === 'COMPLETED'
                        ? 'bg-success-subtle text-success'
                        : b.status === 'CANCELLED' || b.status === 'REJECTED'
                          ? 'bg-danger-subtle text-danger'
                          : 'bg-info-subtle text-info'
                    }`}
                  >
                    {t(bookingStatusLabelKey(b.status as string))}
                  </span>
                  {(b.status === 'REQUESTED' || b.status === 'ACCEPTED') && (
                    <Button size="sm" variant="danger" onClick={() => setCancelId(b.id as number)}>
                      {t('button.cancel')}
                    </Button>
                  )}
                  {(b.status === 'PAID' || b.status === 'IN_PROGRESS') && (
                    <Link
                      href={`/video/${b.id}`}
                      className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700"
                    >
                      {t('booking.video')}
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
      <Modal
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        title={t('booking.confirm-cancel')}
        size="sm"
      >
        <p className="text-sm text-text-secondary dark:text-gray-400">
          {t('booking.confirm-cancel-question')}
        </p>
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => setCancelId(null)} className="flex-1">
            {t('button.back')}
          </Button>
          <Button
            variant="danger"
            onClick={() => cancelId && cancelMut.mutate({ id: cancelId, action: 'cancel' })}
            loading={cancelMut.isPending}
            className="flex-1"
          >
            {t('booking.confirm-cancel')}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
