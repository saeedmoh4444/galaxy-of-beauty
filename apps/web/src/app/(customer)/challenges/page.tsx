'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, ProgressBar } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Challenge {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  target: number;
  reward: string;
  rewardValue: number;
}

const CHALLENGE_STYLES: Record<string, { emoji: string; gradient: string; bgGradient: string }> = {
  '7day_skincare': { emoji: '✨', gradient: 'from-rose-400 to-pink-500', bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950' },
  '5bookings': { emoji: '💇‍♀️', gradient: 'from-amber-400 to-orange-500', bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950' },
  first_review: { emoji: '⭐', gradient: 'from-blue-400 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950' },
  streak_4weeks: { emoji: '🔥', gradient: 'from-purple-400 to-violet-500', bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950' },
  refer_3friends: { emoji: '👯‍♀️', gradient: 'from-emerald-400 to-green-500', bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950' },
};

function getProgressForChallenge(challengeId: string, progress: { bookingCount: number; reviewCount: number }): { current: number; target: number; label: string } {
  switch (challengeId) {
    case '5bookings':
      return { current: Math.min(progress.bookingCount, 5), target: 5, label: 'حجوزات' };
    case 'first_review':
      return { current: Math.min(progress.reviewCount, 1), target: 1, label: 'مراجعة' };
    case 'streak_4weeks':
      return { current: Math.min(progress.bookingCount, 4), target: 4, label: 'أسابيع' };
    case '7day_skincare':
      return { current: Math.min(progress.bookingCount, 7), target: 7, label: 'أيام' };
    case 'refer_3friends':
      return { current: 0, target: 3, label: 'صديقات' };
    default:
      return { current: 0, target: 1, label: '' };
  }
}

export default function ChallengesPage(): JSX.Element {
  const { data: challenges, isLoading, isError, refetch: refetchList } = api.challenges.list.useQuery();
  const { data: progress, refetch: refetchProgress } = api.challenges.myProgress.useQuery();
  const joinMut = api.challenges.join.useMutation();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleJoin = (challengeId: string): void => {
    setJoiningId(challengeId);
    joinMut.mutate(
      { challengeId },
      {
        onSuccess: () => {
          setJoinedIds((prev) => new Set(prev).add(challengeId));
          setJoiningId(null);
          refetchProgress();
        },
        onError: () => setJoiningId(null),
      },
    );
  };

  const allChallenges: Challenge[] = (challenges ?? []) as Challenge[];
  const userProgress = progress ?? { bookingCount: 0, reviewCount: 0 };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🏆 تحديات الجمال</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            أكملي التحديات واكسبي مكافآت حصرية — تقدمكِ مهم لنا!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card padding="lg" className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl">📊</span>
            <p className="mt-2 text-3xl font-bold text-brand-600">{userProgress.bookingCount}</p>
            <p className="text-sm text-gray-500">حجز مكتمل</p>
          </Card>
          <Card padding="lg" className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl">✍️</span>
            <p className="mt-2 text-3xl font-bold text-brand-600">{userProgress.reviewCount}</p>
            <p className="text-sm text-gray-500">مراجعة</p>
          </Card>
          <Card padding="lg" className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl">🏅</span>
            <p className="mt-2 text-3xl font-bold text-brand-600">{joinedIds.size}</p>
            <p className="text-sm text-gray-500">تحدي نشط</p>
          </Card>
        </div>

        {/* Challenges Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل التحديات" onRetry={() => refetchList()} />
        ) : allChallenges.length === 0 ? (
          <EmptyState title="لا توجد تحديات متاحة حالياً" description="تحقق مرة أخرى لاحقاً" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allChallenges.map((challenge) => {
              const style = CHALLENGE_STYLES[challenge.id] ?? { emoji: '🎯', gradient: 'from-gray-400 to-gray-500', bgGradient: '' };
              const prog = getProgressForChallenge(challenge.id, userProgress);
              const pct = prog.target > 0 ? Math.round((prog.current / prog.target) * 100) : 0;
              const isJoined = joinedIds.has(challenge.id);
              const isComplete = pct >= 100;

              return (
                <Card
                  key={challenge.id}
                  padding="lg"
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    isComplete
                      ? 'border-2 border-green-400 dark:border-green-600'
                      : isJoined
                        ? 'border-2 border-brand-300 dark:border-brand-700'
                        : ''
                  }`}
                >
                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.gradient}`} />

                  {/* Complete badge */}
                  {isComplete && (
                    <div className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white">
                      ✓ مكتمل
                    </div>
                  )}

                  <div className="pt-4 text-center">
                    <span className="text-5xl">{style.emoji}</span>
                    <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
                      {challenge.nameAr}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {challenge.descAr}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {prog.current} / {prog.target} {prog.label}
                        </span>
                        <span className="font-semibold text-brand-600">{pct}%</span>
                      </div>
                      <ProgressBar
                        value={pct}
                        className={isComplete ? '[&>div]:bg-green-500' : ''}
                      />
                    </div>

                    {/* Reward */}
                    <div className="mt-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-xs text-gray-400">المكافأة</p>
                      <p className="mt-0.5 text-sm font-bold text-brand-600 dark:text-brand-400">
                        🎁 {challenge.reward}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      {isComplete ? (
                        <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                          🎉 أحسنتِ! المكافأة في انتظاركِ
                        </div>
                      ) : isJoined ? (
                        <div className="rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                          ⏳ جاري التحدي...
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleJoin(challenge.id)}
                          loading={joiningId === challenge.id}
                          className="w-full"
                        >
                          ابدئي التحدي 🚀
                        </Button>
                      )}
                    </div>
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
