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

  const prods = (products as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const storeOrders = (orders as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  /* ---------- Apply wizard (no store yet) ---------- */
  if (!storeLoading && !store) {
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
          <div>
            <h1 className="text-2xl font-bold">{t('vendorPortal.apply.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('vendorPortal.apply.subtitle')}</p>
          </div>
          <Card padding="lg">
            <div className="space-y-3">
              <Input
                label={t('vendorPortal.apply.store-name')}
                value={applyName}
                onChange={(e) => setApplyName(e.target.value)}
              />
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
              {applyMut.isError && <p className="text-sm text-red-600">{applyMut.error.message}</p>}
              <Button
                onClick={() =>
                  applyMut.mutate({
                    storeName: applyName.trim(),
                    storeSlug: `store-${Date.now().toString(36)}-${Math.random()
                      .toString(36)
                      .slice(2, 8)}`,
                    descriptionAr: applyBio.trim() || undefined,
                    licenseNumber: applyLicense.trim() || undefined,
                    bankName: applyBank.trim() || undefined,
                    bankIban: applyIban.trim() || undefined,
                    logoUrl: applyLogo.trim() || undefined,
                  })
                }
                loading={applyMut.isPending}
                disabled={!applyName.trim()}
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
            <Button
              onClick={() => {
                if (name.trim() && price > 0) addMut.mutate({ nameAr: name.trim(), price, stock });
              }}
              loading={addMut.isPending}
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
