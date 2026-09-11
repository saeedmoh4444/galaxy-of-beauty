'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface StoresPageData {
  stores: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function StoresClient({ data }: { data: StoresPageData }): JSX.Element {
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
        eyebrow="🛍️"
        title={t('stores.title')}
        subtitle={t('stores.subtitle')}
        gradient="from-accent-50 via-surface to-brand-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
        {data.stores.length === 0 ? (
          <EmptyState title={t('stores.empty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.stores.map((s: Record<string, unknown>) => {
              const count = (s._count as Record<string, number> | undefined)?.products ?? 0;
              return (
                <Link key={s.id as number} href={`/stores/${s.storeSlug as string}`}>
                  <Card
                    padding="md"
                    className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ServiceImage
                        src={(s.logoUrl as string) ?? null}
                        alt={(s.storeName as string) ?? ''}
                        size="md"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-text-primary dark:text-gray-100">
                          {s.storeName as string}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('stores.product-count', { count })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
