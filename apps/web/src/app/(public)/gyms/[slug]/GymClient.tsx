'use client';

import { useMemo } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  Button,
  formatCurrency,
  ErrorAlert,
  EmptyState,
  useToast,
  useAuth,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export interface GymPageData {
  gym: {
    id: number;
    storeName: string;
    storeSlug: string;
    gymType: string | null;
    gymCity: string | null;
    gymAddress: string | null;
    licenseAgency: string | null;
    licenseVerifiedAt: string | null;
    descriptionJson: { ar?: string; en?: string } | null;
    logoUrl: string | null;
    ratingAvg: number | null;
    totalReviews: number;
  } | null;
  plans: Array<Record<string, unknown>>;
  dayPasses: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function GymClient({ data }: { data: GymPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  const window_ = useMemo(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 86_400_000).toISOString();
    return { from, to };
  }, []);
  const classesQ = api.gyms.classes.useQuery(
    { gymId: data.gym?.id ?? 0, from: window_.from, to: window_.to },
    { enabled: !!data.gym },
  );
  const myQ = api.gyms.myBookings.useQuery(undefined, { enabled: isAuthenticated });
  const bookMut = api.gyms.bookClass.useMutation({
    onSuccess: () => {
      addToast('success', t('gyms.classes.booked'));
      classesQ.refetch();
      myQ.refetch();
    },
    onError: (e) => addToast('error', e.message),
  });
  const cancelMut = api.gyms.cancelBooking.useMutation({
    onSuccess: () => {
      classesQ.refetch();
      myQ.refetch();
    },
    onError: (e) => addToast('error', e.message),
  });
  const subscribeMut = api.subscriptionBoxes.subscribe.useMutation({
    onSuccess: () => addToast('success', t('gyms.plans.subscribed')),
    onError: (e) => addToast('error', e.message),
  });
  const buyPassMut = api.classPass.purchase.useMutation({
    onSuccess: () => addToast('success', t('gyms.passes.bought')),
    onError: (e) => addToast('error', e.message),
  });

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!data.gym) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState title={t('gyms.not-found')} />
      </div>
    );
  }

  const { gym } = data;
  const classes = (classesQ.data as Array<Record<string, unknown>> | undefined) ?? [];
  const myBookings =
    (myQ.data as Array<Record<string, unknown>> | undefined)?.filter(
      (b) => ((b.class as Record<string, unknown> | undefined)?.gymId as number) === gym.id,
    ) ?? [];
  const bio = (gym.descriptionJson ?? {}) as { ar?: string; en?: string };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Gym header */}
      <div className="flex items-center gap-4">
        {gym.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gym.logoUrl}
            alt={gym.storeName}
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-4xl">
            ️
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {gym.storeName}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {gym.gymType ? t(`gyms.type.${gym.gymType}` as never) : ''} · {gym.gymCity ?? ''} ·{' '}
            {gym.gymAddress ?? ''}
            {gym.totalReviews > 0 ? ` · ⭐ ${Number(gym.ratingAvg ?? 0).toFixed(1)}` : ''}
          </p>
          {gym.licenseVerifiedAt && (
            <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              {t('gyms.verified-badge', { agency: gym.licenseAgency ?? 'MISA' })}
            </span>
          )}
        </div>
      </div>

      {bio[locale] ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{bio[locale]}</p>
      ) : null}

      {/* Group classes (capacity-based) */}
      <Card padding="lg">
        <h2 className="mb-3 font-bold">{t('gyms.classes.title')}</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('gyms.classes.empty')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c: Record<string, unknown>) => {
              const spots = Number(c.spotsLeft ?? 0);
              const price = Number(c.price ?? 0);
              return (
                <div
                  key={c.id as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-bold">{localize(c.nameJson, locale)}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(c.startsAt as string).toLocaleDateString('ar-SA')} ·{' '}
                      {new Date(c.startsAt as string).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {price > 0 ? formatCurrency(price) : t('gyms.classes.free')}
                    </p>
                    <p className="text-xs font-semibold text-brand-600">
                      {spots > 0
                        ? t('gyms.classes.spots-left', { count: spots })
                        : t('gyms.classes.full')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={spots <= 0}
                    loading={bookMut.isPending}
                    onClick={() => {
                      if (!isAuthenticated) {
                        addToast('warning', t('stores.login-to-buy'));
                        return;
                      }
                      bookMut.mutate({ classId: c.id as number });
                    }}
                  >
                    {t('gyms.classes.book')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Membership plans */}
      <Card padding="lg">
        <h2 className="mb-3 font-bold">{t('gyms.plans.title')}</h2>
        {data.plans.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('gyms.plans.empty')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.plans.map((p: Record<string, unknown>) => (
              <div
                key={p.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-bold">{localize(p.nameJson, locale)}</p>
                  <p className="text-xs text-text-secondary">
                    {localize(p.descriptionJson, locale)} · {formatCurrency(Number(p.price ?? 0))}/
                    {t('vendorPortal.deals.ends')}
                  </p>
                </div>
                <Button
                  size="sm"
                  loading={subscribeMut.isPending}
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast('warning', t('stores.login-to-buy'));
                      return;
                    }
                    subscribeMut.mutate({ planId: p.id as number });
                  }}
                >
                  {t('gyms.plans.subscribe')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Day passes */}
      <Card padding="lg">
        <h2 className="mb-3 font-bold">{t('gyms.passes.title')}</h2>
        {data.dayPasses.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('gyms.plans.empty')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.dayPasses.map((p: Record<string, unknown>) => (
              <div
                key={p.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-bold">{p.name as string}</p>
                  <p className="text-xs text-text-secondary">
                    {p.classes as number} {t('vendorPortal.orders.items')} ·{' '}
                    {formatCurrency(Number(p.price ?? 0))}
                  </p>
                </div>
                <Button
                  size="sm"
                  loading={buyPassMut.isPending}
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast('warning', t('stores.login-to-buy'));
                      return;
                    }
                    buyPassMut.mutate({ passId: p.id as number });
                  }}
                >
                  {t('gyms.passes.buy')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* My bookings */}
      {isAuthenticated && (
        <Card padding="lg">
          <h2 className="mb-3 font-bold">{t('gyms.my.title')}</h2>
          {myBookings.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('gyms.my.empty')}</p>
          ) : (
            <div className="space-y-2">
              {myBookings.map((b: Record<string, unknown>) => {
                const cls = b.class as Record<string, unknown> | undefined;
                return (
                  <div
                    key={b.id as number}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {b.code as string} · {cls ? localize(cls.nameJson, locale) : ''}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {cls ? new Date(cls.startsAt as string).toLocaleDateString('ar-SA') : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {t(`gyms.status.${b.status as string}` as never)}
                      </span>
                      {b.status === 'BOOKED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={cancelMut.isPending}
                          onClick={() => cancelMut.mutate({ bookingId: b.id as number })}
                        >
                          {t('gyms.cancel')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
