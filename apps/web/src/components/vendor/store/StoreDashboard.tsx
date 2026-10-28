'use client';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type * as React from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, Input, formatCurrency, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore, StoreDealPayload, StoreOrderRow } from '@galaxy/api';
import { localize, type TranslationKey } from '@galaxy/shared';
import { VenueProfileCard } from '../shared/VenueProfileCard';
import { SubmissionStatusCard } from '../shared/SubmissionStatusCard';
import { ProductVariantsModal } from './ProductVariantsModal';
import { StockInModal } from './StockInModal';
import { PricingRulesPanel } from './PricingRulesPanel';
import { StoreServicesPanel } from './StoreServicesPanel';
import { StaffPanel } from '../shared/StaffPanel';
import { DashboardTabs } from '../shared/DashboardTabs';
import { VendorTour } from '../shared/VendorTour';

type TabKey =
  | 'overview'
  | 'orders'
  | 'products'
  | 'deals'
  | 'coupons'
  | 'earnings'
  | 'analytics'
  | 'reviews'
  | 'customers'
  | 'inbox'
  | 'staff'
  | 'pricing'
  | 'services';

const TAB_KEYS: TabKey[] = [
  'overview',
  'orders',
  'products',
  'deals',
  'coupons',
  'earnings',
  'analytics',
  'reviews',
  'customers',
  'inbox',
  'staff',
  'pricing',
  'services',
];

/** A3 — read the ?tab= deep link once on mount (hydration-safe; the page is
 *  client-only, so window is available). */
function initialTab(): TabKey {
  const q = new URLSearchParams(window.location.search).get('tab');
  return TAB_KEYS.includes(q as TabKey) ? (q as TabKey) : 'overview';
}

/**
 * S1 — generic store dashboard: KPIs, orders, deals and the product catalog
 * in an A3 tabbed workspace (Overview / Orders / Products / Deals). Extracted
 * from VendorPortal (A1 decomposition); lazy-loaded per vendor type so only
 * the owner's dashboard chunk ships.
 */
/**
 * D4 — one-click CSV export for orders/products/analytics, following the
 * B4 earnings download pattern (bilingual headers from the server).
 */
function useCsvDownload(kind: 'orders' | 'products' | 'analytics'): {
  download: () => Promise<void>;
  pending: boolean;
} {
  const { locale } = useLocale();
  const q = api.vendorPortal.exportCsv.useQuery(
    { kind, locale: locale === 'ar' ? 'ar' : 'en' },
    { enabled: false },
  );
  const download = async () => {
    const res = await q.refetch();
    const csv = res.data?.csv ?? '';
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind}-${locale}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return { download, pending: q.isFetching };
}

