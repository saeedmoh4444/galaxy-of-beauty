'use client';

import { api } from '@/lib/trpc';
import { useState } from 'react';
import {
  PageContainer,
  PageTitle,
  useAuth,
  GridSkeleton,
  EmptyState,
  ServiceImage,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function MarketplacePage(): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const products = api.marketplace.products.useQuery({
    search: search || undefined,
    page: 1,
    limit: 24,
  });
  // /marketplace is not middleware-protected (products are public) — the cart
  // query is, so gate it on auth to avoid UNAUTHORIZED + redirect for anonymous
  // browsers (same pattern as NotificationBadge).
  const cart = api.marketplace.cart.useQuery(undefined, {
    enabled: !authLoading && isAuthenticated,
    retry: false,
  });
  const items = (products?.data?.items ?? []) as Array<Record<string, unknown>>;
  const cartCount = cart?.data?.length ?? 0;
  const addToCartMut = api.marketplace.addToCart.useMutation();

  const handleAddToCart = async (pid: number) => {
    try {
      await addToCartMut.mutateAsync({ productId: pid });
    } catch {
      /* noop */
    }
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <PageTitle title={t('marketplace.title')} subtitle={t('marketplace.subtitle')} />
          </div>
          <span className="rounded-full bg-surface-muted px-4 py-2 text-sm font-bold text-text-primary dark:bg-gray-800 dark:text-gray-100">
            {cartCount}
          </span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('marketplace.searchPlaceholder')}
          className="mb-6 w-full rounded-xl border border-edge px-4 py-3 text-sm text-end dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />

        {products.isLoading ? (
          <GridSkeleton count={8} />
        ) : items.length === 0 ? (
          <EmptyState title={t('marketplace.noProducts')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id as number}
                className="rounded-2xl border border-edge-muted bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <ServiceImage
                  src={(p.imageUrl as string) ?? null}
                  alt={(p.nameAr as string) ?? (p.titleAr as string) ?? ''}
                  size="full"
                  className="mb-2 h-32 w-full"
                />
                <h4 className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">
                  {(p.nameAr as string) ?? (p.titleAr as string)}
                </h4>
                <p className="mt-1 text-xs text-text-tertiary dark:text-text-secondary line-clamp-2">
                  {p.descAr as string}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {(p.price as number)?.toLocaleString()} {t('misc.sar')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p.id as number)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
                  >
                    {t('marketplace.add')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
