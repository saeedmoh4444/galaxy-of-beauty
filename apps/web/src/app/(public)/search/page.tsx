'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Input, Card, GridSkeleton, Button, formatCurrency } from '@galaxy/ui';
export default function SearchPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const { data: services, isLoading: svcLoading } = api.services.list.useQuery(
    { search: query || undefined, limit: 12 },
    { enabled: searched && query.length > 1 },
  );
  const { data: products, isLoading: prodLoading } = api.marketplace.products.useQuery(
    { search: query || undefined, limit: 8 },
    { enabled: searched && query.length > 1 },
  );
  const { data: technicians, isLoading: techLoading } = api.technicians.list.useQuery(
    {},
    { enabled: searched && query.length > 1 },
  );

  const handleSearch = () => {
    if (query.trim().length > 1) setSearched(true);
  };
  const svcItems = services?.items ?? [];
  const prodItems = products?.items ?? [];
  const techItems = Array.isArray(technicians)
    ? technicians.filter((t) => (t as { user?: { name?: string } }).user?.name?.includes?.(query))
    : [];

  const isLoading = svcLoading || prodLoading || techLoading;
  const totalResults = svcItems.length + prodItems.length + techItems.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.search.title')}
        </h1>
      </div>
      <div className="mx-auto mb-8 flex max-w-xl gap-2">
        <Input
          placeholder={t('marketing.search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} loading={isLoading}>
          {t('marketing.search.search-button')}
        </Button>
      </div>

      {searched && (
        <>
          <p className="mb-6 text-sm text-text-secondary">
            {isLoading
              ? t('marketing.search.searching')
              : t('marketing.search.results-count', { count: totalResults })}
          </p>
          {isLoading ? (
            <GridSkeleton count={8} />
          ) : totalResults === 0 ? (
            <div className="py-16 text-center text-text-tertiary">
              <span className="text-5xl"></span>
              <p className="mt-4">{t('marketing.search.no-results')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {svcItems.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold">
                    {t('marketing.search.services-heading')}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {svcItems.map((s) => (
                      <Link key={s.id} href={`/services/${s.id}`}>
                        <Card hover padding="md">
                          <div className="h-32 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-3xl"></div>
                          <h3 className="mt-2 font-semibold">{localize(s.titleJson, locale)}</h3>
                          <p className="text-sm text-text-secondary">
                            {t('marketing.search.duration-min', { min: s.durationMin })} ·{' '}
                            {formatCurrency(Number(s.basePrice))}
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {prodItems.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold">
                    {t('marketing.search.products-heading')}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-4">
                    {prodItems.map((p) => (
                      <Link key={p.id} href={`/marketplace`}>
                        <Card hover padding="sm">
                          <div className="h-24 rounded-lg bg-surface-muted flex items-center justify-center text-2xl"></div>
                          <p className="mt-2 text-sm font-semibold truncate">
                            {localize(p.nameJson, locale)}
                          </p>
                          <p className="text-xs font-bold text-brand-600">
                            {formatCurrency(Number(p.price))}
                          </p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {techItems.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold">
                    {t('marketing.search.technicians-heading')}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {techItems.slice(0, 6).map((t) => (
                      <Link key={t.id} href={`/technicians/${t.id}`}>
                        <Card hover padding="md">
                          <div className="text-center">
                            <div className="mx-auto h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-2xl">
                              ‍
                            </div>
                            <p className="mt-2 font-semibold">{t.user?.name}</p>
                            <p className="text-sm text-text-secondary">
                              {t.city} · {Number(t.ratingAvg).toFixed(1)}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
