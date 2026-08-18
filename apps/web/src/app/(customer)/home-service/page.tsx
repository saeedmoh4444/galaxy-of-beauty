'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

const CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الظهران',
  'الطائف',
  'أبها',
  'بريدة',
  'تبوك',
  'حائل',
  'الجبيل',
  'ينبع',
];

export default function HomeServicePage(): JSX.Element {
  const { t } = useLocale();
  const [city, setCity] = useState('الرياض');
  const [address, setAddress] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [prefDate, setPrefDate] = useState('');
  const [prefTime, setPrefTime] = useState('');
  const [notes, setNotes] = useState('');
  const [requested, setRequested] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const { data: estimate } = api.homeService.estimate.useQuery({ city }) as {
    data: Record<string, unknown> | undefined;
  };
  const requestMut = api.homeService.request.useMutation({
    onSuccess: (data) => {
      setRequested(data as Record<string, unknown>);
      setError('');
    },
    onError: (err: { message?: string }) =>
      setError(err?.message ?? t('homeService.err.requestFailed')),
  });

  const handleRequest = () => {
    setError('');
    if (!address.trim()) {
      setError(t('homeService.err.address'));
      return;
    }
    if (!serviceId) {
      setError(t('homeService.err.serviceId'));
      return;
    }
    requestMut.mutate({
      serviceId: parseInt(serviceId, 10),
      city,
      address: address.trim(),
      preferredDate: prefDate,
      preferredTime: prefTime,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('homeService.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('homeService.subtitle')}</p>
        </div>

        {/* Pricing Card */}
        {estimate && (
          <Card padding="lg" className="border-2 border-brand-200 dark:border-brand-800">
            <h3 className="font-bold text-lg mb-4">{t('homeService.estimateTitle', { city })}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('homeService.fee.service')}</span>
                <span>{formatCurrency(estimate.serviceFee as number)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('homeService.fee.travel')}</span>
                <span>{formatCurrency(estimate.travelFee as number)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('homeService.fee.booking')}</span>
                <span>{formatCurrency(estimate.baseFee as number)}</span>
              </div>
              <hr className="dark:border-gray-700" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">{t('homeService.fee.total')}</span>
                <span className="font-extrabold text-brand-600">
                  {formatCurrency(estimate.total as number)} {t('misc.sar')}
                </span>
              </div>
            </div>
          </Card>
        )}

        {requested ? (
          <Card
            padding="lg"
            className="text-center border-2 border-green-300 dark:border-green-700"
          >
            <span className="text-6xl"></span>
            <h2 className="mt-4 text-xl font-bold text-green-700 dark:text-green-300">
              {t('homeService.success.title')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {t('homeService.success.requestId', { id: requested.requestId as string })}
            </p>
            <p className="text-sm text-text-secondary">{requested.estimatedArrival as string}</p>
            <div className="mt-4">
              <Link href="/bookings">
                <Button size="sm">{t('homeService.success.continue')}</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <h3 className="font-bold text-lg mb-4">{t('homeService.form.title')}</h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="hs-city" className="block text-sm font-semibold mb-1">
                    {t('homeService.label.city')}
                  </label>
                  <select
                    id="hs-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="hs-serviceId" className="block text-sm font-semibold mb-1">
                    {t('homeService.label.serviceId')}
                  </label>
                  <input
                    id="hs-serviceId"
                    type="number"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    placeholder={t('homeService.placeholder.serviceId')}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="hs-address" className="block text-sm font-semibold mb-1">
                  {t('homeService.label.address')}
                </label>
                <input
                  id="hs-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t('homeService.placeholder.address')}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="hs-prefDate" className="block text-sm font-semibold mb-1">
                    {t('homeService.label.date')}
                  </label>
                  <input
                    id="hs-prefDate"
                    type="date"
                    value={prefDate}
                    onChange={(e) => setPrefDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="hs-prefTime" className="block text-sm font-semibold mb-1">
                    {t('homeService.label.time')}
                  </label>
                  <input
                    id="hs-prefTime"
                    type="time"
                    value={prefTime}
                    onChange={(e) => setPrefTime(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="hs-notes" className="block text-sm font-semibold mb-1">
                  {t('homeService.label.notes')}
                </label>
                <textarea
                  id="hs-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('homeService.placeholder.notes')}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
              <Button
                onClick={handleRequest}
                loading={requestMut.isPending}
                className="w-full"
                size="lg"
              >
                {t('homeService.submit')}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '', title: t('homeService.feat1.title'), desc: t('homeService.feat1.desc') },
            { emoji: '️', title: t('homeService.feat2.title'), desc: t('homeService.feat2.desc') },
            { emoji: '️', title: t('homeService.feat3.title'), desc: t('homeService.feat3.desc') },
          ].map((b, i) => (
            <Card key={i} padding="md" className="text-center">
              <span className="text-3xl">{b.emoji}</span>
              <h3 className="mt-2 font-semibold text-sm">{b.title}</h3>
              <p className="text-xs text-text-secondary">{b.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
