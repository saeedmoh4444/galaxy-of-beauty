'use client';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ServiceImage } from '@galaxy/ui';
import { pageHeroKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

export default function SmartPricingPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading } = api.smartPricing.current.useQuery() as {
    data:
      { configured: boolean; prices: Array<Record<string, unknown>>; reason: string } | undefined;
    isLoading: boolean;
  };
  const items = data?.prices ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <ServiceImage
          service={pageHeroKey('smart-pricing')}
          alt=""
          size="xl"
          className="mx-auto rounded-3xl"
        />
        <h1 className="mt-4 text-3xl font-bold">{t('marketing.smart-pricing.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('marketing.smart-pricing.subtitle')}</p>
      </div>
      {isLoading ? (
        <CardListSkeleton count={4} />
      ) : !data?.configured ? (
        <Card padding="lg" className="border-2 border-amber-300 text-center">
          <span className="text-5xl">🚧</span>
          <h2 className="mt-4 text-xl font-bold">{t('common.notConfigured')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('common.unavailable')}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((s: Record<string, unknown>) => (
            <Card key={s.service as string} padding="lg" className="flex items-center gap-4">
              <span className="text-4xl">{s.emoji as string}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{s.service as string}</h3>
                <p className="text-xs text-text-secondary">{s.reason as string}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
