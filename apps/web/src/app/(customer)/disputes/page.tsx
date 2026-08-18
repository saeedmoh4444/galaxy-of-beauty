'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  RESOLVED_CUSTOMER: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  RESOLVED_TECHNICIAN: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  CLOSED: 'bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, TranslationKey> = {
  OPEN: 'disputes.status.open',
  UNDER_REVIEW: 'disputes.status.underReview',
  RESOLVED_CUSTOMER: 'disputes.status.resolvedCustomer',
  RESOLVED_TECHNICIAN: 'disputes.status.resolvedTechnician',
  CLOSED: 'disputes.status.closed',
};

export default function DisputesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [showCreate, setShowCreate] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [reason, setReason] = useState('');

  const { data, isLoading, isError, refetch } = api.disputes.list.useQuery({});
  const createMut = api.disputes.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      setBookingId('');
      setReason('');
      refetch();
    },
  });

  const disputes = (data as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('disputes.title')}</h1>
          <Button onClick={() => setShowCreate(true)}>{t('disputes.createNew')}</Button>
        </div>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('disputes.loadError')} onRetry={() => refetch()} />
        ) : disputes.length === 0 ? (
          <div>
            <EmptyState title={t('disputes.emptyTitle')} description={t('disputes.emptyDesc')} />
            <div className="text-center">
              <Button onClick={() => setShowCreate(true)}>{t('disputes.open')}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d: Record<string, unknown>) => {
              const statusKey = d.status as string;
              return (
                <Card key={d.id as number} padding="md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {(d.bookingCode as string) ??
                            t('disputes.bookingFallback', { id: d.bookingId as string })}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(d.createdAt as string).toLocaleDateString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                          )}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[statusKey] ?? 'bg-surface-muted text-text-secondary'}`}
                      >
                        {t(STATUS_LABELS[statusKey] ?? 'disputes.status.unknown')}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-gray-400">
                      {d.reason as string}
                    </p>
                    {(d.resolution as string) && (
                      <div className="rounded-lg bg-surface-muted p-3 dark:bg-gray-800">
                        <p className="text-xs font-medium text-text-secondary">
                          {t('disputes.adminDecision')}
                        </p>
                        <p className="text-sm text-text-primary dark:text-gray-300">
                          {d.resolution as string}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('disputes.createNew')}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label={t('disputes.bookingLabel')}
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder={t('disputes.bookingPlaceholder')}
          />
          <div>
            <label htmlFor="dp-reason" className="mb-1 block text-sm font-medium">
              {t('disputes.reasonLabel')}
            </label>
            <textarea
              id="dp-reason"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('disputes.reasonPlaceholder')}
            />
          </div>
          <Button
            className="w-full"
            loading={createMut.isPending}
            disabled={!bookingId || !reason}
            onClick={() => createMut.mutate({ bookingId: Number(bookingId), reason })}
          >
            {t('disputes.submit')}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
