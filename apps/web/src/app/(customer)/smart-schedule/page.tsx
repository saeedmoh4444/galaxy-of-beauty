'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button , ErrorAlert } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const POPULAR_SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅' }, { id: 2, name: 'باديكير', emoji: '🦶' },
  { id: 3, name: 'تنظيف بشرة', emoji: '✨' }, { id: 4, name: 'مساج', emoji: '💆‍♀️' },
  { id: 5, name: 'صبغ شعر', emoji: '🎨' }, { id: 6, name: 'مكياج', emoji: '💄' },
];

export default function SmartSchedulePage(): JSX.Element {
  const [serviceId, setServiceId] = useState(1);
  const [datePref, setDatePref] = useState('');
  const { data, isLoading } = api.aiFeatures.smartSchedule.useQuery(
    { serviceId, datePreference: datePref || undefined },
    { enabled: !!serviceId },
  ) as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const suggestions = (data?.suggestions as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🤖 جدولة ذكية</h1><p className="mt-1 text-sm text-gray-500">أفضل المواعيد حسب توفر الفنيات وتقييماتهن</p></div>

        <Card padding="lg"><h3 className="font-bold mb-3">💅 اختاري الخدمة</h3>
          <div className="flex flex-wrap gap-2 mb-3">{POPULAR_SERVICES.map(s => (
            <button key={s.id} onClick={() => setServiceId(s.id)} className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId===s.id?'bg-brand-600 text-white':'bg-gray-100'}`}>{s.emoji} {s.name}</button>
          ))}</div>
          <input type="date" value={datePref} onChange={e => setDatePref(e.target.value)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" placeholder="اختياري — تاريخ مفضل" />
        </Card>

        {isLoading ? <CardSkeleton/> :
          suggestions.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">📅</p><p className="text-gray-500">لا توجد مواعيد متاحة حالياً — جربي خدمة ثانية أو تاريخ مختلف</p></Card> :
          <Card padding="lg"><h3 className="font-bold mb-4">📅 أفضل {suggestions.length} مواعيد</h3>
            <div className="space-y-2">{suggestions.map((s: Record<string,unknown>, i: number) => {
              const start = new Date(s.startAt as string);
              const end = new Date(s.endAt as string);
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👩‍🎨</span>
                    <div>
                      <p className="font-bold text-sm">فنية #{s.technicianId as number}</p>
                      <p className="text-xs text-gray-500">
                        {start.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                        {' · '}
                        {start.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {end.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-500">⭐{s.rating as number}</span>
                    <Button size="sm" className="mt-1 block">احجز</Button>
                  </div>
                </div>
              );
            })}</div>
          </Card>
        }
      </div>
    </DashboardLayout>
  );
}
