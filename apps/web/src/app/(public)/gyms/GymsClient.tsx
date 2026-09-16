'use client';
import type { JSX } from 'react';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage, TrustBadges } from '@galaxy/ui';
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
                      <p className="truncate font-bold text-text-primary">
                        {g.storeName as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(`gyms.type.${g.gymType as string}` as never)} · {g.gymCity as string}
                      </p>
                    </div>
                  </div>
                  <TrustBadges
                    className="mt-3"
                    items={[
                      {
                        variant: 'verified' as const,
                        label: t('gyms.verified-badge', { agency: 'MISA' }),
                      },
                      ...(Number(g.totalReviews ?? 0) > 0
                        ? [
                            {
                              variant: 'rating' as const,
                              label: t('misc.rating'),
                              value: Number(g.ratingAvg ?? 0).toFixed(1),
                            },
                          ]
                        : []),
                      ...(g.womenOnlyStaff
                        ? [{ variant: 'womenOnly' as const, label: t('trust.womenOnly') }]
                        : []),
                      ...(g.privateSuite
                        ? [{ variant: 'private' as const, label: t('trust.privateSuite') }]
                        : []),
                    ]}
                  />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
