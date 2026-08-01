'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const POPULAR_SERVICES = [
  { id: 1, name: 'مانيكير', emoji: '💅' }, { id: 2, name: 'باديكير', emoji: '🦶' },
  { id: 3, name: 'تنظيف بشرة', emoji: '✨' }, { id: 4, name: 'مساج', emoji: '💆‍♀️' },
  { id: 5, name: 'صبغ شعر', emoji: '🎨' }, { id: 6, name: 'مكياج', emoji: '💄' },
];

export default function EmergencyBookingPage(): JSX.Element {
  const [serviceId, setServiceId] = useState(1);
  const { data: avail, isLoading } = api.emergencyBooking.checkAvailability.useQuery({ serviceId }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const createMut = api.emergencyBooking.create.useMutation();
  const [selectedTech, setSelectedTech] = useState<number | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const available = (avail?.available as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🚨 حجز طارئ</h1><p className="mt-1 text-sm text-gray-500">حجز فوري خلال ٣ ساعات مع رسوم إضافية</p></div>

        <Card padding="lg" className="border-2 border-red-300 bg-red-50">
          <div className="flex items-center gap-3"><span className="text-3xl">⚠️</span><div><p className="font-bold text-red-700">رسوم الطوارئ: {formatCurrency(avail?.emergencySurcharge as number ?? 50)}</p><p className="text-xs text-red-600">يتم الحجز خلال {avail?.availableWithin as string ?? '٣ ساعات'} — رسوم إضافية للسرعة</p></div></div>
        </Card>

        <Card padding="lg"><h3 className="font-bold mb-3">💅 اختاري الخدمة</h3>
          <div className="flex flex-wrap gap-2 mb-4">{POPULAR_SERVICES.map(s => (
            <button key={s.id} onClick={()=>{setServiceId(s.id);setSelectedTech(null);setBookingCode(null);}} className={`rounded-full px-4 py-2 text-sm transition-all ${serviceId===s.id?'bg-red-600 text-white':'bg-gray-100'}`}>{s.emoji} {s.name}</button>
          ))}</div>

          {isLoading ? <CardSkeleton/> :
            available.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">😔 لا توجد فنيات متاحات حالياً لهذه الخدمة</p> :
            <div className="space-y-2">{available.map((t: Record<string,unknown>) => (
              <button key={t.technicianId as number} onClick={()=>setSelectedTech(t.technicianId as number)} className={`w-full rounded-xl border-2 p-3 text-right transition-all ${selectedTech===t.technicianId?'border-red-400 bg-red-50':'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{t.name as string}</span>
                  <span className="font-bold text-red-600">{formatCurrency(t.price as number)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>⭐ {t.rating as number} · {t.city as string}</span><span>🕐 {t.nextSlot ? new Date(t.nextSlot as string).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'}) : '—'}</span></div>
              </button>
            ))}</div>
          }
        </Card>

        {bookingCode ? <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50"><p className="text-3xl">✅</p><p className="font-bold text-green-700 mt-2">تم الحجز الطارئ</p><p className="text-sm text-gray-500">رمز الحجز: <span className="font-mono font-bold">{bookingCode}</span></p><p className="text-lg font-bold text-green-600 mt-1">الإجمالي: {formatCurrency(avail?.totalEstimate as number ?? 0)}</p></Card> :
          selectedTech && <Button onClick={()=>createMut.mutate({ serviceId, technicianId: selectedTech, addressId: 1, slotId: (available.find(t=>t.technicianId===selectedTech) as Record<string,unknown>)?.slotId as number ?? 0 },{onSuccess:(r)=>{setBookingCode((r as Record<string,unknown>)?.bookingCode as string);}})} loading={createMut.isPending} className="w-full">🚨 احجزي الآن — {formatCurrency(avail?.totalEstimate as number ?? 0)}</Button>
        }
      </div>
    </DashboardLayout>
  );
}
