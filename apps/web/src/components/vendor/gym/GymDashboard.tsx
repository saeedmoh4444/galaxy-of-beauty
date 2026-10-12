'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import { VenueProfileCard } from '../shared/VenueProfileCard';

/**
 * E3 — gym dashboard (the same provider shell as stores/clinics): schedule
 * capacity-based classes and manage incoming class bookings.
 */
export function GymDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: Record<string, unknown>;
  refetchStore: () => void;
  shellRole?: string;
}): JSX.Element {
  const { t, locale } = useLocale();
  const [clsNameAr, setClsNameAr] = useState('');
  const [clsNameEn, setClsNameEn] = useState('');
  const [clsStart, setClsStart] = useState(
    new Date(Date.now() + 24 * 3_600_000).toISOString().slice(0, 16),
  );
  const [clsEnd, setClsEnd] = useState(
    new Date(Date.now() + 25 * 3_600_000).toISOString().slice(0, 16),
  );
  const [clsCapacity, setClsCapacity] = useState(10);
  const [clsPrice, setClsPrice] = useState(0);

  const classesQ = api.vendorPortal['gymClasses.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const bookingsQ = api.vendorPortal.gymClassBookings.useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addClassMut = api.vendorPortal['gymClasses.add'].useMutation({
    onSuccess: () => classesQ.refetch(),
  });
  const removeClassMut = api.vendorPortal['gymClasses.remove'].useMutation({
    onSuccess: () => classesQ.refetch(),
  });
  const gymCancelMut = api.vendorPortal.gymCancelBooking.useMutation({
    onSuccess: () => {
      bookingsQ.refetch();
      classesQ.refetch();
    },
  });

  const classes = classesQ.data ?? [];
  const bookings = bookingsQ.data ?? [];

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {store.gymType ? t(`gyms.type.${store.gymType as string}` as never) : ''} ·{' '}
            {store.gymCity as string} · {store.gymAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
          </Card>
        )}

        <VenueProfileCard store={store} refetchStore={refetchStore} />

        {/* Classes */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.gym.classes-title')}</h3>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <Input
              label={t('vendorPortal.gym.class-add')}
              value={clsNameAr}
              onChange={(e) => setClsNameAr(e.target.value)}
              placeholder="اليوغا"
            />
            <Input
              label="EN"
              value={clsNameEn}
              onChange={(e) => setClsNameEn(e.target.value)}
              placeholder="Yoga"
            />
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={clsStart}
              onChange={(e) => setClsStart(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={clsEnd}
              onChange={(e) => setClsEnd(e.target.value)}
            />
            <Input
              label={t('vendorPortal.gym.capacity')}
              type="number"
              value={String(clsCapacity)}
              onChange={(e) => setClsCapacity(parseInt(e.target.value) || 0)}
            />
            <Input
              label={t('vendorPortal.gym.price')}
              type="number"
              value={String(clsPrice)}
              onChange={(e) => setClsPrice(parseInt(e.target.value) || 0)}
            />
          </div>
          <Button
            size="sm"
            disabled={!clsNameAr.trim() || !clsNameEn.trim() || clsCapacity < 1}
            onClick={() =>
              addClassMut.mutate({
                nameAr: clsNameAr.trim(),
                nameEn: clsNameEn.trim(),
                startsAt: new Date(clsStart).toISOString(),
                endsAt: new Date(clsEnd).toISOString(),
                capacity: clsCapacity,
                price: clsPrice,
              })
            }
            loading={addClassMut.isPending}
          >
            {t('vendorPortal.gym.class-add')}
          </Button>
          <div className="mt-3 space-y-2">
            {classes.map((c: Record<string, unknown>) => (
              <div
                key={c.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm">
                  {localize(c.nameJson, locale)} ·{' '}
                  {new Date(c.startsAt as string).toLocaleString('ar-SA')} ·{' '}
                  {c.enrolledCount as number}/{c.capacity as number}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(c.enrolledCount as number) > 0}
                  onClick={() => removeClassMut.mutate({ classId: c.id as number })}
                  loading={removeClassMut.isPending}
                >
                  {t('vendorPortal.gym.class-remove')}
                </Button>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-sm text-text-tertiary">{t('gyms.classes.empty')}</p>
            )}
          </div>
        </Card>

        {/* Class bookings */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.gym.bookings-title')}</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.gym.bookings-empty')}</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: Record<string, unknown>) => {
                const customer = b.customer as Record<string, unknown> | undefined;
                const cls = b.class as Record<string, unknown> | undefined;
                return (
                  <div
                    key={b.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {customer?.name as string} · {b.code as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {cls ? localize(cls.nameJson, locale) : ''} ·{' '}
                        {cls ? new Date(cls.startsAt as string).toLocaleString('ar-SA') : ''}
                      </p>
                    </div>
                    {b.status === 'BOOKED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gymCancelMut.mutate({ bookingId: b.id as number })}
                        loading={gymCancelMut.isPending}
                      >
                        {t('gyms.cancel')}
                      </Button>
                    ) : (
                      <span className="text-sm font-semibold">
                        {t(`gyms.status.${b.status as string}` as never)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
