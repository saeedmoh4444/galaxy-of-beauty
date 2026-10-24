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
  const { t, locale } = useLocale();
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

  // E2 — clinic console deepening: package proposals, outcomes, utilization.
  const [pkgNameAr, setPkgNameAr] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgDiscount, setPkgDiscount] = useState(15);
  const [cancelReason, setCancelReason] = useState('');
  const packagesQ = api.vendorPortal.clinicPackages.useQuery(undefined);
  const utilizationQ = api.vendorPortal.clinicSlotUtilization.useQuery(undefined);
  const proposePkgMut = api.vendorPortal.proposeClinicPackage.useMutation({
    onSuccess: () => {
      setPkgNameAr('');
      setPkgNameEn('');
      void packagesQ.refetch();
    },
  });
  const outcomeMut = api.vendorPortal.clinicOutcome.useMutation({
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
                        <input
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder={t('vendorPortal.clinic.cancel-reason')}
                          className="w-32 rounded-lg border px-2 py-1 text-xs border-edge bg-surface-elevated"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            clinicCancelMut.mutate({
                              consultationId: c.id as number,
                              ...(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
                            })
                          }
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
                    ) : c.status === 'CONFIRMED' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            outcomeMut.mutate({
                              consultationId: c.id as number,
                              outcome: 'no_show',
                            })
                          }
                          loading={outcomeMut.isPending}
                        >
                          {t('vendorPortal.clinic.no-show')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            outcomeMut.mutate({
                              consultationId: c.id as number,
                              outcome: 'completed',
                            })
                          }
                          loading={outcomeMut.isPending}
                        >
                          {t('vendorPortal.clinic.complete')}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {t(`clinics.status.${c.status as string}` as never)}
                        {c.noShow ? ` · ${t('vendorPortal.clinic.no-show')}` : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* E2 — treatment-package proposals (admin-approved queue). */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.packages-title')}</h3>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <Input
              label={t('vendorPortal.clinic.package-name-ar')}
              value={pkgNameAr}
              onChange={(e) => setPkgNameAr(e.target.value)}
              placeholder="باقة التنظيف العميق"
            />
            <Input
              label={t('vendorPortal.clinic.package-name-en')}
              value={pkgNameEn}
              onChange={(e) => setPkgNameEn(e.target.value)}
              placeholder="Deep Cleanse"
            />
            <Input
              label={t('vendorPortal.clinic.package-discount')}
              type="number"
              value={String(pkgDiscount)}
              onChange={(e) => setPkgDiscount(parseInt(e.target.value) || 0)}
              className="w-28"
            />
            <Button
              size="sm"
              disabled={!pkgNameAr.trim() || !pkgNameEn.trim()}
              onClick={() =>
                proposePkgMut.mutate({
                  nameAr: pkgNameAr.trim(),
                  nameEn: pkgNameEn.trim(),
                  discountPercent: pkgDiscount,
                })
              }
              loading={proposePkgMut.isPending}
            >
              {t('vendorPortal.clinic.package-propose')}
            </Button>
          </div>
          {(packagesQ.data ?? []).length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.clinic.packages-empty')}</p>
          ) : (
            <div className="space-y-2">
              {(packagesQ.data ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-bold">
                      {locale === 'ar' ? p.nameAr : p.nameEn} · {p.discountPercent}٪
                    </p>
                    {p.reviewNotes ? (
                      <p className="text-xs text-text-secondary">{p.reviewNotes}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {t(`vendorPortal.clinic.pkg-status.${p.status}` as never)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* E2 — slot utilization (last 30 days). */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.utilization-title')}</h3>
          <p className="text-sm">
            <span className="font-bold">
              {utilizationQ.data
                ? t('vendorPortal.clinic.utilization', {
                    booked: utilizationQ.data.bookedSlots,
                    total: utilizationQ.data.totalSlots,
                  })
                : '—'}
            </span>{' '}
            · {utilizationQ.data?.utilizationPct ?? 0}٪
          </p>
          <div className="mt-2 flex h-12 items-end gap-[2px]">
            {(utilizationQ.data?.byDay ?? []).map((d) => {
              const max = Math.max(...(utilizationQ.data?.byDay ?? []).map((x) => x.total), 1);
              return (
                <div
                  key={d.day}
                  className="group relative flex-1"
                  title={`${d.day}: ${d.booked}/${d.total}`}
                >
                  <div
                    className="w-full rounded-t-[3px] bg-brand-600 transition-colors group-hover:bg-brand-700 dark:bg-brand-500 dark:group-hover:bg-brand-400"
                    style={{ height: `${(d.total / max) * 100}%` }}
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
