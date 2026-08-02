'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

const OCCASION_LABELS: Record<string, string> = { wedding: 'زفاف 👰', birthday: 'عيد ميلاد 🎂', baby_shower: 'استقبال مولود 👶', other: 'أخرى 🎁' };

export default function GiftRegistryPage(): JSX.Element {
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.giftRegistry.myRegistries.useQuery() as any;
  const createMut = api.giftRegistry.create.useMutation({ onSuccess: () => { refetch(); setShowAdd(false); addToast('success', 'تم إنشاء سجل الهدايا'); } });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', occasion: 'wedding', targetAmount: '', serviceIds: '', message: '' });

  const registries = (data ?? []) as Array<Record<string, any>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎁 سجل الهدايا</h1>
          <Button onClick={() => setShowAdd(true)}>إنشاء سجل هدايا</Button>
        </div>
        <p className="text-sm text-gray-500">أنشئي سجل هدايا لمناسبتكِ الخاصة ودعي أحبائكِ يساهمون في خدمات التجميل اللي تحلمين فيها</p>

        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : registries.length === 0 ? <EmptyState title="لا توجد سجلات هدايا" description="أنشئي سجل هدايا لمناسبتكِ القادمة" /> : (
          <div className="grid gap-4 sm:grid-cols-2">{registries.map((r: Record<string, any>) => {
            const pct = r.targetAmount > 0 ? Math.min(100, (Number(r.raisedAmount) / Number(r.targetAmount)) * 100) : 0;
            return (
              <Card key={r.id} padding="lg">
                <div className="text-center">
                  <p className="text-3xl">{OCCASION_LABELS[r.occasion]?.split(' ')[1] || '🎁'}</p>
                  <h3 className="mt-2 text-lg font-bold">{r.title}</h3>
                  <p className="text-xs text-gray-500">{OCCASION_LABELS[r.occasion]?.split(' ')[0] || r.occasion}</p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm"><span>تم التجميع</span><span className="font-bold text-brand-600">{formatCurrency(Number(r.raisedAmount))}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>المستهدف</span><span>{formatCurrency(Number(r.targetAmount))}</span></div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} /></div>
                  <p className="mt-1 text-center text-xs text-gray-400">{pct.toFixed(0)}%</p>
                </div>
                {r.message && <p className="mt-3 text-center text-sm italic text-gray-500">&ldquo;{r.message}&rdquo;</p>}
              </Card>
            );
          })}</div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdd(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold">سجل هدايا جديد</h3>
              <div className="space-y-3">
                <Input placeholder="العنوان (مثال: زفافي، عيد ميلادي)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800">
                  <option value="wedding">زفاف 👰</option><option value="birthday">عيد ميلاد 🎂</option><option value="baby_shower">استقبال مولود 👶</option><option value="other">أخرى 🎁</option>
                </select>
                <Input type="number" placeholder="المبلغ المستهدف (ر.س)" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
                <Input placeholder="معرفات الخدمات (مفصولة بفواصل)" value={form.serviceIds} onChange={(e) => setForm({ ...form, serviceIds: e.target.value })} />
                <Input placeholder="رسالة للضيوف (اختياري)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <Button onClick={() => createMut.mutate({ title: form.title, occasion: form.occasion as 'wedding' | 'birthday' | 'baby_shower' | 'other', targetAmount: Number(form.targetAmount), serviceIds: form.serviceIds.split(',').map(Number).filter(n => n > 0), message: form.message || undefined })} loading={createMut.isPending} className="w-full">إنشاء</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
