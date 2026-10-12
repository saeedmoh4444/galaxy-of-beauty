'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore } from '@galaxy/api';
import { VenueProfileCard } from '../shared/VenueProfileCard';

/**
 * E2 — clinic dashboard (the same provider shell as stores): consultation
 * price, slot management, and incoming consultation requests.
 */
export function ClinicDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: NonNullable<MyStore>;
  refetchStore: () => void;
  shellRole?: string;
}): JSX.Element {
  const { t } = useLocale();
  const [price, setPrice] = useState(String(Number(store.consultationPrice ?? 0)));
  const [slotStart, setSlotStart] = useState(
    new Date(Date.now() + 3_600_000).toISOString().slice(0, 16),
  );
  const [slotEnd, setSlotEnd] = useState(
    new Date(Date.now() + 2 * 3_600_000).toISOString().slice(0, 16),
  );

  const slotsQ = api.vendorPortal['clinicSlots.list'].useQuery(undefined);
  const consultsQ = api.vendorPortal.clinicConsultations.useQuery(undefined);
  const priceMut = api.vendorPortal.setConsultationPrice.useMutation({});
  const addSlotMut = api.vendorPortal['clinicSlots.add'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const removeSlotMut = api.vendorPortal['clinicSlots.remove'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const confirmMut = api.vendorPortal.confirmConsultation.useMutation({
    onSuccess: () => consultsQ.refetch(),
  });
  const clinicCancelMut = api.vendorPortal.clinicCancelConsultation.useMutation({
    onSuccess: () => consultsQ.refetch(),
  });

  const slots = slotsQ.data ?? [];
  const consults = consultsQ.data ?? [];

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t(`clinics.treatment.${store.clinicType as string}` as never)}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.clinic.pending-license')}
            </p>
          </Card>
        )}

        <VenueProfileCard store={store} refetchStore={refetchStore} />

        {/* Consultation price */}
        <Card padding="md">
          <div className="flex items-end gap-3">
            <Input
              label={t('vendorPortal.clinic.price')}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-48"
            />
            <Button
              size="sm"
              onClick={() => priceMut.mutate({ price: Number(price) || 0 })}
              loading={priceMut.isPending}
            >
              {t('vendorPortal.clinic.price-save')}
            </Button>
          </div>
        </Card>

        {/* Slots */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.slots-title')}</h3>
          <div className="mb-3 flex flex-wrap items-end gap-3">
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
            <Button
              size="sm"
              onClick={() =>
                addSlotMut.mutate({
                  startAt: new Date(slotStart).toISOString(),
                  endAt: new Date(slotEnd).toISOString(),
                })
              }
              loading={addSlotMut.isPending}
            >
              {t('vendorPortal.clinic.slot-add')}
            </Button>
          </div>
          <div className="space-y-2">
            {slots.map((s) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm">
                  {new Date(s.startAt).toLocaleDateString('ar-SA')} ·{' '}
                  {new Date(s.startAt).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {s.isBooked ? ` · ${t('vendorPortal.orders.fulfilled')}` : ''}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={s.isBooked as boolean}
                  onClick={() => removeSlotMut.mutate({ slotId: s.id as number })}
                  loading={removeSlotMut.isPending}
                >
                  {t('vendorPortal.clinic.slot-remove')}
                </Button>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="text-sm text-text-tertiary">{t('clinics.slots.empty')}</p>
            )}
          </div>
        </Card>

        {/* Incoming consultations */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.consultations-title')}</h3>
          {consults.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              {t('vendorPortal.clinic.consultations-empty')}
            </p>
          ) : (
            <div className="space-y-2">
              {consults.map((c) => {
                const customer = c.customer;
                return (
                  <div
                    key={c.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {customer?.name as string} · {c.code as string} ·{' '}
                        {t(`clinics.treatment.${c.treatmentType as string}` as never)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(c.scheduledAt).toLocaleString('ar-SA')} ·{' '}
                        {formatCurrency(Number(c.price ?? 0))}
                      </p>
                    </div>
                    {c.status === 'REQUESTED' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clinicCancelMut.mutate({ consultationId: c.id as number })}
                          loading={clinicCancelMut.isPending}
                        >
                          {t('clinics.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => confirmMut.mutate({ consultationId: c.id as number })}
                          loading={confirmMut.isPending}
                        >
                          {t('vendorPortal.clinic.confirm')}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {t(`clinics.status.${c.status as string}` as never)}
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
