'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TIER_COLORS: Record<string, string> = {
  SILVER: 'from-gray-300 to-gray-400',
  GOLD: 'from-yellow-400 to-amber-500',
  PLATINUM: 'from-purple-400 to-indigo-500',
};

export default function RewardsMarketplacePage(): JSX.Element {
  const { data: account, isLoading: acctLoading } = api.loyalty.myAccount.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: rewards, isLoading: rwLoading } = api.loyalty.rewards.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: transactions } = api.loyalty.myTransactions.useQuery({ page: 1, limit: 20 }) as {
    data: Record<string, unknown> | undefined;
  };
  const redeemMut = api.loyalty.redeem.useMutation();
  const [redeemed, setRedeemed] = useState<number | null>(null);
  const txs = (transactions?.items as Array<Record<string, unknown>>) ?? [];
  const points = (account?.points as number) ?? 0;
  const tier = (account?.tier as string) ?? 'SILVER';

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> سوق المكافآت</h1>
          <p className="mt-1 text-sm text-text-secondary">استبدلي نقاطكِ بمكافآت وخدمات حصرية</p>
        </div>

        {acctLoading ? (
          <CardSkeleton />
        ) : (
          <Card
            padding="lg"
            className={`text-center bg-gradient-to-r ${TIER_COLORS[tier] ?? TIER_COLORS['SILVER']!} text-white`}
          >
            <p className="text-sm opacity-80">رصيد نقاطكِ</p>
            <p className="text-4xl font-extrabold mt-2">{points.toLocaleString('ar-SA')}</p>
            <p className="text-sm mt-1 opacity-80">
              {account?.tierNameAr as string} · مضاعف ×{account?.multiplier as number}
            </p>
            {(account?.nextTier as Record<string, unknown>) && (
              <p className="text-xs mt-2 bg-white dark:bg-gray-900/20 rounded-full px-3 py-1 inline-block">
                تحتاجين {(account!.nextTier as Record<string, unknown>).pointsNeeded as number} نقطة
                للوصول لـ {(account!.nextTier as Record<string, unknown>).name as string}
              </p>
            )}
          </Card>
        )}

        {rwLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !(rewards ?? []).length ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-text-secondary">لا توجد مكافآت متاحة</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(rewards ?? []).map((r: Record<string, unknown>) => {
              const canAfford = points >= (r.pointsCost as number);
              const isRedeemed = redeemed === r.id;
              return (
                <Card
                  key={r.id as number}
                  padding="lg"
                  className={`text-center ${isRedeemed ? 'border-2 border-green-300 bg-green-50' : canAfford ? '' : 'opacity-50'}`}
                >
                  <span className="text-4xl">
                    {r.rewardType === 'free_service'
                      ? '‍️'
                      : r.rewardType === 'discount_percent'
                        ? '️'
                        : ''}
                  </span>
                  <h3 className="font-bold mt-3">{(r.nameJson as Record<string, string>)?.ar}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {(r.descriptionJson as Record<string, string>)?.ar ?? ''}
                  </p>
                  <p className="text-2xl font-extrabold text-amber-600 mt-3">
                    {r.pointsCost as number} نقطة
                  </p>
                  {(r.rewardValue as number) > 0 && (
                    <p className="text-xs text-text-secondary">
                      {r.rewardType === 'discount_percent'
                        ? `خصم ${r.rewardValue as number}%`
                        : r.rewardType === 'discount_fixed'
                          ? `خصم ${formatCurrency(r.rewardValue as number)}`
                          : 'خدمة مجانية'}
                    </p>
                  )}
                  {isRedeemed ? (
                    <p className="text-green-600 font-bold mt-3"> تم الاستبدال</p>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() =>
                        redeemMut.mutate(
                          { rewardId: r.id as number },
                          { onSuccess: () => setRedeemed(r.id as number) },
                        )
                      }
                      loading={redeemMut.isPending}
                      disabled={!canAfford}
                      className="w-full mt-3"
                    >
                      {canAfford ? ' استبدلي' : ' نقاط غير كافية'}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {txs.length > 0 && (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> سجل النقاط</h3>
            <div className="space-y-2">
              {txs.slice(0, 10).map((t: Record<string, unknown>) => (
                <div key={t.id as number} className="flex justify-between text-sm border-b pb-2">
                  <span className="text-text-secondary">{t.reason as string}</span>
                  <span
                    className={`font-bold ${(t.points as number) > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {(t.points as number) > 0 ? '+' : ''}
                    {t.points as number} نقطة
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
