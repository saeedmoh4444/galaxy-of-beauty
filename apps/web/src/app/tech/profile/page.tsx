'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const KYC_BADGES: Record<string, { colour: string; label: string }> = {
  PENDING: { colour: 'bg-gray-100 text-gray-700', label: 'قيد الانتظار' },
  SUBMITTED: { colour: 'bg-amber-100 text-amber-700', label: 'قيد المراجعة' },
  VERIFIED: { colour: 'bg-green-100 text-green-700', label: 'موثق' },
  REJECTED: { colour: 'bg-red-100 text-red-700', label: 'مرفوض' },
};

export default function TechProfilePage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.auth.me.useQuery({} as never);
  const servicesQ = api.services.list.useQuery({ limit: 50 });
  const addServiceMut = api.technicians.addService.useMutation({ onSuccess: () => refetch() });
  const removeServiceMut = api.technicians.removeService.useMutation({ onSuccess: () => refetch() });
  const submitKycMut = api.technicians.submitKyc.useMutation({ onSuccess: () => refetch() });

  const me = data as unknown as Record<string, unknown>;
  const tech = me?.technician as Record<string, unknown> | undefined;
  const techId = tech?.id as number | undefined;

  const { data: myServices, refetch: refetchServices } = api.technicians.getServices.useQuery(
    { techId: techId ?? 0 },
    { enabled: !!techId },
  );
  const servicesList = myServices as unknown as Record<string, unknown>[] | undefined;

  // Profile form
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [bioAr, setBioAr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState(5);
  const [profileMsg, setProfileMsg] = useState('');

  // KYC
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docUrl, setDocUrl] = useState('');
  const [kycMsg, setKycMsg] = useState('');

  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [serviceMsg, setServiceMsg] = useState('');

  // Hydrate form when data loads
  const [_hydrated, setHydrated] = useState(false);
  if (data && !_hydrated) {
    setName((me?.name as string) ?? '');
    setCity((tech?.city as string) ?? '');
    setArea((tech?.area as string) ?? '');
    setBioAr((tech?.bioAr as string) ?? '');
    setBioEn((tech?.bioEn as string) ?? '');
    setIsEcoFriendly((tech?.isEcoFriendly as boolean) ?? false);
    setBufferMinutes((tech?.bufferMinutes as number) ?? 5);
    setHydrated(true);
  }

  const kycStatus = (tech?.kycStatus as string) ?? 'PENDING';
  const badge: { colour: string; label: string } = KYC_BADGES[kycStatus] ?? KYC_BADGES.PENDING!;

  /* ---------- KYC upload ---------- */
  const handleKycSubmit = () => {
    if (!docUrl) { setKycMsg('يرجى إدخال رابط المستند'); return; }
    submitKycMut.mutate({ documents: [{ type: docType, url: docUrl }] });
  };

  /* ---------- Profile save ---------- */
  const profileMut = api.auth.updateProfile.useMutation({
    onSuccess: () => { setProfileMsg('تم حفظ التغييرات'); refetch(); },
    onError: (e) => setProfileMsg(e.message),
  });

  const handleProfileSave = () => {
    setProfileMsg('');
    profileMut.mutate({ name: name || undefined });
    // Tech-specific fields (city, area, bioAr, bioEn, isEcoFriendly, bufferMinutes)
    // require a dedicated endpoint on the backend. Stub message for now.
    setProfileMsg('تم تحديث البيانات الأساسية. تحديث بيانات الفني يحتاج نقطة نهاية.');
  };

  /* ---------- Services ---------- */
  const handleAddService = () => {
    if (!selectedServiceId) return;
    addServiceMut.mutate({ serviceId: selectedServiceId });
    setSelectedServiceId(null);
    setServiceMsg('تمت إضافة الخدمة');
  };

  const handleRemoveService = (mappingId: number) => {
    removeServiceMut.mutate({ mappingId });
    setServiceMsg('تمت إزالة الخدمة');
  };

  const allServices = (servicesQ.data?.items as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>

        {/* ------ Loading ------ */}
        {isLoading && Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}

        {/* ------ Error ------ */}
        {isError && <ErrorAlert message="فشل تحميل الملف الشخصي" onRetry={() => refetch()} />}

        {/* ------ Data ------ */}
        {!isLoading && !isError && (
          <>
            {/* ── KYC Status ── */}
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">توثيق الهوية (KYC)</h2>
                  <p className="text-sm text-gray-500">حالة التوثيق</p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${badge.colour}`}>
                  {badge.label}
                </span>
              </div>

              {kycStatus === 'PENDING' || kycStatus === 'REJECTED' ? (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  {kycMsg && <p className="text-sm text-amber-600">{kycMsg}</p>}
                  <div className="flex gap-3">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                    >
                      <option value="NATIONAL_ID">الهوية الوطنية</option>
                      <option value="PASSPORT">جواز السفر</option>
                      <option value="LICENSE">رخصة عمل</option>
                    </select>
                    <Input
                      placeholder="رابط المستند"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={handleKycSubmit} loading={submitKycMut.isPending}>
                    إرسال للتوثيق
                  </Button>
                </div>
              ) : kycStatus === 'SUBMITTED' ? (
                <p className="mt-2 text-sm text-amber-600">
                  المستندات قيد المراجعة من قبل الإدارة
                </p>
              ) : (
                <p className="mt-2 text-sm text-green-600">تم توثيق الهوية بنجاح</p>
              )}
            </Card>

            {/* ── Profile Form ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">المعلومات الشخصية</h2>
              {profileMsg && (
                <p className={`mb-3 text-sm ${profileMut.isError ? 'text-red-600' : 'text-green-600'}`}>
                  {profileMsg}
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="البريد الإلكتروني" value={me?.email as string} disabled />
                <Input label="المدينة" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="المنطقة" value={area} onChange={(e) => setArea(e.target.value)} />
                <div className="md:col-span-2">
                  <Input label="السيرة الذاتية (عربي)" value={bioAr} onChange={(e) => setBioAr(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Input label="السيرة الذاتية (إنجليزي)" value={bioEn} onChange={(e) => setBioEn(e.target.value)} />
                </div>
                <Input
                  label="وقت التحضير (دقائق)"
                  type="number"
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                />
                <div className="flex items-center gap-3 self-end pb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    صديق للبيئة
                  </label>
                  <input
                    type="checkbox"
                    checked={isEcoFriendly}
                    onChange={(e) => setIsEcoFriendly(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-brand-600"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleProfileSave} loading={profileMut.isPending}>
                  حفظ التغييرات
                </Button>
              </div>
            </Card>

            {/* ── Services Management ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">الخدمات المقدمة</h2>
              {serviceMsg && <p className="mb-3 text-sm text-green-600">{serviceMsg}</p>}

              {/* Add service */}
              <div className="mb-4 flex flex-wrap gap-3">
                <select
                  value={selectedServiceId ?? ''}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  <option value="">اختر خدمة</option>
                  {allServices.map((s) => (
                    <option key={s.id as number} value={s.id as number}>
                      {((s.titleJson as Record<string, string>)?.ar ?? '')}
                    </option>
                  ))}
                </select>
                <Button onClick={handleAddService} loading={addServiceMut.isPending} disabled={!selectedServiceId}>
                  + إضافة
                </Button>
              </div>

              {/* Current services */}
              {servicesQ.isLoading && servicesList === undefined ? (
                <CardSkeleton />
              ) : !servicesList || servicesList.length === 0 ? (
                <EmptyState title="لا توجد خدمات مضافة" description="أضف خدماتك من القائمة أعلاه" />
              ) : (
                <div className="space-y-2">
                  {servicesList.map((mapping: Record<string, unknown>) => {
                    const svc = mapping.service as Record<string, unknown> | undefined;
                    return (
                      <Card key={mapping.id as number} padding="sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {((svc?.titleJson as Record<string, string>)?.ar ?? '')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Number(mapping.customPrice ?? svc?.basePrice ?? 0)} ر.س
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRemoveService(mapping.id as number)}
                            loading={removeServiceMut.isPending && removeServiceMut.variables?.mappingId === mapping.id}
                          >
                            إزالة
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
