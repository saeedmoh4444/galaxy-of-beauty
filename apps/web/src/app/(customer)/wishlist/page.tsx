'use client';

import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { Card, GridSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

type WishlistItem = RouterOutputs['wishlist']['list']['items'][number];

export default function WishlistPage(): JSX.Element {
  const { t } = useLocale();
  const { data, isLoading, isError, refetch } = api.wishlist.list.useQuery();
  const removeMut = api.wishlist.remove.useMutation({ onSuccess: () => refetch() });

  const items: WishlistItem[] = data?.items ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">{t('wishlist.title')}</h1>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : isError ? (
          <ErrorAlert message={t('wishlist.loadError')} onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <div>
            <EmptyState
              title={t('wishlist.emptyTitle')}
              description={t('wishlist.emptyDescription')}
            />
            <div className="text-center">
              <Link href="/services">
                <Button>{t('wishlist.browseServices')}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const service = item.service;
              const technician = item.technician;

              if (service) {
                const category = service.category;
                const titleJson = service.titleJson;
                return (
                  <Card key={item.id as number} padding="md" className="relative">
                    <div className="relative mb-3 flex h-36 items-center justify-center rounded-lg bg-surface-muted dark:bg-gray-800">
                      {service.imageUrl ? (
                        <Image
                          src={service.imageUrl as string}
                          alt=""
                          fill
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-gray-300"></span>
                      )}
                    </div>
                    <h3 className="font-semibold">
                      {(titleJson as { ar?: string; en?: string })?.ar ??
                        (titleJson as { ar?: string; en?: string })?.en ??
                        ''}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary">
                      {(category?.nameJson as Record<string, string>)?.ar ?? ''}
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-600">
                      {formatCurrency(Number(service.basePrice))}
                    </p>
                    <button
                      onClick={() => removeMut.mutate({ wishlistItemId: item.id as number })}
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {t('wishlist.remove')}
                    </button>
                  </Card>
                );
              }

              if (technician) {
                const user = technician.user;
                return (
                  <Card key={item.id as number} padding="md" className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted dark:bg-gray-800">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl as string}
                            alt=""
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-gray-300"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name as string}</h3>
                        <p className="text-xs text-text-secondary">{technician.city as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <span></span>
                      <span>{Number(technician.ratingAvg).toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => removeMut.mutate({ wishlistItemId: item.id as number })}
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {t('wishlist.remove')}
                    </button>
                  </Card>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
