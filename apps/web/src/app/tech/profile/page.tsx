'use client';

import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Input, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize, type TranslationKey } from '@galaxy/shared';

const TIER_LABELS: Record<string, TranslationKey> = {
  NEW: 'tech.profile.tier-new',
  EXPERIENCED: 'tech.profile.tier-experienced',
  PREMIUM: 'tech.profile.tier-premium',
  CELEBRITY: 'tech.profile.tier-celebrity',
};

const KYC_BADGES: Record<string, { colour: string; labelKey: TranslationKey }> = {
  PENDING: { colour: 'bg-surface-muted text-text-primary', labelKey: 'tech.profile.kyc-pending' },
  SUBMITTED: {
    colour: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    labelKey: 'tech.profile.kyc-submitted',
  },
  VERIFIED: {
    colour: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    labelKey: 'tech.profile.kyc-verified',
  },
  REJECTED: {
    colour: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    labelKey: 'tech.profile.kyc-rejected',
  },
};

/** Inline custom-price editor for one technician service mapping (B.8c). */
function ServicePriceEditor({
  mappingId,
  initialPrice,
  saving,
  onSave,
}: {
  mappingId: number;
  initialPrice: number;
  saving: boolean;
  onSave: (mappingId: number, price: number) => void;
}): JSX.Element {
  const { t } = useLocale();
  const [price, setPrice] = useState(String(initialPrice));
  const dirty = Number(price) !== initialPrice && Number.isFinite(Number(price));

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-28"
        aria-label={t('tech.profile.custom-price')}
      />
      <Button
        size="sm"
        disabled={!dirty}
        loading={saving}
        onClick={() => onSave(mappingId, Number(price))}
      >
        {t('tech.profile.save-price')}
      </Button>
    </div>
  );
}

