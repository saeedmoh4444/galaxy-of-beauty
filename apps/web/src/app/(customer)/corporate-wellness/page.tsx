'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CorporateWellnessPage(): JSX.Element {
  const { data: plans, isLoading } = api.corporateWellness.plans.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: enquiries } = api.corporateWellness.myEnquiries.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const enquireMut = api.corporateWellness.enquire.useMutation();
  const [companyName, setCompanyName] = useState(''); const [contactName, setContactName] = useState(''); const [email, setEmail] = useState(''); const [planId, setPlanId] = useState('growth');
  const [submitted, setSubmitted] = useState(false);

  const handleEnquire = () => {
    if (!companyName.trim() || !contactName.trim() || !email.trim()) return;
    enquireMut.mutate({ companyName: companyName.trim(), contactName: contactName.trim(), email: email.trim(), planId }, { onSuccess: () => { setSubmitted(true); setCompanyName(''); setContactName(''); setEmail(''); } });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">🏢 عافية الشركات</h1><p className="mt-1 text-sm text-gray-500">باقات تجميل وعناية لمنسوبات الشركات</p></div>

        {isLoading ? <div className="grid gap-6 lg:grid-cols-3">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          <div className="grid gap-6 lg:grid-cols-3">{(plans??[]).map((p: Record<string,unknown>) => (
            <Card key={p.id as string} padding="lg" className={`text-center ${planId===p.id?'ring-2 ring-brand-400':''}`}>
              <span className="text-5xl">{p.emoji as string}</span>
              <h2 className="text-xl font-bold mt-2">{p.nameAr as string}</h2>
              <p className="text-2xl font-extrabold mt-1">{formatCurrency(p.price as number)}<span className="text-sm font-normal text-gray-500"> / شهرياً</span></p>
              <p className="text-sm text-gray-500 mt-1">حتى {p.employees as number} موظفة</p>
              <div className="mt-4 space-y-1 text-sm text-right">
                {(p.services as string[]).map((s,i)=><p key={i} className="text-green-600">✓ {s}</p>)}
              </div>
              <Button size="sm" variant={planId===p.id?'primary':'outline'} onClick={()=>setPlanId(p.id as string)} className="mt-4 w-full">{planId===p.id?'✅ تم الاختيار':'اختيار'}</Button>
            </Card>
          ))}</div>
        }

        {submitted && <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50"><p className="font-bold text-green-700">✅ تم استلام طلبكِ وسنتواصل معكِ خلال ٢٤ ساعة</p></Card>}

        <Card padding="lg"><h3 className="font-bold mb-4">📝 تقديم طلب</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="اسم الشركة" className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="اسم المسؤولة" className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد الإلكتروني" type="email" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <Button onClick={handleEnquire} loading={enquireMut.isPending} className="w-full mt-3">📩 تقديم الطلب — {formatCurrency((plans??[]).find(p=>p.id===planId)?.price as number??0)} / شهرياً</Button>
        </Card>

        {(enquiries??[]).length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📋 طلباتي السابقة</h3><div className="space-y-2">{(enquiries??[]).map((e: Record<string,unknown>, i: number) => <div key={i} className="text-sm flex justify-between"><span>{e.companyName as string} — {e.planId as string}</span><span className="text-gray-400">{new Date(e.createdAt as string).toLocaleDateString('ar-SA')}</span></div>)}</div></Card>}
      </div>
    </DashboardLayout>
  );
}
