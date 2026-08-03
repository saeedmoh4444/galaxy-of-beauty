'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';

const DIM_LABELS: Record<string, string> = {
  hydration: '💧 ترطيب', absorption: '🧽 امتصاص', value: '💰 قيمة', gentle: '🌸 لطف' };

export default function ProductComparePage(): JSX.Element {
  const [selected, setSelected] = useState<number[]>([]);

  const { data: products, isLoading: pLoad } = api.productCompare.list.useQuery() as {
    data: Array<Record<string,unknown>> | undefined; isLoading: boolean;
  };
  const { data: compareData, isLoading: cLoad } = api.productCompare.compare.useQuery(
    { ids: selected },
    { enabled: selected.length >= 2 },
  ) as { data: { products: Array<Record<string,unknown>>; dimensions: string[] } | undefined; isLoading: boolean };

  const toggle = (id: number) => {
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 4 ? [...p, id] : p);
  };

  const productsList = (products ?? []) as Array<Record<string,unknown>>;
  const compared = compareData?.products ?? [];
  const dimensions = compareData?.dimensions ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">⚖️</span>
        <h1 className="mt-4 text-3xl font-bold">مقارنة المنتجات</h1>
        <p className="mt-2 text-text-secondary">قارني بين منتجات التجميل جنباً إلى جنب</p>
      </div>

      {/* Product selector */}
      <Card padding="lg" className="mb-6">
        <h3 className="font-bold mb-3">🛍️ اختر منتجين للمقارنة ({selected.length}/4)</h3>
        {pLoad ? <CardSkeleton /> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {productsList.map((p: Record<string,unknown>) => (
              <button key={p.id as number} onClick={() => toggle(p.id as number)} className={`rounded-xl border-2 p-3 text-center transition-all ${selected.includes(p.id as number) ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 scale-105' : 'border-edge dark:border-gray-700'}`}>
                <span className="text-3xl">{p.emoji as string}</span>
                <p className="text-xs font-bold mt-1">{p.nameAr as string}</p>
                <p className="text-[10px] text-text-secondary">{p.brand as string}</p>
                <p className="text-xs font-bold text-brand-600 mt-0.5">{formatCurrency(p.price as number)} ر.س</p>
                <p className="text-[10px] text-text-tertiary">⭐ {p.rating as number}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Comparison Table */}
      {cLoad ? <CardSkeleton /> : compared.length >= 2 ? (
        <Card padding="lg" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-right py-3 px-4 text-text-secondary font-semibold w-32">الميزة</th>
                {compared.map((p: Record<string,unknown>) => (
                  <th key={p.id as number} className="text-center py-3 px-4">
                    <span className="text-2xl block">{p.emoji as string}</span>
                    <span className="font-bold text-sm">{p.nameAr as string}</span>
                    <span className="text-xs text-text-secondary block">{p.brand as string}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t dark:border-gray-700">
                <td className="py-3 px-4 text-text-secondary font-semibold">💰 السعر</td>
                {compared.map((p: Record<string,unknown>) => (
                  <td key={p.id as number} className="text-center py-3 px-4 font-bold text-brand-600">{formatCurrency(p.price as number)} ر.س</td>
                ))}
              </tr>
              <tr className="border-t dark:border-gray-700">
                <td className="py-3 px-4 text-text-secondary font-semibold">⭐ التقييم</td>
                {compared.map((p: Record<string,unknown>) => (
                  <td key={p.id as number} className="text-center py-3 px-4">{p.rating as number}</td>
                ))}
              </tr>
              {dimensions.map((dim) => (
                <tr key={dim} className="border-t dark:border-gray-700">
                  <td className="py-3 px-4 text-text-secondary font-semibold">{DIM_LABELS[dim] ?? dim}</td>
                  {compared.map((p: Record<string,unknown>) => {
                    const features = p.features as Record<string,number>;
                    const val = features?.[dim] ?? 0;
                    return (
                      <td key={p.id as number} className="text-center py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="h-2 flex-1 max-w-[80px] rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className={`h-full rounded-full ${val >= 85 ? 'bg-green-500' : val >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${val}%` }} />
                          </div>
                          <span className="text-xs font-bold w-8">{val}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t dark:border-gray-700">
                <td className="py-3 px-4 text-text-secondary font-semibold">🐰 خالي من القسوة</td>
                {compared.map((p: Record<string,unknown>) => (
                  <td key={p.id as number} className="text-center py-3 px-4 text-lg">{p.crueltyFree ? '✅' : '❌'}</td>
                ))}
              </tr>
              <tr className="border-t dark:border-gray-700">
                <td className="py-3 px-4 text-text-secondary font-semibold">🌱 نباتي</td>
                {compared.map((p: Record<string,unknown>) => (
                  <td key={p.id as number} className="text-center py-3 px-4 text-lg">{p.vegan ? '✅' : '❌'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      ) : selected.length < 2 ? (
        <div className="text-center py-8 text-text-tertiary">اختر منتجين على الأقل للمقارنة</div>
      ) : null}
    </div>
  );
}
