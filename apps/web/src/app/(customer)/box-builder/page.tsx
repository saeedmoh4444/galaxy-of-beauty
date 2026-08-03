'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BoxBuilderPage(): JSX.Element {
  const { data: catalog, isLoading } = api.boxBuilder.catalog.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const buildMut = api.boxBuilder.build.useMutation();
  const [selected, setSelected] = useState<number[]>([]);
  const [boxName, setBoxName] = useState('');
  const [freq, setFreq] = useState<'monthly' | 'quarterly'>('monthly');
  const [result, setResult] = useState<Record<string,unknown> | null>(null);

  const toggle = (id: number) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p);
  const products = (catalog as Array<Record<string,unknown>>) ?? [];
  const selectedProducts = products.filter((p) => selected.includes(p.id as number));
  const subtotal = selectedProducts.reduce((s, p) => s + (p.price as number), 0);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">📦 صندوق التجميل الشهري</h1><p className="mt-1 text-sm text-text-secondary">اختاري منتجاتكِ المفضلة واحصلي عليها شهرياً — ووفري حتى ١٥٪</p></div>

        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300 dark:border-green-700">
            <span className="text-6xl">🎉</span>
            <h2 className="mt-4 text-xl font-bold">تم بناء صندوقكِ!</h2>
            <p className="text-2xl font-extrabold text-brand-600 mt-2">{formatCurrency(result.total as number)} ر.س / {(result.frequency as string) === 'monthly' ? 'شهرياً' : 'ربع سنوي'}</p>
            <p className="text-sm text-green-600 mt-1">وفرتِ {formatCurrency(result.discount as number)} ر.س!</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1">{(result.products as Array<Record<string,unknown>>)?.map((p: Record<string,unknown>) => <span key={p.id as number} className="text-2xl">{p.emoji as string}</span>)}</div>
          </Card>
        ) : (
          <>
            <Card padding="lg">
              <h3 className="font-bold mb-3">🛍️ اختاري منتجاتكِ (٣-٦)</h3>
              {isLoading ? <CardSkeleton /> : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((p: Record<string,unknown>) => (
                    <button key={p.id as number} onClick={() => toggle(p.id as number)} className={`rounded-xl border-2 p-3 text-center transition-all ${selected.includes(p.id as number) ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="text-3xl">{p.emoji as string}</span>
                      <p className="text-xs font-bold mt-1">{p.nameAr as string}</p>
                      <p className="text-xs text-brand-600 font-semibold">{formatCurrency(p.price as number)} ر.س</p>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {selected.length >= 3 && (
              <Card padding="lg">
                <div className="space-y-3">
                  <input type="text" value={boxName} onChange={(e) => setBoxName(e.target.value)} placeholder="اسم الصندوق" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                  <div className="flex gap-2">
                    {(['monthly','quarterly'] as const).map((f) => <button key={f} onClick={() => setFreq(f)} className={`flex-1 rounded-lg border py-2 text-sm font-medium ${freq === f ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}>{f === 'monthly' ? '📅 شهري (خصم ١٥٪)' : '📦 ربع سنوي (خصم ١٠٪)'}</button>)}
                  </div>
                  <div className="flex justify-between text-sm"><span>المنتجات ({selected.length})</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-green-600">الخصم</span><span className="text-green-600">-{formatCurrency(Math.round(subtotal * (freq === 'monthly' ? 0.15 : 0.1)))}</span></div>
                  <Button onClick={() => { if (boxName.trim()) buildMut.mutate({ name: boxName.trim(), productIds: selected, frequency: freq }, { onSuccess: (d) => setResult(d as Record<string,unknown>) }); }} loading={buildMut.isPending} className="w-full" size="lg">🎁 بناء الصندوق</Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
