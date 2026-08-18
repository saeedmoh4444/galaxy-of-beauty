'use client';

import { api } from '@/lib/trpc';
import { Card, GridSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';

export default function VIPMembershipPage(): JSX.Element {
  const { t } = useLocale();
  const { data: tiers, isLoading } = api.vipMembership.tiers.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const { data: myTier } = api.vipMembership.myTier.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const upgradeMut = api.vipMembership.upgrade.useMutation();

  const allTiers = tiers ?? [];
  const current = (myTier?.currentTier as string) ?? 'silver';

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <span className="text-6xl"></span>
          <h1 className="mt-4 text-3xl font-bold">{t('vipMembership.title')}</h1>
          <p className="mt-2 text-text-secondary">{t('vipMembership.subtitle')}</p>
          {current !== 'silver' && (
            <p className="mt-2 text-brand-600 font-bold">
              {t('vipMembership.activeMembership')}
              {current === 'gold' ? t('vipMembership.gold') : t('vipMembership.platinum')}
              {t('vipMembership.active')}
            </p>
          )}
        </div>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : allTiers.length === 0 ? (
          <ErrorAlert message={t('vipMembership.noData')} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {allTiers.map((tx: Record<string, unknown>) => {
              const isCurrent = current === (tx.key as string);
              const benefits = (tx.benefits as string[]) ?? [];
              return (
                <Card
                  key={tx.key as string}
                  padding="lg"
                  className={`relative text-center ${isCurrent ? 'border-2 border-brand-400 ring-2 ring-brand-100 dark:ring-brand-900' : ''}`}
                >
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-0.5 text-xs font-bold text-white">
                      {t('vipMembership.current')}
                    </span>
                  )}
                  <span className="text-5xl">{tx.emoji as string}</span>
                  <h2 className="mt-2 text-xl font-extrabold">{tx.nameAr as string}</h2>
                  <p className="mt-3 text-3xl font-extrabold text-brand-600">
                    {(tx.price as number) > 0
                      ? formatCurrency(tx.price as number) + ' ' + t('beautyParty.currency')
                      : t('vipMembership.free')}
                    <span className="text-xs text-text-tertiary font-normal">
                      {' '}
                      / {t('vipMembership.perYear')}
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-right">
                    {benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-brand-500"></span>{' '}
                        <span className="text-text-primary dark:text-gray-300">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {isCurrent ? (
                      <span className="rounded-full bg-green-100 dark:bg-green-900 px-4 py-2 text-sm font-bold text-green-700 dark:text-green-300">
                        {t('vipMembership.membershipActive')}
                      </span>
                    ) : (tx.price as number) > 0 ? (
                      <Button
                        onClick={() =>
                          upgradeMut.mutate({
                            tier: tx.key as string as 'silver' | 'gold' | 'platinum',
                          })
                        }
                        loading={upgradeMut.isPending}
                        className="w-full"
                      >
                        {t('vipMembership.upgrade')}
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
