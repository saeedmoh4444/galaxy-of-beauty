'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechOnboardingPage(): JSX.Element {
  const { data, refetch } = api.techOnboarding.steps.useQuery() as { data: Record<string,unknown> | undefined; refetch: () => void };
  const submitMut = api.techOnboarding.submitDoc.useMutation({ onSuccess: () => { setShow(false); refetch(); } });
  const [show, setShow] = useState(false); const [stepKey, setStepKey] = useState(''); const [url, setUrl] = useState('');

  const steps = (data?.steps ?? []) as Array<Record<string,unknown>>;
  const completed = (data?.completed as number) ?? 0;
  const total = (data?.total as number) ?? 5;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6">
        <div><h1 className="text-2xl font-bold">📋 التسجيل كفنية</h1><p className="mt-1 text-sm text-text-secondary">أكملي الخطوات لتصبحي فنية معتمدة</p></div>
        <Card padding="lg">
          <div className="mb-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-2 rounded-full bg-brand-500" style={{ width: `${(completed / total) * 100}%` }} /></div>
          <p className="text-sm text-center mb-4">{completed}/{total} مكتملة</p>
          <div className="space-y-3">{steps.map((s: Record<string,unknown>) => (
            <div key={s.key as string} className={`flex items-center gap-3 rounded-lg p-3 ${s.completed ? 'bg-green-50 dark:bg-green-950' : 'bg-surface-muted dark:bg-gray-800'}`}>
              <span className="text-2xl">{s.emoji as string}</span><div className="flex-1"><p className="font-bold text-sm">{s.nameAr as string}</p><p className="text-xs text-text-secondary">{s.desc as string}</p></div>
              {s.completed ? <span className="text-green-600">✅</span> : <Button size="sm" variant="ghost" onClick={() => { setStepKey(s.key as string); setShow(true); }}>رفع</Button>}
            </div>
          ))}</div>
        </Card>
        <Modal open={show} onClose={() => setShow(false)} title="رفع مستند"><div className="space-y-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="رابط المستند" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <Button onClick={() => { if (url) submitMut.mutate({ stepKey, documentUrl: url }); }} loading={submitMut.isPending} className="w-full">رفع</Button>
        </div></Modal>
      </div>
    </DashboardLayout>
  );
}
