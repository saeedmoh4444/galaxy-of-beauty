'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, Input, formatCurrency, useAuth } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';
import { VenueProfileCard } from '../shared/VenueProfileCard';

/**
 * S1 — generic store dashboard: KPIs, orders, deals, top products and the
 * product catalog. Extracted from VendorPortal (A1 decomposition);
 * lazy-loaded per vendor type so only the owner's dashboard chunk ships.
 */
export function StoreDashboard({
  store,
  refetchStore,
  shellRole,
}: {
  store: Record<string, unknown>;
  refetchStore: () => void;
  shellRole?: string;
}): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
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
  const prods = (products as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const storeOrders = (orders as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <DashboardLayout userRole={shellRole}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {/* S1 — the owner's store name leads the dashboard (the portal
                title alone made it feel like a shared page). */}
            <h1 className="text-2xl font-bold">
              {(store?.storeName as string | undefined) ?? t('vendorPortal.title')}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.subtitle')}</p>
          </div>
          <Button onClick={() => setShow(true)}>+ {t('vendorPortal.newProduct')}</Button>
        </div>

        {/* E6d/E7/K3 — trust toggles + venue banner (self-service) */}
        <VenueProfileCard
          store={store as Record<string, unknown>}
          refetchStore={() => refetchStore()}
        />

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
            <p className="text-2xl font-bold">{(dash?.rating as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.rating')}</p>
          </Card>
        </div>

        {/* S5 — order-based analytics (30-day revenue, orders, AOV, customers) */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">
              {formatCurrency((dash?.revenue30d as number) ?? 0)}
            </p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.revenue30d')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.ordersCount as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.ordersCount')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{formatCurrency((dash?.aov as number) ?? 0)}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.aov')}</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-2xl font-bold">{(dash?.customerCount as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">{t('vendorPortal.customers')}</p>
          </Card>
        </div>

        {/* Store plan Phase 1 — orders */}
        <Card padding="lg">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">{t('vendorPortal.orders.title')}</h3>
            {((dash?.ordersByStatus as Record<string, number> | undefined)?.FULFILLED ?? 0) > 0 && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                {t('vendorPortal.fulfilledOrders')}:{' '}
                {(dash?.ordersByStatus as Record<string, number>).FULFILLED}
              </span>
            )}
          </div>
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
                            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
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
            <div className="text-sm text-text-tertiary">
              <p>{t('vendorPortal.deals.empty')}</p>
              <p className="mt-1 text-xs">{t('vendorPortal.deals.floor-hint')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myDeals.map((sub: Record<string, unknown>) => {
                const payload = (sub.payload ?? {}) as Record<string, unknown>;
                const original = Number(payload.originalPrice ?? 0);
                const deal = Number(payload.dealPrice ?? 0);
                const pct = original > 0 ? Math.round((1 - deal / original) * 100) : 0;
                return (
                  <Card key={sub.id as number} padding="sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{payload.titleAr as string}</p>
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
                        {new Date(payload.startsAt as string).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                        )}{' '}
                        —{' '}
                        {new Date(payload.endsAt as string).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-GB',
                        )}
                      </p>
                    ) : null}
                    {sub.status === 'REJECTED' && sub.reviewNotes ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {t('tech.packages.reject-reason', { reason: sub.reviewNotes as string })}
                      </p>
                    ) : null}
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
                      {formatCurrency(Number(p.price ?? 0) * Number(p.sales ?? 0))}{' '}
                      {t('vendorPortal.revenue')}
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
                ></button>
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
              className="w-full rounded-lg border px-3 py-2 text-sm border-edge bg-surface-elevated"
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
      </div>
    </DashboardLayout>
  );
}
