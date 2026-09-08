'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, Input, formatCurrency, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

export default function VendorPortalPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();

  // Store plan Phase 1 — registration state.
  const {
    data: myStore,
    isLoading: storeLoading,
    refetch: refetchStore,
  } = api.vendorPortal.myStore.useQuery(undefined, { enabled: isAuthenticated });
  const store = myStore as unknown as Record<string, unknown> | null;

  const { data: dash } = api.vendorPortal.dashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: products, refetch } = api.vendorPortal.myProducts.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: orders, refetch: refetchOrders } = api.vendorPortal.orders.useQuery(undefined, {
    enabled: isAuthenticated && !!store,
  });
  const addMut = api.vendorPortal.addProduct.useMutation({
    onSuccess: () => {
      setShow(false);
      refetch();
    },
  });
  const deleteMut = api.vendorPortal.deleteProduct.useMutation({ onSuccess: () => refetch() });
  const fulfillMut = api.vendorPortal.fulfillOrder.useMutation({
    onSuccess: () => refetchOrders(),
  });

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  // E7 — real product shot upload (media pipeline).
  const [prodImage, setProdImage] = useState('');
  const prodImgMut = api.uploads.uploadMedia.useMutation({});

  // Store plan Phase 4b — My Deals + top products.
  const { data: deals, refetch: refetchDeals } = api.vendorPortal.myDeals.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const proposeDealMut = api.vendorPortal.proposeDeal.useMutation({
    onSuccess: () => {
      setShowDeal(false);
      refetchDeals();
    },
  });
  const [showDeal, setShowDeal] = useState(false);
  const [dealProductId, setDealProductId] = useState<number | undefined>();
  const [dealPrice, setDealPrice] = useState('');
  const [dealStarts, setDealStarts] = useState(
    new Date(Date.now() + 3_600_000).toISOString().slice(0, 16),
  );
  const [dealEnds, setDealEnds] = useState(
    new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 16),
  );
  const myDeals = (deals as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const topProducts = (dash?.topProducts as Array<Record<string, unknown>> | undefined) ?? [];

  // Apply form
  const [applyName, setApplyName] = useState('');
  const [applyLicense, setApplyLicense] = useState('');
  const [applyBank, setApplyBank] = useState('');
  const [applyIban, setApplyIban] = useState('');
  const [applyBio, setApplyBio] = useState('');
  const [applyLogo, setApplyLogo] = useState('');
  const applyMut = api.marketplace.becomeVendor.useMutation({
    onSuccess: () => refetchStore(),
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
    onSuccess: () => refetchStore(),
  });
  const applyGymMut = api.marketplace.becomeGym.useMutation({
    onSuccess: () => refetchStore(),
  });
  const applyNailBarMut = api.marketplace.becomeNailBar.useMutation({
    onSuccess: () => refetchStore(),
  });
  const applyAthomeMut = api.marketplace.becomeAthomeSalon.useMutation({
    onSuccess: () => refetchStore(),
  });

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

  const prods = (products as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const storeOrders = (orders as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  /* ---------- Apply wizard (no store/clinic/gym/nail bar/athome yet) ---------- */
  if (!storeLoading && !store) {
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
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorPortal.apply.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.apply.subtitle')}</p>
          </div>
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
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
                      className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
                      className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
                <p className="text-sm text-red-600">
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

  /* ---------- Clinic dashboard (E2) ---------- */
  if (store && (store.type as string) === 'CLINIC') {
    return <ClinicDashboard store={store} />;
  }

  /* ---------- Gym dashboard (E3) ---------- */
  if (store && (store.type as string) === 'GYM') {
    return <GymDashboard store={store} />;
  }

  /* ---------- Nail bar dashboard (E5) ---------- */
  if (store && (store.type as string) === 'NAIL_BAR') {
    return <NailBarDashboard store={store} />;
  }

  /* ---------- At-home salon dashboard (E5) ---------- */
  if (store && (store.type as string) === 'ATHOME') {
    return <AthomeDashboard store={store} />;
  }

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorPortal.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.subtitle')}</p>
          </div>
          <Button onClick={() => setShow(true)}>+ {t('vendorPortal.newProduct')}</Button>
        </div>

        {/* Store plan Phase 1 — approval status */}
        {store && !(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {t('vendorPortal.status.pending-review-desc')}
            </p>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-5">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.totalProducts as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.products')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.totalSales as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.sold')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{formatCurrency((dash?.revenue as number) ?? 0)}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.revenue')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.pendingOrders as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.pendingOrders')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.rating as number) ?? 4.8}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.rating')}</p>
          </Card>
        </div>

        {/* Store plan Phase 1 — orders */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.orders.title')}</h3>
          {storeOrders.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.orders.empty')}</p>
          ) : (
            <div className="space-y-2">
              {storeOrders.map((o: Record<string, unknown>) => {
                const customer = o.customer as Record<string, unknown> | undefined;
                return (
                  <div
                    key={o.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        #{o.id as number} · {formatCurrency(o.totalAmount as number)} ·{' '}
                        {o.itemCount as number} {t('vendorPortal.orders.items')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {customer?.name as string} ·{' '}
                        {new Date(o.createdAt as string).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          o.status === 'FULFILLED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {o.status === 'FULFILLED'
                          ? t('vendorPortal.orders.fulfilled')
                          : t('vendorPortal.orders.pending')}
                      </span>
                      {o.status !== 'FULFILLED' && (
                        <Button
                          size="sm"
                          onClick={() => fulfillMut.mutate({ orderId: o.id as number })}
                          loading={fulfillMut.isPending}
                        >
                          {t('vendorPortal.orders.fulfill')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-3">
          {/* Store plan Phase 4b — My Deals */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('vendorPortal.deals.title')}</h2>
            <Button size="sm" variant="outline" onClick={() => setShowDeal(true)}>
              {t('vendorPortal.deals.propose')}
            </Button>
          </div>
          {myDeals.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.deals.empty')}</p>
          ) : (
            <div className="space-y-2">
              {myDeals.map((sub: Record<string, unknown>) => {
                const payload = (sub.payload ?? {}) as Record<string, unknown>;
                return (
                  <Card key={sub.id as number} padding="sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{payload.titleAr as string}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-tertiary line-through">
                          {formatCurrency(payload.originalPrice as number)}
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {formatCurrency(payload.dealPrice as number)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            sub.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : sub.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {sub.status === 'APPROVED'
                            ? t('vendorPortal.deals.approved')
                            : sub.status === 'REJECTED'
                              ? t('vendorPortal.deals.rejected')
                              : t('vendorPortal.deals.pending')}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Phase 4b — top products (analytics P1) */}
          {topProducts.length > 0 && (
            <Card padding="md">
              <h3 className="mb-2 font-bold">{t('vendorPortal.topProducts')}</h3>
              <div className="space-y-1">
                {topProducts.map((p: Record<string, unknown>) => (
                  <div key={p.id as number} className="flex justify-between text-sm">
                    <span className="font-medium">{localize(p.nameJson, locale)}</span>
                    <span className="text-text-secondary">
                      {p.sales as number} {t('vendorPortal.sales')} ·{' '}
                      {formatCurrency(Number(p.price ?? 0))}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {prods.map((p: Record<string, unknown>) => (
            <Card key={p.id as number} padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji as string}</span>
                <div>
                  <p className="font-bold">{p.nameAr as string}</p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.stock')}: {p.stock as number} · {t('vendorPortal.sales')}:{' '}
                    {p.sales as number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand-600">
                  {formatCurrency(p.price as number)} {t('beautyParty.currency')}
                </span>
                <button
                  onClick={() => deleteMut.mutate({ id: p.id as number })}
                  className="text-red-400"
                >
                  ️
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Phase 4b — propose deal modal */}
        <Modal
          open={showDeal}
          onClose={() => setShowDeal(false)}
          title={t('vendorPortal.deals.propose')}
        >
          <div className="space-y-3">
            <select
              value={dealProductId ?? ''}
              onChange={(e) => setDealProductId(Number(e.target.value) || undefined)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">—</option>
              {prods.map((p: Record<string, unknown>) => (
                <option key={p.id as number} value={p.id as number}>
                  {p.nameAr as string} · {formatCurrency(p.price as number)}
                </option>
              ))}
            </select>
            <Input
              label={t('vendorPortal.deals.price')}
              type="number"
              value={dealPrice}
              onChange={(e) => setDealPrice(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={dealStarts}
              onChange={(e) => setDealStarts(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={dealEnds}
              onChange={(e) => setDealEnds(e.target.value)}
            />
            {proposeDealMut.isError && (
              <p className="text-sm text-red-600">{proposeDealMut.error.message}</p>
            )}
            <Button
              onClick={() =>
                proposeDealMut.mutate({
                  productId: dealProductId ?? 0,
                  dealPrice: Number(dealPrice),
                  startsAt: new Date(dealStarts).toISOString(),
                  endsAt: new Date(dealEnds).toISOString(),
                })
              }
              loading={proposeDealMut.isPending}
              disabled={!dealProductId || !dealPrice || !dealStarts || !dealEnds}
            >
              {t('button.save')}
            </Button>
          </div>
        </Modal>

        <Modal open={show} onClose={() => setShow(false)} title={t('vendorPortal.addProductTitle')}>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('vendorPortal.productNamePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.pricePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.stockPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  prodImgMut.mutate(
                    {
                      mediaType: 'image',
                      file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        base64: String(reader.result ?? ''),
                      },
                    },
                    { onSuccess: (res) => setProdImage(res.url) },
                  );
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-sm"
            />
            {prodImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prodImage} alt="product" className="h-16 w-16 rounded-xl object-cover" />
            )}
            <Button
              onClick={() => {
                if (name.trim() && price > 0)
                  addMut.mutate({
                    nameAr: name.trim(),
                    price,
                    stock,
                    imageUrl: prodImage || undefined,
                  });
              }}
              loading={addMut.isPending || prodImgMut.isPending}
              className="w-full"
            >
              {t('vendorPortal.add')}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

/**
 * E2 — clinic dashboard (the same provider shell as stores): consultation
 * price, slot management, and incoming consultation requests.
 */
function ClinicDashboard({ store }: { store: Record<string, unknown> }): JSX.Element {
  const { t } = useLocale();
  const [price, setPrice] = useState(String((store.consultationPrice as number) ?? 0));
  const [slotStart, setSlotStart] = useState(
    new Date(Date.now() + 3_600_000).toISOString().slice(0, 16),
  );
  const [slotEnd, setSlotEnd] = useState(
    new Date(Date.now() + 2 * 3_600_000).toISOString().slice(0, 16),
  );

  const slotsQ = api.vendorPortal['clinicSlots.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const consultsQ = api.vendorPortal.clinicConsultations.useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const priceMut = api.vendorPortal.setConsultationPrice.useMutation({});
  const addSlotMut = api.vendorPortal['clinicSlots.add'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const removeSlotMut = api.vendorPortal['clinicSlots.remove'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const confirmMut = api.vendorPortal.confirmConsultation.useMutation({
    onSuccess: () => consultsQ.refetch(),
  });
  const clinicCancelMut = api.vendorPortal.clinicCancelConsultation.useMutation({
    onSuccess: () => consultsQ.refetch(),
  });

  const slots = slotsQ.data ?? [];
  const consults = consultsQ.data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t(`clinics.treatment.${store.clinicType as string}` as never)}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.clinic.pending-license')}
            </p>
          </Card>
        )}

        {/* Consultation price */}
        <Card padding="md">
          <div className="flex items-end gap-3">
            <Input
              label={t('vendorPortal.clinic.price')}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-48"
            />
            <Button
              size="sm"
              onClick={() => priceMut.mutate({ price: Number(price) || 0 })}
              loading={priceMut.isPending}
            >
              {t('vendorPortal.clinic.price-save')}
            </Button>
          </div>
        </Card>

        {/* Slots */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.slots-title')}</h3>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={slotEnd}
              onChange={(e) => setSlotEnd(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() =>
                addSlotMut.mutate({
                  startAt: new Date(slotStart).toISOString(),
                  endAt: new Date(slotEnd).toISOString(),
                })
              }
              loading={addSlotMut.isPending}
            >
              {t('vendorPortal.clinic.slot-add')}
            </Button>
          </div>
          <div className="space-y-2">
            {slots.map((s: Record<string, unknown>) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm">
                  {new Date(s.startAt as string).toLocaleDateString('ar-SA')} ·{' '}
                  {new Date(s.startAt as string).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {s.isBooked ? ` · ${t('vendorPortal.orders.fulfilled')}` : ''}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={s.isBooked as boolean}
                  onClick={() => removeSlotMut.mutate({ slotId: s.id as number })}
                  loading={removeSlotMut.isPending}
                >
                  {t('vendorPortal.clinic.slot-remove')}
                </Button>
              </div>
            ))}
            {slots.length === 0 && (
              <p className="text-sm text-text-tertiary">{t('clinics.slots.empty')}</p>
            )}
          </div>
        </Card>

        {/* Incoming consultations */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.clinic.consultations-title')}</h3>
          {consults.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              {t('vendorPortal.clinic.consultations-empty')}
            </p>
          ) : (
            <div className="space-y-2">
              {consults.map((c: Record<string, unknown>) => {
                const customer = c.customer as Record<string, unknown> | undefined;
                return (
                  <div
                    key={c.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {customer?.name as string} · {c.code as string} ·{' '}
                        {t(`clinics.treatment.${c.treatmentType as string}` as never)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(c.scheduledAt as string).toLocaleString('ar-SA')} ·{' '}
                        {formatCurrency(Number(c.price ?? 0))}
                      </p>
                    </div>
                    {c.status === 'REQUESTED' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clinicCancelMut.mutate({ consultationId: c.id as number })}
                          loading={clinicCancelMut.isPending}
                        >
                          {t('clinics.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => confirmMut.mutate({ consultationId: c.id as number })}
                          loading={confirmMut.isPending}
                        >
                          {t('vendorPortal.clinic.confirm')}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {t(`clinics.status.${c.status as string}` as never)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

/** E2 — file upload input for KSA provider documents (top-level: the
 *  react-hooks/static-components rule forbids creating components during
 *  render). */
function DocUploadInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm">
        {value
          ? `${t('vendorPortal.apply.uploaded')} ✓`
          : `${t('vendorPortal.apply.upload')} — ${label}`}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={onChange} />
      </label>
    </div>
  );
}

/**
 * E3 — gym dashboard (the same provider shell as stores/clinics): schedule
 * capacity-based classes and manage incoming class bookings.
 */
function GymDashboard({ store }: { store: Record<string, unknown> }): JSX.Element {
  const { t, locale } = useLocale();
  const [clsNameAr, setClsNameAr] = useState('');
  const [clsNameEn, setClsNameEn] = useState('');
  const [clsStart, setClsStart] = useState(
    new Date(Date.now() + 24 * 3_600_000).toISOString().slice(0, 16),
  );
  const [clsEnd, setClsEnd] = useState(
    new Date(Date.now() + 25 * 3_600_000).toISOString().slice(0, 16),
  );
  const [clsCapacity, setClsCapacity] = useState(10);
  const [clsPrice, setClsPrice] = useState(0);

  const classesQ = api.vendorPortal['gymClasses.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const bookingsQ = api.vendorPortal.gymClassBookings.useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addClassMut = api.vendorPortal['gymClasses.add'].useMutation({
    onSuccess: () => classesQ.refetch(),
  });
  const removeClassMut = api.vendorPortal['gymClasses.remove'].useMutation({
    onSuccess: () => classesQ.refetch(),
  });
  const gymCancelMut = api.vendorPortal.gymCancelBooking.useMutation({
    onSuccess: () => {
      bookingsQ.refetch();
      classesQ.refetch();
    },
  });

  const classes = classesQ.data ?? [];
  const bookings = bookingsQ.data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {store.gymType ? t(`gyms.type.${store.gymType as string}` as never) : ''} ·{' '}
            {store.gymCity as string} · {store.gymAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
          </Card>
        )}

        {/* Classes */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.gym.classes-title')}</h3>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <Input
              label={t('vendorPortal.gym.class-add')}
              value={clsNameAr}
              onChange={(e) => setClsNameAr(e.target.value)}
              placeholder="اليوغا"
            />
            <Input
              label="EN"
              value={clsNameEn}
              onChange={(e) => setClsNameEn(e.target.value)}
              placeholder="Yoga"
            />
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={clsStart}
              onChange={(e) => setClsStart(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={clsEnd}
              onChange={(e) => setClsEnd(e.target.value)}
            />
            <Input
              label={t('vendorPortal.gym.capacity')}
              type="number"
              value={String(clsCapacity)}
              onChange={(e) => setClsCapacity(parseInt(e.target.value) || 0)}
            />
            <Input
              label={t('vendorPortal.gym.price')}
              type="number"
              value={String(clsPrice)}
              onChange={(e) => setClsPrice(parseInt(e.target.value) || 0)}
            />
          </div>
          <Button
            size="sm"
            disabled={!clsNameAr.trim() || !clsNameEn.trim() || clsCapacity < 1}
            onClick={() =>
              addClassMut.mutate({
                nameAr: clsNameAr.trim(),
                nameEn: clsNameEn.trim(),
                startsAt: new Date(clsStart).toISOString(),
                endsAt: new Date(clsEnd).toISOString(),
                capacity: clsCapacity,
                price: clsPrice,
              })
            }
            loading={addClassMut.isPending}
          >
            {t('vendorPortal.gym.class-add')}
          </Button>
          <div className="mt-3 space-y-2">
            {classes.map((c: Record<string, unknown>) => (
              <div
                key={c.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <p className="text-sm">
                  {localize(c.nameJson, locale)} ·{' '}
                  {new Date(c.startsAt as string).toLocaleString('ar-SA')} ·{' '}
                  {c.enrolledCount as number}/{c.capacity as number}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(c.enrolledCount as number) > 0}
                  onClick={() => removeClassMut.mutate({ classId: c.id as number })}
                  loading={removeClassMut.isPending}
                >
                  {t('vendorPortal.gym.class-remove')}
                </Button>
              </div>
            ))}
            {classes.length === 0 && (
              <p className="text-sm text-text-tertiary">{t('gyms.classes.empty')}</p>
            )}
          </div>
        </Card>

        {/* Class bookings */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.gym.bookings-title')}</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.gym.bookings-empty')}</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: Record<string, unknown>) => {
                const customer = b.customer as Record<string, unknown> | undefined;
                const cls = b.class as Record<string, unknown> | undefined;
                return (
                  <div
                    key={b.id as number}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {customer?.name as string} · {b.code as string}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {cls ? localize(cls.nameJson, locale) : ''} ·{' '}
                        {cls ? new Date(cls.startsAt as string).toLocaleString('ar-SA') : ''}
                      </p>
                    </div>
                    {b.status === 'BOOKED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => gymCancelMut.mutate({ bookingId: b.id as number })}
                        loading={gymCancelMut.isPending}
                      >
                        {t('gyms.cancel')}
                      </Button>
                    ) : (
                      <span className="text-sm font-semibold">
                        {t(`gyms.status.${b.status as string}` as never)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

/* ================================================================
 * E5 — Nail bar dashboard (station-capacity slots + bookings)
 * ================================================================ */
function NailBarDashboard({ store }: { store: Record<string, unknown> }): JSX.Element {
  const { t } = useLocale();
  const [slotStart, setSlotStart] = useState(
    new Date(Date.now() + 24 * 3_600_000).toISOString().slice(0, 16),
  );
  const [slotEnd, setSlotEnd] = useState(
    new Date(Date.now() + 25 * 3_600_000).toISOString().slice(0, 16),
  );
  const [slotCapacity, setSlotCapacity] = useState(4);

  const slotsQ = api.vendorPortal['nailBarSlots.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const bookingsQ = api.vendorPortal.nailBarBookings.useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addSlotMut = api.vendorPortal['nailBarSlots.add'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });
  const removeSlotMut = api.vendorPortal['nailBarSlots.remove'].useMutation({
    onSuccess: () => slotsQ.refetch(),
  });

  const slots = slotsQ.data ?? [];
  const bookings = bookingsQ.data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {store.nailBarType ? t(`nailBars.type.${store.nailBarType as string}` as never) : ''} ·{' '}
            {store.nailBarCity as string} · {store.nailBarAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
          </Card>
        )}

        {/* Station slots */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.nailBar.slots-title')}</h3>
          <div className="mb-3 grid gap-3 sm:grid-cols-3">
            <Input
              label={t('vendorPortal.deals.starts')}
              type="datetime-local"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
            />
            <Input
              label={t('vendorPortal.deals.ends')}
              type="datetime-local"
              value={slotEnd}
              onChange={(e) => setSlotEnd(e.target.value)}
            />
            <Input
              label={t('vendorPortal.nailBar.capacity')}
              type="number"
              value={String(slotCapacity)}
              onChange={(e) => setSlotCapacity(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button
            size="sm"
            disabled={slotCapacity < 1}
            onClick={() =>
              addSlotMut.mutate({
                startAt: new Date(slotStart).toISOString(),
                endAt: new Date(slotEnd).toISOString(),
                capacity: slotCapacity,
              })
            }
            loading={addSlotMut.isPending}
          >
            {t('vendorPortal.nailBar.slot-add')}
          </Button>
          <div className="mt-3 space-y-2">
            {slots.map((s: Record<string, unknown>) => (
              <div
                key={s.id as number}
                className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
              >
                <p className="text-sm">
                  {new Date(s.startAt as string).toLocaleString()} →{' '}
                  {new Date(s.endAt as string).toLocaleString()} ·{' '}
                  <span className="font-bold">
                    {s.bookedCount as number}/{s.capacity as number}
                  </span>
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={(s.bookedCount as number) > 0}
                  onClick={() => removeSlotMut.mutate({ slotId: s.id as number })}
                  loading={removeSlotMut.isPending}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Incoming bookings */}
        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.nailBar.bookings-title')}</h3>
          {bookings.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.nailBar.bookings-empty')}</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: Record<string, unknown>) => (
                <div
                  key={b.id as number}
                  className="flex items-center justify-between rounded-xl bg-surface-muted p-3"
                >
                  <div>
                    <p className="text-sm font-bold">{b.code as string}</p>
                    <p className="text-xs text-text-secondary">
                      {(b.customer as Record<string, unknown> | null)?.name as string} ·{' '}
                      {(b.customer as Record<string, unknown> | null)?.phone as string} ·{' '}
                      {b.slot
                        ? new Date(
                            (b.slot as Record<string, unknown>).startAt as string,
                          ).toLocaleString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

/* ================================================================
 * E5 — At-home salon dashboard (assigned home requests)
 * ================================================================ */
function AthomeDashboard({ store }: { store: Record<string, unknown> }): JSX.Element {
  const { t } = useLocale();
  const requestsQ = api.vendorPortal['homeRequests.list'].useQuery(undefined) as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const completeMut = api.vendorPortal['homeRequests.complete'].useMutation({
    onSuccess: () => requestsQ.refetch(),
  });

  const requests = requestsQ.data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName as string}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('vendorPortal.athome.coverage')}: {store.homeCity as string} ·{' '}
            {store.homeAddress as string}
          </p>
        </div>

        {!(store.isVerified as boolean) && (
          <Card
            padding="md"
            className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
          >
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t('vendorPortal.status.pending-review')}
            </p>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="mb-3 font-bold">{t('vendorPortal.athome.requests-title')}</h3>
          {requests.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t('vendorPortal.athome.requests-empty')}</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r: Record<string, unknown>) => (
                <div key={r.id as number} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">
                      {(r.customer as Record<string, unknown> | null)?.name as string}
                    </p>
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {r.status as string}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {r.address as string} · {r.preferredDate as string} ·{' '}
                    {r.preferredTime as string}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {(r.service as Record<string, unknown> | null)
                      ? String(
                          (
                            (r.service as Record<string, unknown>).titleJson as Record<
                              string,
                              string
                            >
                          )?.ar ?? '',
                        )
                      : ''}
                  </p>
                  {r.status === 'PENDING' && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => completeMut.mutate({ requestId: r.id as number })}
                      loading={completeMut.isPending}
                    >
                      {t('vendorPortal.athome.complete')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
