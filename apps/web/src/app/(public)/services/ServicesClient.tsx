'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Input, Card, GridSkeleton, ErrorAlert, EmptyState, useDebounce } from '@galaxy/ui';

type ServiceItem = RouterOutputs['services']['list']['items'][number];
type CategoryItem = RouterOutputs['categories']['list'][number];

export interface ServicesPageData {
  initialServices: ServiceItem[];
  initialCategories: CategoryItem[];
  initialTotal: number;
}

export function ServicesClient({ data }: { data: ServicesPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Client-side queries — initial SSR data renders first, then hydrates
  const svcQuery = api.services.list.useQuery({
    search: debouncedSearch || undefined,
    sort: sort as 'newest',
    page,
    limit: 12,
  });
  const catsQuery = api.categories.list.useQuery();

  // Use SSR data while client query loads
  const cats = catsQuery.data ?? data.initialCategories;
  const svcData = svcQuery.data;
  const items: ServiceItem[] =
    svcQuery.isLoading && page === 1 && !debouncedSearch && sort === 'newest'
      ? data.initialServices
      : (svcData?.items ?? []);
  const total: number =
    svcQuery.isLoading && page === 1 && !debouncedSearch && sort === 'newest'
      ? data.initialTotal
      : (svcData?.total ?? 0);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('marketing.services.title')}</h1>
        <Link
          href="/services/surprise-me"
          className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
        >
          {t('marketing.services.surprise-me')}
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder={t('marketing.services.search-placeholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-edge px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
        >
          <option value="newest">{t('marketing.services.sort-newest')}</option>
          <option value="price_asc">{t('marketing.services.sort-price-asc')}</option>
          <option value="price_desc">{t('marketing.services.sort-price-desc')}</option>
          <option value="popular">{t('marketing.services.sort-popular')}</option>
        </select>
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/services?categoryId=${c.id}`}
                className="rounded-full bg-surface-muted px-3 py-1 text-xs dark:bg-gray-800"
              >
                {localize(c.nameJson, locale)}
              </Link>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelected(new Set());
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            compareMode
              ? 'bg-brand-600 text-white'
              : 'border border-edge text-text-secondary hover:bg-surface-muted dark:border-gray-600 dark:text-gray-400'
          }`}
        >
          {t('marketing.services.compare')}{' '}
          {compareMode ? `(${t('marketing.services.compare-active')})` : ''}
        </button>
        {compareMode && selected.size >= 2 && (
          <Link
            href={`/compare?ids=${[...selected].join(',')}`}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t('marketing.services.compare-count', { count: selected.size })}
          </Link>
        )}
      </div>

      {svcQuery.isLoading ? (
        <GridSkeleton count={6} />
      ) : svcQuery.isError ? (
        <ErrorAlert
          message={t('marketing.services.load-error')}
          onRetry={() => svcQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('marketing.services.no-services')}
          description={t('marketing.services.no-services-desc')}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((svc) =>
            compareMode ? (
              <button
                key={svc.id}
                onClick={() => toggleSelect(svc.id)}
                className={`text-right ${selected.has(svc.id) ? 'ring-2 ring-brand-500 rounded-2xl' : ''}`}
              >
                <Card hover padding="md" className="relative">
                  <input
                    type="checkbox"
                    checked={selected.has(svc.id)}
                    readOnly
                    className="absolute left-3 top-3 h-5 w-5 accent-brand-600"
                  />
                  <div className="h-40 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900 dark:to-accent-900" />
                  <h3 className="mt-3 font-semibold text-text-primary dark:text-gray-100">
                    {localize(svc.titleJson, locale)}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('marketing.services.duration-min', { min: svc.durationMin })}
                  </p>
                  <p className="mt-1 font-bold text-brand-600">
                    {t('marketing.services.price-sar', { price: Number(svc.basePrice) })}
                  </p>
                </Card>
              </button>
            ) : (
              <Link key={svc.id} href={`/services/${svc.id}`}>
                <Card hover>
                  <div className="h-40 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100" />
                  <h3 className="mt-3 font-semibold">{localize(svc.titleJson, locale)}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('marketing.services.duration-min', { min: svc.durationMin })}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-bold text-brand-600">
                      {t('marketing.services.price-sar', { price: Number(svc.basePrice) })}
                    </p>
                    <Link
                      href={`/bookings/create?serviceId=${svc.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
                    >
                      {t('marketing.services.book')}
                    </Link>
                  </div>
                </Card>
              </Link>
            ),
          )}
        </div>
      )}
      {total > 12 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / 12) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`rounded-lg px-3 py-1 text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
