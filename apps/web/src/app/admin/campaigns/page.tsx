'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/shared';
import { useState } from 'react';

export default function AdminCampaignsPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.campaigns.listAll.useQuery() as any;
  const campaigns = (data ?? []) as Array<Record<string, any>>;
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', discountType: 'percent', discountValue: 20, promoCode: '', startsAt: '', endsAt: '' });
  const createMut = api.campaigns.create.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">📢 الحملات</h1><Button onClick={() => setShowCreate(true)}>إضافة حملة</Button></div>
      {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : campaigns.length === 0 ? <EmptyState title="لا توجد حملات" /> : (
        <div className="space-y-3">{campaigns.map((c: Record<string, any>) => <Card key={c.id} padding="md"><div className="flex items-center justify-between"><div><h3 className="font-bold">{((c.nameJson as Record<string,string>)?.ar)}</h3><p className="text-sm text-gray-500">{c.discountType === 'percent' ? `-${c.discountValue}%` : `-${c.discountValue} ر.س`}</p></div><span className={`rounded px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.isActive ? 'نشط' : 'غير نشط'}</span></div></Card>)}</div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إضافة حملة جديدة">
        <div className="space-y-3">
          <Input label="الاسم (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input label="الاسم (إنجليزي)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <Input label="قيمة الخصم" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
          <Input label="كود الخصم" value={form.promoCode} onChange={(e) => setForm({ ...form, promoCode: e.target.value })} />
          <Input label="يبدأ من" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          <Input label="ينتهي في" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          <Button onClick={() => createMut.mutate({ ...form, discountValue: Number(form.discountValue), startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() })} loading={createMut.isPending}>حفظ</Button>
        </div>
      </Modal>
    </div>
  );
}
