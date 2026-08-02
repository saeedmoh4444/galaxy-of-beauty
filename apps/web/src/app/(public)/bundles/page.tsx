'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { CardSkeleton, Button, formatCurrency, ar } from '@galaxy/shared';
const BUNDLE_DISCOUNTS: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };

export default function BundlesPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading } = api.categories.list.useQuery() as any;
  const services = (data ?? []) as Array<Record<string, any>>;
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : (next.size < 5 && next.add(id));
      return next;
    });
  };

  const count = selected.size;
  const discount = BUNDLE_DISCOUNTS[count] || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📦 اصنعي باقتكِ</h1>
        <p className="mt-2 text-gray-500">اختاري ٢-٥ خدمات واحصلي على خصم تلقائي</p>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {[2, 3, 4, 5].map(n => (
          <div key={n} className={`rounded-full px-4 py-1.5 text-xs font-bold ${count >= n ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            {n}+ خدمات = -{BUNDLE_DISCOUNTS[n]}%
          </div>
        ))}
      </div>

      {count > 0 && (
        <div className="mb-6 text-center">
          <p className="text-lg"><span className="text-gray-500">عدد الخدمات: </span><span className="font-bold">{count}</span> · <span className="text-gray-500">الخصم: </span><span className="font-bold text-green-600">-{discount}%</span></p>
        </div>
      )}

      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 9 }, (_, i) => <CardSkeleton key={i} />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.flatMap((cat: Record<string, any>) => {
            const children = (cat.children as Array<Record<string, any>>) || [];
            return [...(cat.services ? [{ ...cat, _isCat: true }] : []), ...children.flatMap((child: Record<string, any>) => child.services || [])];
          }).slice(0, 30).map((svc: Record<string, any>) => svc._isCat ? null : (
            <button key={svc.id} onClick={() => toggle(svc.id)} className={`text-right rounded-2xl border-2 p-4 transition-all ${selected.has(svc.id) ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{ar(svc.titleJson)}</p>
                  <p className="text-sm text-gray-500">{svc.durationMin} دقيقة</p>
                  <p className="mt-1 font-bold text-brand-600">{formatCurrency(Number(svc.basePrice))}</p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selected.has(svc.id) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`}>
                  {selected.has(svc.id) && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {count >= 2 && (
        <div className="mt-8 text-center">
          <Link href={`/bookings/create?serviceIds=${[...selected].join(',')}`}>
            <Button size="lg">✨ احجزي باقتكِ بخصم {discount}%</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
