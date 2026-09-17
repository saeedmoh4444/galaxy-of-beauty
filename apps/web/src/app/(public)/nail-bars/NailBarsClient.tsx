'use client';
import type { JSX } from 'react';

import Link from 'next/link';
import { Card, ErrorAlert, EmptyState, HeroSection, ServiceImage, TrustBadges } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

export interface NailBarsPageData {
  nailBars: Array<Record<string, unknown>>;
  /** K3 (W9) — active child-friendly filter state. */
  childFriendly?: boolean;
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
        {/* K3 (W9) — child-friendly corner filter */}
        <Link
          href={data.childFriendly ? '/nail-bars' : '/nail-bars?childFriendly=1'}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition-colors ${
            data.childFriendly
              ? 'bg-brand-600 text-white ring-brand-600'
              : 'bg-surface-elevated text-text-secondary ring-edge hover:text-brand-600'
          }`}
        >
          🧸 {t('trust.childFriendly')}
        </Link>
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
                      <p className="truncate font-bold text-text-primary">
                        {n.storeName as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(`nailBars.type.${n.nailBarType as string}` as never)} ·{' '}
                        {n.nailBarCity as string}
                      </p>
                    </div>
                  </div>
                  <TrustBadges
                    className="mt-3"
                    items={[
                      {
                        variant: 'verified' as const,
                        label: t('nailBars.verified-badge'),
                      },
                      ...(Number(n.totalReviews ?? 0) > 0
                        ? [
                            {
                              variant: 'rating' as const,
                              label: t('misc.rating'),
                              value: Number(n.ratingAvg ?? 0).toFixed(1),
                            },
                          ]
                        : []),
                      ...(n.womenOnlyStaff
                        ? [{ variant: 'womenOnly' as const, label: t('trust.womenOnly') }]
                        : []),
                      ...(n.privateSuite
                        ? [{ variant: 'private' as const, label: t('trust.privateSuite') }]
                        : []),
                      ...(n.childFriendlyCorner
                        ? [{ variant: 'childFriendly' as const, label: t('trust.childFriendly') }]
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
