'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

const PRESET_AMOUNTS = [100, 200, 500, 1000];

export default function WalletTopUpPage(): JSX.Element {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: balance, isLoading } = api.wallet.getBalance.useQuery() as any;

  const handleTopUp = () => {
    const a = selected || Number(amount);
    if (a < 50) {
      addToast('warning', 'الحد الأدنى ٥٠ ر.س');
      return;
    }
    addToast('success', `سيتم تحويلك لبوابة الدفع لإضافة ${formatCurrency(a)}`);
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100"> شحن المحفظة</h1>
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <Card className="text-center" padding="lg">
            <p className="text-sm text-text-secondary">الرصيد الحالي</p>
            <p className="text-4xl font-extrabold text-brand-600 mt-2">
              {formatCurrency(Number(balance?.balance || 0))}
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              + {formatCurrency(Number(balance?.bonusBalance || 0))} رصيد مكافآت
            </p>
          </Card>
        )}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">اختر المبلغ</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => {
                  setSelected(a);
                  setAmount('');
                }}
                className={`rounded-xl border-2 p-4 text-center transition-all ${selected === a ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700'}`}
              >
                <p className="text-2xl font-extrabold text-brand-600">{a}</p>
                <p className="text-xs text-text-tertiary">ر.س</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center mb-4">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-text-tertiary">أو أدخل مبلغ مخصص</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>
          <input
            type="number"
            placeholder="المبلغ (ر.س)"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setSelected(null);
            }}
            className="w-full rounded-lg border border-gray-300 p-3 text-center text-lg dark:border-gray-600 dark:bg-gray-800"
          />
          <Button onClick={handleTopUp} size="lg" className="w-full mt-4">
             شحن {formatCurrency(selected || Number(amount) || 0)}
          </Button>
        </Card>
        <div className="text-center">
          <Link href="/wallet" className="text-sm text-brand-600 hover:underline">
            العودة للمحفظة
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
