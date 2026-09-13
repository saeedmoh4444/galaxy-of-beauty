'use client';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface GymsPageData {
  gyms: Array<Record<string, unknown>>;
  fetchError?: string;
}

export function GymsClient({ data }: { data: GymsPageData }): JSX.Element {
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
        eyebrow="💪"
        title={t('gyms.title')}
        subtitle={t('gyms.subtitle')}
        gradient="from-accent-50 via-surface to-brand-50"
        className="mb-2"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-8">
        {data.gyms.length === 0 ? (
          <EmptyState title={t('gyms.empty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.gyms.map((g: Record<string, unknown>) => (
              <Link key={g.id as number} href={`/gyms/${g.storeSlug as string}`}>
                <Card
                  padding="md"
                  className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <ServiceImage
                      src={(g.logoUrl as string) ?? null}
                      alt={(g.storeName as string) ?? ''}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text-primary dark:text-gray-100">
                        {g.storeName as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(`gyms.type.${g.gymType as string}` as never)} · {g.gymCity as string}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {t('gyms.verified-badge', { agency: 'MISA' })}
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
