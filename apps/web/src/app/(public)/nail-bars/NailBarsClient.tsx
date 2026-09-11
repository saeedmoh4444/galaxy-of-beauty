'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage } from '@galaxy/ui';
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
    <div>
      <HeroSection
        eyebrow="💅"
        title={t('nailBars.title')}
        subtitle={t('nailBars.subtitle')}
        gradient="from-brand-50 via-surface to-accent-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
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
                    <ServiceImage
                      src={(n.logoUrl as string) ?? null}
                      alt={(n.storeName as string) ?? ''}
                      size="md"
                    />
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
    </div>
  );
}
