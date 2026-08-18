'use client';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, formatCurrency } from '@galaxy/ui';
import { localize } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function AiFeedPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data: feed, isLoading } = api.aiFeatures.personalizedFeed.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const wishlistItems = (feed?.wishlistItems as Array<Record<string, unknown>>) ?? [];
  const recommendations = (feed?.recommendations as Array<Record<string, unknown>>) ?? [];
  const skinProfile = feed?.skinProfile as Record<string, unknown> | null;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('aiFeed.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('aiFeed.subtitle')}</p>
        </div>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : (
          <>
            {skinProfile && (
              <Card padding="lg" className="border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl"></span>
                  <div>
                    <p className="font-bold text-purple-700">{t('aiFeed.skinProfile')}</p>
                    <p className="text-sm text-purple-600">
                      {t('aiFeed.skinTypeLine', {
                        type: skinProfile.skinType as string,
                        concerns:
                          (skinProfile.concerns as string[])?.join(t('aiFeed.separator')) ?? '',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {wishlistItems.length > 0 && (
              <Card padding="lg">
                <h3 className="font-bold mb-3">{t('aiFeed.wishlist')}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {wishlistItems.map((w: Record<string, unknown>) => (
                    <div
                      key={w.id as number}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-bold text-sm">
                          {localize(w.titleJson, locale) ?? String(w.id)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {w.imageUrl ? t('aiFeed.available') : t('aiFeed.service')}
                        </p>
                      </div>
                      <span className="font-bold text-brand-600">
                        {formatCurrency(w.basePrice as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {recommendations.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-lg">{t('aiFeed.recommended')}</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {recommendations.map((r: Record<string, unknown>) => (
                    <Card key={r.id as number} padding="md" className="text-center">
                      <span className="text-3xl"></span>
                      <h4 className="font-bold mt-2 text-sm">
                        {localize(r.titleJson, locale) ??
                          t('aiFeed.serviceFallback', { id: r.id as number })}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {localize((r.category as Record<string, unknown>)?.nameJson, locale) ?? ''}
                      </p>
                      <p className="font-bold text-brand-600 mt-2">
                        {formatCurrency(r.basePrice as number)}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {wishlistItems.length === 0 && recommendations.length === 0 && (
              <Card padding="lg" className="text-center py-8">
                <p className="text-4xl mb-2"></p>
                <p className="text-text-secondary">{t('aiFeed.empty')}</p>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
