'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, Modal } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ClinicConnectPage(): JSX.Element {
  const { data: clinics } = api.clinicConnect.clinics.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: referrals } = api.clinicConnect.myReferrals.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const referMut = api.clinicConnect.refer.useMutation();
  const [show, setShow] = useState(false); const [clinicId, setClinicId] = useState(0); const [reason, setReason] = useState(''); const [urgency, setUrgency] = useState<'routine'|'urgent'|'emergency'>('routine');

  const list = (clinics ?? []) as Array<Record<string,unknown>>;
  const refs = (referrals ?? []) as Array<Record<string,unknown>>;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🏥 Clinic Connect</h1><p className="mt-1 text-sm text-gray-500">إحالة طبية من فنيات التجميل للعيادات المتخصصة</p></div>
        <Card padding="lg"><h3 className="font-bold mb-3">🏥 العيادات المتخصصة</h3>
          <div className="space-y-3">{list.map((c: Record<string,unknown>) => (
            <div key={c.id as number} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
              <div className="flex items-center gap-3"><span className="text-3xl">{c.emoji as string}</span><div><p className="font-bold">{c.name as string}</p><p className="text-xs text-gray-500">📍 {c.city as string} · {c.specialty as string} · ⭐ {c.rating as number}</p></div></div>
              <Button size="sm" onClick={() => { setClinicId(c.id as number); setShow(true); }}>إحالة</Button>
            </div>
          ))}</div>
        </Card>
        {refs.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📋 إحالاتي</h3><div className="space-y-2">{refs.map((r: Record<string,unknown>) => <div key={r.id as number} className="flex justify-between text-sm"><span className="font-bold">{r.reason as string}</span><span className={`rounded-full px-2 py-0.5 text-xs ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{r.status === 'PENDING' ? 'معلقة' : 'مكتملة'}</span></div>)}</div></Card>}
        <Modal open={show} onClose={() => setShow(false)} title="إحالة طبية"><div className="space-y-3">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب الإحالة..." className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" rows={3} />
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as 'routine'|'urgent'|'emergency')} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">{['routine','urgent','emergency'].map((u) => <option key={u} value={u}>{u === 'routine' ? 'روتيني' : u === 'urgent' ? 'عاجل' : 'طوارئ'}</option>)}</select>
          <Button onClick={() => { if (reason.trim()) referMut.mutate({ clinicId, reason: reason.trim(), urgency }, { onSuccess: () => setShow(false) }); }} loading={referMut.isPending} className="w-full">إرسال</Button>
        </div></Modal>
      </div>
    </DashboardLayout>
  );
}
