'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function WishlistPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.wishlist.list.useQuery({} as never);
  const removeMut = api.wishlist.remove.useMutation({ onSuccess: () => refetch() });

  const items = (data?.items as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">المفضلة</h1>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المفضلة" onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <div>
            <EmptyState title="المفضلة فارغة" description="لم تقم بإضافة أي عنصر إلى المفضلة بعد" />
            <div className="text-center">
              <Link href="/services"><Button>تصفح الخدمات</Button></Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item: Record<string, unknown>) => {
              const service = item.service as unknown as Record<string, unknown> | null;
              const technician = item.technician as unknown as Record<string, unknown> | null;

              if (service) {
                const category = service.category as unknown as Record<string, unknown>;
                const titleJson = service.titleJson as Record<string, string>;
                return (
                  <Card key={item.id as number} padding="md" className="relative">
                    <div className="mb-3 flex h-36 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      {service.imageUrl ? (
                        <img src={service.imageUrl as string} alt="" className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-300">📷</span>
                      )}
                    </div>
                    <h3 className="font-semibold">{titleJson?.ar ?? titleJson?.en ?? ''}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {(category?.nameJson as Record<string, string>)?.ar ?? ''}
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-600">
                      {formatCurrency(Number(service.basePrice))}
                    </p>
                    <button
                      onClick={() => removeMut.mutate({ wishlistItemId: item.id as number })}
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      إزالة
                    </button>
                  </Card>
                );
              }

              if (technician) {
                const user = technician.user as unknown as Record<string, unknown>;
                return (
                  <Card key={item.id as number} padding="md" className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl as string} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <span className="text-2xl text-gray-300">👤</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name as string}</h3>
                        <p className="text-xs text-gray-500">{technician.city as string}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <span>⭐</span>
                      <span>{Number(technician.ratingAvg).toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => removeMut.mutate({ wishlistItemId: item.id as number })}
                      className="mt-3 w-full rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      إزالة
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
