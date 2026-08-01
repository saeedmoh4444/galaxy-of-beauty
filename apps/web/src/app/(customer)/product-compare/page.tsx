'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const DIM_LABELS: Record<string,string> = { hydration: '💧 ترطيب', absorption: '🧽 امتصاص', value: '💰 قيمة', gentle: '🌿 لطف' };

export default function ProductComparePage(): JSX.Element {
  const { data: products, isLoading } = api.productCompare.list.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => { if (selected.includes(id)) setSelected(selected.filter(x => x !== id)); else if (selected.length < 4) setSelected([...selected, id]); };
  const { data: comparison, isLoading: compLoading } = api.productCompare.compare.useQuery(
    { ids: selected },
    { enabled: selected.length >= 2 },
  ) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const compProducts = (comparison?.products as Array<Record<string,unknown>>) ?? [];
  const dimensions = (comparison?.dimensions as string[]) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">🔍 مقارنة المنتجات</h1><p className="mt-1 text-sm text-gray-500">قارني بين منتجات التجميل (اختاري ٢-٤)</p></div>

        {isLoading ? <div className="grid gap-4 sm:grid-cols-2">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
          <Card padding="lg"><h3 className="font-bold mb-3">🧴 اختر المنتجات للمقارنة ({selected.length}/4)</h3>
            <div className="grid gap-3 sm:grid-cols-2">{products?.map((p: Record<string,unknown>) => {
              const isSel = selected.includes(p.id as number);
              return (
                <button key={p.id as number} onClick={() => toggle(p.id as number)} className={`rounded-xl border-2 p-3 text-right transition-all ${isSel ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.emoji as string}</span>
                    <div><p className="font-bold">{p.nameAr as string}</p><p className="text-xs text-gray-500">{p.brand as string} · ⭐{p.rating as number} · {formatCurrency(p.price as number)}</p></div>
                    {isSel && <span className="mr-auto text-brand-600">✅</span>}
                  </div>
                </button>
              );
            })}</div>
          </Card>
        }

        {selected.length >= 2 && compLoading ? <CardSkeleton/> : compProducts.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">📊 المقارنة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr>
                  <th className="text-right p-2">الميزة</th>
                  {compProducts.map((p: Record<string,unknown>) => <th key={p.id as number} className="p-2 text-center"><span className="text-2xl block">{p.emoji as string}</span><span className="text-xs">{p.nameAr as string}</span></th>)}
                </tr></thead>
                <tbody>
                  <tr className="border-t"><td className="p-2 text-gray-600">💰 السعر</td>{compProducts.map((p: Record<string,unknown>) => <td key={p.id as number} className="p-2 text-center font-bold">{formatCurrency(p.price as number)}</td>)}</tr>
                  <tr className="border-t"><td className="p-2 text-gray-600">⭐ التقييم</td>{compProducts.map((p: Record<string,unknown>) => <td key={p.id as number} className="p-2 text-center">{p.rating as number}</td>)}</tr>
                  <tr className="border-t"><td className="p-2 text-gray-600">🏷 الماركة</td>{compProducts.map((p: Record<string,unknown>) => <td key={p.id as number} className="p-2 text-center">{p.brand as string}</td>)}</tr>
                  {dimensions.map(dim => (
                    <tr key={dim} className="border-t"><td className="p-2 text-gray-600">{DIM_LABELS[dim] ?? dim}</td>
                      {compProducts.map((p: Record<string,unknown>) => {
                        const features = p.features as Record<string,number>;
                        const val = features?.[dim] ?? 0;
                        return <td key={p.id as number} className="p-2 text-center"><div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-brand-600 rounded-full" style={{width:`${val}%`}}/></div><span className="text-xs">{val}%</span></td>;
                      })}
                    </tr>
                  ))}
                  <tr className="border-t"><td className="p-2 text-gray-600">🐰 خال من القسوة</td>{compProducts.map((p: Record<string,unknown>) => <td key={p.id as number} className="p-2 text-center">{p.crueltyFree ? '✅' : '❌'}</td>)}</tr>
                  <tr className="border-t"><td className="p-2 text-gray-600">🌱 نباتي</td>{compProducts.map((p: Record<string,unknown>) => <td key={p.id as number} className="p-2 text-center">{p.vegan ? '✅' : '❌'}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