export function StoreDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: NonNullable<MyStore>;
  refetchStore: () => void;
  shellRole?: string;
}): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { data: dash } = api.vendorPortal.dashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  // A1 — the caller's portal relationship drives tab visibility: owners see
  // everything, staff see only the tabs their capabilities unlock.
  const accessQ = api.vendorPortal.staff.access.useQuery(undefined, { enabled: isAuthenticated });
  const access = accessQ.data ?? { kind: 'none', permissions: [] };
  const can = (cap: string) =>
    access.kind === 'owner' || (access.permissions as string[]).includes(cap);
  // A5 — cursor-paginated lists via useInfiniteQuery.
  const productsQ = api.vendorPortal.myProducts.useInfiniteQuery(
    { limit: 20 },
    {
      enabled: isAuthenticated,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const ordersQ = api.vendorPortal.orders.useInfiniteQuery(
    { limit: 20 },
    {
      enabled: isAuthenticated && !!store,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const { refetch } = productsQ;
  const { refetch: refetchOrders } = ordersQ;
  const addMut = api.vendorPortal.addProduct.useMutation({
    onSuccess: () => {
      setShow(false);
      refetch();
    },
  });
  const deleteMut = api.vendorPortal.deleteProduct.useMutation({ onSuccess: () => refetch() });

  // C1 — product editor pro: edit / draft toggle / duplicate.
  const updateMut = api.vendorPortal.updateProduct.useMutation({
    onSuccess: () => {
      setEditId(null);
      refetch();
    },
  });
  const duplicateMut = api.vendorPortal.duplicateProduct.useMutation({
    onSuccess: () => refetch(),
  });
  const setDraftMut = api.vendorPortal.setDraft.useMutation({ onSuccess: () => refetch() });
  // C6 — featured picker (storefront profile ordering).
  const featuredMut = api.vendorPortal.setProductFeatured.useMutation({
    onSuccess: () => refetch(),
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [edNameAr, setEdNameAr] = useState('');
  const [edNameEn, setEdNameEn] = useState('');
  const [edDescAr, setEdDescAr] = useState('');
  const [edDescEn, setEdDescEn] = useState('');
  const [edPrice, setEdPrice] = useState(0);
  const [edStock, setEdStock] = useState(0);
  const [edEmoji, setEdEmoji] = useState('');
  const [edCategoryId, setEdCategoryId] = useState<number | undefined>();
  const [edImages, setEdImages] = useState<string[]>([]);
  const [edThreshold, setEdThreshold] = useState(5);
  // C4 — rich media + product SEO editor fields.
  const [edVideoUrl, setEdVideoUrl] = useState('');
  const [edMetaTitleAr, setEdMetaTitleAr] = useState('');
  const [edMetaTitleEn, setEdMetaTitleEn] = useState('');
  const [edMetaDescAr, setEdMetaDescAr] = useState('');
  const [edMetaDescEn, setEdMetaDescEn] = useState('');
  const [edArTryOnUrl, setEdArTryOnUrl] = useState('');
  const { data: categories } = api.marketplace.productCategories.useQuery();
  const edImgMut = api.uploads.uploadMedia.useMutation({
    onSuccess: (res) => setEdImages((prev) => [...prev, res.url]),
  });

  /** C1 — open the editor, populating the form from a portal row. */
  const openEdit = (p: (typeof prods)[number]) => {
    setEditId(p.id);
    setEdNameAr(p.nameAr);
    setEdNameEn(p.nameEn);
    setEdDescAr(p.descAr);
    setEdDescEn(p.descEn);
    setEdPrice(p.price);
    setEdStock(p.stock);
    setEdEmoji(p.emoji);
    setEdCategoryId(undefined);
    setEdImages(p.images);
    setEdThreshold(p.threshold);
    // C4 — media + SEO fields.
    setEdVideoUrl(p.videoUrl ?? '');
    setEdMetaTitleAr(p.metaTitleAr ?? '');
    setEdMetaTitleEn(p.metaTitleEn ?? '');
    setEdMetaDescAr(p.metaDescAr ?? '');
    setEdMetaDescEn(p.metaDescEn ?? '');
    setEdArTryOnUrl(p.arTryOnUrl ?? '');
  };
  const fulfillMut = api.vendorPortal.fulfillOrder.useMutation({
    onSuccess: () => refetchOrders(),
  });
  // B1 — order drawer + cancel-before-fulfillment.
  const cancelMut = api.vendorPortal.cancelOrder.useMutation({
    onSuccess: () => {
      setDetailOrder(null);
      refetchOrders();
    },
  });
  const [detailOrder, setDetailOrder] = useState<StoreOrderRow | null>(null);

  // C1 — variants manager per product (Wave C).
  const [variantProduct, setVariantProduct] = useState<{
    id: number;
    price: number;
    nameAr?: string;
    nameEn?: string;
  } | null>(null);

  // C2b — stock-in dialog (base product or a variant).
  const [stockInProduct, setStockInProduct] = useState<{
    id: number;
    nameAr?: string;
    nameEn?: string;
  } | null>(null);

  // B5 — vendor response to a customer-raised dispute (drawer).
  const respondMut = api.disputes.respond.useMutation({
    onSuccess: (updated) => {
      setDisputeResponse('');
      refetchOrders();
      setDetailOrder((d) => (d ? { ...d, dispute: updated } : d));
    },
  });
  const [disputeResponse, setDisputeResponse] = useState('');

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
  const myDeals = deals ?? [];

  // C4 — store coupon codes (propose → admin review → live store-scoped code).
  const { data: coupons, refetch: refetchCoupons } = api.vendorPortal.listCoupons.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const createCouponMut = api.vendorPortal.createCoupon.useMutation({
    onSuccess: () => {
      setCouponCode('');
      setCouponValue('');
      refetchCoupons();
    },
  });
  const deactivateCouponMut = api.vendorPortal.deactivateCoupon.useMutation({
    onSuccess: () => refetchCoupons(),
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('');
  const [couponMin, setCouponMin] = useState('');
  const topProducts = dash?.topProducts ?? [];
  // B3b — low-stock surface (stock ≤ the per-product threshold).
  const lowStock = dash?.lowStockProducts ?? [];
  const prods = productsQ.data?.pages.flatMap((p) => p.items) ?? [];

  // C2 — bulk stock editor: enter the mode, edit rows, save all changed.
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStocks, setBulkStocks] = useState<Record<number, number>>({});
  const [bulkTouched, setBulkTouched] = useState<Record<number, boolean>>({});
  const bulkMut = api.vendorPortal.bulkStockUpdate.useMutation({
    onSuccess: () => {
      setBulkStocks({});
      setBulkTouched({});
      setBulkMode(false);
      void productsQ.refetch();
    },
  });
  const forecastsQ = api.vendorPortal.stockForecasts.useQuery(
    { productIds: prods.map((p) => p.id) },
    { enabled: bulkMode && prods.length > 0 },
  );
  const forecasts = forecastsQ.data ?? {};

  const enterBulk = () => {
    setBulkStocks(Object.fromEntries(prods.map((p) => [p.id, p.stock])));
    setBulkTouched({});
    setBulkMode(true);
  };
  const saveBulk = () => {
    const updates = Object.entries(bulkTouched)
      .filter(([, touched]) => touched)
      .map(([id]) => ({ productId: Number(id), stock: bulkStocks[Number(id)] ?? 0 }));
    if (updates.length > 0) bulkMut.mutate({ updates });
  };
  const storeOrders = ordersQ.data?.pages.flatMap((p) => p.items) ?? [];

  // C5 — bulk CSV import: upload → worker job → polled per-row report.
  const importMut = api.vendorPortal.importProductsCsv.useMutation({});

  // D1 — analytics read-model series (7/30/90-day toggle).
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const ordersCsv = useCsvDownload('orders');
  const templatesQ = api.vendorPortal.dealTemplates.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const productsCsv = useCsvDownload('products');
  const analyticsCsv = useCsvDownload('analytics');

  // D3 — rule-based advisor (restock / expired deals / weekend peak / AOV).
  const advisorQ = api.vendorPortal.advisor.useQuery(undefined, { enabled: isAuthenticated });

  const analyticsQ = api.vendorPortal.analyticsSeries.useQuery(
    { days: analyticsDays },
    { enabled: isAuthenticated },
  );
  const series = analyticsQ.data?.series ?? [];
  const analyticsTopProducts = analyticsQ.data?.topProducts ?? [];
  // B5 — funnel analytics (views → orders → repeat).
  const funnelQ = api.vendorPortal.funnel.useQuery(undefined, { enabled: isAuthenticated });

  // E4 — reputation hub: summary + paginated review list + merchant reply.
  const reviewsSummaryQ = api.vendorPortal.myReviewsSummary.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const reviewsQ = api.vendorPortal.myReviews.useInfiniteQuery(
    { limit: 10 },
    {
      enabled: isAuthenticated,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const replyMut = api.vendorPortal.replyToReview.useMutation({
    onSuccess: () => {
      setReplyTo(null);
      setReplyText('');
      void reviewsQ.refetch();
      void reviewsSummaryQ.refetch();
    },
  });
  const reviews = (reviewsQ.data?.pages ?? []).flatMap((p) => p.items);

  // E5 — CRM-lite: repeat-customer aggregates (top spenders, recency).
  const customersQ = api.vendorPortal.customers.useInfiniteQuery(
    { limit: 20 },
    {
      enabled: isAuthenticated,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const customers = (customersQ.data?.pages ?? []).flatMap((p) => p.items);
  const customersFirst = customersQ.data?.pages[0];

  // B4 — win-back toolkit: pre-approved templates, selected customers.
  const [winbackTemplate, setWinbackTemplate] = useState<'restocked' | 'on_offer'>('restocked');
  const [winbackIds, setWinbackIds] = useState<number[]>([]);
  const [winbackResult, setWinbackResult] = useState<{ sent: number; skipped: number } | null>(
    null,
  );
  const sendWinbackMut = api.vendorPortal.sendWinback.useMutation({
    onSuccess: (res) => {
      setWinbackResult(res);
      setWinbackIds([]);
    },
  });
  const totalCustomers = customersFirst?.total ?? 0;
  const repeatCustomers = customersFirst?.repeatCustomers ?? 0;
  const repeatRate = customersFirst?.repeatRate ?? 0;

  // F1 — vendor inbox (reuses the notifications domain: list, unread, read).
  const inboxQ = api.notifications.list.useQuery(
    { page: 1, limit: 30 },
    { enabled: isAuthenticated },
  );
  const unreadQ = api.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const unread = unreadQ.data?.count ?? 0;
  const refreshInbox = () => {
    void inboxQ.refetch();
    void unreadQ.refetch();
  };
  const markReadMut = api.notifications.markRead.useMutation({ onSuccess: refreshInbox });
  const markAllReadMut = api.notifications.markAllRead.useMutation({ onSuccess: refreshInbox });
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const importStatusQ = api.vendorPortal.importStatus.useQuery(
    { jobId: importJobId ?? '' },
    {
      enabled: importJobId !== null,
      // Poll until the job reaches a terminal state.
      refetchInterval: (q) =>
        q.state.data?.state === 'completed' || q.state.data?.state === 'failed' ? false : 2000,
    },
  );
  const importReport =
    importStatusQ.data?.state === 'completed' || importStatusQ.data?.state === 'failed'
      ? importStatusQ.data
      : null;

  const downloadImportTemplate = () => {
    const csv = `nameAr,nameEn,price,stock,emoji\nسيروم,Serum,50,10,🧴`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importMut.mutate(
        { csv: String(reader.result ?? '') },
        {
          onSuccess: (res) => setImportJobId(res.jobId),
          onError: () => setImportJobId(null),
        },
      );
    };
    reader.readAsText(file);
  };

  // B4 — earnings & settlement center (statement + CSV export).
  const { data: earnings } = api.vendorPortal.earnings.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const earningsCsv = api.vendorPortal.earningsCsv.useQuery({ locale }, { enabled: false });
  const downloadCsv = async () => {
    const res = await earningsCsv.refetch();
    if (!res.data) return;
    const blob = new Blob(['﻿', res.data.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // A2 — payout automation: schedule selector + per-payout invoice CSV.
  const utils = api.useUtils();
  const setScheduleMut = api.vendorPortal.setPayoutSchedule.useMutation({
    onSuccess: () => {
      void utils.vendorPortal.earnings.invalidate();
    },
  });
  const setSlaMut = api.vendorPortal.setFulfillmentSla.useMutation({
    onSuccess: () => {
      void utils.vendorPortal.dashboard.invalidate();
    },
  });
  const downloadInvoice = async (payoutId: number) => {
    const data = await utils.vendorPortal.payoutInvoice.fetch({ payoutId, locale });
    const blob = new Blob(['﻿', data.csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-${payoutId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // A3 — tab state, deep-linkable via ?tab=<key>.
  const [tab, setTab] = useState<TabKey>('overview');
  useEffect(() => {
    setTab(initialTab());
  }, []);
  const selectTab = (next: TabKey) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url);
  };

  // A1 — capability-filtered tabs: owners keep the full bar; staff see only
  // what their permission list unlocks.
  const tabs = [
    { key: 'overview', label: t('vendorPortal.tab.overview') },
    ...(can('ORDERS_MANAGE') ? [{ key: 'orders', label: t('vendorPortal.orders.title') }] : []),
    ...(can('PRODUCTS_MANAGE') ? [{ key: 'products', label: t('vendorPortal.tab.products') }] : []),
    ...(can('PRODUCTS_MANAGE') ? [{ key: 'pricing', label: t('vendorPortal.tab.pricing') }] : []),
    ...(can('PRODUCTS_MANAGE') ? [{ key: 'services', label: t('vendorPortal.tab.services') }] : []),
    ...(can('DEALS_MANAGE') ? [{ key: 'deals', label: t('vendorPortal.tab.deals') }] : []),
    ...(can('COUPONS_MANAGE') ? [{ key: 'coupons', label: t('vendorPortal.tab.coupons') }] : []),
    ...(can('PAYOUTS_VIEW') ? [{ key: 'earnings', label: t('vendorPortal.tab.earnings') }] : []),
    ...(can('ANALYTICS_VIEW')
      ? [{ key: 'analytics', label: t('vendorPortal.tab.analytics') }]
      : []),
    ...(can('REVIEWS_MANAGE') ? [{ key: 'reviews', label: t('vendorPortal.tab.reviews') }] : []),
    ...(can('CUSTOMERS_VIEW')
      ? [{ key: 'customers', label: t('vendorPortal.tab.customers') }]
      : []),
    { key: 'inbox', label: t('vendorPortal.inbox.title'), badge: unread },
    ...(can('STAFF_MANAGE') ? [{ key: 'staff', label: t('vendorPortal.tab.staff') }] : []),
  ];

  // The dashboard query's non-owner branch returns {}, so narrow the union.
  const ordersByStatus = dash?.ordersByStatus as Record<string, number> | undefined;

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          {/* S1 — the owner's store name leads the dashboard (the portal
              title alone made it feel like a shared page). */}
          <h1 className="text-2xl font-bold">{store.storeName}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.subtitle')}</p>
        </div>

        <DashboardTabs
          tabs={tabs}
          active={tab}
          onSelect={(key) => selectTab(key as TabKey)}
          label={t('vendorPortal.tabs.aria')}
        />

        {/* D4 — first-visit onboarding tour: inline banner (no overlay,
            so it never intercepts clicks); dismissed into localStorage. */}
        <VendorTour onNavigate={(next) => selectTab(next as TabKey)} />

        {tab === 'overview' && (
          <div
            role="tabpanel"
            id="vendor-panel-overview"
            data-testid="vendor-panel-overview"
            aria-labelledby="vendor-tab-overview"
            className="space-y-6"
          >
            {/* E6d/E7/K3 — trust toggles + venue banner (self-service) */}
            <VenueProfileCard store={store} refetchStore={() => refetchStore()} />

            {/* D2 — store health score (0–100) + top improvement hints. */}
            <Card padding="md">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('vendorPortal.health.title')}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    (dash?.health?.score ?? 60) >= 80
                      ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : (dash?.health?.score ?? 60) >= 60
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {dash?.health?.score ?? 60}
                </span>
              </div>
              {(dash?.health?.hints ?? []).length > 0 && (
                <ul className="mt-2 list-inside list-disc text-xs text-text-secondary">
                  {(dash?.health?.hints ?? []).map((h) => (
                    <li key={h.key}>{t(h.key as TranslationKey, h.params)}</li>
                  ))}
                </ul>
              )}
            </Card>

            {/* G2 — approval status & resubmission timeline. */}
            {!store.isVerified && <SubmissionStatusCard />}

            {/* A3 — fulfillment SLA: on-time rate + window selector. */}
            <Card padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{t('vendorPortal.sla.title')}</h3>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('vendorPortal.sla.onTimeRate')}:{' '}
                    <span className="font-bold text-text-primary">
                      {dash?.sla?.onTimeRate ?? 100}%
                    </span>
                    {' · '}
                    {t('vendorPortal.sla.breached')}:{' '}
                    <span
                      className={
                        (dash?.sla?.breached30d ?? 0) > 0
                          ? 'font-bold text-red-600 dark:text-red-400'
                          : 'font-bold'
                      }
                    >
                      {dash?.sla?.breached30d ?? 0}
                    </span>
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-text-secondary">{t('vendorPortal.sla.window')}</span>
                  <select
                    data-testid="sla-window-select"
                    value={dash?.sla?.windowHours ?? 48}
                    onChange={(e) => setSlaMut.mutate({ hours: Number(e.target.value) })}
                    disabled={setSlaMut.isPending}
                    className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                  >
                    {[12, 24, 48, 72, 120, 168].map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </Card>

            {/* D3 — store advisor (rule-based v1, no LLM). */}
            {(advisorQ.data ?? []).length > 0 && (
              <Card padding="md">
                <h3 className="mb-2 text-sm font-semibold">{t('vendorPortal.advisor.title')}</h3>
                <ul className="list-inside list-disc space-y-1 text-xs text-text-secondary">
                  {(advisorQ.data ?? []).map((r) => (
                    <li key={r.key}>{t(r.key as TranslationKey, r.params)}</li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-5">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.totalProducts ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.products')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.totalSales ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.sold')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(dash?.revenue ?? 0)}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.revenue')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.pendingOrders ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.pendingOrders')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.rating ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.rating')}</p>
              </Card>
            </div>

            {/* S5 — order-based analytics (30-day revenue, orders, AOV, customers) */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(dash?.revenue30d ?? 0)}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.revenue30d')}</p>
                {/* C5g — store-service revenue rides the same tile. */}
                <p className="mt-1 text-xs text-text-secondary">
                  {t('vendorPortal.serviceRevenue30d')}:{' '}
                  {formatCurrency(dash?.serviceRevenue30d ?? 0)}
                </p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.ordersCount ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.ordersCount')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(dash?.aov ?? 0)}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.aov')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{dash?.customerCount ?? 0}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.customers')}</p>
              </Card>
            </div>

            {/* B3b — low-stock alerts (stock ≤ per-product threshold). */}
            {lowStock.length > 0 && (
              <Card
                padding="md"
                className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
              >
                <h3 className="mb-2 font-bold text-amber-700 dark:text-amber-300">
                  {t('vendorPortal.lowStock.title')}
                </h3>
                <ul className="space-y-1">
                  {lowStock.map((p) => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="font-medium">
                        {localize({ ar: p.nameAr, en: p.nameEn }, locale)}
                      </span>
                      <span className="text-text-secondary">
                        {t('vendorPortal.lowStock.left', { count: p.stock })}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Phase 4b — top products (analytics P1) */}
            {topProducts.length > 0 && (
              <Card padding="md">
                <h3 className="mb-2 font-bold">{t('vendorPortal.topProducts')}</h3>
                <div className="space-y-1">
                  {topProducts.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span className="font-medium">{localize(p.nameJson, locale)}</span>
                      <span className="text-text-secondary">
                        {p.sales} {t('vendorPortal.sales')} ·{' '}
                        {formatCurrency(Number(p.price) * p.sales)} {t('vendorPortal.revenue')}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div
            role="tabpanel"
            id="vendor-panel-orders"
            data-testid="vendor-panel-orders"
            aria-labelledby="vendor-tab-orders"
          >
            {/* Store plan Phase 1 — orders */}
            <Card padding="lg">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{t('vendorPortal.orders.title')}</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void ordersCsv.download()}
                  loading={ordersCsv.pending}
                >
                  {t('vendorPortal.export')}
                </Button>
                {(ordersByStatus?.FULFILLED ?? 0) > 0 && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                    {t('vendorPortal.fulfilledOrders')}: {ordersByStatus?.FULFILLED}
                  </span>
                )}
              </div>
              {storeOrders.length === 0 ? (
                <p className="text-sm text-text-tertiary">{t('vendorPortal.orders.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {storeOrders.map((o) => {
                    const customer = o.customer;
                    return (
                      <div
                        key={o.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-bold">
                            #{o.id} · {formatCurrency(Number(o.totalAmount))} · {o.itemCount}{' '}
                            {t('vendorPortal.orders.items')}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {customer?.name} · {new Date(o.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              o.status === 'FULFILLED'
                                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                : o.status === 'CANCELLED'
                                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {o.status === 'FULFILLED'
                              ? t('vendorPortal.orders.fulfilled')
                              : o.status === 'CANCELLED'
                                ? t('vendorPortal.orders.cancelled')
                                : t('vendorPortal.orders.pending')}
                          </span>
                          {o.slaBreachedAt && o.status === 'PENDING_FULFILLMENT' && (
                            <span
                              data-testid={`order-sla-late-${o.id}`}
                              className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                            >
                              {t('vendorPortal.sla.lateChip')}
                            </span>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setDetailOrder(o)}>
                            {t('vendorPortal.orders.details')}
                          </Button>
                          {o.status === 'PENDING_FULFILLMENT' && (
                            <Button
                              size="sm"
                              onClick={() => fulfillMut.mutate({ orderId: o.id })}
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
              {ordersQ.hasNextPage && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => ordersQ.fetchNextPage()}
                    loading={ordersQ.isFetchingNextPage}
                  >
                    {t('vendorPortal.loadMore')}
                  </Button>
                </div>
              )}
            </Card>

            {/* B1 — order drawer: line items, customer contact, cancel. */}
            <Modal
              open={detailOrder !== null}
              onClose={() => setDetailOrder(null)}
              title={detailOrder ? `#${detailOrder.id}` : ''}
            >
              {detailOrder && (
                <div className="space-y-3">
                  <div className="space-y-1 rounded-lg border p-3">
                    {detailOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="font-medium">
                          {(item.nameSnapshot as { ar?: string; en?: string } | null)?.[
                            locale === 'ar' ? 'ar' : 'en'
                          ] ?? `#${item.productId}`}
                        </span>
                        <span className="text-text-secondary">
                          {formatCurrency(Number(item.priceSnapshot))} × {item.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t pt-2 text-sm font-bold">
                      <span>{t('vendorPortal.orders.total')}</span>
                      <span>{formatCurrency(Number(detailOrder.totalAmount))}</span>
                    </div>
                  </div>

                  {detailOrder.customer && (
                    <div className="text-sm">
                      <p className="font-semibold">{detailOrder.customer.name}</p>
                      {detailOrder.customer.phone && (
                        <a
                          href={`https://wa.me/${detailOrder.customer.phone
                            .replace(/^\+/, '')
                            .replace(/^0/, '966')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-600 underline"
                        >
                          {detailOrder.customer.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* B5 — the order's dispute: customer reason, vendor
                      response, admin resolution (1:1 per order). */}
                  {detailOrder.dispute && (
                    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                          {t('vendorPortal.disputes.title')}
                        </p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          {t(
                            detailOrder.dispute.status === 'OPEN'
                              ? 'vendorPortal.disputes.status.open'
                              : detailOrder.dispute.status === 'UNDER_REVIEW'
                                ? 'vendorPortal.disputes.status.under-review'
                                : detailOrder.dispute.status === 'RESOLVED_CUSTOMER'
                                  ? 'vendorPortal.disputes.status.resolved-customer'
                                  : detailOrder.dispute.status === 'RESOLVED_TECHNICIAN'
                                    ? 'vendorPortal.disputes.status.resolved-technician'
                                    : 'vendorPortal.disputes.status.closed',
                          )}
                        </span>
                      </div>
                      {/* A4 — dispute SLA: escalated flag once the 48h
                          response deadline passes without a reply. */}
                      {detailOrder.dispute.escalatedAt && (
                        <p
                          data-testid={`dispute-escalated-${detailOrder.dispute.id}`}
                          className="text-xs font-semibold text-red-700 dark:text-red-300"
                        >
                          {t('vendorPortal.disputes.escalated')}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary">
                        <span className="font-semibold">{t('vendorPortal.disputes.reason')}: </span>
                        {detailOrder.dispute.reason}
                        {detailOrder.dispute.description
                          ? ` — ${detailOrder.dispute.description}`
                          : ''}
                      </p>
                      {detailOrder.dispute.vendorResponse && (
                        <p className="text-xs">
                          <span className="font-semibold">
                            {t('vendorPortal.disputes.yourResponse')}:{' '}
                          </span>
                          {detailOrder.dispute.vendorResponse}
                        </p>
                      )}
                      {detailOrder.dispute.resolution && (
                        <p className="text-xs text-green-700 dark:text-green-300">
                          <span className="font-semibold">
                            {t('vendorPortal.disputes.resolution')}:{' '}
                          </span>
                          {detailOrder.dispute.resolution}
                        </p>
                      )}
                      {(detailOrder.dispute.status === 'OPEN' ||
                        detailOrder.dispute.status === 'UNDER_REVIEW') && (
                        <>
                          {respondMut.isError && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {respondMut.error.message}
                            </p>
                          )}
                          <textarea
                            value={disputeResponse}
                            onChange={(e) => setDisputeResponse(e.target.value)}
                            placeholder={t('vendorPortal.disputes.responsePlaceholder')}
                            rows={3}
                            className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              respondMut.mutate({
                                disputeId: detailOrder.dispute!.id,
                                response: disputeResponse,
                              })
                            }
                            disabled={!disputeResponse.trim()}
                            loading={respondMut.isPending}
                          >
                            {t('vendorPortal.disputes.submit')}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {detailOrder.status === 'PENDING_FULFILLMENT' && (
                    <>
                      {cancelMut.isError && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {cancelMut.error.message}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => cancelMut.mutate({ orderId: detailOrder.id })}
                        loading={cancelMut.isPending}
                        className="w-full"
                      >
                        {t('vendorPortal.orders.cancel')}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </Modal>
          </div>
        )}

        {tab === 'products' && (
          <div
            role="tabpanel"
            id="vendor-panel-products"
            data-testid="vendor-panel-products"
            aria-labelledby="vendor-tab-products"
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('vendorPortal.tab.products')}</h2>
              <div className="flex items-center gap-2">
                {/* C5 — bulk CSV import (worker job + live report). */}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  id="csv-import-input"
                  onChange={onImportFile}
                />
                <label
                  htmlFor="csv-import-input"
                  className="cursor-pointer rounded-xl border border-border-muted px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-elevated"
                >
                  {t('vendorPortal.import.choose')}
                </label>
                <Button size="sm" variant="ghost" onClick={downloadImportTemplate}>
                  {t('vendorPortal.import.template')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void productsCsv.download()}
                  loading={productsCsv.pending}
                >
                  {t('vendorPortal.export')}
                </Button>
                <Button size="sm" onClick={() => setShow(true)}>
                  + {t('vendorPortal.newProduct')}
                </Button>
                {/* C2 — bulk stock editor toggle + save. */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={bulkMode ? () => setBulkMode(false) : enterBulk}
                >
                  {bulkMode ? t('vendorPortal.bulk.exit') : t('vendorPortal.bulk.enter')}
                </Button>
                {bulkMode && (
                  <Button
                    size="sm"
                    onClick={saveBulk}
                    loading={bulkMut.isPending}
                    disabled={!Object.values(bulkTouched).some(Boolean)}
                  >
                    {t('vendorPortal.bulk.save')}
                  </Button>
                )}
              </div>
            </div>
            {/* C5 — import progress + report (polled from the worker job). */}
            {importMut.isPending && (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.import.uploading')}</p>
            )}
            {importReport && (
              <Card padding="sm">
                <p className="text-sm font-semibold">
                  {t('vendorPortal.import.report', {
                    imported: importReport.report?.imported ?? 0,
                    total: importReport.report?.totalRows ?? 0,
                  })}
                </p>
                {(importReport.report?.errors ?? []).length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs text-red-600 dark:text-red-400">
                    {(importReport.report?.errors ?? []).map((er) => (
                      <li key={er.row}>
                        {t('vendorPortal.import.row-error', {
                          row: er.row,
                          message: er.message,
                        })}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
            {importMut.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">{importMut.error.message}</p>
            )}
            {prods.length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.products.empty')}</p>
            ) : (
              prods.map((p) => (
                <Card key={p.id} padding="md" className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-bold">
                        {p.nameAr}
                        {p.draft && (
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {t('vendorPortal.draft')}
                          </span>
                        )}
                        {/* C2 — listing approval state (strict mode). */}
                        {p.approvalStatus === 'PENDING' && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                            {t('vendorPortal.approval.pending')}
                          </span>
                        )}
                        {p.approvalStatus === 'REJECTED' && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                            {t('vendorPortal.approval.rejected')}
                          </span>
                        )}
                      </p>
                      {bulkMode ? (
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            type="number"
                            value={bulkStocks[p.id] ?? p.stock}
                            onChange={(e) => {
                              const n = parseInt(e.target.value, 10);
                              if (Number.isNaN(n)) return;
                              setBulkStocks((prev) => ({ ...prev, [p.id]: n }));
                              setBulkTouched((prev) => ({ ...prev, [p.id]: n !== p.stock }));
                            }}
                            className="w-24"
                          />
                          {(() => {
                            const f = forecasts[p.id];
                            return f && f.daysAtStock !== null && f.daysAtStock !== undefined ? (
                              <span className="text-xs text-text-secondary">
                                {t('vendorPortal.bulk.forecast', { days: f.daysAtStock })}
                              </span>
                            ) : (
                              <span className="text-xs text-text-tertiary">
                                {t('vendorPortal.bulk.noVelocity')}
                              </span>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary">
                          {t('vendorPortal.stock')}: {p.stock} · {t('vendorPortal.sales')}:{' '}
                          {p.sales}
                        </p>
                      )}
                      {p.approvalStatus === 'REJECTED' && p.reviewNotes ? (
                        <p className="text-xs text-red-600 dark:text-red-400">{p.reviewNotes}</p>
                      ) : null}
                      {/* C1 — bilingual completeness meter. */}
                      <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className={`h-full ${p.completeness >= 100 ? 'bg-green-500' : 'bg-amber-400'}`}
                          style={{ width: `${p.completeness}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-600">
                      {formatCurrency(p.price)} {t('beautyParty.currency')}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      {t('vendorPortal.edit')}
                    </Button>
                    {/* C1 — variants manager (sizes/shades with own stock). */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setVariantProduct({
                          id: p.id,
                          price: p.price,
                          nameAr: p.nameAr,
                          nameEn: p.nameEn,
                        })
                      }
                    >
                      {t('vendorPortal.variants.title')}
                    </Button>
                    {/* C2b — stock-in (base product or a variant). */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStockInProduct({ id: p.id, nameAr: p.nameAr, nameEn: p.nameEn })
                      }
                    >
                      + {t('vendorPortal.stockin.title')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateMut.mutate({ id: p.id })}
                      loading={duplicateMut.isPending}
                    >
                      {t('vendorPortal.duplicate')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDraftMut.mutate({ id: p.id, draft: !p.draft })}
                    >
                      {p.draft ? t('vendorPortal.publish') : t('vendorPortal.draft')}
                    </Button>
                    {/* C6 — featured picker: leads the public storefront. */}
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t('vendorPortal.featured')}
                      onClick={() => featuredMut.mutate({ id: p.id, featured: !p.featured })}
                    >
                      {p.featured ? '⭐' : '☆'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMut.mutate({ id: p.id })}
                    >
                      🗑️
                    </Button>
                  </div>
                </Card>
              ))
            )}
            {productsQ.hasNextPage && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => productsQ.fetchNextPage()}
                  loading={productsQ.isFetchingNextPage}
                >
                  {t('vendorPortal.loadMore')}
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'deals' && (
          <div
            role="tabpanel"
            id="vendor-panel-deals"
            data-testid="vendor-panel-deals"
            aria-labelledby="vendor-tab-deals"
            className="space-y-3"
          >
            {/* Store plan Phase 4b — My Deals */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('vendorPortal.deals.title')}</h2>
              <Button size="sm" variant="outline" onClick={() => setShowDeal(true)}>
                {t('vendorPortal.deals.propose')}
              </Button>
            </div>
            {myDeals.length === 0 ? (
              <div className="text-sm text-text-tertiary">
                <p>{t('vendorPortal.deals.empty')}</p>
                <p className="mt-1 text-xs">{t('vendorPortal.deals.floor-hint')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myDeals.map((sub) => {
                  const payload = (sub.payload ?? {}) as unknown as StoreDealPayload;
                  const original = Number(payload.originalPrice ?? 0);
                  const deal = Number(payload.dealPrice ?? 0);
                  const pct = original > 0 ? Math.round((1 - deal / original) * 100) : 0;
                  return (
                    <Card key={sub.id} padding="sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{payload.titleAr}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-tertiary line-through">
                            {formatCurrency(original)}
                          </span>
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(deal)}
                          </span>
                          {pct > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                              -{pct}%
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              sub.status === 'APPROVED'
                                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                : sub.status === 'REJECTED'
                                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
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
                      {payload.startsAt && payload.endsAt ? (
                        <p className="mt-1 text-xs text-text-tertiary">
                          {new Date(payload.startsAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}{' '}
                          —{' '}
                          {new Date(payload.endsAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}
                        </p>
                      ) : null}
                      {sub.status === 'REJECTED' && sub.reviewNotes ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {t('tech.packages.reject-reason', { reason: sub.reviewNotes })}
                        </p>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'coupons' && (
          <div
            role="tabpanel"
            id="vendor-panel-coupons"
            data-testid="vendor-panel-coupons"
            aria-labelledby="vendor-tab-coupons"
            className="space-y-3"
          >
            {/* C4 — propose a store coupon (admin reviews via the queue). */}
            <Card padding="md">
              <h3 className="mb-2 text-sm font-semibold">{t('vendorPortal.coupons.create')}</h3>
              <div className="flex flex-wrap gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t('vendorPortal.coupons.code')}
                  className="w-32 rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm"
                />
                <input
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  placeholder={t('vendorPortal.coupons.value')}
                  className="w-28 rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm"
                />
                <input
                  value={couponMin}
                  onChange={(e) => setCouponMin(e.target.value)}
                  placeholder={t('vendorPortal.coupons.min')}
                  className="w-32 rounded-xl border border-border-muted bg-surface px-3 py-2 text-sm"
                />
                <Button
                  size="sm"
                  onClick={() =>
                    createCouponMut.mutate({
                      code: couponCode,
                      discountType: 'percent',
                      discountValue: Number(couponValue),
                      ...(couponMin ? { minOrderAmount: Number(couponMin) } : {}),
                    })
                  }
                  loading={createCouponMut.isPending}
                  disabled={!couponCode || !couponValue}
                >
                  {t('vendorPortal.coupons.create')}
                </Button>
              </div>
              {createCouponMut.isError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {createCouponMut.error.message}
                </p>
              )}
            </Card>

            {(coupons ?? []).length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.coupons.empty')}</p>
            ) : (
              <div className="space-y-2">
                {(coupons ?? []).map((p) => (
                  <Card key={p.id} padding="sm" className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{p.code}</p>
                      <p className="text-xs text-text-secondary">
                        {p.discountType === 'percent'
                          ? `-${Number(p.discountValue)}%`
                          : formatCurrency(Number(p.discountValue))}{' '}
                        · {t('vendorPortal.coupons.uses', { used: p.currentUses })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {p.isActive
                          ? t('vendorPortal.coupons.active')
                          : t('vendorPortal.coupons.inactive')}
                      </span>
                      {p.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deactivateCouponMut.mutate({ id: p.id })}
                        >
                          {t('vendorPortal.coupons.deactivate')}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'earnings' && (
          <div
            role="tabpanel"
            id="vendor-panel-earnings"
            data-testid="vendor-panel-earnings"
            aria-labelledby="vendor-tab-earnings"
            className="space-y-4"
          >
            {/* B4 — earnings & settlement center: summary cards + statement. */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('vendorPortal.earnings.title')}</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadCsv}
                loading={earningsCsv.isFetching}
              >
                {t('vendorPortal.earnings.export')}
              </Button>
            </div>
            {/* A2 — payout automation: cadence selector + sweep status. */}
            <Card padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{t('vendorPortal.earnings.schedule')}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {earnings?.payoutSchedule === 'MANUAL'
                      ? t('vendorPortal.earnings.manualHint')
                      : earnings?.lastPayoutRunAt
                        ? t('vendorPortal.earnings.lastRun', {
                            date: new Date(earnings.lastPayoutRunAt).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-GB',
                            ),
                          })
                        : t('vendorPortal.earnings.firstRunPending')}
                  </p>
                </div>
                <select
                  data-testid="payout-schedule-select"
                  value={earnings?.payoutSchedule ?? 'MANUAL'}
                  onChange={(e) =>
                    setScheduleMut.mutate({
                      schedule: e.target.value as 'MANUAL' | 'WEEKLY' | 'MONTHLY',
                    })
                  }
                  disabled={setScheduleMut.isPending}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="MANUAL">{t('vendorPortal.earnings.scheduleManual')}</option>
                  <option value="WEEKLY">{t('vendorPortal.earnings.scheduleWeekly')}</option>
                  <option value="MONTHLY">{t('vendorPortal.earnings.scheduleMonthly')}</option>
                </select>
              </div>
            </Card>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(earnings?.summary.pendingNet ?? 0)}
                </p>
                <p className="text-xs text-text-secondary">
                  {t('vendorPortal.earnings.pendingNet')}
                </p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(earnings?.summary.processedNet ?? 0)}
                </p>
                <p className="text-xs text-text-secondary">
                  {t('vendorPortal.earnings.processedNet')}
                </p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(earnings?.summary.totalFee ?? 0)}
                </p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.earnings.totalFee')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {t('vendorPortal.earnings.commission', { rate: earnings?.commissionRate ?? 0 })}
                </p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.earnings.net')}</p>
              </Card>
            </div>
            {!earnings || earnings.rows.length === 0 ? (
              <div className="text-sm text-text-tertiary">
                <p>{t('vendorPortal.earnings.empty')}</p>
              </div>
            ) : (
              <Card padding="md">
                <div className="space-y-2">
                  {earnings.rows.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">
                          {t('vendorPortal.earnings.period')}:{' '}
                          {new Date(r.periodStart).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}{' '}
                          —{' '}
                          {new Date(r.periodEnd).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {t('vendorPortal.earnings.gross')}: {formatCurrency(r.gross)} ·{' '}
                          {t('vendorPortal.earnings.fee')}: {formatCurrency(r.fee)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(r.net)}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            r.status === 'COMPLETED'
                              ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                              : r.status === 'FAILED'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {t(
                            r.status === 'COMPLETED'
                              ? 'vendorPortal.earnings.status.completed'
                              : r.status === 'FAILED'
                                ? 'vendorPortal.earnings.status.failed'
                                : r.status === 'PROCESSING'
                                  ? 'vendorPortal.earnings.status.processing'
                                  : 'vendorPortal.earnings.status.pending',
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-1"
                          onClick={() => downloadInvoice(r.id)}
                          data-testid={`payout-invoice-${r.id}`}
                        >
                          {t('vendorPortal.earnings.invoice')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'analytics' && (
          <div
            role="tabpanel"
            id="vendor-panel-analytics"
            data-testid="vendor-panel-analytics"
            aria-labelledby="vendor-tab-analytics"
            className="space-y-4"
          >
            {/* D1 — read-model analytics: stat tiles + a single-metric daily
                series (revenue only — one axis, identity from the title) +
                labeled top products. */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('vendorPortal.analytics.title')}</h2>
              <div
                className="flex gap-1"
                role="group"
                aria-label={t('vendorPortal.analytics.range')}
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void analyticsCsv.download()}
                  loading={analyticsCsv.pending}
                >
                  {t('vendorPortal.export')}
                </Button>
                {([7, 30, 90] as const).map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={analyticsDays === d ? 'primary' : 'ghost'}
                    onClick={() => setAnalyticsDays(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            {/* B5 — the funnel: storefront views → orders + repeat. */}
            <Card padding="md">
              <h3 className="mb-2 text-sm font-semibold">
                {t('vendorPortal.analytics.funnel.title')}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-2xl font-bold">{funnelQ.data?.views30d ?? 0}</p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.analytics.funnel.views')}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{funnelQ.data?.orders30d ?? 0}</p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.analytics.funnel.orders')}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(funnelQ.data?.conversion ?? 0).toLocaleString(
                      locale === 'ar' ? 'ar-SA' : 'en-GB',
                    )}
                    ٪
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.analytics.funnel.conversion')}
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{funnelQ.data?.repeatRate ?? 0}٪</p>
                  <p className="text-xs text-text-secondary">
                    {t('vendorPortal.analytics.funnel.repeatRate')}
                  </p>
                </div>
              </div>
              {(funnelQ.data?.topViewed ?? []).length > 0 && (
                <div className="mt-3 border-t border-border-muted pt-3">
                  <p className="mb-1 text-xs font-semibold text-text-secondary">
                    {t('vendorPortal.analytics.funnel.topViewed')}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {(funnelQ.data?.topViewed ?? []).map((p) => (
                      <li key={p.productId} className="flex justify-between">
                        <span className="truncate">{locale === 'ar' ? p.nameAr : p.nameEn}</span>
                        <span className="text-text-secondary">
                          {t('vendorPortal.analytics.funnel.viewCount', { count: p.views })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(series.reduce((s, x) => s + x.revenue, 0))}
                </p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.analytics.revenue')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{series.reduce((s, x) => s + x.orders, 0)}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.analytics.orders')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    series.length
                      ? series.reduce((s, x) => s + x.revenue, 0) /
                          series.reduce((s, x) => s + x.orders, 0)
                      : 0,
                  )}
                </p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.analytics.aov')}</p>
              </Card>
            </div>

            {/* D5 — KSA season markers over the window. */}
            {(analyticsQ.data?.markers ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(analyticsQ.data?.markers ?? []).map((m) => (
                  <span
                    key={`${m.day}-${m.type}`}
                    className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  >
                    {locale === 'ar' ? m.titleAr : m.titleEn} · {m.day.slice(8, 10)}/
                    {m.day.slice(5, 7)}
                  </span>
                ))}
              </div>
            )}

            {series.length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.analytics.empty')}</p>
            ) : (
              <Card padding="md">
                <p className="mb-2 text-sm font-semibold">{t('vendorPortal.analytics.revenue')}</p>
                <div className="flex h-28 items-end gap-[2px]">
                  {series.map((x) => {
                    const max = Math.max(...series.map((s) => s.revenue), 1);
                    return (
                      <div
                        key={x.day}
                        className="group relative flex-1"
                        title={`${new Date(x.day).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                        )}: ${formatCurrency(x.revenue)}`}
                      >
                        <div
                          className="w-full rounded-t-[4px] bg-brand-600 transition-colors group-hover:bg-brand-700 dark:bg-brand-500 dark:group-hover:bg-brand-400"
                          style={{ height: `${(x.revenue / max) * 100}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card padding="md">
              <h3 className="mb-2 text-sm font-semibold">
                {t('vendorPortal.analytics.topProducts')}
              </h3>
              {analyticsTopProducts.length === 0 ? (
                <p className="text-xs text-text-tertiary">{t('vendorPortal.analytics.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {analyticsTopProducts.map((p) => {
                    const maxQty = Math.max(...analyticsTopProducts.map((tp) => tp.quantity), 1);
                    return (
                      <div key={p.productId} className="flex items-center gap-3">
                        <p className="w-32 truncate text-sm">{p.nameAr}</p>
                        <div className="h-2 flex-1 rounded-full bg-surface-elevated">
                          <div
                            className="h-2 rounded-full bg-brand-600 dark:bg-brand-500"
                            style={{ width: `${(p.quantity / maxQty) * 100}%` }}
                          />
                        </div>
                        <p className="w-10 text-right text-xs text-text-secondary">{p.quantity}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'reviews' && (
          <div
            role="tabpanel"
            id="vendor-panel-reviews"
            data-testid="vendor-panel-reviews"
            aria-labelledby="vendor-tab-reviews"
            className="space-y-4"
          >
            {/* E4 — reputation hub: summary (avg, distribution, 8-week
                trend), 1-star triage banner, replyable review list. */}
            <h2 className="text-lg font-bold">{t('vendorPortal.reviews.title')}</h2>

            {(reviewsSummaryQ.data?.unrepliedOneStar ?? 0) > 0 && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                {t('vendorPortal.reviews.one-star-alert', {
                  count: reviewsSummaryQ.data?.unrepliedOneStar ?? 0,
                })}
              </div>
            )}

            <Card padding="md">
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {(reviewsSummaryQ.data?.avg ?? 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-text-secondary">{t('vendorPortal.reviews.avg')}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {t('vendorPortal.reviews.total', { count: reviewsSummaryQ.data?.total ?? 0 })}
                  </p>
                </div>
                <div className="min-w-40 flex-1 space-y-1">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = reviewsSummaryQ.data?.distribution[star] ?? 0;
                    const max = Math.max(
                      ...([5, 4, 3, 2, 1] as const).map(
                        (s) => reviewsSummaryQ.data?.distribution[s] ?? 0,
                      ),
                      1,
                    );
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-text-secondary">{star}★</span>
                        <div className="h-2 flex-1 rounded-full bg-surface-elevated">
                          <div
                            className="h-2 rounded-full bg-brand-600 dark:bg-brand-500"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-text-secondary">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-1 text-xs text-text-secondary">
                  {t('vendorPortal.reviews.trend')}
                </p>
                <div className="flex h-12 items-end gap-[2px]">
                  {(reviewsSummaryQ.data?.trend ?? []).map((b) => {
                    const max = Math.max(
                      ...(reviewsSummaryQ.data?.trend ?? []).map((x) => x.count),
                      1,
                    );
                    return (
                      <div
                        key={b.start}
                        className="group relative flex-1"
                        title={`${b.start}: ${b.count}`}
                      >
                        <div
                          className="w-full rounded-t-[3px] bg-brand-600 transition-colors group-hover:bg-brand-700 dark:bg-brand-500 dark:group-hover:bg-brand-400"
                          style={{ height: `${(b.count / max) * 100}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {reviews.length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.reviews.empty')}</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r.id} padding="md" className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {t('vendorPortal.reviews.on', { product: r.productNameAr })}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('vendorPortal.reviews.customer', { name: r.customerName })} ·{' '}
                          {new Date(r.createdAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}
                        </p>
                      </div>
                      <span
                        className="shrink-0 text-sm text-brand-600 dark:text-brand-400"
                        aria-label={`${r.rating} / 5`}
                      >
                        {'★'.repeat(r.rating)}
                        <span className="text-text-tertiary">{'★'.repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    {r.comment && <p className="text-sm">{r.comment}</p>}
                    {r.replied ? (
                      <div className="rounded-lg bg-surface-elevated px-3 py-2">
                        <p className="text-xs font-semibold text-text-secondary">
                          {t('vendorPortal.reviews.answered')}
                        </p>
                        <p className="mt-0.5 text-sm">
                          {locale === 'ar' ? r.replyAr : r.replyEn || r.replyAr}
                        </p>
                      </div>
                    ) : replyTo === r.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t('vendorPortal.reviews.replyPlaceholder')}
                          className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              replyMut.mutate({
                                reviewId: r.id,
                                ...(locale === 'ar'
                                  ? { replyAr: replyText }
                                  : { replyEn: replyText }),
                              })
                            }
                            loading={replyMut.isPending}
                            disabled={replyText.trim() === ''}
                          >
                            {t('vendorPortal.save')}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText('');
                            }}
                          >
                            {t('button.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyTo(r.id);
                          setReplyText('');
                        }}
                      >
                        {t('vendorPortal.reviews.reply')}
                      </Button>
                    )}
                  </Card>
                ))}
                {reviewsQ.hasNextPage && (
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reviewsQ.fetchNextPage()}
                      loading={reviewsQ.isFetchingNextPage}
                    >
                      {t('vendorPortal.loadMore')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'customers' && (
          <div
            role="tabpanel"
            id="vendor-panel-customers"
            data-testid="vendor-panel-customers"
            aria-labelledby="vendor-tab-customers"
            className="space-y-4"
          >
            {/* E5 — CRM-lite: repeat-customer aggregates (top spenders,
                recency). Aggregate-only — name/phone, never email. */}
            <h2 className="text-lg font-bold">{t('vendorPortal.customers.title')}</h2>

            {/* B4 — win-back toolkit: pre-approved templates only,
                rate-limited server-side, opt-outs honored. */}
            <Card padding="md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {t('vendorPortal.customers.winback.title')}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {t('vendorPortal.customers.winback.hint')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={winbackTemplate}
                    onChange={(e) => setWinbackTemplate(e.target.value as 'restocked' | 'on_offer')}
                    className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                    data-testid="winback-template-select"
                  >
                    <option value="restocked">
                      {t('vendorPortal.customers.winback.restocked')}
                    </option>
                    <option value="on_offer">{t('vendorPortal.customers.winback.onOffer')}</option>
                  </select>
                  <Button
                    size="sm"
                    disabled={winbackIds.length === 0}
                    loading={sendWinbackMut.isPending}
                    onClick={() =>
                      sendWinbackMut.mutate({ template: winbackTemplate, customerIds: winbackIds })
                    }
                    data-testid="winback-send-button"
                  >
                    {t('vendorPortal.customers.winback.send', { count: winbackIds.length })}
                  </Button>
                </div>
              </div>
              {winbackResult && (
                <p className="mt-2 text-xs text-text-secondary">
                  {t('vendorPortal.customers.winback.result', winbackResult)}
                </p>
              )}
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.customers.total')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">{repeatCustomers}</p>
                <p className="text-xs text-text-secondary">
                  {t('vendorPortal.customers.repeaters')}
                </p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-2xl font-bold">
                  {(repeatRate * 100).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
                    maximumFractionDigits: 0,
                  })}
                  ٪
                </p>
                <p className="text-xs text-text-secondary">{t('vendorPortal.customers.rate')}</p>
              </Card>
            </div>

            {customers.length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.customers.empty')}</p>
            ) : (
              <Card padding="md" className="space-y-3">
                {customers.map((c) => (
                  <div key={c.customerId} className="flex items-center justify-between gap-3">
                    <label className="flex min-w-0 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={winbackIds.includes(c.customerId)}
                        onChange={(e) =>
                          setWinbackIds((prev) =>
                            e.target.checked
                              ? [...prev, c.customerId]
                              : prev.filter((id) => id !== c.customerId),
                          )
                        }
                        data-testid={`winback-customer-${c.customerId}`}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {c.customerName}
                          {c.repeat && (
                            <span className="mr-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-normal text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                              {t('vendorPortal.customers.repeat')}
                            </span>
                          )}
                        </span>
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/^\+/, '').replace(/^0/, '966')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-600 underline"
                          >
                            {c.phone}
                          </a>
                        )}
                      </span>
                    </label>
                    <div className="shrink-0 text-left">
                      <p className="text-sm font-bold">{formatCurrency(c.totalSpent)}</p>
                      <p className="text-xs text-text-secondary">
                        {t('vendorPortal.customers.orders', { count: c.orderCount })} ·{' '}
                        {c.lastOrderAt
                          ? new Date(c.lastOrderAt).toLocaleDateString(
                              locale === 'ar' ? 'ar-SA' : 'en-GB',
                            )
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
                {customersQ.hasNextPage && (
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => customersQ.fetchNextPage()}
                      loading={customersQ.isFetchingNextPage}
                    >
                      {t('vendorPortal.loadMore')}
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {tab === 'inbox' && (
          <div
            role="tabpanel"
            id="vendor-panel-inbox"
            data-testid="vendor-panel-inbox"
            aria-labelledby="vendor-tab-inbox"
            className="space-y-4"
          >
            {/* F1 — vendor inbox: approval decisions, new orders, payouts,
                low-stock, reviews and dispute updates (notifications
                domain). Clicking a row marks it read and follows its link. */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{t('vendorPortal.inbox.title')}</h2>
              {unread > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAllReadMut.mutate({})}
                  loading={markAllReadMut.isPending}
                >
                  {t('vendorPortal.inbox.mark-all')}
                </Button>
              )}
            </div>

            {(inboxQ.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-text-tertiary">{t('vendorPortal.inbox.empty')}</p>
            ) : (
              <Card padding="md" className="space-y-2">
                {(inboxQ.data?.items ?? []).map((n) => {
                  const title = n.titleJson as { ar?: string; en?: string };
                  const body = n.bodyJson as { ar?: string; en?: string };
                  return (
                    <button
                      key={n.id}
                      type="button"
                      data-testid={`inbox-row-${n.id}`}
                      onClick={() => {
                        markReadMut.mutate({ id: n.id });
                        if (n.link) window.location.href = n.link;
                      }}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-surface-elevated ${
                        n.isRead ? 'border-edge' : 'border-brand-300 dark:border-brand-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {locale === 'ar' ? title.ar : title.en || title.ar}
                        </p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {locale === 'ar' ? body.ar : body.en || body.ar}
                        </p>
                        <p className="mt-1 text-[10px] text-text-tertiary">
                          {new Date(n.createdAt).toLocaleString(
                            locale === 'ar' ? 'ar-SA' : 'en-GB',
                          )}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600 dark:bg-brand-400" />
                      )}
                    </button>
                  );
                })}
              </Card>
            )}
          </div>
        )}

        {tab === 'staff' && (
          <div
            role="tabpanel"
            id="vendor-panel-staff"
            data-testid="vendor-panel-staff"
            aria-labelledby="vendor-tab-staff"
          >
            {/* A1 — team management: invite, permissions, revoke, audit feed. */}
            <StaffPanel />
          </div>
        )}

        {tab === 'pricing' && (
          <div
            role="tabpanel"
            id="vendor-panel-pricing"
            data-testid="vendor-panel-pricing"
            aria-labelledby="vendor-tab-pricing"
          >
            {/* C3 — uplift-only pricing rules + the per-product change log. */}
            <PricingRulesPanel />
          </div>
        )}

        {tab === 'services' && (
          <div
            role="tabpanel"
            id="vendor-panel-services"
            data-testid="vendor-panel-services"
            aria-labelledby="vendor-tab-services"
          >
            {/* C5 — hybrid store-services: editor + slots + bookings. */}
            <StoreServicesPanel />
          </div>
        )}

        {/* Phase 4b — propose deal modal */}
        <Modal
          open={showDeal}
          onClose={() => setShowDeal(false)}
          title={t('vendorPortal.deals.propose')}
        >
          <div className="space-y-3">
            <select
              data-testid="deal-product-select"
              value={dealProductId ?? ''}
              onChange={(e) => setDealProductId(Number(e.target.value) || undefined)}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            >
              <option value="">—</option>
              {prods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr} · {formatCurrency(p.price)}
                </option>
              ))}
            </select>
            {/* D5 — seasonal deal templates prefill the window. */}
            <select
              data-testid="deal-template-select"
              defaultValue=""
              onChange={(e) => {
                const tpl = (templatesQ.data ?? []).find((x) => x.type === e.target.value);
                if (tpl) {
                  setDealStarts(tpl.startsAt.slice(0, 16));
                  setDealEnds(tpl.endsAt.slice(0, 16));
                }
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            >
              <option value="">{t('vendorPortal.deals.template-hint')}</option>
              {(templatesQ.data ?? []).map((tpl) => (
                <option key={tpl.type} value={tpl.type}>
                  {locale === 'ar' ? tpl.titleAr : tpl.titleEn}
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
              <p className="text-sm text-red-600 dark:text-red-400">
                {proposeDealMut.error.message}
              </p>
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
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.pricePlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            />
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              placeholder={t('vendorPortal.stockPlaceholder')}
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
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

        {/* C1 — product editor pro: bilingual fields, gallery, draft. */}
        <Modal
          open={editId !== null}
          onClose={() => setEditId(null)}
          title={t('vendorPortal.editProduct')}
        >
          {editId !== null && (
            <div className="space-y-3">
              <input
                value={edNameAr}
                onChange={(e) => setEdNameAr(e.target.value)}
                placeholder={t('vendorPortal.productNamePlaceholder')}
                className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
              />
              <input
                value={edNameEn}
                onChange={(e) => setEdNameEn(e.target.value)}
                placeholder={t('vendorPortal.nameEnPlaceholder')}
                className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
              />
              <textarea
                value={edDescAr}
                onChange={(e) => setEdDescAr(e.target.value)}
                placeholder={t('vendorPortal.descArPlaceholder')}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
              />
              <textarea
                value={edDescEn}
                onChange={(e) => setEdDescEn(e.target.value)}
                placeholder={t('vendorPortal.descEnPlaceholder')}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={edPrice}
                  onChange={(e) => setEdPrice(parseFloat(e.target.value) || 0)}
                  placeholder={t('vendorPortal.pricePlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                />
                <input
                  type="number"
                  value={edStock}
                  onChange={(e) => setEdStock(parseInt(e.target.value) || 0)}
                  placeholder={t('vendorPortal.stockPlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                />
                <input
                  value={edEmoji}
                  onChange={(e) => setEdEmoji(e.target.value)}
                  placeholder="🧴"
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                />
                <input
                  type="number"
                  value={edThreshold}
                  onChange={(e) => setEdThreshold(parseInt(e.target.value) || 0)}
                  placeholder={t('vendorPortal.thresholdPlaceholder')}
                  className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
                />
              </div>
              <select
                value={edCategoryId ?? ''}
                onChange={(e) => setEdCategoryId(Number(e.target.value) || undefined)}
                className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
              >
                <option value="">—</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {localize(c.nameJson, locale)}
                  </option>
                ))}
              </select>
              {/* C1 — multi-image gallery (append via the media pipeline). */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-secondary">
                  {t('vendorPortal.images')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {edImages.map((url, i) => (
                    <div key={url} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`gallery-${i}`}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEdImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white"
                        aria-label="remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      edImgMut.mutate({
                        mediaType: 'image',
                        file: {
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          base64: String(reader.result ?? ''),
                        },
                      });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-sm"
                />
              </div>
              {updateMut.isError && (
                <p className="text-sm text-red-600 dark:text-red-400">{updateMut.error.message}</p>
              )}
              {/* C4 — rich media + product-level SEO section. Collapsed by
                  default so the edit modal stays short (a tall modal
                  clipped the Save button on CI viewports). */}
              <details className="rounded-lg border border-border-muted p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  {t('vendorPortal.media.section')}
                </summary>
                <div className="mt-3 space-y-3">
                  <Input
                    label={t('vendorPortal.media.video')}
                    value={edVideoUrl}
                    onChange={(e) => setEdVideoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        label={`${t('vendorPortal.media.metaTitleAr')} (${edMetaTitleAr.length}/60)`}
                        value={edMetaTitleAr}
                        onChange={(e) => setEdMetaTitleAr(e.target.value.slice(0, 60))}
                      />
                      <Input
                        label={`${t('vendorPortal.media.metaTitleEn')} (${edMetaTitleEn.length}/60)`}
                        value={edMetaTitleEn}
                        onChange={(e) => setEdMetaTitleEn(e.target.value.slice(0, 60))}
                      />
                    </div>
                    <div>
                      <Input
                        label={`${t('vendorPortal.media.metaDescAr')} (${edMetaDescAr.length}/160)`}
                        value={edMetaDescAr}
                        onChange={(e) => setEdMetaDescAr(e.target.value.slice(0, 160))}
                      />
                      <Input
                        label={`${t('vendorPortal.media.metaDescEn')} (${edMetaDescEn.length}/160)`}
                        value={edMetaDescEn}
                        onChange={(e) => setEdMetaDescEn(e.target.value.slice(0, 160))}
                      />
                    </div>
                  </div>
                  <Input
                    label={t('vendorPortal.media.arTryOn')}
                    value={edArTryOnUrl}
                    onChange={(e) => setEdArTryOnUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </details>
              <Button
                onClick={() => {
                  if (edNameAr.trim() && edPrice > 0)
                    updateMut.mutate({
                      id: editId,
                      nameAr: edNameAr.trim(),
                      nameEn: edNameEn.trim() || undefined,
                      descAr: edDescAr,
                      descEn: edDescEn,
                      price: edPrice,
                      stock: edStock,
                      emoji: edEmoji,
                      categoryId: edCategoryId,
                      images: edImages,
                      lowStockThreshold: edThreshold,
                      // C4 — media + SEO.
                      videoUrl: edVideoUrl.trim() || undefined,
                      metaTitleAr: edMetaTitleAr.trim() || undefined,
                      metaTitleEn: edMetaTitleEn.trim() || undefined,
                      metaDescAr: edMetaDescAr.trim() || undefined,
                      metaDescEn: edMetaDescEn.trim() || undefined,
                      arTryOnUrl: edArTryOnUrl.trim() || undefined,
                    });
                }}
                loading={updateMut.isPending || edImgMut.isPending}
                className="w-full"
              >
                {t('vendorPortal.save')}
              </Button>
            </div>
          )}
        </Modal>

        {/* C1 — variants manager for the selected product. */}
        {variantProduct ? (
          <ProductVariantsModal product={variantProduct} onClose={() => setVariantProduct(null)} />
        ) : null}

        {/* C2b — stock-in dialog. */}
        {stockInProduct ? (
          <StockInModal product={stockInProduct} onClose={() => setStockInProduct(null)} />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
