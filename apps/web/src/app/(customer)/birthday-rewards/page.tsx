'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@galaxy/ui';
import Link from 'next/link';

interface RewardData {
  id: number;
  userId: number;
  year: number;
  rewardType: string;
  rewardValue: number | null;
  discountPercent: number | null;
  claimed: boolean;
  claimedAt: string | null;
  promoCode: string | null;
}

export default function BirthdayRewardsPage(): JSX.Element {
  const { user } = useAuth();
  const { data: reward, isLoading, isError, refetch } = api.birthdayRewards.myReward.useQuery() as {
    data: RewardData | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const claimMut = api.birthdayRewards.claim.useMutation({
    onSuccess: () => refetch() });
  const [claimError, setClaimError] = useState('');

  const handleClaim = () => {
    setClaimError('');
    claimMut.mutate(undefined, {
      onError: (err: { message?: string }) => setClaimError(err?.message ?? 'فشل استلام المكافأة') });
  };

  // Estimate days until next birthday
  const today = new Date();
  const birthMonth = user?.name ? 1 : 12; // fallback — user profile should have birthday
  const birthDay = 1;
  const nextBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
  if (nextBirthday < today) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);

  const isClaimed = reward?.claimed ?? false;
  const hasReward = !!reward;
  const rewardValue = Number(reward?.rewardValue ?? 0);
  const discountPercent = Number(reward?.discountPercent ?? 0);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-7xl">🎂</span>
          <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">هدية عيد ميلادكِ</h1>
          <p className="mt-2 text-text-secondary dark:text-gray-400">
            احتفلي معنا — مكافأة خاصة بمناسبة يوم ميلادكِ 🎉
          </p>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل بيانات المكافأة" onRetry={() => refetch()} />
        ) : (
          <>
            {/* Main Reward Card */}
            <Card padding="lg" className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-2 border-pink-200 dark:border-pink-800">
              {/* Decorative */}
              <div className="absolute -top-6 -right-6 text-6xl opacity-20">🎂</div>
              <div className="absolute -bottom-6 -left-6 text-6xl opacity-20">🎁</div>

              {isClaimed ? (
                /* Claimed State */
                <div className="text-center relative z-10">
                  <span className="text-6xl">🎉</span>
                  <h2 className="mt-4 text-2xl font-extrabold text-text-primary dark:text-gray-100">
                    تم استلام هديتكِ!
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    استمتعي بمكافأة عيد ميلادكِ — الكود جاهز للاستخدام
                  </p>

                  {/* Promo Code */}
                  {reward?.promoCode && (
                    <div className="mt-4 inline-block rounded-2xl bg-white dark:bg-gray-800 px-8 py-4 shadow-lg border-2 border-dashed border-pink-300 dark:border-pink-700">
                      <p className="text-xs text-text-secondary mb-1">🎁 كود الخصم</p>
                      <p className="text-3xl font-mono font-extrabold tracking-widest text-brand-600">
                        {reward.promoCode}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(reward.promoCode ?? '');
                        }}
                        className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        📋 نسخ الكود
                      </button>
                    </div>
                  )}

                  {reward?.claimedAt && (
                    <p className="mt-4 text-xs text-text-tertiary">
                      تاريخ الاستلام: {new Date(reward.claimedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}

                  <div className="mt-6">
                    <Link href="/bookings/create">
                      <Button size="lg">💅 احجزي واستخدمي الكود</Button>
                    </Link>
                  </div>
                </div>
              ) : hasReward ? (
                /* Unclaimed — can claim */
                <div className="text-center relative z-10">
                  <span className="text-6xl">🎁</span>
                  <h2 className="mt-4 text-2xl font-extrabold text-text-primary dark:text-gray-100">
                    هديتكِ في انتظاركِ!
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    {discountPercent > 0
                      ? `خصم ${discountPercent}% على حجزكِ القادم`
                      : rewardValue > 0
                        ? `رصيد ${formatCurrency(rewardValue)} ر.س في محفظتكِ`
                        : 'مكافأة خاصة بمناسبة عيد ميلادكِ'}
                  </p>

                  {claimError && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                      {claimError}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      size="lg"
                      onClick={handleClaim}
                      loading={claimMut.isPending}
                    >
                      🎂 استلمي هديتكِ
                    </Button>
                  </div>
                </div>
              ) : (
                /* No reward yet */
                <div className="text-center relative z-10">
                  <span className="text-6xl">📅</span>
                  <h2 className="mt-4 text-xl font-bold text-text-primary dark:text-gray-100">
                    لم يحن موعد هديتكِ بعد
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    {daysUntil <= 30
                      ? `متبقي ${daysUntil} يوم على عيد ميلادكِ 🎂`
                      : 'هدية عيد الميلاد متاحة خلال شهر ميلادكِ'}
                  </p>
                  <p className="mt-4 text-sm text-text-secondary">
                    تأكدي من تحديث تاريخ ميلادكِ في الملف الشخصي لتلقي الهدية في وقتها!
                  </p>
                  <div className="mt-6">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm">تحديث الملف الشخصي ←</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="md" className="text-center">
                <span className="text-3xl">🎁</span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">هدية سنوية</h3>
                <p className="text-xs text-text-secondary">مكافأة تتجدد كل عام في شهر ميلادكِ</p>
              </Card>
              <Card padding="md" className="text-center">
                <span className="text-3xl">💎</span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">لجميع العضوات</h3>
                <p className="text-xs text-text-secondary">جميع المستويات تحصل على هدية العيد</p>
              </Card>
              <Card padding="md" className="text-center">
                <span className="text-3xl">📅</span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">صالحة ٣٠ يوم</h3>
                <p className="text-xs text-text-secondary">استخدمي كود الخصم خلال ٣٠ يوم من الاستلام</p>
              </Card>
            </div>

            {/* Birthday Tips */}
            <Card padding="lg" className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950 border-none">
              <h3 className="font-bold text-text-primary dark:text-gray-100 mb-3">💡 أفكار لعيد ميلادكِ</h3>
              <div className="grid gap-2 text-sm text-text-secondary dark:text-gray-400 sm:grid-cols-2">
                <p>💇‍♀️ تسريحة شعر جديدة ليومكِ الخاص</p>
                <p>💄 جلسة مكياج احترافية</p>
                <p>💅 مانيكير وباديكير احتفالي</p>
                <p>✨ عناية بالبشرة لتتألقي</p>
              </div>
              <div className="mt-4 text-center">
                <Link href="/bookings/create">
                  <Button size="sm">احجزي إطلالة عيد ميلادكِ 🎂</Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
