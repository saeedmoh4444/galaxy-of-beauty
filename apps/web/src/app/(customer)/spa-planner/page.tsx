/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SpaPlannerPage(): JSX.Element {
  const { data: services } = api.spaPlanner.services.useQuery() as any;
  const { data: breaks } = api.spaPlanner.breaks.useQuery() as any;
  const { data: myPlans } = api.spaPlanner.myPlans.useQuery() as any;
  const createMut = api.spaPlanner.create.useMutation() as any;

  const [name, setName] = useState('');
  const [selectedSvcs, setSelectedSvcs] = useState<number[]>([]);
  const [selectedBreaks, setSelectedBreaks] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string,unknown> | null>(null);

  const toggleSvc = (id: number) => setSelectedSvcs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleBreak = (id: string) => setSelectedBreaks((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const svcs = (services ?? []) as Array<Record<string,unknown>>;
  const brks = (breaks ?? []) as Array<Record<string,unknown>>;
  const plans = (myPlans ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">🕯️ مخطط يوم سبا</h1><p className="mt-1 text-sm text-text-secondary">خططي ليوم سبا متكامل مع خدمات واستراحات</p></div>

        {result ? (
          <Card padding="lg" className="text-center border-2 border-green-300">
            <span className="text-6xl">🧖‍♀️</span>
            <h2 className="mt-4 text-xl font-bold">تم تخطيط يومكِ!</h2>
            <p className="text-2xl font-extrabold text-brand-600 mt-2">{(result.totalMin as number)} دقيقة · {formatCurrency(result.totalPrice as number)} ر.س</p>
            <div className="mt-4 space-y-2">{(result.items as Array<Record<string,unknown>>)?.map((i: Record<string,unknown>, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm"><span>{i.emoji as string}</span><span>{i.nameAr as string}</span><span className="text-text-tertiary">{i.durationMin as number}د</span></div>
            ))}</div>
            <Button className="mt-4" onClick={() => setResult(null)}>🔄 تخطيط جديد</Button>
          </Card>
        ) : (
          <>
            <Card padding="lg"><h3 className="font-bold mb-3">💆‍♀️ اختاري الخدمات</h3><div className="grid gap-2 sm:grid-cols-2">{svcs.map((s: Record<string,unknown>) => (
              <button key={s.id as number} onClick={() => toggleSvc(s.id as number)} className={`rounded-xl border-2 p-3 text-right transition-all ${selectedSvcs.includes(s.id as number) ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className="text-2xl">{s.emoji as string}</span><span className="font-bold text-sm mr-2">{s.nameAr as string}</span><span className="text-xs text-text-secondary mr-2">{s.durationMin as number}د · {formatCurrency(s.price as number)} ر.س</span>
              </button>
            ))}</div></Card>

            <Card padding="lg"><h3 className="font-bold mb-3">☕ استراحات</h3><div className="flex flex-wrap gap-2">{brks.map((b: Record<string,unknown>) => (
              <button key={b.id as string} onClick={() => toggleBreak(b.id as string)} className={`rounded-full px-4 py-2 text-sm ${selectedBreaks.includes(b.id as string) ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}>{b.emoji as string} {b.nameAr as string}</button>
            ))}</div></Card>

            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الخطة..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
              <Button onClick={() => { if (name.trim() && selectedSvcs.length > 0) createMut.mutate({ name: name.trim(), serviceIds: selectedSvcs, breakIds: selectedBreaks }, { onSuccess: (d: any) => setResult(d) }); }} loading={createMut.isPending}>🕯️ خططي يومي</Button>
            </div>
          </>
        )}

        {plans.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📋 خططي السابقة</h3><div className="space-y-2">{plans.map((p: Record<string,unknown>) => <div key={p.id as number} className="flex justify-between text-sm"><span className="font-bold">{p.name as string}</span><span className="text-text-secondary">{new Date(p.createdAt as string).toLocaleDateString('ar-SA')}</span></div>)}</div></Card>}
      </div>
    </DashboardLayout>
  );
}
