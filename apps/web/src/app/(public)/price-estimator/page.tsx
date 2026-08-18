'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, FormSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

interface EstimateResult {
  serviceName: string;
  basePrice: number;
  variantDelta: number;
  variantName: string;
  subtotal: number;
  platformFee: number;
  discount: number;
  discountType: string;
  promoValid: boolean;
  total: number;
  currency: string;
}

interface ServiceOption {
  id: number;
  titleJson: Record<string, string>;
  basePrice: string | number;
  categoryId: number;
}

export default function PriceEstimatorPage(): JSX.Element {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');

  // Service search
  const { data: services, isLoading: servicesLoading } = api.services.list.useQuery(
    { search: search || undefined, page: 1, limit: 10 },
    { enabled: search.length >= 1 },
  ) as { data: { items: ServiceOption[] } | undefined; isLoading: boolean };

  // Estimation query (auto-runs when service is selected)
  const {
    data: estimate,
    isLoading: estimateLoading,
    isError,
    error,
    refetch,
  } = api.priceEstimator.estimate.useQuery(
    {
      serviceId: selectedServiceId ?? 0,
      promoCode: promoCode.trim() || undefined,
    },
    { enabled: !!selectedServiceId && !isNaN(selectedServiceId) },
  ) as {
    data: EstimateResult | undefined;
    isLoading: boolean;
    isError: boolean;
    error: { message?: string } | null;
    refetch: () => void;
  };

  const serviceList: ServiceOption[] = (services as { items: ServiceOption[] })?.items ?? [];
  const selectedService = serviceList.find((s) => s.id === selectedServiceId);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value) setSelectedServiceId(null);
  };

  const handleServiceSelect = (id: number) => {
    setSelectedServiceId(id);
    setSearch('');
  };

  const savings = estimate && estimate.discount > 0 ? estimate.discount : 0;
  const hasPromoError =
    promoCode.trim() && estimate && !estimate.promoValid && estimate.discount === 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.price-estimator.title')}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          {t('marketing.price-estimator.subtitle')}
        </p>
      </div>

      {/* Input Card */}
      <Card padding="lg">
        <div className="space-y-4">
          {/* Service Search / Select */}
          <div>
            <label
              htmlFor="pe-service"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1.5"
            >
              {t('marketing.price-estimator.service-label')}
              <span className="text-red-500">*</span>
            </label>

            {selectedService ? (
              <div className="flex items-center justify-between rounded-xl border-2 border-brand-300 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-950">
                <div className="flex items-center gap-3">
                  <span className="text-2xl"></span>
                  <div>
                    <p className="text-sm font-bold text-text-primary dark:text-gray-100">
                      {selectedService.titleJson?.ar ??
                        selectedService.titleJson?.en ??
                        t('marketing.price-estimator.service-fallback', {
                          id: selectedService.id,
                        })}
                    </p>
                    <p className="text-xs text-brand-600 font-semibold">
                      {formatCurrency(Number(selectedService.basePrice))}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedServiceId(null)}
                  className="text-text-tertiary hover:text-red-500 p-1 transition-colors"
                  title={t('marketing.price-estimator.change-service')}
                ></button>
              </div>
            ) : (
              <div className="relative">
                <input
                  id="pe-service"
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('marketing.price-estimator.search-placeholder')}
                  className="w-full rounded-xl border border-edge bg-surface-muted px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-text-secondary"
                />
                {servicesLoading && search.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-edge bg-white p-4 text-center text-sm text-text-tertiary dark:border-gray-700 dark:bg-gray-900 z-10 shadow-lg">
                    {t('marketing.price-estimator.searching')}
                  </div>
                )}
                {search.length > 0 && !servicesLoading && serviceList.length > 0 && (
                  <div className="absolute top-full mt-1 w-full rounded-xl border border-edge bg-white dark:border-gray-700 dark:bg-gray-900 z-10 shadow-xl max-h-64 overflow-y-auto">
                    {serviceList.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleServiceSelect(s.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                      >
                        <span className="text-text-primary dark:text-gray-100">
                          {s.titleJson?.ar ??
                            s.titleJson?.en ??
                            t('marketing.price-estimator.service-fallback', { id: s.id })}
                        </span>
                        <span className="text-xs font-semibold text-brand-600">
                          {formatCurrency(Number(s.basePrice))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Promo Code */}
          <div>
            <label
              htmlFor="pe-promo"
              className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1.5"
            >
              {t('marketing.price-estimator.promo-label')}{' '}
              <span className="text-text-tertiary font-normal">
                {t('marketing.price-estimator.optional')}
              </span>
            </label>
            <div className="relative">
              <input
                id="pe-promo"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t('marketing.price-estimator.promo-placeholder')}
                className="w-full rounded-xl border border-edge bg-surface-muted px-4 py-3 text-sm uppercase tracking-wider focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-text-secondary"
              />
              {promoCode && estimate?.promoValid && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold">
                  {t('marketing.price-estimator.promo-valid')}
                </span>
              )}
              {hasPromoError && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-xs">
                  {t('marketing.price-estimator.promo-invalid')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="rounded-xl bg-surface-muted p-3 dark:bg-gray-800 text-xs text-text-secondary space-y-1">
            <p>
              <strong>{t('marketing.price-estimator.base-price-label')}</strong> —{' '}
              {t('marketing.price-estimator.base-price-hint')}
            </p>
            <p>
              <strong>{t('marketing.price-estimator.platform-fee-label')}</strong> —{' '}
              {t('marketing.price-estimator.platform-fee-hint')}
            </p>
            <p>
              <strong>{t('marketing.price-estimator.discount-label')}</strong> —{' '}
              {t('marketing.price-estimator.discount-hint')}
            </p>
          </div>
        </div>
      </Card>

      {/* Estimate Result */}
      {estimateLoading && selectedServiceId && (
        <div className="mt-6">
          <FormSkeleton fields={4} />
        </div>
      )}

      {isError && selectedServiceId && (
        <div className="mt-6">
          <ErrorAlert
            message={
              (error as { message?: string })?.message || t('marketing.price-estimator.load-error')
            }
            onRetry={() => refetch()}
          />
        </div>
      )}

      {estimate && !estimateLoading && selectedServiceId && (
        <Card
          padding="lg"
          className={`mt-6 transition-all ${
            savings > 0 ? 'border-2 border-green-300 dark:border-green-700' : ''
          }`}
        >
          {/* Service Title */}
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
              {estimate.serviceName}
            </h3>
            {estimate.variantDelta > 0 && estimate.variantName && (
              <span className="inline-block mt-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {estimate.variantName}
              </span>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t('marketing.price-estimator.base-price-label')}
              </span>
              <span className="font-medium text-text-primary dark:text-gray-300">
                {formatCurrency(estimate.basePrice)}
              </span>
            </div>

            {estimate.variantDelta > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {estimate.variantName || t('marketing.price-estimator.variant-fallback')}
                </span>
                <span className="text-purple-600 font-medium">
                  +{formatCurrency(estimate.variantDelta)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-text-secondary">
                {t('marketing.price-estimator.subtotal-label')}
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {formatCurrency(estimate.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t('marketing.price-estimator.platform-fee-label')}
              </span>
              <span className="text-text-secondary dark:text-gray-400">
                {formatCurrency(estimate.platformFee)}
              </span>
            </div>

            {estimate.discount > 0 && (
              <div className="flex justify-between rounded-lg bg-green-50 p-2 dark:bg-green-950">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  {t('marketing.price-estimator.discount-row')}{' '}
                  {estimate.discountType === 'percent' ? `(${promoCode})` : ''}
                </span>
                <span className="text-green-700 dark:text-green-300 font-bold">
                  -{formatCurrency(estimate.discount)}
                </span>
              </div>
            )}

            {hasPromoError && (
              <div className="rounded-lg bg-red-50 p-2 text-center text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
                {t('marketing.price-estimator.promo-error', { code: promoCode })}
              </div>
            )}

            <hr className="dark:border-gray-700" />

            {/* Total */}
            <div className="flex justify-between text-lg pt-1">
              <span className="font-bold text-text-primary dark:text-gray-100">
                {t('marketing.price-estimator.total-label')}
              </span>
              <span className="font-extrabold text-brand-600">
                {t('marketing.price-estimator.total-amount', {
                  amount: formatCurrency(estimate.total),
                })}
              </span>
            </div>

            {savings > 0 && (
              <div className="rounded-full bg-green-100 px-4 py-1.5 text-center text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                {t('marketing.price-estimator.savings-badge', { amount: formatCurrency(savings) })}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-5 text-center">
            <Button
              size="lg"
              className="w-full"
              onClick={() =>
                window.location.assign(`/bookings/create?serviceId=${selectedServiceId}`)
              }
            >
              {t('marketing.price-estimator.book-cta')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
