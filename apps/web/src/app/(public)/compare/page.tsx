'use client';

import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { ErrorAlert, PageSpinner, EmptyState } from '@galaxy/ui';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

export default function ComparePage(): JSX.Element {
  const { t, locale } = useLocale();
  const params = useSearchParams();
  const ids = (params.get('ids') || '')
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  const { data, isLoading, isError, refetch } = api.services.compare.useQuery(
    { ids },
    { enabled: ids.length >= 2 },
  );

  const services =
    ((data as Record<string, unknown>)?.services as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text-primary dark:text-gray-100">
        {t('marketing.compare.title')}
      </h1>

      {ids.length < 2 ? (
        <EmptyState
          title={t('marketing.compare.select-title')}
          description={t('marketing.compare.select-desc')}
        />
      ) : isLoading ? (
        <PageSpinner message={t('marketing.compare.loading')} />
      ) : isError ? (
        <ErrorAlert message={t('marketing.compare.load-error')} onRetry={() => refetch()} />
      ) : services.length === 0 ? (
        <EmptyState
          title={t('marketing.compare.no-services')}
          description={t('marketing.compare.no-services-desc')}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl border border-edge dark:border-gray-700">
            <thead>
              <tr className="bg-surface-muted dark:bg-gray-800">
                <th className="p-4 text-right text-sm font-semibold text-text-secondary dark:text-gray-400 min-w-[140px]">
                  {t('marketing.compare.feature-col')}
                </th>
                {services.map((s) => (
                  <th key={s.id as number} className="p-4 text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-950"></div>
                      <p className="text-sm font-bold text-text-primary dark:text-gray-100">
                        {localize(s.titleJson as Record<string, string>, locale)}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Price row */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.price-col')}
                </td>
                {services.map((s) => (
                  <td
                    key={s.id as number}
                    className="p-4 text-center text-lg font-bold text-brand-600"
                  >
                    {t('marketing.compare.price-sar', { price: Number(s.basePrice).toFixed(0) })}
                  </td>
                ))}
              </tr>
              {/* Duration */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.duration-col')}
                </td>
                {services.map((s) => (
                  <td
                    key={s.id as number}
                    className="p-4 text-center text-sm text-text-secondary dark:text-gray-400"
                  >
                    {t('marketing.compare.duration-min', { min: s.durationMin as number })}
                  </td>
                ))}
              </tr>
              {/* Category */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.category-col')}
                </td>
                {services.map((s) => (
                  <td
                    key={s.id as number}
                    className="p-4 text-center text-sm text-text-secondary dark:text-gray-400"
                  >
                    {s.category as string}
                  </td>
                ))}
              </tr>
              {/* Bookings */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.bookings-col')}
                </td>
                {services.map((s) => (
                  <td
                    key={s.id as number}
                    className="p-4 text-center text-sm text-text-secondary dark:text-gray-400"
                  >
                    {s.bookingCount as number}
                  </td>
                ))}
              </tr>
              {/* Tags */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.tags-col')}
                </td>
                {services.map((s) => (
                  <td key={s.id as number} className="p-4 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {((s.tags as string[]) || []).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Variants */}
              <tr className="hover:bg-surface-muted dark:hover:bg-gray-900">
                <td className="p-4 text-sm font-medium text-text-primary dark:text-gray-300">
                  {t('marketing.compare.variants-col')}
                </td>
                {services.map((s) => (
                  <td key={s.id as number} className="p-4 text-center">
                    <div className="space-y-1">
                      {((s.variants as Array<Record<string, unknown>>) || []).map((v, i) => (
                        <p key={i} className="text-xs text-text-secondary dark:text-gray-400">
                          {localize(v.nameJson as Record<string, string>, locale)}
                          {Number(v.priceDelta) > 0
                            ? t('marketing.compare.price-delta', {
                                price: Number(v.priceDelta).toFixed(0),
                              })
                            : ''}
                        </p>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Best value indicator */}
          <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-brand-800 dark:bg-brand-950">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {t('marketing.compare.best-value')}{' '}
              {(() => {
                const best = [...services].sort(
                  (a, b) =>
                    (a.basePrice as number) / ((a.durationMin as number) || 1) -
                    (b.basePrice as number) / ((b.durationMin as number) || 1),
                )[0];
                return localize(best?.titleJson as Record<string, string>, locale);
              })()}
            </p>
            <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
              {t('marketing.compare.best-per-minute')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
