'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
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
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const {
    data: reward,
    isLoading,
    isError,
    refetch,
  } = api.birthdayRewards.myReward.useQuery() as {
    data: RewardData | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const claimMut = api.birthdayRewards.claim.useMutation({
    onSuccess: () => refetch(),
  });
  const [claimError, setClaimError] = useState('');

  const handleClaim = () => {
    setClaimError('');
    claimMut.mutate(undefined, {
      onError: (err: { message?: string }) =>
        setClaimError(err?.message ?? t('birthday.claimFailed')),
    });
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
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <span className="text-7xl"></span>
          <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
            {t('birthday.title')}
          </h1>
          <p className="mt-2 text-text-secondary dark:text-gray-400">{t('birthday.subtitle')}</p>
        </div>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <ErrorAlert message={t('birthday.loadError')} onRetry={() => refetch()} />
        ) : (
          <>
            {/* Main Reward Card */}
            <Card
              padding="lg"
              className="relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-2 border-pink-200 dark:border-pink-800"
            >
              {/* Decorative */}
              <div className="absolute -top-6 -right-6 text-6xl opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 text-6xl opacity-20"></div>

              {isClaimed ? (
                /* Claimed State */
                <div className="text-center relative z-10">
                  <span className="text-6xl"></span>
                  <h2 className="mt-4 text-2xl font-extrabold text-text-primary dark:text-gray-100">
                    {t('birthday.claimedTitle')}
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    {t('birthday.claimedDesc')}
                  </p>

                  {/* Promo Code */}
                  {reward?.promoCode && (
                    <div className="mt-4 inline-block rounded-2xl bg-white dark:bg-gray-800 px-8 py-4 shadow-lg border-2 border-dashed border-pink-300 dark:border-pink-700">
                      <p className="text-xs text-text-secondary mb-1"> {t('birthday.codeLabel')}</p>
                      <p className="text-3xl font-mono font-extrabold tracking-widest text-brand-600">
                        {reward.promoCode}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(reward.promoCode ?? '');
                        }}
                        className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        {t('birthday.copyCode')}
                      </button>
                    </div>
                  )}

                  {reward?.claimedAt && (
                    <p className="mt-4 text-xs text-text-tertiary">
                      {t('birthday.claimedAt')}{' '}
                      {new Date(reward.claimedAt).toLocaleDateString(
                        locale === 'en' ? 'en-GB' : 'ar-SA',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </p>
                  )}

                  <div className="mt-6">
                    <Link href="/bookings/create">
                      <Button size="lg"> {t('birthday.bookAndUse')}</Button>
                    </Link>
                  </div>
                </div>
              ) : hasReward ? (
                /* Unclaimed — can claim */
                <div className="text-center relative z-10">
                  <span className="text-6xl"></span>
                  <h2 className="mt-4 text-2xl font-extrabold text-text-primary dark:text-gray-100">
                    {t('birthday.waitingTitle')}
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    {discountPercent > 0
                      ? t('birthday.discountDesc', { percent: discountPercent })
                      : rewardValue > 0
                        ? t('birthday.balanceDesc', { amount: formatCurrency(rewardValue) })
                        : t('birthday.specialDesc')}
                  </p>

                  {claimError && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                      {claimError}
                    </div>
                  )}

                  <div className="mt-6">
                    <Button size="lg" onClick={handleClaim} loading={claimMut.isPending}>
                      {t('birthday.claim')}
                    </Button>
                  </div>
                </div>
              ) : (
                /* No reward yet */
                <div className="text-center relative z-10">
                  <span className="text-6xl"></span>
                  <h2 className="mt-4 text-xl font-bold text-text-primary dark:text-gray-100">
                    {t('birthday.notYetTitle')}
                  </h2>
                  <p className="mt-2 text-text-secondary dark:text-gray-400">
                    {daysUntil <= 30
                      ? t('birthday.daysLeft', { days: daysUntil })
                      : t('birthday.withinMonth')}
                  </p>
                  <p className="mt-4 text-sm text-text-secondary">
                    {t('birthday.updateProfileHint')}
                  </p>
                  <div className="mt-6">
                    <Link href="/profile">
                      <Button variant="ghost" size="sm">
                        {t('birthday.updateProfile')} ←
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="md" className="text-center">
                <span className="text-3xl"></span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">
                  {t('birthday.annualGift')}
                </h3>
                <p className="text-xs text-text-secondary">{t('birthday.annualGiftDesc')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <span className="text-3xl"></span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">
                  {t('birthday.forAllMembers')}
                </h3>
                <p className="text-xs text-text-secondary">{t('birthday.forAllMembersDesc')}</p>
              </Card>
              <Card padding="md" className="text-center">
                <span className="text-3xl"></span>
                <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">
                  {t('birthday.valid30')}
                </h3>
                <p className="text-xs text-text-secondary">{t('birthday.valid30Desc')}</p>
              </Card>
            </div>

            {/* Birthday Tips */}
            <Card
              padding="lg"
              className="bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-950 dark:to-rose-950 border-none"
            >
              <h3 className="font-bold text-text-primary dark:text-gray-100 mb-3">
                {t('birthday.ideasTitle')}
              </h3>
              <div className="grid gap-2 text-sm text-text-secondary dark:text-gray-400 sm:grid-cols-2">
                <p> {t('birthday.idea1')}</p>
                <p> {t('birthday.idea2')}</p>
                <p> {t('birthday.idea3')}</p>
                <p> {t('birthday.idea4')}</p>
              </div>
              <div className="mt-4 text-center">
                <Link href="/bookings/create">
                  <Button size="sm">{t('birthday.bookLook')} </Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
