'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore } from '@galaxy/api';
import { VenueProfileCard } from '../shared/VenueProfileCard';
import { SubmissionStatusCard } from '../shared/SubmissionStatusCard';

/* ================================================================
 * E5 — Nail bar dashboard (station-capacity slots + bookings)
 * ================================================================ */
export function NailBarDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: NonNullable<MyStore>;
  refetchStore: () => void;
  shellRole?: string;
}): JSX.Element {
  const { t } = useLocale();
  const [slotStart, setSlotStart] = useState(
    new Date(Date.now() + 24 * 3_600_000).toISOString().slice(0, 16),
  );
  const [slotEnd, setSlotEnd] = useState(
    new Date(Date.now() + 25 * 3_600_000).toISOString().slice(0, 16),
  );
  const [slotCapacity, setSlotCapacity] = useState(4);

  const slotsQ = api.vendorPortal['nailBarSlots.list'].useQuery(undefined);
  const bookingsQ = api.vendorPortal.nailBarBookings.useQuery(undefined);
  const addSlotMut = api.vendorPortal['nailBarSlots.add'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const removeSlotMut = api.vendorPortal['nailBarSlots.remove'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });

  // E3 — capacity analytics over the last 30 days.
  const capacityQ = api.vendorPortal.nailBarCapacity.useQuery(undefined);

  const slots = slotsQ.data ?? [];
  const bookings = bookingsQ.data ?? [];

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {store.nailBarType ? t(`nailBars.type.${store.nailBarType as string}` as never) : ''} ·{' '}
            {store.nailBarCity as string} · {store.nailBarAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && <SubmissionStatusCard />}

        <VenueProfileCard store={store} refetchStore={refetchStore} />

        {/* Station slots */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.nailBar.slots-title')}</h3>
          <div className="mb-3 grid gap-3 sm:grid-cols-3">
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={slotEnd}
              onChange={(e) => setSlotEnd(e.target.value)}
            />
            <Input
              label={t('vendorPortal.nailBar.capacity')}
              type="number"
              value={String(slotCapacity)}
              onChange={(e) => setSlotCapacity(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button
            size="sm"
            disabled={slotCapacity < 1}
            onClick={() =>
              addSlotMut.mutate({
                startAt: new Date(slotStart).toISOString(),
                endAt: new Date(slotEnd).toISOString(),
                capacity: slotCapacity,
              })
            }
            loading={addSlotMut.isPending}
          >
            {t('vendorPortal.nailBar.slot-add')}
          </Button>
          <div className="mt-3 space-y-2">
            {slots.map((s) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
              >
                <p className="text-sm">
                  {new Date(s.startAt).toLocaleString()} → {new Date(s.endAt).toLocaleString()} ·{' '}
                  <span className="font-bold">
                    {s.bookedCount as number}/{s.capacity as number}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={(s.bookedCount as number) > 0}
                  onClick={() => removeSlotMut.mutate({ slotId: s.id as number })}
                  loading={removeSlotMut.isPending}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Incoming bookings */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.nailBar.bookings-title')}</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.nailBar.bookings-empty')}</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id as number}
                  className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
                >
                  <div>
                    <p className="text-sm font-bold">{b.code as string}</p>
                    <p className="text-xs text-text-secondary">
                      {b.customer?.name} · {b.customer?.phone} ·{' '}
                      {b.slot ? new Date(b.slot.startAt).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* E3 — capacity analytics: stations filled per day (30 days). */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.nailBar.capacity-title')}</h3>
          <p className="text-sm">
            <span className="font-bold">
              {t('vendorPortal.nailBar.capacity-summary', {
                booked: capacityQ.data?.booked ?? 0,
                capacity: capacityQ.data?.totalCapacity ?? 0,
              })}
            </span>{' '}
            · {capacityQ.data?.fillPct ?? 0}٪
          </p>
          <div className="mt-2 flex h-12 items-end gap-[2px]">
            {(capacityQ.data?.byDay ?? []).map((d) => {
              const max = Math.max(...(capacityQ.data?.byDay ?? []).map((x) => x.capacity), 1);
              return (
                <div
                  key={d.day}
                  className="group relative flex-1"
                  title={`${d.day}: ${d.booked}/${d.capacity}`}
                >
                  <div
                    className="w-full rounded-t-[3px] bg-brand-600 transition-colors group-hover:bg-brand-700 dark:bg-brand-500 dark:group-hover:bg-brand-400"
                    style={{ height: `${(d.capacity / max) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
