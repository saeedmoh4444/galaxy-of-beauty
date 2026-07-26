'use client';

import { api } from '@/lib/trpc';
import type { RouterOutput } from '@galaxy/api/client';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState } from 'react';

type LoyaltyAccount = RouterOutput['loyalty']['myAccount'];
type LoyaltyTransaction = NonNullable<RouterOutput['loyalty']['myTransactions']>['items'][number];
type LoyaltyReward = RouterOutput['loyalty']['rewards'][number];

export default function LoyaltyPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.loyalty.myAccount.useQuery();
  const { data: txData } = api.loyalty.myTransactions.useQuery({ page: 1, limit: 10 });
  const { data: rewardsData } = api.loyalty.rewards.useQuery();
  const redeemMut = api.loyalty.redeem.useMutation({ onSuccess: () => refetch() });

  const account = data as LoyaltyAccount | null;
  const transactions: LoyaltyTransaction[] = txData?.items ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rewardList = (rewardsData ?? []) as any[];

  const tierColors: Record<string, string> = {
    SILVER: 'from-gray-300 to-gray-400',
    GOLD: 'from-yellow-400 to-amber-500',
    PLATINUM: 'from-purple-400 to-indigo-500',
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">برنامج الولاء</h1>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل بيانات الولاء" onRetry={() => refetch()} />
        ) : !account ? (
          <EmptyState title="لا يوجد حساب ولاء" description="يتم إنشاء حساب الولاء تلقائياً مع أول حجز." />
        ) : (
          <>
            {/* Tier Card */}
            <Card padding="lg" className={`bg-gradient-to-r ${tierColors[String(account.tier)] || tierColors['SILVER']} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">مستوى العضوية</p>
                  <p className="mt-1 text-3xl font-bold">
                    {account.tier === 'PLATINUM' ? '🥇' : account.tier === 'GOLD' ? '🥈' : '🥉'}{' '}
                    {account.tier === 'PLATINUM' ? 'بلاتينية' : account.tier === 'GOLD' ? 'ذهبية' : 'فضية'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">النقاط</p>
                  <p className="text-4xl font-bold">{Number(account.points)}</p>
                  <p className="mt-1 text-xs opacity-60">المضاعف: {Number(account.multiplier)}x</p>
                </div>
              </div>
              {account.nextTier && Number(account.nextTier.pointsNeeded) > 0 && (
                <div className="mt-4 rounded-lg bg-white/20 p-3">
                  <p className="text-sm">
                    تبقى {Number(account.nextTier.pointsNeeded)} نقطة للوصول إلى المستوى {account.nextTier.name}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-white/30">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{ width: `${Math.min(100, (Number(account.points) / (Number(account.points) + Number(account.nextTier.pointsNeeded))) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Points History */}
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">سجل النقاط</h2>
            {transactions.length === 0 ? (
              <EmptyState title="لا توجد عمليات" description="ستظهر هنا عمليات كسب وإنفاق النقاط." />
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 10).map((tx, i) => (
                  <Card key={i} padding="sm" className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {Number(tx.points) > 0 ? '➕' : '➖'} {tx.reason}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(String(tx.createdAt)).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <span className={`text-sm font-bold ${Number(tx.points) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(tx.points) > 0 ? '+' : '-'}{Math.abs(Number(tx.points))} نقطة
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Rewards */}
        {rewardList.length > 0 && (
          <>
            <h2 className="mt-8 text-lg font-bold text-gray-900 dark:text-gray-100">المكافآت المتاحة</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewardList.map((r) => {
                const nameJson = r.nameJson as { ar?: string };
                const descJson = r.descriptionJson as { ar?: string };
                return (
                <Card key={Number(r.id)} padding="md">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {nameJson.ar || ''}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {descJson.ar || ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-600">{Number(r.pointsCost)} نقطة</span>
                    <Button
                      size="sm"
                      onClick={() => redeemMut.mutate({ rewardId: Number(r.id) })}
                      disabled={(Number(account?.points) || 0) < Number(r.pointsCost)}
                    >
                      استبدال
                    </Button>
                  </div>
                </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
