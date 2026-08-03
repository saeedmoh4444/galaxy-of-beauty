'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, Modal, formatCurrency } from '@galaxy/shared';

export default function CorporateWellnessPage(): JSX.Element {
  const { data: plans, isLoading } = api.corporateWellness.plans.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const enquireMut = api.corporateWellness.enquire.useMutation();
  const [show, setShow] = useState(false); const [company, setCompany] = useState(''); const [contact, setContact] = useState(''); const [email, setEmail] = useState(''); const [planId, setPlanId] = useState('starter'); const [done, setDone] = useState(false);

  const list = (plans ?? []) as Array<Record<string,unknown>>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">🏢</span><h1 className="mt-4 text-3xl font-bold">برنامج الشركات</h1><p className="mt-2 text-text-secondary">باقات تجميل وعناية لمنسوبات الشركات</p></div>
      {isLoading ? <div className="grid gap-6 lg:grid-cols-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <div className="grid gap-6 lg:grid-cols-3">{list.map((p: Record<string,unknown>) => (
          <Card key={p.id as string} padding="lg" className="text-center hover:shadow-xl transition-all">
            <span className="text-5xl">{p.emoji as string}</span><h3 className="mt-2 text-xl font-bold">{p.nameAr as string}</h3>
            <p className="text-3xl font-extrabold text-brand-600 mt-3">{formatCurrency(p.price as number)} ر.س<span className="text-sm text-text-tertiary font-normal"> / شهرياً</span></p>
            <p className="text-sm text-text-secondary mt-2">حتى {(p.employees as number)} موظفة</p>
            <div className="mt-3 space-y-1">{(p.services as string[]).map((s: string) => <p key={s} className="text-xs">✓ {s}</p>)}</div>
            <Button className="mt-4 w-full" onClick={() => { setPlanId(p.id as string); setShow(true); }}>اطلبي الآن</Button>
          </Card>
        ))}</div>
      }
      {done ? <Card padding="lg" className="mt-6 text-center border-2 border-green-300"><span className="text-5xl">✅</span><p className="text-xl font-bold mt-2">تم استلام طلبكِ</p><p className="text-text-secondary">سنتواصل معكِ خلال ٢٤ ساعة</p></Card> : null}
      <Modal open={show} onClose={() => setShow(false)} title="طلب برنامج شركات"><div className="space-y-3">
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="اسم الشركة" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="اسم المسؤول" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <Button onClick={() => { if (company && contact && email) enquireMut.mutate({ companyName: company, contactName: contact, email, planId }, { onSuccess: () => { setShow(false); setDone(true); } }); }} loading={enquireMut.isPending} className="w-full">إرسال</Button>
      </div></Modal>
    </div>
  );
}
