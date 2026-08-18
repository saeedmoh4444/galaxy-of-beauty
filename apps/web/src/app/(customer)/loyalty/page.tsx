'use client';

import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert, EmptyState, LOYALTY_TIERS } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

/** UI‑only marketing copy per tier (benefits shown to the customer). */
const TIER_BENEFITS: Record<string, TranslationKey[]> = {
  SILVER: ['loyalty.benefit.discount5', 'loyalty.benefit.points1x', 'loyalty.benefit.birthdayGift'],
  GOLD: [
    'loyalty.benefit.discount10',
    'loyalty.benefit.points15x',
    'loyalty.benefit.priorityBooking',
    'loyalty.benefit.birthdayGift',
    'loyalty.benefit.trialSession',
  ],
  PLATINUM: [
    'loyalty.benefit.discount20',
    'loyalty.benefit.points2x',
    'loyalty.benefit.vipBooking',
    'loyalty.benefit.birthdayGift',
    'loyalty.benefit.monthlyFreeSession',
    'loyalty.benefit.personalStylist',
  ],
};

export default function LoyaltyDashboardPage(): JSX.Element {
  const { t } = useLocale();
  const { data: account, isLoading, isError, refetch } = api.loyalty.myAccount.useQuery();

  const tierKey = (account?.tier as string) || 'SILVER';
  const currentTier = tierKey as keyof typeof LOYALTY_TIERS;
  const tier = LOYALTY_TIERS[currentTier] || LOYALTY_TIERS.SILVER;
  const nextTierKey =
    currentTier === 'SILVER' ? 'GOLD' : currentTier === 'GOLD' ? 'PLATINUM' : null;
  const nextTier = nextTierKey ? LOYALTY_TIERS[nextTierKey] : null;
  const points = Number(account?.points || 0);
  const progress = nextTier ? Math.min(100, (points / nextTier.minPoints) * 100) : 100;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('loyalty.title')}
        </h1>

        {isLoading ? (
          <CardListSkeleton count={4} />
        ) : isError ? (
          <ErrorAlert message={t('common.loadFailed')} onRetry={() => refetch()} />
        ) : !account ? (
          <EmptyState title={t('loyalty.noAccount')} description={t('loyalty.noAccountDesc')} />
        ) : (
          <>
            {/* Current Tier Card */}
            <Card padding="lg" className={`bg-gradient-to-r ${tier.color} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{t('loyalty.membershipLevel')}</p>
                  <p className="text-3xl font-bold mt-1">
                    {tier.emoji} {tier.nameAr}
                  </p>
                  <p className="text-sm mt-2 opacity-80">
                    {points.toLocaleString()} {t('loyalty.points')}
                  </p>
                  <p className="text-xs opacity-60">
                    {t('loyalty.multiplier')} {account.multiplier || 1}x
                  </p>
                </div>
                <div className="text-6xl">{tier.emoji}</div>
              </div>
              {nextTier && (
                <div className="mt-4 rounded-lg bg-white/20 p-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      {t('loyalty.progressToward')} {nextTier.emoji} {nextTier.nameAr}
                    </span>
                    <span>
                      {Math.ceil(nextTier.minPoints - points)} {t('loyalty.pointsRemaining')}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/30">
                    <div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </Card>

            {/* Benefits */}
            <Card padding="lg">
              <h3 className="font-semibold mb-4"> {t('loyalty.benefitsTitle')}</h3>
              <div className="space-y-2">
                {(TIER_BENEFITS[currentTier] ?? []).map((b: TranslationKey, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg bg-surface-muted p-3 text-sm dark:bg-gray-800"
                  >
                    <span className="text-brand-600"></span> {t(b)}
                  </div>
                ))}
              </div>
            </Card>

            {/* All Tiers */}
            <Card padding="lg">
              <h3 className="font-semibold mb-4"> {t('loyalty.allTiers')}</h3>
              <div className="space-y-3">
                {Object.entries(LOYALTY_TIERS).map(([key, tierObj]) => (
                  <div
                    key={key}
                    className={`rounded-xl border-2 p-4 ${currentTier === key ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tierObj.emoji}</span>
                        <div>
                          <p className="font-bold text-text-primary dark:text-gray-100">
                            {tierObj.nameAr}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {t('loyalty.fromPoints', {
                              minPoints: tierObj.minPoints.toLocaleString(),
                            })}
                          </p>
                        </div>
                      </div>
                      {currentTier === key && (
                        <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                          {t('loyalty.current')}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(TIER_BENEFITS[key] ?? [])
                        .slice(0, 3)
                        .map((b: TranslationKey, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary dark:bg-gray-800"
                          >
                            {t(b)}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
