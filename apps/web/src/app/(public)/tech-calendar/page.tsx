'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button } from '@galaxy/shared';
import Link from 'next/link';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS = ['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];

export default function TechCalendarPage(): JSX.Element {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year] = useState(today.getFullYear());
  const [techId, setTechId] = useState('1');

  const { data: technicians, isLoading: tLoad } = api.techCalendar.listWithAvailability.useQuery() as {
    data: Array<Record<string,unknown>> | undefined; isLoading: boolean;
  };

  const { data: calData, isLoading, isError, refetch } = api.techCalendar.slots.useQuery(
    { technicianId: parseInt(techId, 10) || 1, month, year },
    { enabled: !!techId },
  ) as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const techs = technicians ?? [];
  const availableDates = (calData?.availableDates as Array<Record<string,unknown>>) ?? [];
  const techName = (calData?.technicianName as string) ?? '';
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const dateSet = new Set(availableDates.map((d) => d.date as string));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">📅</span>
        <h1 className="mt-4 text-3xl font-bold">تقويم المواعيد</h1>
        <p className="mt-2 text-text-secondary">تصفّحي المواعيد المتاحة للفنيات واحجزي مباشرة</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(month === 1 ? 12 : month - 1)} className="text-xl">◀</button>
            <h3 className="text-lg font-bold">{MONTHS[month - 1]} {year}</h3>
            <button onClick={() => setMonth(month === 12 ? 1 : month + 1)} className="text-xl">▶</button>
          </div>

          {isLoading ? <CardSkeleton /> :
           isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => <div key={d} className="text-xs font-semibold text-text-tertiary py-1">{d}</div>)}
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                const available = dateSet.has(dateStr);
                const isToday = i + 1 === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                return (
                  <div key={i} className={`rounded-lg py-2 text-sm transition-all ${
                    available ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold cursor-pointer hover:bg-green-200' :
                    isToday ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 font-semibold' :
                    'text-text-tertiary'
                  }`}>
                    {i + 1}
                    {available && <span className="block text-[9px]">●</span>}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Technician List */}
        <Card padding="lg">
          <h3 className="font-bold mb-3">👩‍🎨 الفنيات</h3>
          {tLoad ? <CardSkeleton /> : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {techs.map((t: Record<string,unknown>) => (
                <button key={t.id as number} onClick={() => setTechId(String(t.id))} className={`w-full text-right rounded-lg p-3 transition-all flex items-center gap-3 ${String(t.id) === techId ? 'bg-brand-50 dark:bg-brand-950 ring-2 ring-brand-300' : 'hover:bg-surface-muted dark:hover:bg-gray-800'}`}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-white text-sm font-bold">{(t.name as string)?.[0] ?? '👩'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.name as string}</p>
                    <p className="text-xs text-text-secondary">⭐ {t.rating as number}</p>
                  </div>
                  {String(t.id) === techId && <span className="text-brand-500 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {techName && (
        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">👩‍🎨 {techName} · {availableDates.length} يوم متاح هذا الشهر</p>
          <Link href="/bookings/create" className="mt-3 inline-block"><Button size="sm">احجزي الآن ←</Button></Link>
        </div>
      )}
    </div>
  );
}
