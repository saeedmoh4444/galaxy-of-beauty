'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import {
  Input,
  Card,
  GridSkeleton,
  Button,
  formatCurrency,
  ServiceImage,
  EmptyState,
} from '@galaxy/ui';
export default function SearchPage(): JSX.Element {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  // E6d — trust badge filters.
  const [womenOnly, setWomenOnly] = useState(false);
  const [privateSuite, setPrivateSuite] = useState(false);
  const [pregnancySafe, setPregnancySafe] = useState(false);
  const { data: services, isLoading: svcLoading } = api.services.list.useQuery(
    {
      search: query || undefined,
      limit: 12,
      womenOnly,
      privateSuite,
      pregnancySafe,
    },
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
          {/* E6d — trust badge filter chips */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setWomenOnly(!womenOnly)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                womenOnly ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'
              }`}
            >
              🙋‍♀️ {t('trust.womenOnly')}
            </button>
            <button
              onClick={() => setPrivateSuite(!privateSuite)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                privateSuite ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'
              }`}
            >
              🚪 {t('trust.privateSuite')}
            </button>
            <button
              onClick={() => setPregnancySafe(!pregnancySafe)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                pregnancySafe ? 'bg-brand-600 text-white' : 'bg-surface-muted text-text-secondary'
              }`}
            >
              🤰 {t('trust.pregnancySafe')}
            </button>
          </div>
          <p className="mb-6 text-sm text-text-secondary">
            {isLoading
              ? t('marketing.search.searching')
              : t('marketing.search.results-count', { count: totalResults })}
          </p>
          {isLoading ? (
            <GridSkeleton count={8} />
          ) : totalResults === 0 ? (
            <EmptyState title={t('marketing.search.no-results')} />
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
                          <ServiceImage
                            src={s.imageUrl}
                            alt={localize(s.titleJson, locale)}
                            size="full"
                            className="h-32 w-full"
                          />
                          <h3 className="mt-2 font-semibold">{localize(s.titleJson, locale)}</h3>
                          <p className="text-sm text-text-secondary">
                            {t('marketing.search.duration-min', { min: s.durationMin })} ·{' '}
                            {formatCurrency(Number(s.basePrice))}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {s.isWomenOnlyStaff && (
                              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-pink-700">
                                🙋‍♀️ {t('trust.womenOnly')}
                              </span>
                            )}
                            {s.isPrivateSuite && (
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] text-brand-700">
                                🚪 {t('trust.privateSuite')}
                              </span>
                            )}
                            {s.isPregnancySafe && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                                🤰 {t('trust.pregnancySafe')}
                              </span>
                            )}
                          </div>
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
                          <ServiceImage
                            src={p.imageUrl ?? null}
                            alt={localize(p.nameJson, locale)}
                            size="full"
                            className="h-24 w-full"
                          />
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
                            <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-brand-100">
                              <ServiceImage
                                src={t.user?.avatarUrl ?? null}
                                alt={t.user?.name ?? ''}
                                size="full"
                                className="h-16 w-16 object-cover"
                              />
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
