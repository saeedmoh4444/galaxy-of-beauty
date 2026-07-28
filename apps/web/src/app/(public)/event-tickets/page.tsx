'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, formatCurrency } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';
import Link from 'next/link';

export default function EventTicketsPage(): JSX.Element {
  const { user } = useAuth();
  const { data: events, isLoading, isError, refetch } = api.eventTickets.available.useQuery() as { data: Array<Record<string, unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const reserveMut = api.eventTickets.reserve.useMutation();
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);
  const [name, setName] = useState('');
  const [reserved, setReserved] = useState<Record<string, unknown> | null>(null);

  const handleReserve = () => {
    if (!name.trim() || !selectedEvent) return;
    reserveMut.mutate({ eventId: selectedEvent.id as number, attendeeName: name }, { onSuccess: (data) => { setReserved(data); setSelectedEvent(null); setName(''); } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">🎟️ تذاكر الفعاليات</h1>
        <p className="mt-2 text-gray-500">احجزي مقعدكِ في أقوى فعاليات وفعاليات التجميل</p>
      </div>

      {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
      : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      : !events || events.length === 0 ? <EmptyState title="لا توجد فعاليات قادمة" description="لم تُضف أي فعاليات بعد" />
      : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e: Record<string, unknown>) => (
            <Card key={e.id as number} padding="lg" className="text-center hover:shadow-xl transition-all">
              <span className="text-5xl">{['workshop','masterclass','launch','seasonal'].includes(e.eventType as string) ? {workshop:'🛠️',masterclass:'👩‍🏫',launch:'🚀',seasonal:'🌸'}[(e.eventType as string)] : '📅'}</span>
              <h3 className="mt-3 text-lg font-bold">{(e.nameJson as Record<string,string>)?.ar}</h3>
              <p className="text-sm text-gray-500 mt-1">{new Date(e.startsAt as string).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' })}</p>
              <p className="text-2xl font-extrabold text-brand-600 mt-3">{Number(e.price) > 0 ? formatCurrency(Number(e.price)) + ' ر.س' : 'مجاناً 🎉'}</p>
              <div className="mt-4">
                {reserved && (reserved.eventId as number) === (e.id as number) ? (
                  <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 dark:bg-green-900 dark:text-green-300">✓ تم الحجز</span>
                ) : user ? (
                  <Button size="sm" onClick={() => { setSelectedEvent(e); setName(user.name ?? ''); }}>🎫 احجزي مقعداً</Button>
                ) : (
                  <Link href="/login"><Button size="sm" variant="ghost">تسجيل الدخول</Button></Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="حجز تذكرة">
        <div className="space-y-4">
          <p className="font-bold">{(selectedEvent?.nameJson as Record<string,string>)?.ar}</p>
          <div><label className="block text-sm font-semibold mb-1">اسم الحاضرة</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" /></div>
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setSelectedEvent(null)}>إلغاء</Button><Button onClick={handleReserve} loading={reserveMut.isPending}>🎫 تأكيد الحجز</Button></div>
        </div>
      </Modal>
    </div>
  );
}
