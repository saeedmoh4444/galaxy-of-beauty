'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TIERS: Record<string, { name: string; emoji: string; color: string; points: number; benefits: string[] }> = {
  SILVER: { name: 'الفضية', emoji: '🥈', color: 'from-gray-300 to-gray-400', points: 0, benefits: ['خصم ٥٪ على الحجوزات', 'مضاعف نقاط ١x', 'هدية عيد ميلاد'] },
  GOLD: { name: 'الذهبية', emoji: '🥇', color: 'from-yellow-400 to-amber-500', points: 500, benefits: ['خصم ١٠٪', 'مضاعف نقاط ٢x', 'أولوية الحجز', 'هدية عيد ميلاد', 'جلسة تجريبية مجانية'] },
  PLATINUM: { name: 'البلاتينية', emoji: '💎', color: 'from-purple-400 to-indigo-500', points: 2000, benefits: ['خصم ٢٠٪', 'مضاعف نقاط ٣x', 'حجز VIP', 'هدية عيد ميلاد', 'جلسة مجانية شهرياً', 'استشاري تجميل شخصي'] },
};

export default function LoyaltyDashboardPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: account, isLoading, isError, refetch } = (api.loyalty as any).myAccount?.useQuery?.() as any;

  const currentTier = (account?.tier as string) || 'SILVER';
  const tier = TIERS[currentTier] || TIERS['SILVER']!;
  const nextTierKey = currentTier === 'SILVER' ? 'GOLD' : currentTier === 'GOLD' ? 'PLATINUM' : null;
  const nextTier = nextTierKey ? TIERS[nextTierKey] : null;
  const points = Number(account?.points || 0);
  const progress = nextTier ? Math.min(100, (points / nextTier.points) * 100) : 100;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">👑 برنامج الولاء</h1>

        {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : !account ? <EmptyState title="لا يوجد حساب ولاء" description="يتم إنشاؤه تلقائياً مع أول حجز" /> : (
          <>
            {/* Current Tier Card */}
            <Card padding="lg" className={`bg-gradient-to-r ${tier.color} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">مستوى عضويتكِ</p>
                  <p className="text-3xl font-bold mt-1">{tier.emoji} {tier.name}</p>
                  <p className="text-sm mt-2 opacity-80">{points.toLocaleString()} نقطة</p>
                  <p className="text-xs opacity-60">المضاعف: {account.multiplier || 1}x</p>
                </div>
                <div className="text-6xl">{tier.emoji}</div>
              </div>
              {nextTier && (
                <div className="mt-4 rounded-lg bg-white/20 p-3">
                  <div className="flex justify-between text-sm"><span>التقدم نحو {nextTier.emoji} {nextTier.name}</span><span>{Math.ceil(nextTier.points - points)} نقطة متبقية</span></div>
                  <div className="mt-2 h-2 rounded-full bg-white/30"><div className="h-2 rounded-full bg-white" style={{ width: `${progress}%` }} /></div>
                </div>
              )}
            </Card>

            {/* Benefits */}
            <Card padding="lg">
              <h3 className="font-semibold mb-4">✨ مميزات عضويتكِ</h3>
              <div className="space-y-2">{tier.benefits.map((b: string, i: number) => <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800"><span className="text-brand-600">✓</span> {b}</div>)}</div>
            </Card>

            {/* All Tiers */}
            <Card padding="lg">
              <h3 className="font-semibold mb-4">📊 جميع المستويات</h3>
              <div className="space-y-3">{Object.entries(TIERS).map(([key, t]) => (
                <div key={key} className={`rounded-xl border-2 p-4 ${currentTier === key ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><span className="text-2xl">{t.emoji}</span><div><p className="font-bold text-gray-900 dark:text-gray-100">{t.name}</p><p className="text-xs text-gray-500">من {t.points.toLocaleString()} نقطة</p></div></div>
                    {currentTier === key && <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">حالي</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">{t.benefits.slice(0, 3).map((b: string, i: number) => <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800">{b}</span>)}</div>
                </div>
              ))}</div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
