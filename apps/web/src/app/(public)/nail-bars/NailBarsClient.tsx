'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface NailBarsPageData {
  nailBars: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function NailBarsClient({ data }: { data: NailBarsPageData }): JSX.Element {
  const { t } = useLocale();

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('nailBars.title')}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{t('nailBars.subtitle')}</p>
      </div>

      {data.nailBars.length === 0 ? (
        <EmptyState title={t('nailBars.empty')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.nailBars.map((n: Record<string, unknown>) => (
            <Link key={n.id as number} href={`/nail-bars/${n.storeSlug as string}`}>
              <Card
                padding="md"
                className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {n.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.logoUrl as string}
                      alt={n.storeName as string}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl">
                      💅
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-text-primary dark:text-gray-100">
                      {n.storeName as string}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {t(`nailBars.type.${n.nailBarType as string}` as never)} ·{' '}
                      {n.nailBarCity as string}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      {t('nailBars.pay-at-venue')}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
