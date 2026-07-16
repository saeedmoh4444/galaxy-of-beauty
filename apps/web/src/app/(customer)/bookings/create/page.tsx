'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, ErrorAlert, Button, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function CreateBookingPage(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const preselectedServiceId = Number(params.get('serviceId')) || undefined;
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<number | undefined>(preselectedServiceId);
  const [variantId, setVariantId] = useState<number | undefined>();
  const [addressId, setAddressId] = useState<number | undefined>();
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: servicesData } = (api.services as any).list.useQuery({ page: 1, limit: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: serviceDetail } = (api.services as any).getById.useQuery(
    { id: serviceId! },
    { enabled: !!serviceId },
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: addressesData } = (api.addresses as any).list.useQuery();

  const services = (servicesData as Record<string, unknown>)?.items as Array<Record<string, unknown>> || [];
  const svc = serviceDetail as Record<string, unknown> | null;
  const variants = (svc?.variants as Array<Record<string, unknown>>) || [];
  const addresses = (addressesData as Array<Record<string, unknown>>) || [];

  const createMut = api.bookings.create.useMutation({
    onSuccess: (result) => {
      addToast('success', 'تم إنشاء الحجز بنجاح!');
      const bookingId = (result as Record<string, unknown>).id as number;
      router.push(`/customer/bookings`);
    },
    onError: () => {
      addToast('error', 'فشل إنشاء الحجز');
      setSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!serviceId || !addressId) {
      addToast('warning', 'الرجاء اختيار الخدمة والعنوان');
      return;
    }
    setSubmitting(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Auto-assign first available technician for this service
    let technicianId = 0;
    const techs = (svc?.technicianServices as Array<Record<string, unknown>>) || [];
    if (techs.length > 0) {
      technicianId = (techs[0]!.technician as Record<string, unknown>)?.userId as number || 0;
    }
    if (!technicianId) {
      addToast('error', 'لا توجد فنيات متاحة لهذه الخدمة حالياً');
      setSubmitting(false);
      return;
    }

    (createMut as any).mutate({
      serviceId, variantId, addressId,
      technicianId,
      idempotencyKey: `web_${Date.now()}_${Math.random().toString(36).slice(2,10)}`,
      notes: notes || undefined,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + ((svc?.durationMin as number) || 60) * 60000).toISOString(),
    });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">حجز جديد</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 text-sm">
          {['الخدمة', 'التفاصيل', 'التأكيد'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              <span className={step === i + 1 ? 'font-bold text-brand-600' : 'text-gray-400'}>{label}</span>
              {i < 2 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">اختر الخدمة</h3>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {services.map((s) => (
                <button
                  key={s.id as number}
                  onClick={() => { setServiceId(s.id as number); setStep(2); }}
                  className={`w-full rounded-lg border p-4 text-right transition-colors hover:border-brand-400 ${
                    serviceId === s.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{((s.titleJson as Record<string, string>)?.ar) || ''}</p>
                  <p className="mt-1 text-sm text-gray-500">{Number(s.basePrice).toFixed(0)} ر.س · {s.durationMin as number} دقيقة</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && svc && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">تفاصيل الحجز</h3>

            <p className="mb-2 text-sm font-bold text-brand-600">{((svc.titleJson as Record<string, string>)?.ar) || ''}</p>

            {variants.length > 0 && (
              <div className="mb-4">
                <label className="mb-2 block text-sm text-gray-600">اختر المتغير</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  value={variantId || ''}
                  onChange={(e) => setVariantId(Number(e.target.value) || undefined)}
                >
                  <option value="">الخدمة الأساسية</option>
                  {variants.map((v) => (
                    <option key={v.id as number} value={v.id as number}>
                      {((v.nameJson as Record<string, string>)?.ar) || ''} (+{Number(v.priceDelta).toFixed(0)} ر.س)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-600">اختر العنوان</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                value={addressId || ''}
                onChange={(e) => setAddressId(Number(e.target.value) || undefined)}
              >
                <option value="">اختر عنواناً...</option>
                {addresses.map((a) => (
                  <option key={a.id as number} value={a.id as number}>
                    {a.label as string} — {a.city as string}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-600">كود الخصم (اختياري)</label>
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="مثال: WELCOME20"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-600">ملاحظات</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline">السابق</Button>
              <Button onClick={() => setStep(3)} className="flex-1">التالي</Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">تأكيد الحجز</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">الخدمة</span>
                <span className="font-semibold">{((svc?.titleJson as Record<string, string>)?.ar) || ''}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">السعر</span>
                <span className="font-bold text-brand-600">{Number(svc?.basePrice || 0).toFixed(0)} ر.س</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">المدة</span>
                <span>{svc?.durationMin as number || 0} دقيقة</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-400">
              * ستقوم الفنية بتأكيد الموعد النهائي بعد مراجعة الحجز.
            </p>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline">السابق</Button>
              <Button onClick={handleSubmit} loading={submitting} className="flex-1">
                تأكيد الحجز
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
