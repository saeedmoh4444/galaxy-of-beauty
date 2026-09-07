'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, Input, EmptyState, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export default function AdminGymsPage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();

  // E3 — gym registration review queue (kind 'gym').
  const {
    data: pendingData,
    isLoading,
    refetch,
  } = api.providerReview.list.useQuery(
    { kind: 'gym', status: 'PENDING_REVIEW' },
    { enabled: isAuthenticated },
  ) as {
    data: { items: Array<Record<string, unknown>> } | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  const pendingSubs = pendingData?.items ?? [];
  const [rejectNotes, setRejectNotes] = useState<Record<number, string>>({});
  const decideMut = api.providerReview.decide.useMutation({ onSuccess: () => refetch() });

  const docLink = (url: string, label: string) => (
    <a
      key={label}
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mr-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 underline"
    >
      {label}
    </a>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.gyms.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('admin.gyms.subtitle')}</p>
      </div>

      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : pendingSubs.length === 0 ? (
        <EmptyState title={t('admin.gyms.empty')} />
      ) : (
        <div className="space-y-3">
          {pendingSubs.map((sub: Record<string, unknown>) => {
            const payload = (sub.payload ?? {}) as Record<string, unknown>;
            const docs = (payload.documents ?? {}) as Record<string, string>;
            return (
              <Card key={sub.id as number} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold">{payload.gymName as string}</p>
                    <p className="text-xs text-text-secondary">
                      {t('admin.gyms.type')}: {t(`gyms.type.${payload.gymType as string}` as never)}{' '}
                      · {t('admin.gyms.city')}: {(payload.gymCity as string) || '—'} ·{' '}
                      {t('admin.gyms.address')}: {(payload.gymAddress as string) || '—'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t('admin.vendors.license')}: {(payload.licenseNumber as string) || '—'} ·{' '}
                      {(payload.licenseAgency as string) || ''}
                    </p>
                    <p>
                      {docs.licenseUrl && docLink(docs.licenseUrl, t('admin.gyms.doc-license'))}
                      {docs.crUrl && docLink(docs.crUrl, t('admin.gyms.doc-cr'))}
                      {docs.nationalIdUrl &&
                        docLink(docs.nationalIdUrl, t('admin.gyms.doc-national-id'))}
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
