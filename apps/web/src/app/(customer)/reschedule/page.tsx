'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReschedulePage(): JSX.Element {
  const { data: bookingsData, isLoading } = api.bookings.list.useQuery({ page: 1, limit: 20 }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const rescheduleMut = api.reschedule.request.useMutation();
  const bookings = (bookingsData?.bookings as Array<Record<string, unknown>>) ?? [];
  const activeBookings = bookings.filter(
    (b: Record<string, unknown>) =>
      (b.status as string) === 'REQUESTED' || (b.status as string) === 'ACCEPTED',
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  const handleReschedule = () => {
    if (!selectedId || !newDate || !newTime) return;
    const newStartAt = new Date(`${newDate}T${newTime}:00`).toISOString();
    rescheduleMut.mutate(
      { bookingId: selectedId, newStartAt, reason: reason || undefined },
      {
        onSuccess: () => {
          setDone(true);
          setSelectedId(null);
          setNewDate('');
          setNewTime('');
          setReason('');
        },
      },
    );
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🔄 إعادة جدولة</h1>
          <p className="mt-1 text-sm text-text-secondary">غيري موعد حجوزاتكِ القادمة</p>
        </div>

        {done && (
          <Card padding="lg" className="text-center border-2 border-green-300 bg-green-50">
            <p className="text-2xl">✅</p>
            <p className="font-bold text-green-700 mt-2">تمت إعادة الجدولة بنجاح</p>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : activeBookings.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-text-secondary">مافي حجوزات قابلة لإعادة الجدولة</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b: Record<string, unknown>) => {
              const isSelected = selectedId === (b.id as number);
              const service = b.service as Record<string, unknown> | undefined;
              return (
                <button
                  key={b.id as number}
                  onClick={() => {
                    setSelectedId(isSelected ? null : (b.id as number));
                    setDone(false);
                  }}
                  className={`w-full rounded-xl border-2 p-4 text-right transition-all ${isSelected ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">حجز #{b.id as number}</span>
                      <span className="text-xs text-text-secondary mr-2">
                        {(service?.titleJson as Record<string, string>)?.ar ?? ''}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${b.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {b.status as string}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    🕐{' '}
                    {new Date(b.startAt as string).toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {selectedId && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">📅 اختر الموعد الجديد</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب إعادة الجدولة (اختياري)"
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={handleReschedule}
              loading={rescheduleMut.isPending}
              disabled={!newDate || !newTime}
              className="w-full mt-3"
            >
              🔄 تأكيد إعادة الجدولة
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
