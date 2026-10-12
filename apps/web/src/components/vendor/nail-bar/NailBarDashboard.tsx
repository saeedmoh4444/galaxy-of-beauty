'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { VenueProfileCard } from '../shared/VenueProfileCard';

/* ================================================================
 * E5 — Nail bar dashboard (station-capacity slots + bookings)
 * ================================================================ */
export function NailBarDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: Record<string, unknown>;
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

  const slotsQ = api.vendorPortal['nailBarSlots.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const bookingsQ = api.vendorPortal.nailBarBookings.useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addSlotMut = api.vendorPortal['nailBarSlots.add'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const removeSlotMut = api.vendorPortal['nailBarSlots.remove'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });

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
            {slots.map((s: Record<string, unknown>) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
              >
                <p className="text-sm">
                  {new Date(s.startAt as string).toLocaleString()} →{' '}
                  {new Date(s.endAt as string).toLocaleString()} ·{' '}
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
              {bookings.map((b: Record<string, unknown>) => (
                <div
                  key={b.id as number}
                  className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
                >
                  <div>
                    <p className="text-sm font-bold">{b.code as string}</p>
                    <p className="text-xs text-text-secondary">
                      {(b.customer as Record<string, unknown> | null)?.name as string} ·{' '}
                      {(b.customer as Record<string, unknown> | null)?.phone as string} ·{' '}
                      {b.slot
                        ? new Date(
                            (b.slot as Record<string, unknown>).startAt as string,
                          ).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
