'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MarketplacePage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { data, isLoading } = api.marketplace.products.useQuery({ search: search || undefined, sortBy: sortBy as 'newest', page: 1, limit: 24 }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: categories } = api.marketplace.productCategories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: cart } = api.marketplace.cart.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const addToCartMut = api.marketplace.addToCart.useMutation();
  const products = (data?.items as Array<Record<string,unknown>>) ?? [];
  const cartCount = (cart ?? []).length;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">🛍️ متجر الجمال</h1><p className="mt-1 text-sm text-gray-500">منتجات تجميل أصلية من أفضل الماركات</p></div>
          <Link href="/cart"><Button variant="outline">🛒 السلة {cartCount > 0 && `(${cartCount})`}</Button></Link>
        </div>

        <div className="flex gap-3 flex-wrap">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحثي عن منتج..." className="flex-1 min-w-[200px] rounded-lg border px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="newest">الأحدث</option><option value="price_asc">السعر: منخفض لأعلى</option><option value="price_desc">السعر: أعلى لمنخفض</option><option value="popular">الأكثر شيوعاً</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">{(categories??[]).map((c: Record<string,unknown>) => {
          const name = (c.nameJson as Record<string,string>)?.ar ?? c.name as string;
          return <button key={c.id as number} className="rounded-full bg-gray-100 px-4 py-1.5 text-xs hover:bg-brand-100 hover:text-brand-700 transition-all">{name}</button>;
        })}</div>

        {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8},(_,i)=><CardSkeleton key={i}/>)}</div> :
          products.length === 0 ? <Card padding="lg" className="text-center py-8 col-span-full"><p className="text-4xl mb-2">🛍️</p><p className="text-gray-500">لا توجد منتجات</p></Card> :
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((p: Record<string,unknown>) => {
            const nameJson = p.nameJson as Record<string,string> | undefined;
            return (
              <Card key={p.id as number} padding="md" className="text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl">{p.imageUrl ? '🖼️' : '🧴'}</span>
                <h3 className="font-bold text-sm mt-2">{nameJson?.ar ?? `منتج #${p.id}`}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.brand as string}</p>
                <p className="text-lg font-extrabold text-brand-600 mt-2">{formatCurrency(Number(p.price ?? 0))}</p>
                <Button size="sm" onClick={() => addToCartMut.mutate({ productId: p.id as number })} loading={addToCartMut.isPending} className="w-full mt-2">🛒 أضيفي للسلة</Button>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
