'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, Input, EmptyState, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.vendors.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.vendors.subtitle')}</p>
      </div>

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
