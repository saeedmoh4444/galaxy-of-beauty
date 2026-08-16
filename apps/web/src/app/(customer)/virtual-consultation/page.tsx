'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CONSULTANTS = [
  {
    key: 'skincare',
    emoji: '‍️',
    name: 'اخصائية بشرة',
    specialty: 'تحليل البشرة وتشخيص المشاكل',
    price: 150,
    rating: 4.9,
    slots: ['9:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
  {
    key: 'makeup',
    emoji: '',
    name: 'خبيرة مكياج',
    specialty: 'استشارة مكياج للمناسبات',
    price: 120,
    rating: 4.8,
    slots: ['10:00 ص', '1:00 م', '4:00 م', '7:00 م'],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'مصففة شعر',
    specialty: 'استشارة تسريحات وعناية',
    price: 100,
    rating: 4.7,
    slots: ['9:00 ص', '12:00 م', '3:00 م', '6:00 م'],
  },
  {
    key: 'nutrition',
    emoji: '',
    name: 'اخصائية تغذية',
    specialty: 'تغذية البشرة والشعر',
    price: 130,
    rating: 4.9,
    slots: ['8:00 ص', '11:00 ص', '2:00 م', '5:00 م'],
  },
];

export default function VirtualConsultationPage(): JSX.Element {
  const { data: bookings } = api.virtualConsultation.myConsultations.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const bookMut = api.virtualConsultation.book.useMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const consultant = CONSULTANTS.find((c) => c.key === selected);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> استشارة افتراضية</h1>
          <p className="mt-1 text-sm text-text-secondary">استشيري خبيرات التجميل عبر الفيديو</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CONSULTANTS.map((c) => (
            <button
              key={c.key}
              onClick={() => {
                setSelected(c.key);
                setSlot(null);
              }}
              className={`rounded-xl border-2 p-4 text-center transition-all ${selected === c.key ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
            >
              <span className="text-5xl">{c.emoji}</span>
              <h3 className="font-bold mt-2">{c.name}</h3>
              <p className="text-xs text-text-secondary">{c.specialty}</p>
              <p className="text-sm font-bold text-brand-600 mt-1">
                {formatCurrency(c.price)} · {c.rating}
              </p>
            </button>
          ))}
        </div>
        {consultant && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">
              اختر الوقت — {consultant.emoji} {consultant.name}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {consultant.slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`rounded-lg px-4 py-2 text-sm ${slot === s ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {slot && (
              <Button
                onClick={() =>
                  bookMut.mutate({
                    consultantType: consultant.key,
                    scheduledAt: new Date().toISOString(),
                    slot,
                    price: consultant.price,
                  })
                }
                loading={bookMut.isPending}
                className="w-full"
              >
                احجزي — {formatCurrency(consultant.price)}
              </Button>
            )}
          </Card>
        )}
        {(bookings ?? []).length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> حجوزاتي</h3>
            <div className="space-y-2">
              {(bookings ?? []).map((b: Record<string, unknown>, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>
                    {b.consultantType as string} — {b.slot as string}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {b.status as string}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
