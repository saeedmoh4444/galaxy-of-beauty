'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardListSkeleton,
  Button,
  Input,
  EmptyState,
  useAuth,
  ErrorAlert,
  formatCurrency,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

function CommissionRow({ vendor }: { vendor: Record<string, unknown> }): JSX.Element {
  const { t } = useLocale();
  const vendorId = vendor.id as number;
  // D2 — health travels on the listStoreVendors row.
  const health = (vendor.health ?? { score: 60 }) as { score?: number };
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
      {/* D2 — the same store health score the vendor sees on Overview. */}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          (health.score ?? 60) >= 80
            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
            : (health.score ?? 60) >= 60
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
        }`}
        title={t('vendorPortal.health.title')}
      >
        {health.score ?? 60}
      </span>
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
    isError,
  } = api.providerReview.list.useQuery(
    { kind: 'store', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as {
    data: { items: Array<Record<string, unknown>> } | undefined;
    isLoading: boolean;
    refetch: () => void;
    isError: boolean;
  };
  const pendingSubs = pendingData?.items ?? [];
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const decideMut = api.providerReview.decide.useMutation({ onSuccess: () => refetch() });

  // C2 — product listing approval queue (strict mode only).
  const {
    data: productData,
    isLoading: productsLoading,
    refetch: refetchProducts,
    isError: productsError,
  } = api.providerReview.list.useQuery(
    { kind: 'product', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as {
    data: { items: Array<Record<string, unknown>> } | undefined;
    isLoading: boolean;
    refetch: () => void;
    isError: boolean;
  };
  const pendingProducts = productData?.items ?? [];
  const productDecideMut = api.providerReview.decide.useMutation({
    onSuccess: () => refetchProducts(),
  });

  // S3 — store commissions (settlement rates).
  const vendorsQ = api.payouts.listStoreVendors.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
    isError: boolean;
    refetch: () => void;
  };
  const vendors = vendorsQ.data ?? [];

  if (isError || vendorsQ.isError || productsError) {
    return (
      <ErrorAlert
        message={t('state.error')}
        onRetry={() => {
          refetch();
          vendorsQ.refetch();
        }}
      />
    );
  }

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

      {/* C2 — product listing approval (strict mode queue). */}
      {productsLoading ? (
        <CardListSkeleton count={2} />
      ) : pendingProducts.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-bold">{t('admin.vendors.product-queue-title')}</h2>
          {pendingProducts.map((sub: Record<string, unknown>) => {
            const payload = (sub.payload ?? {}) as {
              nameJson?: { ar?: string; en?: string };
              price?: number;
            };
            const name = payload.nameJson?.ar ?? payload.nameJson?.en ?? `#${sub.id}`;
            return (
              <Card key={sub.id as number} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-text-secondary">
                      {formatCurrency(Number(payload.price ?? 0))}
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
                        productDecideMut.mutate({
                          id: sub.id as number,
                          approve: false,
                          notes: rejectNotes[sub.id as number] || undefined,
                        })
                      }
                      loading={productDecideMut.isPending}
                    >
                      {t('admin.packages.reject')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        productDecideMut.mutate({ id: sub.id as number, approve: true })
                      }
                      loading={productDecideMut.isPending}
                    >
                      {t('admin.packages.approve')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
