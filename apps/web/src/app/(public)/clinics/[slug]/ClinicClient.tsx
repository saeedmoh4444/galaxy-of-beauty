'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, ErrorAlert, EmptyState, useToast, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export interface ClinicPageData {
  clinic: {
    id: number;
    storeName: string;
    storeSlug: string;
    clinicType: string | null;
    licenseAgency: string | null;
    licenseNumber: string | null;
    licenseVerifiedAt: string | null;
    consultationPrice: number | null;
    descriptionJson: { ar?: string; en?: string } | null;
    logoUrl: string | null;
    ratingAvg: number | null;
    totalReviews: number;
  } | null;
  packages: Array<Record<string, unknown>>;
  fetchError?: string;
}

const TREATMENT_TYPES = ['dermatology', 'laser', 'injectables', 'dental', 'nutrition'] as const;

export function ClinicClient({ data }: { data: ClinicPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Slots window: now → +30 days.
  const window_ = useMemo(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 86_400_000).toISOString();
    return { from, to };
  }, []);
  const slotsQ = api.clinics.slots.useQuery(
    { clinicId: data.clinic?.id ?? 0, from: window_.from, to: window_.to },
    { enabled: !!data.clinic },
  );
  const myQ = api.clinics.myConsultations.useQuery(undefined, { enabled: isAuthenticated });
  const bookMut = api.clinics.book.useMutation({
    onSuccess: () => {
      addToast('success', t('clinics.book.success'));
      setBookingSlot(null);
      setConsent(false);
      slotsQ.refetch();
      myQ.refetch();
    },
    onError: (e) => addToast('error', e.message),
  });
  const cancelMut = api.clinics.cancel.useMutation({
    onSuccess: () => myQ.refetch(),
    onError: (e) => addToast('error', e.message),
  });

  const [bookingSlot, setBookingSlot] = useState<Record<string, unknown> | null>(null);
  const [treatmentType, setTreatmentType] = useState<string>('dermatology');
  const [consent, setConsent] = useState(false);

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!data.clinic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState title={t('clinics.not-found')} />
      </div>
    );
  }

  const { clinic } = data;
  const slots = (slotsQ.data as Array<Record<string, unknown>> | undefined) ?? [];
  const myConsults =
    (myQ.data as Array<Record<string, unknown>> | undefined)?.filter(
      (c) => (c.clinicId as number) === clinic.id,
    ) ?? [];
  const bio = (clinic.descriptionJson ?? {}) as { ar?: string; en?: string };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Clinic header */}
      <div className="flex items-center gap-4">
        {clinic.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clinic.logoUrl}
            alt={clinic.storeName}
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-4xl"></div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {clinic.storeName}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {clinic.clinicType ? t(`clinics.treatment.${clinic.clinicType}` as never) : ''}
            {clinic.totalReviews > 0 ? ` · ⭐ ${Number(clinic.ratingAvg ?? 0).toFixed(1)}` : ''}
          </p>
          {clinic.licenseVerifiedAt && (
            <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              {t('clinics.verified-badge', { agency: clinic.licenseAgency ?? 'MOH/SFDA' })}
            </span>
          )}
        </div>
      </div>

      {bio[locale] ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{bio[locale]}</p>
      ) : null}

      {/* Medical disclaimer */}
      <Card
        padding="md"
        className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
      >
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          {t('clinics.disclaimer-title')}
        </p>
        <p className="mt-1 text-xs text-text-secondary">{t('clinics.disclaimer-body')}</p>
        <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {t('clinics.consultation-price', { price: Number(clinic.consultationPrice ?? 0) })} ·{' '}
          {t('clinics.payment-at-clinic')}
        </p>
      </Card>

      {/* Open slots + booking */}
      <Card padding="lg">
        <h2 className="mb-3 font-bold">{t('clinics.slots.title')}</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('clinics.slots.empty')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s: Record<string, unknown>) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm font-semibold">
                  {new Date(s.startAt as string).toLocaleDateString('ar-SA')} ·{' '}
                  {new Date(s.startAt as string).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      addToast('warning', t('stores.login-to-buy'));
                      return;
                    }
                    setBookingSlot(s);
                  }}
                >
                  {t('clinics.slots.book')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Treatment packages (display-only) */}
      <Card padding="lg">
        <h2 className="mb-3 font-bold">{t('clinics.packages.title')}</h2>
        {data.packages.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('clinics.packages.empty')}</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {data.packages.map((p: Record<string, unknown>) => (
              <div key={p.id as number} className="rounded-lg border p-3">
                <p className="font-bold">{localize(p.nameJson, locale)}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {localize(p.descriptionJson, locale)} · {t('vendorPortal.deals.approved')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* My consultations */}
      {isAuthenticated && (
        <Card padding="lg">
          <h2 className="mb-3 font-bold">{t('clinics.my.title')}</h2>
          {myConsults.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('clinics.my.empty')}</p>
          ) : (
            <div className="space-y-2">
              {myConsults.map((c: Record<string, unknown>) => (
                <div
                  key={c.id as number}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {c.code as string} ·{' '}
                      {t(`clinics.treatment.${c.treatmentType as string}` as never)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(c.scheduledAt as string).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {t(`clinics.status.${c.status as string}` as never)}
                    </span>
                    {c.status === 'REQUESTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={cancelMut.isPending}
                        onClick={() => cancelMut.mutate({ consultationId: c.id as number })}
                      >
                        {t('clinics.cancel')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Booking modal */}
      <Modal
        open={!!bookingSlot}
        onClose={() => setBookingSlot(null)}
        title={t('clinics.book.title')}
      >
        <div className="space-y-3">
          <select
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {TREATMENT_TYPES.map((tt) => (
              <option key={tt} value={tt}>
                {t(`clinics.treatment.${tt}` as never)}
              </option>
            ))}
          </select>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span className="text-text-secondary">{t('clinics.book.consent')}</span>
          </label>
          <Button
            className="w-full"
            disabled={!consent}
            loading={bookMut.isPending}
            onClick={() => {
              if (!bookingSlot) return;
              bookMut.mutate({
                slotId: bookingSlot.id as number,
                treatmentType: treatmentType as never,
                consent: true,
              });
            }}
          >
            {t('clinics.book.confirm')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
