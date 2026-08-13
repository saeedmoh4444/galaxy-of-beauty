'use client';

import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/ui';

export default function ReferralDashboardPage(): JSX.Element {
  const { addToast } = useToast();
  const { data: codeData } = api.referrals.getMyCode.useQuery() as {
    data: { code: string } | undefined;
  };
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = api.referrals.getStats.useQuery() as {
    data:
      | {
          totalReferred: number;
          completedReferrals: number;
          pendingReferrals: number;
          totalEarned: number;
          pendingRewards: number;
          referrals: Array<{
            id: number;
            status: string;
            referralCode: string;
            rewardCredited: boolean;
            referrerReward: number;
            referred: { name: string; createdAt: string };
            completedAt: string | null;
            createdAt: string;
          }>;
        }
      | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: leaderboard } = api.referrals.leaderboard.useQuery({ limit: 10 }) as {
    data: Array<{ referrerId: number; _count: { id: number } }> | undefined;
  };
  const { data: share } = api.referrals.shareCard.useQuery() as {
    data: { code: string; shareUrl: string; shareText: string } | undefined;
  };

  const code = codeData?.code ?? share?.code ?? '———';
  const shareUrl =
    share?.shareUrl ??
    `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => addToast('success', 'تم نسخ الكود'));
  };
  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent((share?.shareText ?? 'انضمي لجالكسي بيوتي') + ' — استخدمي كود: ' + code + '\n' + shareUrl)}`,
      '_blank',
    );
  };

  const s = stats ?? {
    totalReferred: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
    referrals: [],
  };
  const topReferrers = leaderboard ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> برنامج الإحالة</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ادعي صديقاتكِ واربحوا معاً — ٢٠ ر.س لكل من تسجل وتحجز
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-3xl">‍️</p>
            <p className="mt-1 text-2xl font-bold">{s.totalReferred}</p>
            <p className="text-xs text-text-secondary">مدعوة</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="mt-1 text-2xl font-bold text-green-600">{s.completedReferrals}</p>
            <p className="text-xs text-text-secondary">مكتملة</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="mt-1 text-2xl font-bold text-brand-600">
              {formatCurrency(s.totalEarned)}
            </p>
            <p className="text-xs text-text-secondary">ربح</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {formatCurrency(s.pendingRewards)}
            </p>
            <p className="text-xs text-text-secondary">معلق</p>
          </Card>
        </div>

        {/* Share Card */}
        <Card
          padding="lg"
          className="bg-gradient-to-r from-brand-500 to-purple-500 text-white text-center"
        >
          <p className="text-2xl font-bold"> كود الإحالة الخاص بكِ</p>
          <div className="mt-3 inline-block rounded-xl bg-white/20 px-8 py-3 backdrop-blur">
            <p className="text-4xl font-mono font-extrabold tracking-[0.3em]">{code}</p>
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={copyCode}
              className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold hover:bg-white/30 transition-colors"
            >
               نسخ الكود
            </button>
            <button
              onClick={shareWhatsApp}
              className="rounded-lg bg-green-500/50 px-4 py-2 text-sm font-bold hover:bg-green-500/70 transition-colors"
            >
               واتساب
            </button>
          </div>
        </Card>

        {/* Referral History */}
        <h3 className="text-lg font-bold"> سجل الإحالات</h3>
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
        ) : s.referrals.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-8">
            لم تحيلي أحداً بعد — شاركي كودكِ!
          </p>
        ) : (
          <div className="space-y-2">
            {s.referrals.map((r) => (
              <Card key={r.id} padding="md" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900 text-lg">
                    
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.referred?.name ?? 'مستخدم'}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : r.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-surface-muted text-text-secondary'
                    }`}
                  >
                    {r.status === 'COMPLETED'
                      ? 'مكتمل'
                      : r.status === 'PENDING'
                        ? 'معلق'
                        : r.status}
                  </span>
                  <p className="text-xs font-bold text-brand-600 mt-0.5">
                    +{formatCurrency(r.referrerReward)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        <h3 className="text-lg font-bold"> أكثر الأعضاء إحالة</h3>
        {topReferrers.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">لا توجد بيانات كافية بعد</p>
        ) : (
          <Card padding="md">
            <div className="space-y-2">
              {topReferrers.slice(0, 5).map((entry, idx) => (
                <div key={entry.referrerId} className="flex items-center gap-3 py-1">
                  <span className="text-xl w-8 text-center font-bold">
                    {['', '', '', '4️⃣', '5️⃣'][idx] ?? `${idx + 1}`}
                  </span>
                  <div className="flex-1 h-4 rounded-full bg-surface-muted dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-purple-500"
                      style={{
                        width: `${Math.min(100, (entry._count.id / Math.max(1, topReferrers[0]?._count?.id ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {entry._count.id} 
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
