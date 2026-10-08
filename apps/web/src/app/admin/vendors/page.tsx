'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, Input, EmptyState, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

function CommissionRow({ vendor }: { vendor: Record<string, unknown> }): JSX.Element {
  const { t } = useLocale();
  const vendorId = vendor.id as number;
  const [rate, setRate] = useState(String(Number(vendor.commissionRate ?? 10)));
  const saveMut = api.payouts.setVendorCommission.useMutation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{vendor.storeName as string}</p>
        <p className="text-xs text-text-secondary">
          {vendor.isVerified ? t('admin.vendors.verified') : t('admin.vendors.not-verified')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-24"
          aria-label={t('admin.vendors.commission-rate')}
        />
        <span className="text-sm text-text-secondary">%</span>
        <Button
          size="sm"
          disabled={!Number.isFinite(Number(rate)) || Number(rate) < 0 || Number(rate) > 100}
          loading={saveMut.isPending}
          onClick={() => saveMut.mutate({ vendorId, commissionRate: Number(rate) })}
        >
          {t('button.save')}
        </Button>
      </div>
    </div>
  );
}

export default function AdminVendorsPage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();

  // Store plan Phase 1 — merchant registration review queue.
  const {
    data: pendingData,
    isLoading,
    refetch,
  } = api.providerReview.list.useQuery(
    { kind: 'store', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as {
    data: { items: Array<Record<string, unknown>> } | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  const pendingSubs = pendingData?.items ?? [];
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const decideMut = api.providerReview.decide.useMutation({ onSuccess: () => refetch() });

  // S3 — store commissions (settlement rates).
  const vendorsQ = api.payouts.listStoreVendors.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const vendors = vendorsQ.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.vendors.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.vendors.subtitle')}</p>
      </div>

      {/* S3 — store commission rates */}
      <Card padding="lg">
        <h2 className="mb-1 font-bold">{t('admin.vendors.commissions-title')}</h2>
        <p className="mb-3 text-xs text-text-secondary">{t('admin.vendors.commissions-desc')}</p>
        {vendors.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('admin.vendors.no-vendors')}</p>
        ) : (
          <div className="space-y-2">
            {vendors.map((v) => (
              <CommissionRow key={v.id as number} vendor={v} />
            ))}
          </div>
        )}
      </Card>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : pendingSubs.length === 0 ? (
        <EmptyState title={t('admin.vendors.empty')} />
      ) : (
        <div className="space-y-3">
          {pendingSubs.map((sub: Record<string, unknown>) => {
            const payload = (sub.payload ?? {}) as Record<string, unknown>;
            return (
              <Card key={sub.id as number} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold">{payload.storeName as string}</p>
                    <p className="text-xs text-text-secondary">
                      {t('admin.vendors.license')}: {(payload.licenseNumber as string) || '—'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t('admin.vendors.bank')}: {(payload.bankName as string) || '—'} ·{' '}
                      {(payload.bankIban as string) || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t('admin.vendors.reject-notes-placeholder')}
                      value={rejectNotes[sub.id as number] ?? ''}
                      onChange={(e) =>
                        setRejectNotes({ ...rejectNotes, [sub.id as number]: e.target.value })
                      }
                      className="w-48"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        decideMut.mutate({
                          id: sub.id as number,
                          approve: false,
                          notes: rejectNotes[sub.id as number] || undefined,
                        })
                      }
                      loading={decideMut.isPending}
                    >
                      {t('admin.packages.reject')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => decideMut.mutate({ id: sub.id as number, approve: true })}
                      loading={decideMut.isPending}
                    >
                      {t('admin.packages.approve')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
