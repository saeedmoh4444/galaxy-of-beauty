'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, Button, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

// RouterOutput types are too deeply nested — use Record for structural access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceListItem = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AddressItem = Record<string, any>;

// Helper to extract bilingual JSON field
function ar(json: unknown): string {
  return (json as { ar?: string })?.ar ?? '';
}

// Helper to safely get number
function num(v: unknown, fallback = 0): number {
  return typeof v === 'number' ? v : Number(v) || fallback;
}

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

  const { data: servicesData } = api.services.list.useQuery({ page: 1, limit: 100 });
  const { data: serviceDetail } = api.services.getById.useQuery(
    { id: serviceId ?? 0 },
    { enabled: !!serviceId },
  );
  const { data: addressesData } = api.addresses.list.useQuery();

  const services = (servicesData?.items ?? []) as ServiceListItem[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = serviceDetail as Record<string, any> | null;
  const variants = (svc?.variants as Array<Record<string, unknown>>) ?? [];
  const addresses = (addressesData ?? []) as AddressItem[];

  const createMut = api.bookings.create.useMutation({
    onSuccess: (_result) => {
      addToast('success', 'تم إنشاء الحجز بنجاح!');
      router.push(`/bookings`);
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
    // Auto-assign first available technician for this service
    let technicianId = 0;
    const techs =
      (svc as unknown as { technicianServices?: Array<{ technician?: { userId?: number } }> })
        ?.technicianServices ?? [];
    if (techs.length > 0) {
      technicianId = techs[0]?.technician?.userId ?? 0;
    }
    if (!technicianId) {
      addToast('error', 'لا توجد فنيات متاحة لهذه الخدمة حالياً');
      setSubmitting(false);
      return;
    }

    createMut.mutate({
      serviceId,
      variantId,
      addressId,
      technicianId,
      idempotencyKey: crypto.randomUUID(),
      notes: notes || undefined,
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(
        Date.now() +
          86400000 +
          num(svc ? (svc as unknown as { durationMin?: number }).durationMin : 60, 60) * 60000,
      ).toISOString(),
    });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">حجز جديد</h1>

        {/* Progress steps */}
        <div className="flex items-center gap-2 text-sm">
          {['الخدمة', 'التفاصيل', 'التأكيد'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-200 text-text-secondary'
                }`}
              >
                {step > i + 1 ? '' : i + 1}
              </span>
              <span className={step === i + 1 ? 'font-bold text-brand-600' : 'text-text-tertiary'}>
                {label}
              </span>
              {i < 2 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-text-primary dark:text-gray-100">اختر الخدمة</h3>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setServiceId(s.id);
                    setStep(2);
                  }}
                  className={`w-full rounded-lg border p-4 text-right transition-colors hover:border-brand-400 ${
                    serviceId === s.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="font-semibold text-text-primary dark:text-gray-100">
                    {ar((s as unknown as { titleJson: unknown }).titleJson)}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {num((s as unknown as { basePrice: unknown }).basePrice).toFixed(0)} ر.س ·{' '}
                    {num((s as unknown as { durationMin: unknown }).durationMin)} دقيقة
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && svc && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-text-primary dark:text-gray-100">
              تفاصيل الحجز
            </h3>

            <p className="mb-2 text-sm font-bold text-brand-600">
              {ar((svc as unknown as { titleJson: unknown }).titleJson)}
            </p>

            {variants.length > 0 && (
              <div className="mb-4">
                <label className="mb-2 block text-sm text-text-secondary">اختر المتغير</label>
                <select
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  value={variantId || ''}
                  onChange={(e) => setVariantId(Number(e.target.value) || undefined)}
                >
                  <option value="">الخدمة الأساسية</option>
                  {variants.map((v) => (
                    <option key={v.id as number} value={v.id as number}>
                      {ar(v.nameJson)} (+{num(v.priceDelta).toFixed(0)} ر.س)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text-secondary">اختر العنوان</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                value={addressId || ''}
                onChange={(e) => setAddressId(Number(e.target.value) || undefined)}
              >
                <option value="">اختر عنواناً...</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {String(a.label)} — {String(a.city)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text-secondary">كود الخصم (اختياري)</label>
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="مثال: WELCOME20"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-text-secondary">ملاحظات</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline">
                السابق
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                التالي
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card padding="md">
            <h3 className="mb-4 font-semibold text-text-primary dark:text-gray-100">تأكيد الحجز</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-text-secondary">الخدمة</span>
                <span className="font-semibold">
                  {svc ? ar((svc as unknown as { titleJson: unknown }).titleJson) : ''}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-text-secondary">السعر</span>
                <span className="font-bold text-brand-600">
                  {num((svc as unknown as { basePrice?: unknown })?.basePrice).toFixed(0)} ر.س
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-text-secondary">المدة</span>
                <span>{num((svc as unknown as { durationMin?: unknown })?.durationMin)} دقيقة</span>
              </div>
            </div>

            <p className="mt-4 text-sm text-text-tertiary">
              * ستقوم الفنية بتأكيد الموعد النهائي بعد مراجعة الحجز.
            </p>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline">
                السابق
              </Button>
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
