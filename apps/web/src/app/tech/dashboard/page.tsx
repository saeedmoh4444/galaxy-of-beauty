'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import {
  Card,
  ErrorAlert,
  EmptyState,
  Button,
  Input,
  formatCurrency,
  StatCard,
  PageContainer,
  DashboardSkeleton,
  CardListSkeleton,
  useAuth,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import { localize, type TranslationKey } from '@galaxy/shared';

const PACKAGE_STATUS_LABEL: Record<string, TranslationKey> = {
  PENDING_REVIEW: 'tech.packages.status-pending',
  APPROVED: 'tech.packages.status-approved',
  REJECTED: 'tech.packages.status-rejected',
};

export default function TechDashboardPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  // Gate: an expired cookie passes the middleware and would fire this
  // auth-only query for guests ("Authentication required" noise).
  const pending = api.bookings.getTechnicianPending.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const earnings = api.analytics.technicianEarnings.useQuery({ days: 30 });
  const { data: profile } = api.auth.me.useQuery();
  const transition = api.bookings.transition.useMutation({
    onSuccess: () => {
      pending.refetch();
    },
  });

  // B.6 — My Packages (propose + status list).
  const techId = (profile?.technician?.id ?? 0) as number;
  const myServicesQ = api.technicians.getServices.useQuery(
    { techId },
    { enabled: isAuthenticated && techId > 0 },
  );
  const myPackagesQ = api.beautyPackages.myPackages.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const proposeMut = api.beautyPackages.propose.useMutation({
    onSuccess: () => {
      setShowPackageForm(false);
      setPkgNameAr('');
      setPkgNameEn('');
      setPkgDiscount(15);
      setSelectedServiceIds([]);
      myPackagesQ.refetch();
    },
  });
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [pkgNameAr, setPkgNameAr] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgDiscount, setPkgDiscount] = useState(15);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const myPackages =
    (myPackagesQ.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];
  const myServices =
    (myServicesQ.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  // B.7 — My Promotions (time-limited discounts on own services).
  const myPromotionsQ = api.promotions.myPromotions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const proposePromoMut = api.promotions.propose.useMutation({
    onSuccess: () => {
      setShowPromoForm(false);
      myPromotionsQ.refetch();
    },
  });
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoSvcId, setPromoSvcId] = useState<number | undefined>();
  const [promoDealPrice, setPromoDealPrice] = useState('');
  const [promoStarts, setPromoStarts] = useState(
    new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
  );
  const [promoEnds, setPromoEnds] = useState(
    new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 16),
  );
  const myPromotions =
    (myPromotionsQ.data as unknown as Array<Record<string, unknown>> | undefined) ?? [];

  // technicianEarnings returns { dailyEarnings, totalEarnings, ... } — the
  // today/week/month summaries below were never part of that shape, so the
  // KPIs show 0 until product decides the intended aggregation.
  const legacyEarnings = earnings.data as
    | (NonNullable<typeof earnings.data> & { today?: number; week?: number; month?: number })
    | undefined;
  const todayEarnings = legacyEarnings?.today || 0;
  const weekEarnings = legacyEarnings?.week || 0;
  const monthEarnings = legacyEarnings?.month || 0;
  const rating = profile?.technician?.ratingAvg || 0;
  const completedBookings = profile?.technician?.completedBookings || 0;

  return (
    <DashboardLayout userRole="TECHNICIAN">
      <PageContainer width="wide">
        <h1 className="text-2xl font-bold text-text-primary">{t('tech.dashboard.title')}</h1>

        {/* Stats */}
        {earnings.isLoading ? (
          <DashboardSkeleton />
        ) : earnings.isError ? (
          <ErrorAlert message={t('tech.dashboard.load-error')} onRetry={() => earnings.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label={t('tech.dashboard.earnings-today')}
              value={formatCurrency(Number(todayEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.earnings-week')}
              value={formatCurrency(Number(weekEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.earnings-month')}
              value={formatCurrency(Number(monthEarnings))}
              icon=""
            />
            <StatCard
              label={t('tech.dashboard.rating')}
              value={` ${Number(rating).toFixed(1)}`}
              icon=""
            />
          </div>
        )}

        {/* Performance Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={t('tech.dashboard.completed-bookings')}
            value={completedBookings}
            icon=""
          />
          <StatCard
            label={t('tech.dashboard.customer-rating')}
            value={Number(rating).toFixed(1)}
            icon=""
          />
          <StatCard
            label={t('tech.dashboard.kyc-status')}
            value={
              profile?.technician?.kycStatus === 'VERIFIED'
                ? t('tech.dashboard.kyc-verified')
                : t('tech.dashboard.kyc-under-review')
            }
            icon=""
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/tech/slots">
            <Button variant="outline">{t('tech.dashboard.manage-slots')}</Button>
          </Link>
          <Link href="/tech/profile">
            <Button variant="outline">{t('tech.dashboard.edit-profile')}</Button>
          </Link>
          <Link href="/tech/earnings">
            <Button variant="outline">{t('tech.dashboard.earnings')}</Button>
          </Link>
          <Link href="/tech/calendar">
            <Button variant="outline">{t('tech.dashboard.calendar')}</Button>
          </Link>
        </div>

        {/* B.6 — My Packages (provider-proposed, admin-approved) */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{t('tech.packages.title')}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowPackageForm(!showPackageForm)}>
            {t('tech.packages.propose')}
          </Button>
        </div>
        {showPackageForm && (
          <Card padding="md">
            <div className="space-y-3">
              <Input
                label={t('tech.packages.name-ar')}
                value={pkgNameAr}
                onChange={(e) => setPkgNameAr(e.target.value)}
              />
              <Input
                label={t('tech.packages.name-en')}
                value={pkgNameEn}
                onChange={(e) => setPkgNameEn(e.target.value)}
              />
              <Input
                label={t('tech.packages.discount')}
                type="number"
                value={pkgDiscount}
                onChange={(e) => setPkgDiscount(Number(e.target.value))}
              />
              <div>
                <p className="mb-2 text-sm text-text-secondary">
                  {t('tech.packages.select-services')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {myServices.map((mapping: Record<string, unknown>) => {
                    const svc = mapping.service as Record<string, unknown>;
                    const sid = svc?.id as number;
                    const active = selectedServiceIds.includes(sid);
                    return (
                      <button
                        key={sid}
                        onClick={() =>
                          setSelectedServiceIds(
                            active
                              ? selectedServiceIds.filter((i) => i !== sid)
                              : [...selectedServiceIds, sid],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs ${
                          active
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-300 text-text-secondary'
                        }`}
                      >
                        {localize(svc?.titleJson, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
              {proposeMut.isError && (
                <p className="text-sm text-red-600">{proposeMut.error.message}</p>
              )}
              <Button
                onClick={() =>
                  proposeMut.mutate({
                    nameAr: pkgNameAr.trim(),
                    nameEn: pkgNameEn.trim() || pkgNameAr.trim(),
                    discountPercent: pkgDiscount,
                    serviceIds: selectedServiceIds,
                  })
                }
                loading={proposeMut.isPending}
                disabled={!pkgNameAr.trim() || selectedServiceIds.length < 2}
              >
                {t('button.save')}
              </Button>
            </div>
          </Card>
        )}
        {!myPackagesQ.isLoading && myPackages.length === 0 ? (
          <EmptyState title={t('tech.packages.empty')} />
        ) : (
          <div className="space-y-3">
            {myPackages.map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">
                      {((p.nameJson as Record<string, string>) ?? {})['ar']}
                    </p>
                    <p className="text-sm text-text-secondary">
                      −{p.discountPercent as number}% ·{' '}
                      {(p.services as unknown[] | undefined)?.length ?? 0}{' '}
                      {t('tech.packages.services')}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t(
                      PACKAGE_STATUS_LABEL[(p.status as string) ?? ''] ??
                        'tech.packages.status-pending',
                    )}
                  </span>
                </div>
                {p.status === 'REJECTED' && p.reviewNotes ? (
                  <p className="mt-2 text-xs text-red-600">
                    {t('tech.packages.reject-reason', { reason: p.reviewNotes as string })}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}

        {/* B.7 — My Promotions (time-limited discounts, admin-approved) */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{t('tech.promotions.title')}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowPromoForm(!showPromoForm)}>
            {t('tech.promotions.propose')}
          </Button>
        </div>
        {showPromoForm && (
          <Card padding="md">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">
                  {t('tech.promotions.select-service')}
                </label>
                <select
                  value={promoSvcId ?? ''}
                  onChange={(e) => setPromoSvcId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="">—</option>
                  {myServices.map((mapping: Record<string, unknown>) => {
                    const svc = mapping.service as Record<string, unknown>;
                    const sid = svc?.id as number;
                    return (
                      <option key={sid} value={sid}>
                        {localize(svc?.titleJson, locale)} ·{' '}
                        {formatCurrency(Number(mapping.customPrice ?? svc?.basePrice ?? 0))}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Input
                label={t('tech.promotions.deal-price')}
                type="number"
                value={promoDealPrice}
                onChange={(e) => setPromoDealPrice(e.target.value)}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label={t('tech.promotions.starts-at')}
                  type="datetime-local"
                  value={promoStarts}
                  onChange={(e) => setPromoStarts(e.target.value)}
                />
                <Input
                  label={t('tech.promotions.ends-at')}
                  type="datetime-local"
                  value={promoEnds}
                  onChange={(e) => setPromoEnds(e.target.value)}
                />
              </div>
              {proposePromoMut.isError && (
                <p className="text-sm text-red-600">{proposePromoMut.error.message}</p>
              )}
              <Button
                onClick={() =>
                  proposePromoMut.mutate({
                    serviceId: promoSvcId ?? 0,
                    dealPrice: Number(promoDealPrice),
                    startsAt: new Date(promoStarts).toISOString(),
                    endsAt: new Date(promoEnds).toISOString(),
                  })
                }
                loading={proposePromoMut.isPending}
                disabled={!promoSvcId || !promoDealPrice || !promoStarts || !promoEnds}
              >
                {t('button.save')}
              </Button>
            </div>
          </Card>
        )}
        {!myPromotionsQ.isLoading && myPromotions.length === 0 ? (
          <EmptyState title={t('tech.promotions.empty')} />
        ) : (
          <div className="space-y-3">
            {myPromotions.map((sub: Record<string, unknown>) => {
              const payload = (sub.payload ?? {}) as Record<string, unknown>;
              return (
                <Card key={sub.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{payload.titleAr as string}</p>
                      <p className="text-sm text-text-secondary">
                        {formatCurrency(payload.originalPrice as number)} ←{' '}
                        <span className="font-bold text-red-600">
                          {formatCurrency(payload.dealPrice as number)}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        sub.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : sub.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t(
                        PACKAGE_STATUS_LABEL[(sub.status as string) ?? ''] ??
                          'tech.packages.status-pending',
                      )}
                    </span>
                  </div>
                  {sub.status === 'REJECTED' && sub.reviewNotes ? (
                    <p className="mt-2 text-xs text-red-600">
                      {t('tech.packages.reject-reason', { reason: sub.reviewNotes as string })}
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pending Bookings */}
        <h2 className="text-lg font-semibold text-text-primary">
          {t('tech.dashboard.pending-title')}
        </h2>
        {pending.isLoading ? (
          <CardListSkeleton count={3} />
        ) : pending.isError ? (
          <ErrorAlert message={t('tech.dashboard.load-error')} onRetry={() => pending.refetch()} />
        ) : !pending.data || (pending.data as unknown[]).length === 0 ? (
          <EmptyState title={t('tech.dashboard.pending-empty')} />
        ) : (
          <div className="space-y-3">
            {(pending.data ?? []).slice(0, 10).map((b) => (
              <Card key={b.id} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{b.bookingCode}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(b.startAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')}{' '}
                      · {formatCurrency(Number(b.totalAmount))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => transition.mutate({ id: b.id as number, action: 'accept' })}
                      loading={transition.isPending}
                    >
                      {t('tech.bookings.accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => transition.mutate({ id: b.id as number, action: 'reject' })}
                      loading={transition.isPending}
                    >
                      {t('tech.bookings.reject')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
