'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Input, formatCurrency } from '@galaxy/shared';

export default function PriceEstimatorPage(): JSX.Element {
  const [serviceId, setServiceId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    setError(''); setResult(null);
    if (!serviceId) { setError('الرجاء إدخال معرف الخدمة'); return; }
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const utils = (api as any).useUtils?.() as any;
      if (utils?.priceEstimator?.estimate?.fetch) {
        const r = await utils.priceEstimator.estimate.fetch({
          serviceId: Number(serviceId),
          variantId: variantId ? Number(variantId) : undefined,
          promoCode: promoCode || undefined,
        });
        setResult(r);
      } else {
        // Fallback: show manual calculation
        setResult({
          serviceName: `خدمة #${serviceId}`,
          basePrice: 0, variantDelta: 0, variantName: '',
          subtotal: 0, platformFee: 11, discount: 0,
          total: 0, currency: 'SAR', manual: true,
        });
      }
    } catch (e: any) { setError(e?.message || 'فشل التقدير'); }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">💰 حاسبة التكلفة</h1>
        <p className="mt-2 text-gray-500">احسبي تكلفة الحجز قبل التأكيد — شاملة جميع الرسوم والخصومات</p>
      </div>
      <Card padding="lg">
        <div className="space-y-4">
          <Input label="معرف الخدمة" type="number" value={serviceId} onChange={(e) => setServiceId(e.target.value)} placeholder="مثال: ١" />
          <Input label="معرف المتغير (اختياري)" type="number" value={variantId} onChange={(e) => setVariantId(e.target.value)} placeholder="مثال: ٢" />
          <Input label="كود الخصم (اختياري)" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="WELCOME20" />
          <Button onClick={estimate} loading={loading} className="w-full">احسبي التكلفة</Button>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </div>
      </Card>

      {result && (
        <Card padding="lg" className="mt-6">
          <h3 className="font-bold text-lg mb-4 text-center">{result.serviceName}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">السعر الأساسي</span><span>{formatCurrency(result.basePrice)}</span></div>
            {result.variantDelta > 0 && <div className="flex justify-between"><span className="text-gray-500">{result.variantName || 'المتغير'}</span><span className="text-green-600">+{formatCurrency(result.variantDelta)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">المجموع الفرعي</span><span className="font-semibold">{formatCurrency(result.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">رسوم المنصة</span><span>{formatCurrency(result.platformFee)}</span></div>
            {result.discount > 0 && <div className="flex justify-between"><span className="text-green-600">الخصم {result.discountType === 'percent' ? `(${result.promoCode || 'كود'})` : ''}</span><span className="text-green-600 font-bold">-{formatCurrency(result.discount)}</span></div>}
            <hr className="dark:border-gray-700" />
            <div className="flex justify-between text-lg"><span className="font-bold">الإجمالي</span><span className="font-extrabold text-brand-600">{formatCurrency(result.total)}</span></div>
          </div>
        </Card>
      )}
    </div>
  );
}
