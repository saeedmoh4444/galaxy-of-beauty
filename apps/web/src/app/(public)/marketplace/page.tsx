'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, formatCurrency } from '@galaxy/shared';
import { MainLayout } from '@/components/layout/MainLayout';

export default function MarketplacePage(): JSX.Element {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = api.marketplace.products.useQuery({
    search: search || undefined,
    sortBy: 'newest',
    page: 1,
    limit: 20,
  });
  const { data: categories } = api.marketplace.productCategories.useQuery({} as never);

  const items = (data as unknown as Record<string, unknown>)?.items as Array<Record<string, unknown>> || [];
  const total = (data as unknown as Record<string, unknown>)?.total as number || 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">متجر منتجات التجميل</h1>

        <div className="flex gap-4">
          <Input
            placeholder="ابحثي عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المنتجات" onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="لا توجد منتجات" description="لم يتم العثور على منتجات. حاولي تغيير البحث." />
        ) : (
          <>
            <p className="text-sm text-gray-500">{total} منتج</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <Card key={p.id as number} padding="sm" className="group cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-square w-full rounded-lg bg-gray-100 dark:bg-gray-800 mb-3 flex items-center justify-center text-4xl">
                    🧴
                  </div>
                  <h3 className="font-semibold text-sm truncate">
                    {((p.nameJson as Record<string, string>)?.ar) || ''}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {((p as Record<string, unknown>).vendor as Record<string, string> | undefined)?.storeName || ''}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-brand-600">{formatCurrency(Number(p.price))}</span>
                    {p.comparePrice ? (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(Number(p.comparePrice))}</span>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
