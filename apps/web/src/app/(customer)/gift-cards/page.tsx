'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function GiftCardsPage(): JSX.Element {
  const { addToast } = useToast();
  const [tab, setTab] = useState<'my' | 'buy' | 'check'>('my');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [checkCode, setCheckCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myCardsQ = api.giftCards.myCards.useQuery() as any;
  const buyMut = api.giftCards.purchase.useMutation({ onSuccess: () => { addToast('success', 'تم شراء بطاقة الهدية بنجاح!'); myCardsQ.refetch(); setAmount(''); setRecipientEmail(''); setRecipientName(''); setGiftMessage(''); } });
  const redeemMut = api.giftCards.redeem.useMutation({ onSuccess: () => { addToast('success', 'تم استرداد الرصيد بنجاح!'); myCardsQ.refetch(); setRedeemCode(''); setRedeemAmount(''); } });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState('');

  const handleCheckBalance = async () => {
    setCheckError(''); setCheckResult(null);
    if (!checkCode) { setCheckError('الرجاء إدخال كود البطاقة'); return; }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const utils = api.useUtils() as any;
      const r = await utils.giftCards.checkBalance.fetch({ code: checkCode });
      setCheckResult(r);
    } catch (e: any) { setCheckError(e?.message || 'البطاقة غير صالحة'); }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">بطاقات الهدية</h1>

        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[{ key: 'my', label: 'بطاقاتي' }, { key: 'buy', label: 'شراء' }, { key: 'check', label: 'التحقق من الرصيد' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'my' && (
          myCardsQ.isLoading ? <CardSkeleton /> :
          myCardsQ.isError ? <ErrorAlert message="فشل تحميل البطاقات" onRetry={() => myCardsQ.refetch()} /> :
          !myCardsQ.data || myCardsQ.data.length === 0 ? <EmptyState title="لا توجد بطاقات هدايا" description="اشتر بطاقة هدية لنفسك أو لأحد تحبينه" /> :
          <div className="space-y-3">
            {myCardsQ.data.map((card: Record<string, any>) => (
              <Card key={card.id} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-brand-600">{card.code}</p>
                    <p className="text-sm text-gray-500">الرصيد: {formatCurrency(Number(card.balance))} / {formatCurrency(Number(card.amount))}</p>
                    {card.recipientName && <p className="text-xs text-gray-400">لـ: {card.recipientName}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {card.status === 'ACTIVE' ? 'نشطة' : 'مستخدمة'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'buy' && (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold">شراء بطاقة هدية</h3>
            <div className="space-y-4">
              <Input label="المبلغ (ر.س)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} hint="الحد الأدنى ٥٠ ر.س، الأقصى ٥٠٠٠ ر.س" />
              <Input label="البريد الإلكتروني للمستلم (اختياري)" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@example.com" />
              <Input label="اسم المستلم (اختياري)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="لأجمل صديقة" />
              <div><label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">رسالة إهداء (اختياري)</label>
              <textarea className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800" rows={3} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="رسالة جميلة..." /></div>
              <Button onClick={() => { const a = Number(amount); if (a < 50) { addToast('warning', 'الحد الأدنى ٥٠ ر.س'); return; } buyMut.mutate({ amount: a, recipientEmail: recipientEmail || undefined, recipientName: recipientName || undefined, message: giftMessage || undefined }); }} loading={buyMut.isPending} className="w-full">🎁 شراء بطاقة هدية</Button>
            </div>
          </Card>
        )}

        {tab === 'check' && (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold">التحقق من رصيد البطاقة</h3>
            <div className="space-y-4">
              <Input label="كود البطاقة" value={checkCode} onChange={(e) => setCheckCode(e.target.value.toUpperCase())} placeholder="GIFT-XXXX-XXXX" />
              <Button onClick={handleCheckBalance} className="w-full">تحقق</Button>
              {checkError && <p className="text-sm text-red-600">{checkError}</p>}
              {checkResult && (
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                  <p className="font-mono font-bold text-green-800 dark:text-green-200">{checkResult.code}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">الرصيد المتبقي: {formatCurrency(Number(checkResult.balance))}</p>
                  <p className="text-xs text-green-600 dark:text-green-400">القيمة الأصلية: {formatCurrency(Number(checkResult.originalAmount))}</p>
                  {checkResult.recipientName && <p className="text-xs text-green-600">لـ: {checkResult.recipientName}</p>}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Redeem */}
        <Card padding="md">
          <h3 className="mb-3 text-sm font-semibold">استرداد بطاقة هدية</h3>
          <div className="flex gap-3">
            <Input placeholder="GIFT-XXXX-XXXX" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value.toUpperCase())} className="flex-1" />
            <Input type="number" placeholder="المبلغ" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} className="w-28" />
            <Button onClick={() => { const a = Number(redeemAmount); if (!redeemCode || !a) { addToast('warning', 'الرجاء إدخال الكود والمبلغ'); return; } redeemMut.mutate({ code: redeemCode, amount: a }); }} loading={redeemMut.isPending}>استرداد</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
