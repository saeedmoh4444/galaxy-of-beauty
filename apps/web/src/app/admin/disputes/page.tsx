'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Button, Card, CardListSkeleton, ErrorAlert, EmptyState, Modal } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { type TranslationKey } from '@galaxy/shared';

const STATUS_TABS = [
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED_CUSTOMER',
  'RESOLVED_TECHNICIAN',
  'CLOSED',
] as const;

type DisputeItem = NonNullable<RouterOutput['disputes']['listAdmin']>['items'][number];

const statusBadge = (status: string): { labelKey: TranslationKey; className: string } => {
  switch (status) {
    case 'OPEN':
      return { labelKey: 'admin.disputes.status-open', className: 'bg-red-100 text-red-700' };
    case 'UNDER_REVIEW':
      return {
        labelKey: 'admin.disputes.status-under-review',
        className: 'bg-amber-100 text-amber-700',
      };
    case 'RESOLVED_CUSTOMER':
      return {
        labelKey: 'admin.disputes.status-customer',
        className: 'bg-green-100 text-green-700',
      };
    case 'RESOLVED_TECHNICIAN':
      return {
        labelKey: 'admin.disputes.status-technician',
        className: 'bg-blue-100 text-blue-700',
      };
    case 'CLOSED':
      return {
        labelKey: 'admin.disputes.status-closed',
        className: 'bg-surface-muted text-text-primary',
      };
    default:
      return {
        labelKey: status as unknown as TranslationKey,
        className: 'bg-surface-muted text-text-primary',
      };
  }
};

export default function AdminDisputesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [statusTab, setStatusTab] = useState<string>('OPEN');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selected, setSelected] = useState<DisputeItem | null>(null);
  const [resolveStatus, setResolveStatus] = useState<string>('RESOLVED_CUSTOMER');
  const [resolutionText, setResolutionText] = useState('');

  const { data, isLoading, isError, refetch } = api.disputes.listAdmin.useQuery({
    page: 1,
    limit: 20,
  });
  const resolveMut = api.disputes.resolve.useMutation({
    onSuccess: () => {
      refetch();
      setResolveOpen(false);
      setSelected(null);
      setResolutionText('');
    },
  });

  const disputes = data?.items ?? [];

  const filtered =
    statusTab === 'OPEN'
      ? disputes.filter((d) => d.status === 'OPEN')
      : disputes.filter((d) => d.status === statusTab);

  const handleResolve = () => {
    if (!selected) return;
    resolveMut.mutate({
      disputeId: selected.id,
      status: resolveStatus as 'RESOLVED_CUSTOMER' | 'RESOLVED_TECHNICIAN' | 'CLOSED',
      resolution: resolutionText,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.disputes.title')}</h1>
        <p className="text-sm text-text-secondary">
          {t('admin.disputes.total', { count: disputes.length })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const badge = statusBadge(tab);
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusTab === tab ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {t(badge.labelKey)}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('admin.disputes.load-error')} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('admin.disputes.empty-title', {
            status: t(statusBadge(statusTab).labelKey),
          })}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((d: DisputeItem) => {
            const badge = statusBadge(d.status);
            return (
              <Card key={d.id} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{d.booking.bookingCode}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {t(badge.labelKey)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-text-secondary">
                      <span>{t('admin.disputes.customer', { name: d.raiser?.name ?? '—' })}</span>
                      <span>{t('admin.disputes.reason', { reason: d.reason ?? '—' })}</span>
                      <span>
                        {d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString(
                              locale === 'en' ? 'en-GB' : 'ar-SA',
                            )
                          : '—'}
                      </span>
                    </div>
                  </div>
                  {d.status !== 'CLOSED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelected(d);
                        setResolveStatus('RESOLVED_CUSTOMER');
                        setResolutionText('');
                        setResolveOpen(true);
                      }}
                    >
                      {t('admin.disputes.resolve-button')}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolve Modal */}
      <Modal
        open={resolveOpen}
        onClose={() => {
          setResolveOpen(false);
          setSelected(null);
          setResolutionText('');
        }}
        title={t('admin.disputes.resolve-button')}
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm">
              <strong>{t('admin.disputes.booking-code')}</strong> {selected.booking.bookingCode}
            </p>
            <p className="text-sm">
              <strong>{t('admin.disputes.reason-label')}</strong> {selected.reason}
            </p>

            <div>
              <label
                htmlFor="ad-resolve-status"
                className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
              >
                {t('admin.disputes.resolution')}
              </label>
              <select
                id="ad-resolve-status"
                className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                value={resolveStatus}
                onChange={(e) => setResolveStatus(e.target.value)}
              >
                <option value="RESOLVED_CUSTOMER">{t('admin.disputes.status-customer')}</option>
                <option value="RESOLVED_TECHNICIAN">{t('admin.disputes.status-technician')}</option>
                <option value="CLOSED">{t('admin.disputes.close-dispute')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ad-resolution"
                className="mb-1 block text-sm font-medium text-text-primary dark:text-gray-300"
              >
                {t('admin.disputes.resolution-details')}
              </label>
              <textarea
                id="ad-resolution"
                className="w-full rounded-lg border border-edge bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder={t('admin.disputes.resolution-placeholder')}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleResolve} loading={resolveMut.isPending}>
                {t('admin.disputes.confirm-resolution')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResolveOpen(false);
                  setSelected(null);
                }}
              >
                {t('button.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
