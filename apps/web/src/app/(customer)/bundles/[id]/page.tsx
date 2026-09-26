'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

// 1.2 Service Bundles — detail: included services in execution order, the
// original→total price story, and the Book CTA that preseeds the booking
// wizard (?beautyBundleId=).
export default function BundleDetailPage(): JSX.Element {
  const { t, locale } = useLocale();
  const params = useParams();
  const id = parseInt((params?.id as string) ?? '0', 10);
  const { data, isLoading } = api.beautyBundles.get.useQuery(
    { id },
    { enabled: Number.isFinite(id) && id > 0, retry: false },
  );
  const bundle = data as
    (Record<string, unknown> & { services?: Array<Record<string, unknown>> }) | null;

  if (isLoading) {
    return (
      <DashboardLayout userRole="CUSTOMER">
        <Card padding="md" className="animate-pulse">
          <div className="h-6 w-1/2 rounded bg-surface-muted" />
        </Card>
      </DashboardLayout>
    );
  }

  if (!bundle) {
    return (
      <DashboardLayout userRole="CUSTOMER">
        <Card padding="md">
          <p className="text-sm text-text-secondary">{t('bundles.empty')}</p>
        </Card>
      </DashboardLayout>
    );
  }

  const services = bundle.services ?? [];
  const original = num(bundle.originalPrice);
  const total = num(bundle.totalPrice);
  const savings = Math.round((original - total) * 100) / 100;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div data-testid="bundle-detail" className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div>
          <Link href="/bundles" className="text-sm text-brand-600 hover:underline">
            ← {t('bundles.title')}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">
            {localize(bundle.titleJson, locale)}
          </h1>
          {bundle.descriptionJson ? (
            <p className="mt-1 text-sm text-text-secondary">
              {localize(bundle.descriptionJson, locale)}
            </p>
          ) : null}
        </div>

        <Card padding="md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-text-tertiary">{t('bundles.original')}</p>
              <p className="text-sm text-text-tertiary line-through">
                {original.toFixed(0)} {t('misc.sar')}
              </p>
            </div>
            <div className="text-end">
              <p className="text-xs text-text-tertiary">{t('bundles.total')}</p>
              <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                {total.toFixed(0)} {t('misc.sar')}
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
              {t('bundles.discount', { pct: bundle.discountPct as number })}
            </span>
          </div>
          <p className="mt-2 text-xs text-green-700 dark:text-green-400">
            {t('bundles.saveLabel')} {savings.toFixed(0)} {t('misc.sar')}
          </p>
        </Card>

        <Card padding="md">
          <h2 className="mb-3 font-semibold text-text-primary">{t('bundles.included')}</h2>
          <div className="space-y-2">
            {services.map((s, i) => (
              <div
                key={s.id as number}
                data-testid="bundle-service-row"
                className="flex items-center justify-between rounded-lg border border-edge bg-surface px-3 py-2"
              >
                <span className="text-sm text-text-primary">
                  <span className="me-2 text-xs font-bold text-brand-600">{i + 1}</span>
                  {localize(s.titleJson, locale)}
                </span>
                <span className="text-xs text-text-secondary">
                  {num(s.basePrice).toFixed(0)} {t('misc.sar')} · {num(s.durationMin)}{' '}
                  {t('misc.min')}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-tertiary">{t('bundles.sequentialNote')}</p>
          {bundle.validUntil ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              {t('bundles.validUntil', {
                date: new Date(String(bundle.validUntil)).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-GB',
                ),
              })}
            </p>
          ) : null}
        </Card>

        <Link
          href={`/bookings/create?beautyBundleId=${bundle.id as number}`}
          data-testid="bundle-book-cta"
          className="block"
        >
          <Button className="w-full" size="lg">
            {t('bundles.book')}
          </Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
