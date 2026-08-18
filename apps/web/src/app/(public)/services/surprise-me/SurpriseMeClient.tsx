'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Button, Card, GridSkeleton, ErrorAlert } from '@galaxy/ui';

type ServiceItem = RouterOutputs['services']['list']['items'][number];

export interface SurpriseMePageData {
  initialService: ServiceItem | null;
}

export function SurpriseMeClient({ data }: { data: SurpriseMePageData }): JSX.Element {
  const { t } = useLocale();
  const [service, setService] = useState<ServiceItem | null>(data.initialService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickRandom = async () => {
    setLoading(true);
    setError('');
    try {
      api.services.list.useQuery({ sort: 'popular', page: 1, limit: 50 });
      // Wait briefly for the query — in production this would use api.services.list.fetch()
      const utils = api.useUtils();
      const result = await utils.services.list.fetch({
        sort: 'popular',
        page: 1,
        limit: 50,
      });
      const items = result?.items ?? [];
      if (items.length > 0) {
        setService(items[Math.floor(Math.random() * items.length)]);
      } else {
        setError(t('marketing.surprise-me.no-services'));
      }
    } catch {
      setError(t('marketing.surprise-me.load-error'));
    }
    setLoading(false);
  };

  const svc = service;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-8">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.surprise-me.title')}
        </h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          {t('marketing.surprise-me.subtitle')}
        </p>
      </div>

      {loading ? (
        <GridSkeleton count={1} />
      ) : error ? (
        <div className="space-y-4">
          <ErrorAlert message={error} onRetry={pickRandom} />
          {svc && <ServiceCard svc={svc} />}
        </div>
      ) : svc ? (
        <div className="space-y-6">
          <ServiceCard svc={svc} />
          <Button onClick={pickRandom} size="lg" className="mx-auto">
            {t('marketing.surprise-me.another-suggestion')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-tertiary">{t('marketing.surprise-me.no-services-available')}</p>
          <Link href="/services">
            <Button variant="outline">{t('marketing.surprise-me.browse-services')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ svc }: { svc: ServiceItem }): JSX.Element {
  const { t, locale } = useLocale();
  return (
    <Card padding="lg" className="mx-auto max-w-sm text-center">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900"></div>
      <h2 className="mt-4 text-xl font-bold text-text-primary dark:text-gray-100">
        {localize(svc.titleJson, locale)}
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        {t('marketing.surprise-me.duration-min', { min: svc.durationMin })}
      </p>
      <p className="mt-2 text-2xl font-bold text-brand-600">
        {t('marketing.surprise-me.price-sar', { price: Number(svc.basePrice).toFixed(0) })}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <Link href={`/services/${svc.id}`}>
          <Button variant="outline">{t('marketing.surprise-me.details')}</Button>
        </Link>
        <Link href={`/bookings/create?serviceId=${svc.id}`}>
          <Button>{t('marketing.surprise-me.book-now')}</Button>
        </Link>
      </div>
    </Card>
  );
}
