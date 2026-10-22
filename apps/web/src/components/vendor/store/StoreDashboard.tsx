'use client';
import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, Input, formatCurrency, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { MyStore, StoreDealPayload, StoreOrderRow } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { VenueProfileCard } from '../shared/VenueProfileCard';
import { DashboardTabs } from '../shared/DashboardTabs';

type TabKey = 'overview' | 'orders' | 'products' | 'deals' | 'coupons';

const TAB_KEYS: TabKey[] = ['overview', 'orders', 'products', 'deals', 'coupons'];

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
  const storeOrders = ordersQ.data?.pages.flatMap((p) => p.items) ?? [];

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

  const tabs = [
    { key: 'overview', label: t('vendorPortal.tab.overview') },
    { key: 'orders', label: t('vendorPortal.orders.title') },
    { key: 'products', label: t('vendorPortal.tab.products') },
    { key: 'deals', label: t('vendorPortal.tab.deals') },
    { key: 'coupons', label: t('vendorPortal.tab.coupons') },
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

            {/* Store plan Phase 1 — approval status */}
            {!store.isVerified && (
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
              <Button size="sm" onClick={() => setShow(true)}>
                + {t('vendorPortal.newProduct')}
              </Button>
            </div>
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
                      <p className="text-xs text-text-secondary">
                        {t('vendorPortal.stock')}: {p.stock} · {t('vendorPortal.sales')}: {p.sales}
                      </p>
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
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
            >
              <option value="">—</option>
              {prods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr} · {formatCurrency(p.price)}
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
      </div>
    </DashboardLayout>
  );
}
