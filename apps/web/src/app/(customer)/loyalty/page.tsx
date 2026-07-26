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
  const rewardList = (rewardsData as Array<Record<string, unknown>>) || [];

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
            <Card padding="lg" className={`bg-gradient-to-r ${tierColors[account.tier as string] || tierColors.SILVER} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">مستوى العضوية</p>
                  <p className="text-3xl font-bold mt-1">
                    {account.tier === 'PLATINUM' ? '🥇' : account.tier === 'GOLD' ? '🥈' : '🥉'}{' '}
                    {account.tier === 'PLATINUM' ? 'بلاتينية' : account.tier === 'GOLD' ? 'ذهبية' : 'فضية'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-80">النقاط</p>
                  <p className="text-4xl font-bold">{account.points as number}</p>
                  <p className="text-xs opacity-60 mt-1">المضاعف: {account.multiplier as number}x</p>
                </div>
              </div>
              {(account.pointsToNextTier as number) > 0 && (
                <div className="mt-4 rounded-lg bg-white/20 p-3">
                  <p className="text-sm">
                    تبقى {account.pointsToNextTier as number} نقطة للوصول إلى المستوى {account.nextTier as string}
                  </p>
                  <div className="mt-2 h-2 rounded-full bg-white/30">
                    <div
                      className="h-2 rounded-full bg-white"
                      style={{ width: `${Math.min(100, ((account.points as number) / ((account.points as number) + (account.pointsToNextTier as number))) * 100)}%` }}
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
                        {tx.type === 'EARN' ? '➕' : '➖'} {tx.description as string}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt as string).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'EARN' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'EARN' ? '+' : '-'}{tx.points as number} نقطة
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-8">المكافآت المتاحة</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rewardList.map((r) => (
                <Card key={r.id as number} padding="md">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {((r.nameJson as Record<string, string>)?.ar) || ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {((r.descriptionJson as Record<string, string>)?.ar) || ''}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-brand-600">{r.pointsCost as number} نقطة</span>
                    <Button
                      size="sm"
                      onClick={() => redeemMut.mutate({ rewardId: r.id })}
                      disabled={(account?.points as number || 0) < (r.pointsCost as number)}
                    >
                      استبدال
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
