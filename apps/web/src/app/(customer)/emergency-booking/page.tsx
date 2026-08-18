'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const POPULAR_SERVICES: { id: number; name: TranslationKey; emoji: string }[] = [
  { id: 1, name: 'advancedBooking.service.manicure', emoji: '' },
  { id: 2, name: 'advancedBooking.service.pedicure', emoji: '' },
  { id: 3, name: 'advancedBooking.service.facial', emoji: '' },
  { id: 4, name: 'advancedBooking.service.massage', emoji: '‍️' },
  { id: 5, name: 'emergencyBooking.service.dyeHair', emoji: '' },
  { id: 6, name: 'advancedBooking.service.makeup', emoji: '' },
];

export default function EmergencyBookingPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [serviceId, setServiceId] = useState(1);
  const { data: avail, isLoading } = api.emergencyBooking.checkAvailability.useQuery({
    serviceId,
  }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const createMut = api.emergencyBooking.create.useMutation();
  const [selectedTech, setSelectedTech] = useState<number | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const available = (avail?.available as Array<Record<string, unknown>>) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('emergencyBooking.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('emergencyBooking.subtitle')}</p>
        </div>

        <Card padding="lg" className="border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-3">
            <span className="text-3xl"></span>
            <div>
              <p className="font-bold text-red-700">
                {t('emergencyBooking.surcharge', {
                  price: formatCurrency((avail?.emergencySurcharge as number) ?? 50),
                })}
              </p>
              <p className="text-xs text-red-600">
                {t('emergencyBooking.within', {
                  within:
                    (avail?.availableWithin as string) ?? t('emergencyBooking.withinFallback'),
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="font-bold mb-3">{t('emergencyBooking.pickService')}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {POPULAR_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setSelectedTech(null);
                  setBookingCode(null);
                }}
                className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId === s.id ? 'bg-red-600 text-white' : 'bg-surface-muted'}`}
              >
                {s.emoji} {t(s.name)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <CardListSkeleton count={4} />
          ) : available.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-4">
              {t('emergencyBooking.noTechs')}
            </p>
          ) : (
            <div className="space-y-2">
              {available.map((tech: Record<string, unknown>) => (
                <button
                  key={tech.technicianId as number}
                  onClick={() => setSelectedTech(tech.technicianId as number)}
                  className={`w-full rounded-xl border-2 p-3 text-right transition-all ${selectedTech === tech.technicianId ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{tech.name as string}</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(tech.price as number)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>
                      {tech.rating as number} · {tech.city as string}
                    </span>
                    <span>
                      {' '}
                      {tech.nextSlot
                        ? new Date(tech.nextSlot as string).toLocaleTimeString(
                            locale === 'en' ? 'en-GB' : 'ar-SA',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )
                        : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {bookingCode ? (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-3xl"></p>
            <p className="font-bold text-green-700 mt-2">{t('emergencyBooking.success')}</p>
            <p className="text-sm text-text-secondary">
              {t('emergencyBooking.codeLabel')}{' '}
              <span className="font-mono font-bold">{bookingCode}</span>
            </p>
            <p className="text-lg font-bold text-green-600 mt-1">
              {t('emergencyBooking.total', {
                price: formatCurrency((avail?.totalEstimate as number) ?? 0),
              })}
            </p>
          </Card>
        ) : (
          selectedTech && (
            <Button
              onClick={() =>
                createMut.mutate(
                  {
                    serviceId,
                    technicianId: selectedTech,
                    addressId: 1,
                    slotId:
                      ((
                        available.find((a) => a.technicianId === selectedTech) as Record<
                          string,
                          unknown
                        >
                      )?.slotId as number) ?? 0,
                  },
                  {
                    onSuccess: (r) => {
                      setBookingCode((r as Record<string, unknown>)?.bookingCode as string);
                    },
                  },
                )
              }
              loading={createMut.isPending}
              className="w-full"
            >
              {t('emergencyBooking.bookNow', {
                price: formatCurrency((avail?.totalEstimate as number) ?? 0),
              })}
            </Button>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
