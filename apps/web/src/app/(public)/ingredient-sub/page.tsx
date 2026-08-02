'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';

export default function IngredientSubPage(): JSX.Element {
  const [search, setSearch] = useState(''); const [q, setQ] = useState('');
  const { data: list } = api.ingredientSub.list.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: result, isLoading } = api.ingredientSub.find.useQuery({ ingredient: q }, { enabled: q.length > 0 }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const items = (list ?? []) as Array<Record<string,unknown>>;
  const subs = (result?.subs ?? []) as Array<Record<string,unknown>>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🧴</span><h1 className="mt-4 text-3xl font-bold">بدائل المكونات</h1><p className="mt-2 text-gray-500">اكتشفي بدائل آمنة وطبيعية للمواد الضارة</p></div>
      <div className="flex gap-2 mb-6"><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setQ(search.trim())} placeholder="اسم المادة..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /><Button onClick={() => setQ(search.trim())}>بحث</Button></div>
      {q && isLoading ? <CardSkeleton /> : subs.length > 0 ? (
        <Card padding="lg"><h3 className="font-bold mb-3">🔄 بدائل {result?.ingredient as string}</h3><div className="space-y-3">{subs.map((s: Record<string,unknown>, i: number) => <div key={i} className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950 p-4"><span className="text-3xl">{s.emoji as string}</span><div><p className="font-bold">{s.nameAr as string}</p><p className="text-xs text-gray-500">{s.nameEn as string}</p><p className="text-xs text-gray-600 mt-1">{s.descAr as string}</p></div></div>)}</div></Card>
      ) : items.length > 0 ? (
        <Card padding="lg"><h3 className="font-bold mb-3">📋 المواد الضارة الشائعة</h3><div className="flex flex-wrap gap-2">{items.map((item: Record<string,unknown>) => <button key={item.ingredient as string} onClick={() => { setSearch(item.ingredient as string); setQ(item.ingredient as string); }} className="rounded-full bg-red-50 dark:bg-red-950 px-3 py-1.5 text-sm hover:bg-red-100">{item.ingredient as string}</button>)}</div></Card>
      ) : null}
    </div>
  );
}