export default function TechProfilePage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, refetch } = api.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const servicesQ = api.services.list.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const addServiceMut = api.technicians.addService.useMutation({ onSuccess: () => refetch() });
  const removeServiceMut = api.technicians.removeService.useMutation({
    onSuccess: () => refetch(),
  });
  const updateServiceMut = api.technicians.updateService.useMutation({
    onSuccess: () => refetch(),
  });
  const submitKycMut = api.technicians.submitKyc.useMutation({ onSuccess: () => refetch() });
  const updateTechMut = api.technicians.updateProfile.useMutation();

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
  const [profileErr, setProfileErr] = useState(false);

  // F5 — richer profile details
  const [years, setYears] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [ig, setIg] = useState('');
  const [sc, setSc] = useState('');
  const [tt, setTt] = useState('');
  const [web, setWeb] = useState('');
  const [certs, setCerts] = useState<
    Array<{ titleAr: string; titleEn: string; issuer: string; year: string }>
  >([]);
  const [certDraft, setCertDraft] = useState({ titleAr: '', titleEn: '', issuer: '', year: '' });

  // KYC
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docUrl, setDocUrl] = useState('');
  const [kycMsg, setKycMsg] = useState('');

  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [serviceMsg, setServiceMsg] = useState('');

  // Hydrate form when data loads
  const [_hydrated, setHydrated] = useState(false);
  if (data && !_hydrated) {
    const bio = tech?.bioJson as Record<string, string> | undefined;
    setName((me?.name as string) ?? '');
    setCity((tech?.city as string) ?? '');
    setArea((tech?.area as string) ?? '');
    setBioAr(bio?.['ar'] ?? '');
    setBioEn(bio?.['en'] ?? '');
    setIsEcoFriendly((tech?.isEcoFriendly as boolean) ?? false);
    setBufferMinutes((tech?.bufferMinutes as number) ?? 5);
    const links = (tech?.socialLinksJson as Record<string, string> | undefined) ?? {};
    setIg(links['instagram'] ?? '');
    setSc(links['snapchat'] ?? '');
    setTt(links['tiktok'] ?? '');
    setWeb(links['website'] ?? '');
    setLanguagesInput(((tech?.languages as string[] | undefined) ?? []).join(', '));
    setYears(String((tech?.yearsOfExperience as number | undefined) ?? ''));
    setCerts(
      (
        (tech?.certificationsJson as
          | Array<{ titleAr?: string; titleEn?: string; issuer?: string; year?: number }>
          | undefined) ?? []
      ).map((c) => ({
        titleAr: c.titleAr ?? '',
        titleEn: c.titleEn ?? '',
        issuer: c.issuer ?? '',
        year: c.year !== undefined ? String(c.year) : '',
      })),
    );
    setHydrated(true);
  }

  const kycStatus = (tech?.kycStatus as string) ?? 'PENDING';
  const badge: { colour: string; labelKey: TranslationKey } =
    KYC_BADGES[kycStatus] ?? KYC_BADGES.PENDING!;
  const tierKey = TIER_LABELS[(tech?.tier as string) ?? 'NEW'] ?? TIER_LABELS.NEW!;

  /* ---------- KYC upload ---------- */
  const handleKycSubmit = () => {
    if (!docUrl) {
      setKycMsg(t('tech.profile.kyc-url-error'));
      return;
    }
    submitKycMut.mutate({ documents: [{ type: docType, url: docUrl }] });
  };

  // E2 — file upload for KYC documents (KSA papers) instead of pasting URLs.
  const uploadKycMut = api.uploads.uploadKycDocument.useMutation({});
  const handleKycFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadKycMut.mutate(
        {
          file: {
            name: file.name,
            type: file.type,
            size: file.size,
            base64: String(reader.result ?? ''),
          },
          documentType:
            docType === 'NATIONAL_ID'
              ? 'id_front'
              : docType === 'LICENSE'
                ? 'certificate'
                : 'id_back',
        },
        {
          onSuccess: (res) => {
            setDocUrl(res.url);
            setKycMsg(t('vendorPortal.apply.uploaded'));
          },
        },
      );
    };
    reader.readAsDataURL(file);
  };

  /* ---------- Profile save ---------- */
  const profileMut = api.auth.updateProfile.useMutation();

  const handleProfileSave = async () => {
    setProfileMsg('');
    setProfileErr(false);
    try {
      await profileMut.mutateAsync({ name: name || undefined });
      await updateTechMut.mutateAsync({
        city: city || undefined,
        area: area || undefined,
        bioAr: bioAr || undefined,
        bioEn: bioEn || undefined,
        bufferMinutes: Number.isFinite(bufferMinutes) ? bufferMinutes : undefined,
        isEcoFriendly,
        socialLinks: {
          instagram: ig.trim() || undefined,
          snapchat: sc.trim() || undefined,
          tiktok: tt.trim() || undefined,
          website: web.trim() || undefined,
        },
        languages: languagesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: certs
          .filter((c) => c.titleAr.trim() && c.titleEn.trim())
          .map((c) => ({
            titleAr: c.titleAr.trim(),
            titleEn: c.titleEn.trim(),
            issuer: c.issuer.trim() || undefined,
            year: Number.isFinite(Number(c.year)) ? Number(c.year) : undefined,
          })),
        yearsOfExperience: Number.isFinite(Number(years)) ? Number(years) : undefined,
      });
      setProfileMsg(t('tech.profile.saved-msg'));
      refetch();
    } catch (e) {
      setProfileErr(true);
      setProfileMsg(e instanceof Error ? e.message : String(e));
    }
  };

  /* ---------- Services ---------- */
  const handleAddService = () => {
    if (!selectedServiceId) return;
    const price = Number(customPrice);
    addServiceMut.mutate({
      serviceId: selectedServiceId,
      customPrice: Number.isFinite(price) && price > 0 ? price : undefined,
    });
    setSelectedServiceId(null);
    setCustomPrice('');
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
                <div className="mt-4 space-y-3 border-t border-edge pt-4">
                  {kycMsg && <p className="text-sm text-amber-600 dark:text-amber-400">{kycMsg}</p>}
                  <div className="flex gap-3">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="rounded-lg border border-edge bg-surface-elevated px-3 py-2 text-sm"
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
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer rounded-lg border border-edge px-3 py-2 text-sm">
                      {uploadKycMut.isPending ? '…' : t('vendorPortal.apply.upload')}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleKycFile}
                      />
                    </label>
                    <Button onClick={handleKycSubmit} loading={submitKycMut.isPending}>
                      {t('tech.profile.kyc-submit')}
                    </Button>
                  </div>
                </div>
              ) : kycStatus === 'SUBMITTED' ? (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  {t('tech.profile.kyc-submitted-desc')}
                </p>
              ) : (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {t('tech.profile.kyc-verified-desc')}
                </p>
              )}
            </Card>

            {/* ── Profile Form ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t('tech.profile.personal-info')}</h2>
              {profileMsg && (
                <p
                  className={`mb-3 text-sm ${profileErr ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
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
                    className="text-sm font-medium text-text-primary"
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

              {/* F5 — additional profile details */}
              <div className="mt-4 border-t border-edge pt-4">
                <h3 className="mb-3 font-semibold">{t('tech.profile.details-title')}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t('tech.profile.years-experience')}
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                  <Input
                    label={t('tech.profile.languages')}
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  {t('tech.profile.languages-hint')}
                </p>

                <h4 className="mb-2 mt-4 font-semibold">{t('tech.profile.social-links')}</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t('tech.profile.instagram')}
                    value={ig}
                    onChange={(e) => setIg(e.target.value)}
                  />
                  <Input
                    label={t('tech.profile.snapchat')}
                    value={sc}
                    onChange={(e) => setSc(e.target.value)}
                  />
                  <Input
                    label={t('tech.profile.tiktok')}
                    value={tt}
                    onChange={(e) => setTt(e.target.value)}
                  />
                  <Input
                    label={t('tech.profile.website')}
                    value={web}
                    onChange={(e) => setWeb(e.target.value)}
                  />
                </div>

                <h4 className="mb-2 mt-4 font-semibold">{t('tech.profile.certifications')}</h4>
                {certs.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {certs.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {localize({ ar: c.titleAr, en: c.titleEn }, locale)}
                          {c.issuer ? ` — ${c.issuer}` : ''}
                          {c.year ? ` (${c.year})` : ''}
                        </span>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setCerts(certs.filter((_, j) => j !== i))}
                        >
                          {t('tech.profile.cert-remove')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="grid gap-3 md:grid-cols-4">
                  <Input
                    placeholder={t('tech.profile.cert-title-ar')}
                    value={certDraft.titleAr}
                    onChange={(e) => setCertDraft({ ...certDraft, titleAr: e.target.value })}
                  />
                  <Input
                    placeholder={t('tech.profile.cert-title-en')}
                    value={certDraft.titleEn}
                    onChange={(e) => setCertDraft({ ...certDraft, titleEn: e.target.value })}
                  />
                  <Input
                    placeholder={t('tech.profile.cert-issuer')}
                    value={certDraft.issuer}
                    onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
                  />
                  <Input
                    placeholder={t('tech.profile.cert-year')}
                    type="number"
                    value={certDraft.year}
                    onChange={(e) => setCertDraft({ ...certDraft, year: e.target.value })}
                  />
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setCerts([...certs, certDraft]);
                    setCertDraft({ titleAr: '', titleEn: '', issuer: '', year: '' });
                  }}
                >
                  {t('tech.profile.cert-add')}
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleProfileSave}
                  loading={profileMut.isPending || updateTechMut.isPending}
                >
                  {t('tech.profile.save-changes')}
                </Button>
              </div>
            </Card>

            {/* ── Stats ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t('tech.profile.stats-title')}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-surface-muted p-4 text-center">
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-400">
                    {(tech?.ratingAvg as number) ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{t('tech.profile.rating')}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4 text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    {String((tech?.totalReviews as number) ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('tech.profile.total-reviews')}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4 text-center">
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-300">
                    {String((tech?.completedBookings as number) ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('tech.profile.completed-bookings')}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-muted p-4 text-center">
                  <p className="truncate text-sm font-bold text-text-primary">
                    {(me?.phone as string) ?? '—'}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{t('tech.profile.phone')}</p>
                </div>
                {/* F5 — pricing tier (admin-managed, display-only) */}
                <div className="rounded-xl bg-surface-muted p-4 text-center">
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {t(tierKey)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{t('tech.profile.tier')}</p>
                </div>
              </div>
            </Card>

            {/* ── Services Management ── */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold">{t('tech.profile.provided-services')}</h2>
              {serviceMsg && (
                <p className="mb-3 text-sm text-green-600 dark:text-green-400">{serviceMsg}</p>
              )}

              {/* Add service */}
              <div className="mb-4 flex flex-wrap gap-3">
                <select
                  value={selectedServiceId ?? ''}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-edge bg-surface-elevated px-3 py-2 text-sm"
                >
                  <option value="">{t('tech.profile.select-service')}</option>
                  {allServices.map((s) => (
                    <option key={s.id as number} value={s.id as number}>
                      {localize(s.titleJson, locale)}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder={t('tech.profile.custom-price')}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-36"
                />
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
                    const mappingId = mapping.id as number;
                    return (
                      <Card key={mappingId} padding="sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {localize(svc?.titleJson, locale)}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {t('tech.profile.base-price')}: {Number(svc?.basePrice ?? 0)}{' '}
                              {t('misc.sar')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ServicePriceEditor
                              mappingId={mappingId}
                              initialPrice={Number(mapping.customPrice ?? svc?.basePrice ?? 0)}
                              saving={
                                updateServiceMut.isPending &&
                                updateServiceMut.variables?.mappingId === mappingId
                              }
                              onSave={(id, price) => {
                                if (Number.isFinite(price) && price > 0) {
                                  updateServiceMut.mutate({ mappingId: id, customPrice: price });
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveService(mappingId)}
                              loading={
                                removeServiceMut.isPending &&
                                removeServiceMut.variables?.mappingId === mappingId
                              }
                            >
                              {t('tech.profile.remove')}
                            </Button>
                          </div>
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
