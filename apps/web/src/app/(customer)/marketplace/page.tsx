'use client';

import { api } from '@/lib/trpc';
import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MarketplacePage(): JSX.Element {
  const [search, setSearch] = useState('');
  const products = (api as any).marketplace?.products?.useQuery?.({
    search: search || undefined,
    page: 1,
    limit: 24,
  }) as any;
  const cart = (api as any).marketplace?.cart?.useQuery?.() as any;
  const items = (products?.data?.items ?? []) as any[];
  const cartCount = ((cart?.data ?? []) as any[]).length;

  const handleAddToCart = async (pid: number) => {
    try {
      await (api as any).marketplace.addToCart.mutate({ productId: pid });
    } catch { /* noop */ }
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <PageTitle title="️ متجر الجمال" subtitle="منتجات تجميل أصلية" />
          </div>
          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-text-primary dark:bg-gray-800 dark:text-gray-100">
             {cartCount}
          </span>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=" ابحثي عن منتج..."
          className="mb-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-right dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-5xl">️</span>
            <p className="mt-4 text-text-secondary dark:text-gray-400">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p: any) => (
              <div
                key={p.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <span className="text-4xl">{p.emoji}</span>
                <h4 className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">
                  {p.nameAr ?? p.titleAr}
                </h4>
                <p className="mt-1 text-xs text-text-tertiary dark:text-gray-500 line-clamp-2">
                  {p.descAr}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {(p.price as number)?.toLocaleString()} ر.س
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p.id)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
                  >
                     أضيفي
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
