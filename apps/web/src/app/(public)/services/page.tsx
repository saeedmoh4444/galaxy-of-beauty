'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Input, Card, CardSkeleton, ErrorAlert, EmptyState, useDebounce } from '@galaxy/shared';

export default function ServicesPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const svcQuery = api.services.list.useQuery({ search: debouncedSearch || undefined, sort: sort as 'newest', page, limit: 12 });
  const cats = api.categories.list.useQuery({} as never);
  const data = svcQuery.data as unknown as { items: Record<string, unknown>[]; total: number; page: number; limit: number } | undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else if (next.size < 3) { next.add(id); }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">الخدمات</h1>
      <div className="mb-6 flex flex-wrap gap-4">
        <Input placeholder="بحث عن خدمة..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
          <option value="newest">الأحدث</option><option value="price_asc">السعر: منخفض لأعلى</option><option value="price_desc">السعر: أعلى لمنخفض</option><option value="popular">الأكثر طلباً</option>
        </select>
        {!cats.isLoading && cats.data && (() => { const catData = cats.data as unknown as Record<string, unknown>[]; return <div className="flex flex-wrap gap-2">{catData.map((c) => <button key={c.id as number} onClick={() => window.location.href = `/services?categoryId=${c.id}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">{((c.nameJson as Record<string, string>)?.ar)}</button>)}</div>; })()}
        <button
          onClick={() => { setCompareMode(!compareMode); setSelected(new Set()); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            compareMode ? 'bg-brand-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400'
          }`}
        >
          ⚖️ مقارنة {compareMode ? '(نشط)' : ''}
        </button>
        {compareMode && selected.size >= 2 && (
          <Link href={`/compare?ids=${[...selected].join(',')}`} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
            مقارنة ({selected.size})
          </Link>
        )}
      </div>

      {svcQuery.isLoading ? <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>
      : svcQuery.isError ? <ErrorAlert message="فشل تحميل الخدمات" onRetry={() => svcQuery.refetch()} />
      : items.length === 0 ? <EmptyState title="لا توجد خدمات" description="جرب تغيير معايير البحث" />
      : (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((svc: Record<string, unknown>) => (
            compareMode ? (
              <button key={svc.id as number} onClick={() => toggleSelect(svc.id as number)} className={`text-right ${selected.has(svc.id as number) ? 'ring-2 ring-brand-500 rounded-2xl' : ''}`}>
                <Card hover padding="md" className="relative">
                  <input type="checkbox" checked={selected.has(svc.id as number)} readOnly className="absolute top-3 left-3 h-5 w-5 accent-brand-600" />
                  <div className="h-40 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900 dark:to-accent-900" />
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">{(svc.titleJson as Record<string, string>)?.ar ?? ''}</h3>
                  <p className="mt-1 text-sm text-gray-500">{svc.durationMin as number} دقيقة</p>
                  <p className="mt-1 font-bold text-brand-600">{svc.basePrice as number} ر.س</p>
                </Card>
              </button>
            ) : (
            <Link key={svc.id as number} href={`/services/${svc.id}`}>
              <Card hover>
                <div className="h-40 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100" />
                <h3 className="mt-3 font-semibold">{(svc.titleJson as Record<string, string>)?.ar ?? ''}</h3>
                <p className="mt-1 text-sm text-gray-500">{svc.durationMin as number} دقيقة</p>
                <p className="mt-2 font-bold text-brand-600">{svc.basePrice as number} ر.س</p>
              </Card>
            </Link>
            )
          ))}
        </div>
      )}
      {total > 12 && <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(total / 12) }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} className={`rounded-lg px-3 py-1 text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{i + 1}</button>)}
      </div>}
    </div>
  );
}
