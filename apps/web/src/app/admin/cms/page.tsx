'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminCmsPage(): JSX.Element {
  const { data: categories, isLoading: catLoading } = api.cms.listCategories.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const { data: services, isLoading: svcLoading } = api.cms.listServices.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };
  const [tab, setTab] = useState<'categories' | 'services'>('categories');

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-6xl space-y-6">
        <div><h1 className="text-2xl font-bold">📝 إدارة المحتوى</h1><p className="mt-1 text-sm text-text-secondary">إدارة الفئات والخدمات</p></div>

        <div className="flex gap-2">
          <button onClick={() => setTab('categories')} className={`rounded-lg px-4 py-2 text-sm ${tab==='categories'?'bg-brand-600 text-white':'bg-surface-muted'}`}>📂 الفئات</button>
          <button onClick={() => setTab('services')} className={`rounded-lg px-4 py-2 text-sm ${tab==='services'?'bg-brand-600 text-white':'bg-surface-muted'}`}>💅 الخدمات</button>
        </div>

        {tab === 'categories' && (
          catLoading ? <CardSkeleton/> :
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(categories??[]).map((c: Record<string,unknown>) => (
            <Card key={c.id as number} padding="md">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.imageUrl ? '🖼' : '📂'}</span>
                <div><p className="font-bold">{(c.nameJson as Record<string,string>)?.ar}</p><p className="text-xs text-text-secondary">{c.slug as string} · {(c._count as Record<string,number>)?.services ?? 0} خدمة</p></div>
              </div>
            </Card>
          ))}</div>
        )}

        {tab === 'services' && (
          svcLoading ? <CardSkeleton/> :
          <div className="space-y-2">{(services??[]).map((s: Record<string,unknown>) => (
            <Card key={s.id as number} padding="md">
              <div className="flex items-center justify-between">
                <div><p className="font-bold">{(s.titleJson as Record<string,string>)?.ar}</p><p className="text-xs text-text-secondary">{((s.category as Record<string,unknown>)?.nameJson as Record<string,string>)?.ar ?? ''} · {s.durationMin as number} دقيقة</p></div>
                <span className="font-bold text-brand-600">{Number(s.basePrice ?? 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
            </Card>
          ))}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
