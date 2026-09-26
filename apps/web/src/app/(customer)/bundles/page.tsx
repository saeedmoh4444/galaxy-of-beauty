'use client';

import Link from 'next/link';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { PageContainer, PageTitle, GridSkeleton, EmptyState, ServiceImage } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

// 1.2 Service Bundles — public catalog of pre-built packages. Guests can
// browse; the Book CTA lives on the detail page.
export default function BundlesPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.beautyBundles.list.useQuery();
  const bundles = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <div className="mb-6">
          <PageTitle title={t('bundles.title')} subtitle={t('bundles.subtitle')} />
        </div>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : bundles.length === 0 ? (
          <EmptyState mood="sparkle" title={t('bundles.empty')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => {
              const id = b.id as number;
              const original = num(b.originalPrice);
              const total = num(b.totalPrice);
              const savings = Math.round((original - total) * 100) / 100;
              const serviceCount = (b.serviceIds as number[]).length;
              return (
                <Link
                  key={id}
                  href={`/bundles/${id}`}
                  data-testid="bundle-card"
                  className="rounded-2xl border border-edge-muted bg-surface-elevated p-4 transition-shadow hover:shadow-md"
                >
                  <ServiceImage
                    src={(b.imageUrl as string) ?? null}
                    alt={localize(b.titleJson, locale)}
                    size="full"
                    className="mb-2 h-32 w-full"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <h4 data-testid="bundle-title" className="text-sm font-bold text-text-primary">
                      {localize(b.titleJson, locale)}
                    </h4>
                    <span
                      data-testid="bundle-savings"
                      className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      {t('bundles.saveLabel')} {savings.toFixed(0)} {t('misc.sar')}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-tertiary dark:text-text-secondary">
                    {b.descriptionJson ? localize(b.descriptionJson, locale) : ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {t('bundles.servicesCount', { count: serviceCount })}
                    </span>
                    <span className="text-end">
                      <span className="block text-xs text-text-tertiary line-through">
                        {original.toFixed(0)} {t('misc.sar')}
                      </span>
                      <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                        {total.toFixed(0)} {t('misc.sar')}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
