'use client';

import { useMemo } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, ErrorAlert, EmptyState, useToast, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export interface NailBarPageData {
  nailBar: {
    id: number;
    storeName: string;
    storeSlug: string;
    nailBarType: string | null;
    nailBarCity: string | null;
    nailBarAddress: string | null;
    licenseAgency: string | null;
    licenseVerifiedAt: string | null;
    descriptionJson: { ar?: string; en?: string } | null;
    logoUrl: string | null;
    ratingAvg: number | null;
    totalReviews: number;
    womenOnlyStaff?: boolean;
    privateSuite?: boolean;
  } | null;
  fetchError?: string;
}

export function NailBarClient({ data }: { data: NailBarPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const window_ = useMemo(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 86_400_000).toISOString();
    return { from, to };
  }, []);
  const slotsQ = api.nailBars.slots.useQuery(
    { nailBarId: data.nailBar?.id ?? 0, from: window_.from, to: window_.to },
    { enabled: !!data.nailBar },
  );
  const myQ = api.nailBars.myBookings.useQuery(undefined, { enabled: isAuthenticated });
  const bookMut = api.nailBars.bookSlot.useMutation({
    onSuccess: () => {
      addToast('success', t('nailBars.booked'));
      slotsQ.refetch();
      myQ.refetch();
    },
    onError: (e) => addToast('error', e.message),
  });

  const slots = (slotsQ.data ?? []) as Array<Record<string, any>>;
  const myBookings = (myQ.data ?? []) as Array<Record<string, any>>;

  if (data.fetchError || !data.nailBar) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert
          message={data.fetchError ?? t('nailBars.load-error')}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const n = data.nailBar;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Card padding="lg">
        <div className="flex items-start gap-4">
          {n.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={n.logoUrl} alt={n.storeName} className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
              💅
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
              {n.storeName}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {n.nailBarType ? t(`nailBars.type.${n.nailBarType}` as never) : ''} · {n.nailBarCity}{' '}
              · {n.nailBarAddress}
            </p>
            {n.licenseVerifiedAt && (
              <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {t('nailBars.verified', { agency: n.licenseAgency ?? '' })}
              </span>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {(n.womenOnlyStaff as boolean) && (
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-pink-700">
                  🙋‍♀️ {t('trust.womenOnly')}
                </span>
              )}
              {(n.privateSuite as boolean) && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] text-purple-700">
                  🚪 {t('trust.privateSuite')}
                </span>
              )}
            </div>
          </div>
        </div>
        {n.descriptionJson && (
          <p className="mt-4 text-sm text-text-secondary">{localize(n.descriptionJson, locale)}</p>
        )}
      </Card>

      {/* Station slots */}
      <Card padding="lg">
        <h3 className="mb-3 font-bold">{t('nailBars.slots')}</h3>
        {slots.length === 0 ? (
          <EmptyState title={t('nailBars.noSlots')} />
        ) : (
          <div className="space-y-2">
            {slots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
              >
                <div>
                  <p className="text-sm font-bold">
                    {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('nailBars.spotsLeft', { n: s.spotsLeft })}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={s.spotsLeft <= 0 || !isAuthenticated}
                  loading={bookMut.isPending}
                  onClick={() => bookMut.mutate({ slotId: s.id })}
                >
                  {s.spotsLeft <= 0 ? t('nailBars.full') : t('nailBars.book')}
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-text-tertiary">{t('nailBars.pay-at-venue')}</p>
      </Card>

      {/* My bookings */}
      {isAuthenticated && (
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('nailBars.myBookings')}</h3>
          {myBookings.filter((b) => b.slot?.nailBarId === n.id).length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('nailBars.noBookings')}</p>
          ) : (
            <div className="space-y-2">
              {myBookings
                .filter((b) => b.slot?.nailBarId === n.id)
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">{b.code}</p>
                      <p className="text-xs text-text-secondary">
                        {b.slot ? new Date(b.slot.startAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
