'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardListSkeleton,
  Button,
  ErrorAlert,
  formatCurrency,
  ServiceImage,
  Icon,
} from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { womensCategoryImageKey } from '@galaxy/shared';

export default function WomensServicesPage(): JSX.Element {
  const { t } = useLocale();
  const { user } = useAuth();
  const { data: cats } = api.womensServices.categories.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const {
    data: category,
    isLoading,
    isError,
    refetch,
  } = api.womensServices.byCategory.useQuery(
    { category: selectedCat ?? '' },
    { enabled: !!selectedCat },
  ) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: tips } = api.womensServices.safetyTips.useQuery(
    { category: selectedCat ?? '' },
    { enabled: !!selectedCat },
  ) as { data: string[] | undefined };

  const bookMut = api.womensServices.book.useMutation();
  const [bookingResult, setBookingResult] = useState<Record<string, unknown> | null>(null);

  // E-womens — real booking: the wizard collects an address + appointment
  // window before calling the (now real) book procedure.
  const { data: addresses } = api.addresses.list.useQuery(undefined, {
    enabled: !!user,
  }) as { data: Array<Record<string, unknown>> | undefined };
  const [addressId, setAddressId] = useState<number | null>(null);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const bookingReady = !!user && !!addressId && !!apptDate && !!apptTime && !bookMut.isPending;

  const categories = (cats ?? []) as Array<Record<string, unknown>>;
  const subServices = (category?.subServices ?? []) as Array<Record<string, unknown>>;
  const safetyTips = tips ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <ServiceImage service="beautyService" alt="" size="xl" className="mx-auto rounded-3xl" />
        <h1 className="mt-4 text-3xl font-bold text-text-primary">
          {t('marketing.womens-services.title')}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-text-tertiary">
          {t('marketing.womens-services.subtitle')}
        </p>
      </div>

      {bookingResult ? (
        (bookingResult.booked as boolean) ? (
          <Card
            padding="lg"
            className="text-center border-2 border-green-300 dark:border-green-700"
          >
            <Icon name="check" size="xl" className="mx-auto text-green-600 dark:text-green-400" />
            <h2 className="mt-4 text-xl font-bold">
              {t('marketing.womens-services.booked-title')}
            </h2>
            <p className="font-bold mt-1">{bookingResult.service as string}</p>
            <p className="text-2xl font-extrabold text-brand-600 mt-2">
              {t('marketing.womens-services.price-sar', {
                price: formatCurrency(bookingResult.price as number),
              })}
            </p>
            <p className="text-sm text-text-secondary">
              {t('marketing.womens-services.duration-min', {
                count: bookingResult.durationMin as number,
              })}
            </p>
            {((bookingResult.specialRequirements as string[])?.length ?? 0) > 0 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-1">
                {(bookingResult.specialRequirements as string[]).map((r: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-full bg-brand-100 dark:bg-brand-900 px-2 py-0.5 text-xs"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : null}
            {(bookingResult.bookingCode as string) ? (
              <p className="text-sm font-mono mt-2">
                {t('marketing.womens-services.booking-code', {
                  code: bookingResult.bookingCode as string,
                })}
              </p>
            ) : null}
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {t('marketing.womens-services.requested')}
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setBookingResult(null);
                setSelectedCat(null);
              }}
            >
              {t('marketing.womens-services.back')}
            </Button>
          </Card>
        ) : (
          <Card padding="lg" className="text-center border-2 border-amber-300">
            <span className="text-5xl">🚧</span>
            <h2 className="mt-4 text-xl font-bold">{t('common.notConfigured')}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t('common.unavailable')}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setBookingResult(null);
                setSelectedCat(null);
              }}
            >
              {t('marketing.womens-services.back')}
            </Button>
          </Card>
        )
      ) : !selectedCat ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c: Record<string, unknown>) => (
            <button key={c.key as string} onClick={() => setSelectedCat(c.key as string)}>
              <Card
                padding="lg"
                className="text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <ServiceImage
                  service={womensCategoryImageKey(c.key as string)}
                  alt={(c.nameAr as string) ?? ''}
                  size="lg"
                  className="mx-auto"
                />
                <h3 className="mt-3 text-lg font-bold text-text-primary">{c.nameAr as string}</h3>
                <p className="mt-1 text-xs text-text-secondary dark:text-text-tertiary">
                  {c.description as string}
                </p>
                <span className="mt-3 inline-block rounded-full bg-brand-100 dark:bg-brand-900 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                  {t('marketing.womens-services.services-count', {
                    count: c.serviceCount as number,
                  })}
                </span>
              </Card>
            </button>
          ))}
        </div>
      ) : isLoading ? (
        <CardListSkeleton count={4} />
      ) : isError ? (
        <ErrorAlert message={t('marketing.womens-services.load-error')} onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCat(null)}
            className="text-brand-600 hover:text-brand-700 text-sm font-medium"
          >
            {t('marketing.womens-services.back-to-categories')}
          </button>

          <Card
            padding="lg"
            className="bg-linear-to-r from-pink-50 to-brand-50 dark:from-pink-950 dark:to-brand-950 border-none"
          >
            <div className="flex items-center gap-4">
              <ServiceImage
                service={womensCategoryImageKey(selectedCat)}
                alt={(category?.nameAr as string) ?? ''}
                size="md"
              />
              <div>
                <h2 className="text-xl font-bold">{category?.nameAr as string}</h2>
                <p className="text-sm text-text-secondary dark:text-text-tertiary">
                  {category?.description as string}
                </p>
              </div>
            </div>
          </Card>

          {/* E-womens — real booking fields: address + appointment window */}
          {user && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="ws-address" className="text-xs font-semibold">
                  {t('marketing.womens-services.address')}
                </label>
                <select
                  id="ws-address"
                  value={addressId ?? ''}
                  onChange={(e) => setAddressId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated mt-1"
                >
                  <option value="">—</option>
                  {(addresses ?? []).map((a: Record<string, unknown>) => (
                    <option key={a.id as number} value={a.id as number}>
                      {[a.label as string, a.street as string, a.area as string, a.city as string]
                        .filter(Boolean)
                        .join(' — ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ws-date" className="text-xs font-semibold">
                  {t('marketing.womens-services.date')}
                </label>
                <input
                  id="ws-date"
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated mt-1"
                />
              </div>
              <div>
                <label htmlFor="ws-time" className="text-xs font-semibold">
                  {t('marketing.womens-services.time')}
                </label>
                <input
                  id="ws-time"
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated mt-1"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {subServices.map((s: Record<string, unknown>) => (
              <Card
                key={s.id as string}
                padding="lg"
                className="flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <ServiceImage
                    service={womensCategoryImageKey(selectedCat)}
                    alt={(s.nameAr as string) ?? ''}
                    size="sm"
                  />
                  <div>
                    <h3 className="font-bold text-text-primary">{s.nameAr as string}</h3>
                    <p className="text-xs text-text-secondary">{s.nameEn as string}</p>
                    {(s.precautions as string) ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                        {' '}
                        {s.precautions as string}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-xl font-extrabold text-brand-600">
                    {t('marketing.womens-services.price-sar', {
                      price: formatCurrency(s.price as number),
                    })}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {t('marketing.womens-services.duration-min', {
                      count: s.durationMin as number,
                    })}
                  </p>
                  {user && (
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={!bookingReady}
                      onClick={() => {
                        if (!bookingReady) return;
                        const startAt = new Date(`${apptDate}T${apptTime}:00`);
                        const durationMin = Number(s.durationMin) || 30;
                        const endAt = new Date(startAt.getTime() + durationMin * 60_000);
                        bookMut.mutate(
                          {
                            serviceId: s.id as string,
                            category: selectedCat as string,
                            addressId: addressId!,
                            startAt: startAt.toISOString(),
                            endAt: endAt.toISOString(),
                            idempotencyKey: crypto.randomUUID(),
                          },
                          { onSuccess: (d) => setBookingResult(d as Record<string, unknown>) },
                        );
                      }}
                    >
                      {t('marketing.womens-services.book')}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {safetyTips.length > 0 && (
            <Card
              padding="lg"
              className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none"
            >
              <h3 className="font-bold mb-3 text-text-primary">
                {t('marketing.womens-services.tips-title')}
              </h3>
              <div className="space-y-2">
                {safetyTips.map((tip: string, i: number) => (
                  <p key={i} className="text-sm text-text-secondary dark:text-text-tertiary">
                    {tip}
                  </p>
                ))}
              </div>
            </Card>
          )}

          {!user && (
            <div className="text-center">
              <Link href="/login">
                <Button size="lg">{t('marketing.womens-services.login-cta')}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
