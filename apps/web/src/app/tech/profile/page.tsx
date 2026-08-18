'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize, type TranslationKey } from '@galaxy/shared';

const KYC_BADGES: Record<string, { colour: string; labelKey: TranslationKey }> = {
  PENDING: { colour: 'bg-surface-muted text-text-primary', labelKey: 'tech.profile.kyc-pending' },
  SUBMITTED: { colour: 'bg-amber-100 text-amber-700', labelKey: 'tech.profile.kyc-submitted' },
  VERIFIED: { colour: 'bg-green-100 text-green-700', labelKey: 'tech.profile.kyc-verified' },
  REJECTED: { colour: 'bg-red-100 text-red-700', labelKey: 'tech.profile.kyc-rejected' },
};

export default function TechProfilePage(): JSX.Element {
  const { t, locale } = useLocale();
  const { data, isLoading, isError, refetch } = api.auth.me.useQuery();
  const servicesQ = api.services.list.useQuery({ limit: 50 });
  const addServiceMut = api.technicians.addService.useMutation({ onSuccess: () => refetch() });
  const removeServiceMut = api.technicians.removeService.useMutation({
    onSuccess: () => refetch(),
  });
  const submitKycMut = api.technicians.submitKyc.useMutation({ onSuccess: () => refetch() });

  const me = data as unknown as Record<string, unknown>;
  const tech = me?.technician as Record<string, unknown> | undefined;
  const techId = tech?.id as number | undefined;

  const { data: myServices } = api.technicians.getServices.useQuery(
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
  const badge: { colour: string; labelKey: TranslationKey } =
    KYC_BADGES[kycStatus] ?? KYC_BADGES.PENDING!;

  /* ---------- KYC upload ---------- */
  const handleKycSubmit = () => {
    if (!docUrl) {
      setKycMsg(t('tech.profile.kyc-url-error'));
      return;
    }
    submitKycMut.mutate({ documents: [{ type: docType, url: docUrl }] });
  };

  /* ---------- Profile save ---------- */
  const profileMut = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setProfileMsg(t('tech.profile.saved-msg'));
      refetch();
    },
    onError: (e) => setProfileMsg(e.message),
  });

  const handleProfileSave = () => {
    setProfileMsg('');
    profileMut.mutate({ name: name || undefined });
    // Tech-specific fields (city, area, bioAr, bioEn, isEcoFriendly, bufferMinutes)
    // require a dedicated endpoint on the backend. Stub message for now.
    setProfileMsg(t('tech.profile.stub-msg'));
  };

  /* ---------- Services ---------- */
  const handleAddService = () => {
    if (!selectedServiceId) return;
    addServiceMut.mutate({ serviceId: selectedServiceId });
    setSelectedServiceId(null);
    setServiceMsg(t('tech.profile.service-added'));
  };

  const handleRemoveService = (mappingId: number) => {
    removeServiceMut.mutate({ mappingId });
    setServiceMsg(t('tech.profile.service-removed'));
  };

  const allServices = (servicesQ.data?.items as unknown as Record<string, unknown>[]) ?? [];

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl font-bold">{t('tech.profile.title')}</h1>

        {/* ------ Loading ------ */}
        {isLoading && Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} />)}

        {/* ------ Error ------ */}
        {isError && <ErrorAlert message={t('tech.profile.load-error')} onRetry={() => refetch()} />}

        {/* ------ Data ------ */}
        {!isLoading && !isError && (
          <>
            {/* ── KYC Status ── */}
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{t('tech.profile.kyc-title')}</h2>
                  <p className="text-sm text-text-secondary">
                    {t('tech.profile.kyc-status-label')}
                  </p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${badge.colour}`}>
                  {t(badge.labelKey)}
                </span>
              </div>

              {kycStatus === 'PENDING' || kycStatus === 'REJECTED' ? (
                <div className="mt-4 space-y-3 border-t border-edge pt-4 dark:border-gray-700">
                  {kycMsg && <p className="text-sm text-amber-600">{kycMsg}</p>}
                  <div className="flex gap-3">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="rounded-lg border border-edge bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                    >
                      <option value="NATIONAL_ID">{t('tech.profile.doc-national-id')}</option>
                      <option value="PASSPORT">{t('tech.profile.doc-passport')}</option>
                      <option value="LICENSE">{t('tech.profile.doc-license')}</option>
                    </select>
                    <Input
                      placeholder={t('tech.profile.document-url')}
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={handleKycSubmit} loading={submitKycMut.isPending}>
                    {t('tech.profile.kyc-submit')}
                  </Button>
                </div>
              ) : kycStatus === 'SUBMITTED' ? (
                <p className="mt-2 text-sm text-amber-600">
                  {t('tech.profile.kyc-submitted-desc')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-green-600">{t('tech.profile.kyc-verified-desc')}</p>
              )}
            </Card>

            {/* ── Profile Form ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t('tech.profile.personal-info')}</h2>
              {profileMsg && (
                <p
                  className={`mb-3 text-sm ${profileMut.isError ? 'text-red-600' : 'text-green-600'}`}
                >
                  {profileMsg}
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t('tech.profile.name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input label={t('tech.profile.email')} value={me?.email as string} disabled />
                <Input
                  label={t('tech.profile.city')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label={t('tech.profile.area')}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label={t('tech.profile.bio-ar')}
                    value={bioAr}
                    onChange={(e) => setBioAr(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={t('tech.profile.bio-en')}
                    value={bioEn}
                    onChange={(e) => setBioEn(e.target.value)}
                  />
                </div>
                <Input
                  label={t('tech.profile.buffer-minutes')}
                  type="number"
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                />
                <div className="flex items-center gap-3 self-end pb-2">
                  <label
                    htmlFor="tp-eco-friendly"
                    className="text-sm font-medium text-text-primary dark:text-gray-300"
                  >
                    {t('tech.profile.eco-friendly')}
                  </label>
                  <input
                    id="tp-eco-friendly"
                    type="checkbox"
                    checked={isEcoFriendly}
                    onChange={(e) => setIsEcoFriendly(e.target.checked)}
                    className="h-5 w-5 rounded border-edge text-brand-600"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleProfileSave} loading={profileMut.isPending}>
                  {t('tech.profile.save-changes')}
                </Button>
              </div>
            </Card>

            {/* ── Services Management ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t('tech.profile.provided-services')}</h2>
              {serviceMsg && <p className="mb-3 text-sm text-green-600">{serviceMsg}</p>}

              {/* Add service */}
              <div className="mb-4 flex flex-wrap gap-3">
                <select
                  value={selectedServiceId ?? ''}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-edge bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  <option value="">{t('tech.profile.select-service')}</option>
                  {allServices.map((s) => (
                    <option key={s.id as number} value={s.id as number}>
                      {localize(s.titleJson, locale)}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAddService}
                  loading={addServiceMut.isPending}
                  disabled={!selectedServiceId}
                >
                  {t('tech.slots.add')}
                </Button>
              </div>

              {/* Current services */}
              {servicesQ.isLoading && servicesList === undefined ? (
                <CardSkeleton />
              ) : !servicesList || servicesList.length === 0 ? (
                <EmptyState
                  title={t('tech.profile.no-services')}
                  description={t('tech.profile.no-services-desc')}
                />
              ) : (
                <div className="space-y-2">
                  {servicesList.map((mapping: Record<string, unknown>) => {
                    const svc = mapping.service as Record<string, unknown> | undefined;
                    return (
                      <Card key={mapping.id as number} padding="sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{localize(svc?.titleJson, locale)}</p>
                            <p className="text-xs text-text-secondary">
                              {Number(mapping.customPrice ?? svc?.basePrice ?? 0)} {t('misc.sar')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRemoveService(mapping.id as number)}
                            loading={
                              removeServiceMut.isPending &&
                              removeServiceMut.variables?.mappingId === mapping.id
                            }
                          >
                            {t('tech.profile.remove')}
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
