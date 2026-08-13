'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const THEMES = [
  { key: 'spa', emoji: '‍️', name: 'سبا منزلي' },
  { key: 'makeup', emoji: '', name: 'حفلة مكياج' },
  { key: 'nails', emoji: '', name: 'صالون أظافر' },
  { key: 'bridal', emoji: '', name: 'توديع عزوبية' },
  { key: 'skincare', emoji: '', name: 'روتين عناية' },
];

export default function BeautyPartyPage(): JSX.Element {
  const createMut = api.beautyParty.create.useMutation();
  const [theme, setTheme] = useState('spa');
  const [guests, setGuests] = useState(4);
  const estPerPerson = 150;
  const total = estPerPerson * guests;
  const discount = guests >= 6 ? 20 : guests >= 4 ? 10 : 0;
  const finalTotal = total - (total * discount) / 100;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> حفلة تجميل</h1>
          <p className="mt-1 text-sm text-text-secondary">خططي لحفلة تجميل لكِ ولصديقاتكِ</p>
        </div>
        <Card padding="lg">
          <h3 className="font-bold mb-4"> اختاري الثيم</h3>
          <div className="space-y-2">
            {THEMES.map((th) => (
              <button
                key={th.key}
                onClick={() => setTheme(th.key)}
                className={`w-full rounded-xl p-4 text-right border-2 transition-all ${theme === th.key ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
              >
                <span className="text-2xl">{th.emoji}</span>{' '}
                <span className="font-bold">{th.name}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card padding="lg">
          <h3 className="font-bold mb-4">‍️ عدد الصديقات: {guests}</h3>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 8, 10].map((g) => (
              <button
                key={g}
                onClick={() => setGuests(g)}
                className={`w-10 h-10 rounded-full text-sm font-semibold ${guests === g ? 'bg-brand-600 text-white' : 'bg-surface-muted'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </Card>
        <Card padding="lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {guests} × {estPerPerson} ر.س
              </span>
              <span>{formatCurrency(total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>خصم المجموعة {discount}%</span>
                <span>-{formatCurrency((total * discount) / 100)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </Card>
        <Button
          onClick={() =>
            createMut.mutate({
              theme,
              guestCount: guests,
              totalAmount: finalTotal,
              discountPct: discount,
            })
          }
          loading={createMut.isPending}
          className="w-full"
        >
           احجزي حفلتكِ
        </Button>
      </div>
    </DashboardLayout>
  );
}
