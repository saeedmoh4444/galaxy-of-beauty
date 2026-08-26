'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  NOTIFIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  CLAIMED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  EXPIRED: 'bg-surface-muted text-text-secondary dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_LABELS: Record<string, TranslationKey> = {
  WAITING: 'waitlist.status.waiting',
  NOTIFIED: 'waitlist.status.notified',
  CLAIMED: 'waitlist.status.claimed',
  EXPIRED: 'waitlist.status.expired',
};

export default function WaitlistPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [showJoin, setShowJoin] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [serviceName, setServiceName] = useState('');

  const { data, isLoading, isError, refetch } = api.waitlist.listMyEntries.useQuery();
  const techsQuery = api.technicians.list.useQuery({ limit: 100 });
  const joinMut = api.waitlist.join.useMutation({
    onSuccess: () => {
      setShowJoin(false);
      setSelectedTechId('');
      setServiceName('');
      refetch();
    },
  });
  const leaveMut = api.waitlist.leave.useMutation({ onSuccess: () => refetch() });

  const entries = (data as unknown as Record<string, unknown>[]) ?? [];
  const technicians = ((techsQuery.data as unknown as Record<string, unknown>[]) ??
    []) as unknown as Record<string, unknown>[];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('waitlist.title')}</h1>
          <Button onClick={() => setShowJoin(true)}>{t('waitlist.join')}</Button>
        </div>

        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : isError ? (
          <ErrorAlert message={t('waitlist.err.load')} onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <div>
            <EmptyState title={t('waitlist.empty.title')} description={t('waitlist.empty.desc')} />
            <div className="text-center">
              <Button onClick={() => setShowJoin(true)}>{t('waitlist.joinNow')}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((e: Record<string, unknown>) => {
              const statusKey = e.status as string;
              return (
                <Card key={e.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {(e.technicianName as string) ?? t('waitlist.technicianFallback')}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <span>
                          {t('waitlist.positionLabel')}{' '}
                          <strong className="text-brand-600">#{e.position as number}</strong>
                        </span>
                        {(e.serviceName as string | null) ? (
                          <span>
                            {t('waitlist.serviceLabel', { name: e.serviceName as string })}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-text-tertiary">
                        {new Date(e.createdAt as string).toLocaleDateString(
                          locale === 'en' ? 'en-GB' : 'ar-SA',
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[statusKey] ?? 'bg-surface-muted text-text-secondary'}`}
                      >
                        {STATUS_LABELS[statusKey] ? t(STATUS_LABELS[statusKey]) : statusKey}
                      </span>
                      {statusKey === 'WAITING' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            leaveMut.mutate({ technicianId: e.technicianId as number })
                          }
                          loading={leaveMut.isPending}
                        >
                          {t('waitlist.leave')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        title={t('waitlist.modal.title')}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="wl-tech" className="mb-1 block text-sm font-medium">
              {t('waitlist.chooseTech')}
            </label>
            <select
              id="wl-tech"
              className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
            >
              <option value="">{t('waitlist.placeholder.tech')}</option>
              {technicians.map((t: Record<string, unknown>) => {
                // technicians.list returns raw profile rows — the public
                // waitlist contract takes the technician USER id (profile
                // ids 404 in join/leave lookups), and the name lives on
                // the nested user object.
                const user = t.user as Record<string, unknown> | undefined;
                return (
                  <option key={user?.id as number} value={user?.id as number}>
                    {user?.name as string}
                  </option>
                );
              })}
            </select>
          </div>
          <Input
            label={t('waitlist.serviceOptional')}
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder={t('waitlist.placeholder.service')}
          />
          <Button
            className="w-full"
            loading={joinMut.isPending}
            disabled={!selectedTechId}
            onClick={() => joinMut.mutate({ technicianId: Number(selectedTechId) })}
          >
            {t('waitlist.confirmJoin')}
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
