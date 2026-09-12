'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, Input, formatCurrency, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅' },
  { id: 2, name: 'باديكير', emoji: '🦶' },
  { id: 3, name: 'تنظيف بشرة', emoji: '🧖' },
  { id: 4, name: 'مساج', emoji: '‍️' },
  { id: 5, name: 'صبغ شعر', emoji: '💈' },
  { id: 6, name: 'مكياج', emoji: '💄' },
];

export default function AdminFlashDealsPage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  // Gated per the 2026-09-06 sweep (stale logged-out tabs).
  const { data: active, isLoading } = api.flashDeals.active.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const createMut = api.flashDeals.create.useMutation();
  const [svcId, setSvcId] = useState(1);
  const [discount, setDiscount] = useState(30);
  const [hours, setHours] = useState(24);
  const [maxRedemptions, setMax] = useState(20);

  // B.7 — provider promotion proposals review queue.
  const { data: pendingData, refetch: refetchQueue } = api.providerReview.list.useQuery(
    { kind: 'promotion', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as { data: { items: Array<Record<string, unknown>> } | undefined; refetch: () => void };
  const pendingSubs = pendingData?.items ?? [];

  // Store plan Phase 4b — store product-deal proposals (same queue).
  const { data: storeDealData, refetch: refetchStoreDeals } = api.providerReview.list.useQuery(
    { kind: 'store_promotion', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as { data: { items: Array<Record<string, unknown>> } | undefined; refetch: () => void };
  const pendingStoreDeals = storeDealData?.items ?? [];

  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const decideMut = api.providerReview.decide.useMutation({
    onSuccess: () => {
      refetchQueue();
      refetchStoreDeals();
    },
  });

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.flash-deals.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('admin.flash-deals.subtitle')}</p>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.flash-deals.create-title')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={svcId}
              onChange={(e) => setSvcId(Number(e.target.value))}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              min={10}
              max={80}
              placeholder={t('admin.flash-deals.discount-placeholder')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              min={1}
              max={72}
              placeholder={t('admin.flash-deals.duration-placeholder')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMax(Number(e.target.value))}
              min={1}
              placeholder={t('admin.flash-deals.max-placeholder')}
              className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <Button
            onClick={() =>
              createMut.mutate({
                serviceId: svcId,
                discountPercent: discount,
                durationHours: hours,
                maxRedemptions,
              })
            }
            loading={createMut.isPending}
            className="w-full mt-3"
          >
            {t('admin.flash-deals.create-button')}
          </Button>
        </Card>

        {/* Store plan Phase 4b — store product-deal proposals */}
        {pendingStoreDeals.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.promotions.store-review-title')}</h3>
            <div className="space-y-3">
              {pendingStoreDeals.map((sub: Record<string, unknown>) => {
                const payload = (sub.payload ?? {}) as Record<string, unknown>;
                return (
                  <div
                    key={sub.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-bold">{payload.titleAr as string}</p>
                      <p className="text-xs text-text-secondary">
                        {formatCurrency(payload.originalPrice as number)} ←{' '}
                        {formatCurrency(payload.dealPrice as number)} ·{' '}
                        {t('admin.promotions.review-provider', { id: sub.providerId as number })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={t('admin.promotions.reject-notes-placeholder')}
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
                );
              })}
            </div>
          </Card>
        )}

        {/* B.7 — provider promotion proposals */}
        {pendingSubs.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('admin.promotions.review-title')}</h3>
            <div className="space-y-3">
              {pendingSubs.map((sub: Record<string, unknown>) => {
                const payload = (sub.payload ?? {}) as Record<string, unknown>;
                return (
                  <div
                    key={sub.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-bold">{payload.titleAr as string}</p>
                      <p className="text-xs text-text-secondary">
                        {t('admin.promotions.review-provider', { id: sub.providerId as number })}
                        {' · '}
                        {formatCurrency(payload.originalPrice as number)} ←{' '}
                        {formatCurrency(payload.dealPrice as number)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={t('admin.promotions.reject-notes-placeholder')}
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
                );
              })}
            </div>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('admin.flash-deals.active-deals')}</h3>
          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : !(active ?? []).length ? (
            <p className="text-sm text-text-tertiary">{t('admin.flash-deals.no-active')}</p>
          ) : (
            <div className="space-y-2">
              {(active ?? []).map((d: Record<string, unknown>) => (
                <div
                  key={d.id as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <span className="font-bold">{d.serviceNameAr as string}</span>
                    <span className="text-xs text-text-secondary me-2">
                      {(d.titleAr as string) ?? ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary line-through">
                      {formatCurrency(d.originalPrice as number)}
                    </span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(d.dealPrice as number)}
                    </span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      -{d.discountPercent as number}%
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {d.currentRedemptions as number}/{d.maxRedemptions as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
