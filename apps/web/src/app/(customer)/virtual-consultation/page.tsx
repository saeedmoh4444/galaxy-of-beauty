'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const CONSULTANTS: {
  key: string;
  emoji: string;
  name: TranslationKey;
  specialty: TranslationKey;
  price: number;
  rating: number;
  slots: TranslationKey[];
}[] = [
  {
    key: 'skincare',
    emoji: '‍️',
    name: 'virtualConsultation.consultant.skincare.name',
    specialty: 'virtualConsultation.consultant.skincare.specialty',
    price: 150,
    rating: 4.9,
    slots: [
      'virtualConsultation.slot.9am',
      'virtualConsultation.slot.11am',
      'virtualConsultation.slot.2pm',
      'virtualConsultation.slot.5pm',
    ],
  },
  {
    key: 'makeup',
    emoji: '',
    name: 'virtualConsultation.consultant.makeup.name',
    specialty: 'virtualConsultation.consultant.makeup.specialty',
    price: 120,
    rating: 4.8,
    slots: [
      'virtualConsultation.slot.10am',
      'virtualConsultation.slot.1pm',
      'virtualConsultation.slot.4pm',
      'virtualConsultation.slot.7pm',
    ],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'virtualConsultation.consultant.hair.name',
    specialty: 'virtualConsultation.consultant.hair.specialty',
    price: 100,
    rating: 4.7,
    slots: [
      'virtualConsultation.slot.9am',
      'virtualConsultation.slot.12pm',
      'virtualConsultation.slot.3pm',
      'virtualConsultation.slot.6pm',
    ],
  },
  {
    key: 'nutrition',
    emoji: '',
    name: 'virtualConsultation.consultant.nutrition.name',
    specialty: 'virtualConsultation.consultant.nutrition.specialty',
    price: 130,
    rating: 4.9,
    slots: [
      'virtualConsultation.slot.8am',
      'virtualConsultation.slot.11am',
      'virtualConsultation.slot.2pm',
      'virtualConsultation.slot.5pm',
    ],
  },
];

export default function VirtualConsultationPage(): JSX.Element {
  const { t } = useLocale();
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
          <h1 className="text-2xl font-bold">{t('virtualConsultation.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('virtualConsultation.subtitle')}</p>
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
              <h3 className="font-bold mt-2">{t(c.name)}</h3>
              <p className="text-xs text-text-secondary">{t(c.specialty)}</p>
              <p className="text-sm font-bold text-brand-600 mt-1">
                {formatCurrency(c.price)} · {c.rating}
              </p>
            </button>
          ))}
        </div>
        {consultant && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">
              {t('virtualConsultation.pickTime', {
                name: `${consultant.emoji} ${t(consultant.name)}`,
              })}
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {consultant.slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`rounded-lg px-4 py-2 text-sm ${slot === s ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
                >
                  {t(s)}
                </button>
              ))}
            </div>
            {slot && (
              <Button
                onClick={() =>
                  bookMut.mutate({
                    consultantType: consultant.key,
                    scheduledAt: new Date().toISOString(),
                    slot: t(slot as TranslationKey),
                    price: consultant.price,
                  })
                }
                loading={bookMut.isPending}
                className="w-full"
              >
                {t('virtualConsultation.book', { price: formatCurrency(consultant.price) })}
              </Button>
            )}
          </Card>
        )}
        {(bookings ?? []).length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3">{t('virtualConsultation.myBookings')}</h3>
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
