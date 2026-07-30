'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, Modal, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function GiftCardMarketPage(): JSX.Element {
  const { data: listings, refetch } = api.giftCardMarket.listings.useQuery() as { data: Array<Record<string,unknown>> | undefined; refetch: () => void };
  const listMut = api.giftCardMarket.list.useMutation({ onSuccess: () => { setShow(false); refetch(); } });
  const buyMut = api.giftCardMarket.buy.useMutation({ onSuccess: () => refetch() });

  const [show, setShow] = useState(false); const [value, setValue] = useState(300); const [sprice, setSprice] = useState(240);
  const items = listings ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">💳 سوق البطاقات</h1><p className="mt-1 text-sm text-gray-500">اشتري وببيعي بطاقات الهدايا</p></div><Button onClick={() => setShow(true)}>بيع بطاقة</Button></div>
        {items.length === 0 ? <Card padding="lg"><p className="text-center text-gray-400">لا توجد بطاقات حالياً</p></Card> :
          <div className="grid gap-4 sm:grid-cols-2">{items.map((l: Record<string,unknown>) => (
            <Card key={l.id as number} padding="lg" className="text-center">
              <span className="text-4xl">🎁</span><p className="font-bold mt-2">بطاقة {formatCurrency(l.value as number)}</p>
              <div className="flex items-center justify-center gap-2 mt-1"><span className="text-gray-400 line-through text-sm">{formatCurrency(l.value as number)}</span><span className="text-2xl font-extrabold text-brand-600">{formatCurrency(l.sellingPrice as number)}</span></div>
              <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-bold text-green-700">وفر {l.discount as number}%</span>
              <p className="text-xs text-gray-500 mt-2">{l.sellerName as string} · {l.createdAt as string}</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => buyMut.mutate({ listingId: l.id as number })}>💳 شراء</Button>
            </Card>
          ))}</div>
        }
        <Modal open={show} onClose={() => setShow(false)} title="بيع بطاقة"><div className="space-y-3">
          <div><label className="text-sm">قيمة البطاقة: {formatCurrency(value)}</label><input type="range" min={50} max={1000} step={50} value={value} onChange={(e) => { setValue(parseInt(e.target.value)); setSprice(Math.round(parseInt(e.target.value) * 0.8)); }} className="w-full accent-brand-600" /></div>
          <div><label className="text-sm">سعر البيع: {formatCurrency(sprice)} (خصم {Math.round(((value - sprice) / value) * 100)}%)</label><input type="range" min={10} max={value} step={10} value={sprice} onChange={(e) => setSprice(parseInt(e.target.value))} className="w-full accent-brand-600" /></div>
          <Button onClick={() => listMut.mutate({ value, sellingPrice: sprice })} loading={listMut.isPending} className="w-full">💳 عرض البطاقة</Button>
        </div></Modal>
      </div>
    </DashboardLayout>
  );
}
