'use client';

import { api } from '@/lib/trpc';
import {
  Card,
  Button,
  formatCurrency,
  ErrorAlert,
  EmptyState,
  useToast,
  useAuth,
} from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export interface StorefrontPageData {
  store: {
    id: number;
    storeName: string;
    storeSlug: string;
    descriptionJson: { ar?: string; en?: string } | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    isVerified: boolean;
  } | null;
  products: Array<Record<string, unknown>>;
  productCount: number;
  fetchError?: string;
}

export function StorefrontClient({ data }: { data: StorefrontPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const addToCartMut = api.marketplace.addToCart.useMutation({
    onSuccess: () => addToast('success', t('stores.added-to-cart')),
    onError: (e) => addToast('error', e.message),
  });

  if (data.fetchError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorAlert message={data.fetchError} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!data.store) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <EmptyState title={t('stores.not-found')} />
      </div>
    );
  }

  const { store } = data;
  const bio = (store.descriptionJson ?? {}) as { ar?: string; en?: string };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Store header */}
      <div className="flex items-center gap-4">
        {store.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logoUrl}
            alt={store.storeName}
            className="h-20 w-20 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-4xl">
            ️
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            {store.storeName}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('stores.product-count', { count: data.productCount })}
            {store.isVerified ? ` · ${t('stores.verified')}` : ''}
          </p>
        </div>
      </div>

      {bio[locale] ? (
        <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">{bio[locale]}</p>
      ) : null}

      {/* Product grid */}
      {data.products.length === 0 ? (
        <EmptyState title={t('stores.empty-products')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((p: Record<string, unknown>) => (
            <Card key={p.id as number} padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-text-primary dark:text-gray-100">
                    {localize(p.nameJson, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-600">
                    {formatCurrency(Number(p.price ?? 0))}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('stores.stock', { count: Number(p.stock ?? 0) })}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={!isAuthenticated || Number(p.stock ?? 0) <= 0}
                  loading={addToCartMut.isPending}
                  onClick={() => {
                    if (isAuthenticated) {
                      addToCartMut.mutate({ productId: p.id as number, quantity: 1 });
                    } else {
                      addToast('warning', t('stores.login-to-buy'));
                    }
                  }}
                >
                  {t('stores.add-to-cart')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
