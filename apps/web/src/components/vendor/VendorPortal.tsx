'use client';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type * as React from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/trpc';
import { Card, Button, Input, CardSkeleton, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { DocUploadInput } from './shared/DocUploadInput';
import {
  DRAFT_KEY,
  buildVendorApplyDraft,
  parseVendorApplyDraft,
  vendorApplyCompleteness,
} from '@galaxy/shared';

const StoreDashboard = dynamic(() =>
  import('./store/StoreDashboard').then((m) => m.StoreDashboard),
);
const ClinicDashboard = dynamic(() =>
  import('./clinic/ClinicDashboard').then((m) => m.ClinicDashboard),
);
const GymDashboard = dynamic(() => import('./gym/GymDashboard').then((m) => m.GymDashboard));
const NailBarDashboard = dynamic(() =>
  import('./nail-bar/NailBarDashboard').then((m) => m.NailBarDashboard),
);
const AthomeDashboard = dynamic(() =>
  import('./athome/AthomeDashboard').then((m) => m.AthomeDashboard),
);

/**
 * Provider portal (customer-shell entry). Store/clinic/gym/nail-bar/athome
 * owners get their type-specific dashboard under the same route; the wizard
 * below handles users who have not registered a venue yet.
 */
export function VendorPortal({ shellRole = 'CUSTOMER' }: { shellRole?: string }): JSX.Element {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();

  // Store plan Phase 1 — registration state.
  const {
    data: myStore,
    isLoading: storeLoading,
    refetch: refetchStore,
  } = api.vendorPortal.myStore.useQuery(undefined, { enabled: isAuthenticated });
  const store = myStore;

  // A1 — pending store-team invitation (accept/decline on the portal).
  const invitationQ = api.vendorPortal.staff.myInvitation.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const acceptInviteMut = api.vendorPortal.staff.accept.useMutation({
    onSuccess: () => {
      void refetchStore();
    },
  });
  const declineInviteMut = api.vendorPortal.staff.decline.useMutation({
    onSuccess: () => {
      void invitationQ.refetch();
    },
  });

  // Apply form
  const [applyName, setApplyName] = useState('');
  const [applyLicense, setApplyLicense] = useState('');
  const [applyBank, setApplyBank] = useState('');
  const [applyIban, setApplyIban] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applyLogo, setApplyLogo] = useState('');
  const applyMut = api.marketplace.becomeVendor.useMutation({
    onSuccess: () => {
      refetchStore();
      clearDraft();
    },
  });

  // E2 — KSA provider documents + clinic registration.
  const [applyType, setApplyType] = useState<'store' | 'clinic' | 'gym' | 'nail_bar' | 'athome'>(
    'store',
  );
  const [applyClinicType, setApplyClinicType] = useState('dermatology');
  const [applyAgency, setApplyAgency] = useState('MOH');
  const [docCr, setDocCr] = useState('');
  const [docNationalId, setDocNationalId] = useState('');
  const [docBankLetter, setDocBankLetter] = useState('');
  const [docMedicalLicense, setDocMedicalLicense] = useState('');
  // E3 — gym registration fields.
  const [applyGymType, setApplyGymType] = useState('ladies');
  const [applyGymCity, setApplyGymCity] = useState('');
  const [applyGymAddress, setApplyGymAddress] = useState('');
  const [docGymLicense, setDocGymLicense] = useState('');
  // E5 — nail bar + at-home salon registration fields.
  const [applyNailBarType, setApplyNailBarType] = useState('standard');
  const [applyNailBarCity, setApplyNailBarCity] = useState('');
  const [applyNailBarAddress, setApplyNailBarAddress] = useState('');
  const uploadMut = api.uploads.uploadKycDocument.useMutation({});
  const applyClinicMut = api.marketplace.becomeClinic.useMutation({
    onSuccess: () => {
      refetchStore();
      clearDraft();
    },
  });
  const applyGymMut = api.marketplace.becomeGym.useMutation({
    onSuccess: () => {
      refetchStore();
      clearDraft();
    },
  });
  const applyNailBarMut = api.marketplace.becomeNailBar.useMutation({
    onSuccess: () => {
      refetchStore();
      clearDraft();
    },
  });
  const applyAthomeMut = api.marketplace.becomeAthomeSalon.useMutation({
    onSuccess: () => {
      refetchStore();
      clearDraft();
    },
  });
  // E6d — trust badge self-service toggles.

  // G1 — wizard persistence: restore a previous draft on mount, save it
  // (debounced) on every change, clear it on successful submission or
  // once a store exists (submitted from another device).
  const draftFields = {
    applyType,
    applyName,
    applyBio,
    applyLogo,
    applyLicense,
    applyAgency,
    applyClinicType,
    applyGymType,
    applyGymCity,
    applyGymAddress,
    applyNailBarType,
    applyNailBarCity,
    applyNailBarAddress,
    docCr,
    docNationalId,
    docBankLetter,
    docMedicalLicense,
    docGymLicense,
  };
  const [draftResumed, setDraftResumed] = useState(false);
  const clearDraft = () => {
    window.localStorage.removeItem(DRAFT_KEY);
    setDraftResumed(false);
  };
  useEffect(() => {
    const draft = parseVendorApplyDraft(window.localStorage.getItem(DRAFT_KEY));
    if (!draft) return;
    setDraftResumed(true);
    if (draft.applyType) setApplyType(draft.applyType as never);
    if (draft.applyName) setApplyName(draft.applyName);
    if (draft.applyBio) setApplyBio(draft.applyBio);
    if (draft.applyLogo) setApplyLogo(draft.applyLogo);
    if (draft.applyLicense) setApplyLicense(draft.applyLicense);
    if (draft.applyAgency) setApplyAgency(draft.applyAgency);
    if (draft.applyClinicType) setApplyClinicType(draft.applyClinicType);
    if (draft.applyGymType) setApplyGymType(draft.applyGymType);
    if (draft.applyGymCity) setApplyGymCity(draft.applyGymCity);
    if (draft.applyGymAddress) setApplyGymAddress(draft.applyGymAddress);
    if (draft.applyNailBarType) setApplyNailBarType(draft.applyNailBarType);
    if (draft.applyNailBarCity) setApplyNailBarCity(draft.applyNailBarCity);
    if (draft.applyNailBarAddress) setApplyNailBarAddress(draft.applyNailBarAddress);
    if (draft.docCr) setDocCr(draft.docCr);
    if (draft.docNationalId) setDocNationalId(draft.docNationalId);
    if (draft.docBankLetter) setDocBankLetter(draft.docBankLetter);
    if (draft.docMedicalLicense) setDocMedicalLicense(draft.docMedicalLicense);
    if (draft.docGymLicense) setDocGymLicense(draft.docGymLicense);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only restore
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      window.localStorage.setItem(DRAFT_KEY, buildVendorApplyDraft(draftFields));
    }, 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draftFields is rebuilt each render by design
  }, [draftFields]);
  useEffect(() => {
    if (store) window.localStorage.removeItem(DRAFT_KEY);
  }, [store]);

  const uploadDoc =
    (documentType: 'cr' | 'national_id' | 'bank_letter' | 'medical_license' | 'license') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        uploadMut.mutate(
          {
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              base64: String(reader.result ?? ''),
            },
            documentType,
          },
          {
            onSuccess: (res) => {
              if (documentType === 'cr') setDocCr(res.url);
              if (documentType === 'national_id') setDocNationalId(res.url);
              if (documentType === 'bank_letter') setDocBankLetter(res.url);
              if (documentType === 'medical_license') setDocMedicalLicense(res.url);
              if (documentType === 'license') setDocGymLicense(res.url);
            },
          },
        );
      };
      reader.readAsDataURL(file);
    };

  /* ---------- Loading (myStore in flight) — the owner dashboards below must
      never render against undefined store data (crash: bannerUrl of
      undefined, caught by the root error boundary). ---------- */
  if (storeLoading) {
    return (
      <DashboardLayout userRole={shellRole}>
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------- Apply wizard (no store/clinic/gym/nail bar/athome yet) ---------- */
  if (!storeLoading && !store) {
    // A1 — a pending staff invitation supersedes the wizard: the invitee
    // joins the store team instead of registering a venue of their own.
    if (invitationQ.data) {
      return (
        <DashboardLayout userRole={shellRole}>
          <div className="mx-auto max-w-xl p-6">
            <Card padding="md" className="space-y-4">
              <div>
                <h1 className="text-xl font-bold">{t('vendorPortal.staff.banner.title')}</h1>
                <p className="mt-2 text-sm text-text-secondary">
                  {t('vendorPortal.staff.banner.body', {
                    storeName: invitationQ.data.storeName,
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => acceptInviteMut.mutate()}
                  loading={acceptInviteMut.isPending}
                  data-testid="staff-invitation-accept"
                >
                  {t('vendorPortal.staff.accept')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => declineInviteMut.mutate()}
                  disabled={declineInviteMut.isPending}
                >
                  {t('vendorPortal.staff.decline')}
                </Button>
              </div>
            </Card>
          </div>
        </DashboardLayout>
      );
    }

    const isClinic = applyType === 'clinic';
    const isGym = applyType === 'gym';
    const isNailBar = applyType === 'nail_bar';
    const isAthome = applyType === 'athome';
    const docsReady = isClinic
      ? docMedicalLicense && docCr && docNationalId
      : isGym || isNailBar || isAthome
        ? docGymLicense && docCr && docNationalId
        : docCr && docNationalId && docBankLetter;
    const submit = () => {
      const slug = `provider-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      if (isClinic) {
        applyClinicMut.mutate({
          storeName: applyName.trim(),
          storeSlug: slug,
          clinicType: applyClinicType as never,
          licenseNumber: applyLicense.trim(),
          licenseAgency: applyAgency as never,
          descriptionAr: applyBio.trim() || undefined,
          logoUrl: applyLogo.trim() || undefined,
          documents: {
            medicalLicenseUrl: docMedicalLicense,
            crUrl: docCr,
            nationalIdUrl: docNationalId,
          },
        });
      } else if (isGym) {
        applyGymMut.mutate({
          storeName: applyName.trim(),
          storeSlug: slug,
          gymType: applyGymType as never,
          licenseNumber: applyLicense.trim(),
          licenseAgency: 'MISA',
          gymCity: applyGymCity.trim(),
          gymAddress: applyGymAddress.trim(),
          descriptionAr: applyBio.trim() || undefined,
          logoUrl: applyLogo.trim() || undefined,
          documents: {
            licenseUrl: docGymLicense,
            crUrl: docCr,
            nationalIdUrl: docNationalId,
          },
        });
      } else if (isNailBar) {
        applyNailBarMut.mutate({
          storeName: applyName.trim(),
          storeSlug: slug,
          nailBarType: applyNailBarType as never,
          licenseNumber: applyLicense.trim(),
          licenseAgency: 'MUNICIPALITY',
          nailBarCity: applyNailBarCity.trim(),
          nailBarAddress: applyNailBarAddress.trim(),
          descriptionAr: applyBio.trim() || undefined,
          logoUrl: applyLogo.trim() || undefined,
          documents: {
            licenseUrl: docGymLicense,
            crUrl: docCr,
            nationalIdUrl: docNationalId,
          },
        });
      } else if (isAthome) {
        applyAthomeMut.mutate({
          storeName: applyName.trim(),
          storeSlug: slug,
          licenseNumber: applyLicense.trim(),
          licenseAgency: 'MUNICIPALITY',
          homeCity: applyNailBarCity.trim(),
          homeAddress: applyNailBarAddress.trim(),
          descriptionAr: applyBio.trim() || undefined,
          logoUrl: applyLogo.trim() || undefined,
          documents: {
            licenseUrl: docGymLicense,
            crUrl: docCr,
            nationalIdUrl: docNationalId,
          },
        });
      } else {
        applyMut.mutate({
          storeName: applyName.trim(),
          storeSlug: slug,
          descriptionAr: applyBio.trim() || undefined,
          licenseNumber: applyLicense.trim(),
          bankName: applyBank.trim() || undefined,
          bankIban: applyIban.trim() || undefined,
          logoUrl: applyLogo.trim() || undefined,
          documents: { crUrl: docCr, nationalIdUrl: docNationalId, bankLetterUrl: docBankLetter },
        });
      }
    };

    return (
      <DashboardLayout userRole={shellRole}>
        <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorPortal.apply.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.apply.subtitle')}</p>
          </div>

          {/* G1 — resume banner: a previous draft was restored from
              localStorage; completeness reflects the submit button's gate. */}
          {draftResumed && (
            <Card
              padding="md"
              className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {t('vendorPortal.apply.draft-resumed')} · {vendorApplyCompleteness(draftFields)}٪
                </p>
                <Button size="sm" variant="outline" onClick={clearDraft}>
                  {t('vendorPortal.apply.draft-discard')}
                </Button>
              </div>
            </Card>
          )}
          <Card padding="lg">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={applyType === 'store' ? 'primary' : 'outline'}
                  onClick={() => setApplyType('store')}
                >
                  {t('vendorPortal.apply.register-store')}
                </Button>
                <Button
                  size="sm"
                  variant={isClinic ? 'primary' : 'outline'}
                  onClick={() => setApplyType('clinic')}
                >
                  {t('vendorPortal.apply.register-clinic')}
                </Button>
                <Button
                  size="sm"
                  variant={isGym ? 'primary' : 'outline'}
                  onClick={() => setApplyType('gym')}
                >
                  {t('vendorPortal.apply.register-gym')}
                </Button>
                <Button
                  size="sm"
                  variant={isNailBar ? 'primary' : 'outline'}
                  onClick={() => setApplyType('nail_bar')}
                >
                  {t('vendorPortal.apply.register-nail-bar')}
                </Button>
                <Button
                  size="sm"
                  variant={isAthome ? 'primary' : 'outline'}
                  onClick={() => setApplyType('athome')}
                >
                  {t('vendorPortal.apply.register-athome')}
                </Button>
              </div>

              <Input
                label={t('vendorPortal.apply.store-name')}
                value={applyName}
                onChange={(e) => setApplyName(e.target.value)}
              />

              {isClinic ? (
                <>
                  <select
                    value={applyClinicType}
                    onChange={(e) => setApplyClinicType(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                  >
                    {['dermatology', 'laser', 'injectables', 'dental', 'nutrition'].map((tt) => (
                      <option key={tt} value={tt}>
                        {t(`clinics.treatment.${tt}` as never)}
                      </option>
                    ))}
                  </select>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label={t('vendorPortal.apply.license')}
                      value={applyLicense}
                      onChange={(e) => setApplyLicense(e.target.value)}
                      placeholder="MOH-123456"
                    />
                    <select
                      value={applyAgency}
                      onChange={(e) => setApplyAgency(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                    >
                      <option value="MOH">MOH</option>
                      <option value="SFDA">SFDA</option>
                    </select>
                  </div>
                </>
              ) : isGym ? (
                <>
                  <select
                    value={applyGymType}
                    onChange={(e) => setApplyGymType(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                  >
                    <option value="ladies">{t('gyms.type.ladies')}</option>
                    <option value="family">{t('gyms.type.family')}</option>
                  </select>
                  <Input
                    label={t('vendorPortal.apply.license')}
                    value={applyLicense}
                    onChange={(e) => setApplyLicense(e.target.value)}
                    placeholder="MISA-123456"
                  />
                  <Input
                    label={t('vendorPortal.apply.gym-city')}
                    value={applyGymCity}
                    onChange={(e) => setApplyGymCity(e.target.value)}
                  />
                  <Input
                    label={t('vendorPortal.apply.gym-address')}
                    value={applyGymAddress}
                    onChange={(e) => setApplyGymAddress(e.target.value)}
                  />
                </>
              ) : isNailBar || isAthome ? (
                <>
                  {isNailBar && (
                    <select
                      value={applyNailBarType}
                      onChange={(e) => setApplyNailBarType(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                    >
                      <option value="standard">{t('nailBars.type.standard')}</option>
                      <option value="express">{t('nailBars.type.express')}</option>
                    </select>
                  )}
                  <Input
                    label={t('vendorPortal.apply.license')}
                    value={applyLicense}
                    onChange={(e) => setApplyLicense(e.target.value)}
                    placeholder="MUN-123456"
                  />
                  <Input
                    label={t(
                      isNailBar
                        ? 'vendorPortal.apply.nail-bar-city'
                        : 'vendorPortal.apply.athome-city',
                    )}
                    value={applyNailBarCity}
                    onChange={(e) => setApplyNailBarCity(e.target.value)}
                  />
                  <Input
                    label={t(
                      isNailBar
                        ? 'vendorPortal.apply.nail-bar-address'
                        : 'vendorPortal.apply.athome-address',
                    )}
                    value={applyNailBarAddress}
                    onChange={(e) => setApplyNailBarAddress(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Input
                    label={t('vendorPortal.apply.license')}
                    value={applyLicense}
                    onChange={(e) => setApplyLicense(e.target.value)}
                    placeholder="CR-123456"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label={t('vendorPortal.apply.bank')}
                      value={applyBank}
                      onChange={(e) => setApplyBank(e.target.value)}
                    />
                    <Input
                      label={t('vendorPortal.apply.iban')}
                      value={applyIban}
                      onChange={(e) => setApplyIban(e.target.value)}
                      placeholder="SA0000000000000000000000"
                    />
                  </div>
                </>
              )}

              <Input
                label={t('vendorPortal.apply.bio')}
                value={applyBio}
                onChange={(e) => setApplyBio(e.target.value)}
              />
              <Input
                label={t('vendorPortal.apply.logo')}
                value={applyLogo}
                onChange={(e) => setApplyLogo(e.target.value)}
                placeholder="https://…"
              />

              {/* E2 — KSA required documents */}
              <div>
                <p className="mb-2 text-sm font-semibold">
                  {t('vendorPortal.apply.documents-title')}
                </p>
                <div className="space-y-2">
                  {isClinic ? (
                    <>
                      <DocUploadInput
                        label={t('vendorPortal.apply.doc-medical-license')}
                        value={docMedicalLicense}
                        onChange={uploadDoc('medical_license')}
                      />
                      <DocUploadInput
                        label={t('vendorPortal.apply.doc-cr')}
                        value={docCr}
                        onChange={uploadDoc('cr')}
                      />
                    </>
                  ) : isGym ? (
                    <DocUploadInput
                      label={t('vendorPortal.apply.doc-license')}
                      value={docGymLicense}
                      onChange={uploadDoc('license')}
                    />
                  ) : (
                    <DocUploadInput
                      label={t('vendorPortal.apply.doc-cr')}
                      value={docCr}
                      onChange={uploadDoc('cr')}
                    />
                  )}
                  {!isGym && (
                    <DocUploadInput
                      label={t('vendorPortal.apply.doc-national-id')}
                      value={docNationalId}
                      onChange={uploadDoc('national_id')}
                    />
                  )}
                  {!isClinic && !isGym && !isNailBar && !isAthome && (
                    <DocUploadInput
                      label={t('vendorPortal.apply.doc-bank-letter')}
                      value={docBankLetter}
                      onChange={uploadDoc('bank_letter')}
                    />
                  )}
                  {(isGym || isNailBar || isAthome) && (
                    <>
                      <DocUploadInput
                        label={t('vendorPortal.apply.doc-cr')}
                        value={docCr}
                        onChange={uploadDoc('cr')}
                      />
                      <DocUploadInput
                        label={t('vendorPortal.apply.doc-national-id')}
                        value={docNationalId}
                        onChange={uploadDoc('national_id')}
                      />
                    </>
                  )}
                </div>
              </div>

              {(applyMut.isError ||
                applyClinicMut.isError ||
                applyGymMut.isError ||
                applyNailBarMut.isError ||
                applyAthomeMut.isError) && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {(applyMut.isError
                    ? applyMut.error?.message
                    : applyClinicMut.isError
                      ? applyClinicMut.error?.message
                      : applyGymMut.isError
                        ? applyGymMut.error?.message
                        : applyNailBarMut.isError
                          ? applyNailBarMut.error?.message
                          : applyAthomeMut.error?.message) ?? ''}
                </p>
              )}
              <Button
                onClick={submit}
                loading={
                  applyMut.isPending ||
                  applyClinicMut.isPending ||
                  applyGymMut.isPending ||
                  applyNailBarMut.isPending ||
                  applyAthomeMut.isPending ||
                  uploadMut.isPending
                }
                disabled={
                  !applyName.trim() ||
                  (isClinic || isGym || isNailBar || isAthome ? !applyLicense.trim() : false) ||
                  !docsReady
                }
                className="w-full"
              >
                {t('vendorPortal.apply.submit')}
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  /* ---------- Per-type dashboards (lazy — only the owner's chunk ships) ---------- */
  if (!store) return <></>;

  if (store && store.type === 'CLINIC') {
    return (
      <ClinicDashboard store={store} refetchStore={() => refetchStore()} shellRole={shellRole} />
    );
  }

  if (store && store.type === 'GYM') {
    return <GymDashboard store={store} refetchStore={() => refetchStore()} shellRole={shellRole} />;
  }

  if (store && store.type === 'NAIL_BAR') {
    return (
      <NailBarDashboard store={store} refetchStore={() => refetchStore()} shellRole={shellRole} />
    );
  }

  if (store && store.type === 'ATHOME') {
    return <AthomeDashboard store={store} shellRole={shellRole} />;
  }

  return <StoreDashboard store={store} refetchStore={() => refetchStore()} shellRole={shellRole} />;
}
