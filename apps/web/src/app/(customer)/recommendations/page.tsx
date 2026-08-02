'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const POPULAR_SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅' }, { id: 2, name: 'باديكير', emoji: '🦶' },
  { id: 3, name: 'تنظيف بشرة', emoji: '✨' }, { id: 4, name: 'مساج', emoji: '💆‍♀️' },
  { id: 5, name: 'صبغ شعر', emoji: '🎨' }, { id: 6, name: 'مكياج', emoji: '💄' },
];

export default function RecommendationsPage(): JSX.Element {
  const [serviceId, setServiceId] = useState(1);
  const { data: together, isLoading: tLoading } = api.recommendations.frequentlyBookedTogether.useQuery({ serviceId, limit: 4 }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: complete, isLoading: cLoading } = api.recommendations.completeTheLook.useQuery({ serviceId, limit: 4 }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🔮 توصيات</h1><p className="mt-1 text-sm text-gray-500">اكتشفي خدمات تناسب ذوقكِ</p></div>

        <Card padding="lg"><h3 className="font-bold mb-3">💅 اختاري خدمة</h3>
          <div className="flex flex-wrap gap-2">{POPULAR_SERVICES.map(s => (
            <button key={s.id} onClick={()=>setServiceId(s.id)} className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId===s.id?'bg-brand-600 text-white':'bg-gray-100'}`}>{s.emoji} {s.name}</button>
          ))}</div>
        </Card>

        <Card padding="lg"><h3 className="font-bold mb-4">🔗 تحجز مع بعض</h3>
          {tLoading ? <CardSkeleton/> : !(together??[]).length ? <p className="text-sm text-gray-400">لا توجد توصيات حالياً</p> :
            <div className="grid gap-3 sm:grid-cols-2">{(together??[]).map((s: Record<string,unknown>) => (
              <div key={s.id as number} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-bold text-sm">{s.title as string}</p><p className="text-xs text-gray-500">{formatCurrency(s.basePrice as number)}</p></div>
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">{s.bookedTogether as number}x</span>
              </div>
            ))}</div>
          }
        </Card>

        <Card padding="lg"><h3 className="font-bold mb-4">✨ كملي الطلة</h3>
          {cLoading ? <CardSkeleton/> : !(complete??[]).length ? <p className="text-sm text-gray-400">لا توجد توصيات حالياً</p> :
            <div className="grid gap-3 sm:grid-cols-2">{(complete??[]).map((s: Record<string,unknown>) => (
              <div key={s.id as number} className="rounded-lg border p-3">
                <p className="font-bold text-sm">{s.title as string}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(s.basePrice as number)} · {s.durationMin as number} دقيقة</p>
                {s.reason === 'popular' && <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">🔥 الأكثر طلباً</span>}
              </div>
            ))}</div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
}
