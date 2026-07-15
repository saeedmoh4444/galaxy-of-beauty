'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, ErrorAlert, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PromoPage(): JSX.Element {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    setError('');
    setResult(null);
    if (!code || !amount) { setError('الرجاء إدخال الكود والمبلغ'); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await (api.promo as any).validate.query({
        code: code.toUpperCase(),
        orderAmount: Number(amount),
      });
      setResult(r as Record<string, unknown>);
    } catch {
      setError('الكود غير صالح أو منتهي الصلاحية');
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">كود الخصم</h1>

        <Card padding="md">
          <div className="space-y-4">
            <Input
              label="كود الخصم"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: WELCOME20"
            />
            <Input
              label="قيمة الحجز (ر.س)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="200"
            />
            <Button onClick={handleValidate} className="w-full">
              تحقق من الكود
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Card>

        {result && result.valid ? (
          <Card padding="md" className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>الكود:</span>
                <span className="font-bold">{result.code as string}</span>
              </div>
              <div className="flex justify-between">
                <span>نوع الخصم:</span>
                <span>{result.discountType === 'percent' ? 'نسبة مئوية' : 'خصم ثابت'}</span>
              </div>
              <div className="flex justify-between">
                <span>قيمة الخصم:</span>
                <span className="font-bold text-green-700">{result.discountValue as number}{result.discountType === 'percent' ? '%' : ' ر.س'}</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span className="font-bold text-green-700">-{Number(result.discountAmount).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">الإجمالي بعد الخصم:</span>
                <span className="text-lg font-bold text-green-700">{Number(result.finalAmount).toFixed(2)} ر.س</span>
              </div>
            </div>
          </Card>
        ) : result && !result.valid ? (
          <ErrorAlert message="الكود غير صالح أو منتهي الصلاحية" />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
