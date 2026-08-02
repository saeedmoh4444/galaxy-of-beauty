'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, ProgressBar, formatCurrency, COUNTDOWN_INTERVAL_MS } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';
import Link from 'next/link';

interface Deal {
  id: number;
  serviceId: number;
  titleAr: string | null;
  titleEn: string | null;
  discountPercent: number;
  originalPrice: number;
  dealPrice: number;
  discountValue: number;
  maxRedemptions: number;
  currentRedemptions: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  serviceNameAr: string;
  serviceNameEn: string;
  serviceEmoji: string;
}

function CountdownTimer({ endsAt }: { endsAt: string }): JSX.Element {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('انتهى');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours} س ${minutes} د ${seconds} ث`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes} د ${seconds} ث`);
      } else {
        setTimeLeft(`${seconds} ثانية`);
      }
    };

    update();
    const interval = setInterval(update, COUNTDOWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [endsAt]);

  const isEnded = timeLeft === 'انتهى';

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isEnded ? 'text-gray-400' : 'text-orange-600 animate-pulse'}`}>
      ⏰ {timeLeft}
    </span>
  );
}

export default function FlashDealsPage(): JSX.Element {
  const { user } = useAuth();
  const { data: deals, isLoading, isError, refetch } = api.flashDeals.active.useQuery() as {
    data: Deal[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const claimMut = api.flashDeals.claim.useMutation({ onSuccess: () => refetch() });
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const handleClaim = useCallback(
    (dealId: number) => {
      if (!user) return;
      setClaimingId(dealId);
      claimMut.mutate(
        { dealId },
        {
          onSuccess: () => {
            setClaimedIds((prev) => new Set(prev).add(dealId));
            setClaimingId(null);
          },
          onError: () => setClaimingId(null),
        },
      );
    },
    [user, claimMut],
  );

  const allDeals = deals ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl">⚡</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">عروض فلاش</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          عروض لفترة محدودة — الحقّي العرض قبل ما ينتهي!
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل تحميل العروض" onRetry={() => refetch()} />
      ) : allDeals.length === 0 ? (
        <EmptyState
          title="لا توجد عروض فلاش حالياً"
          description="تحققي لاحقاً — العروض تتجدد باستمرار! ⚡"
          action={{ label: 'تصفح الخدمات', onPress: () => window.location.assign('/services') }}
        />
      ) : (
        <div className="space-y-6">
          {allDeals.map((deal) => {
            const pct = deal.maxRedemptions > 0 ? (deal.currentRedemptions / deal.maxRedemptions) * 100 : 0;
            const soldOut = deal.currentRedemptions >= deal.maxRedemptions;
            const isClaimed = claimedIds.has(deal.id);
            const savings = deal.originalPrice - deal.dealPrice;
            const title = deal.titleAr || deal.serviceNameAr;

            return (
              <Card
                key={deal.id}
                padding="lg"
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  soldOut ? 'opacity-60' : ''
                }`}
              >
                {/* Flash badge */}
                <div
                  className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold text-white ${
                    soldOut ? 'bg-gray-400' : 'bg-red-500 animate-pulse'
                  }`}
                >
                  {soldOut ? 'نفذت الكمية' : '⚡ عرض فلاش'}
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {/* Emoji / Service icon */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 text-5xl dark:from-red-950 dark:to-orange-900">
                    {deal.serviceEmoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {deal.serviceNameEn && deal.serviceNameEn !== title ? deal.serviceNameEn : ''}
                    </p>

                    {/* Pricing */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                        {formatCurrency(deal.dealPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatCurrency(deal.originalPrice)}
                      </span>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900 dark:text-red-300">
                        -{deal.discountPercent}%
                      </span>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                        وفر {formatCurrency(savings)}
                      </span>
                    </div>

                    {/* Timer + Redemption Stats */}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <CountdownTimer endsAt={deal.endsAt} />
                      <span>
                        🔥 {deal.currentRedemptions} / {deal.maxRedemptions} تم الاستفادة
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <ProgressBar
                        value={pct}
                        className="[&>div]:bg-red-500"
                      />
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {soldOut ? (
                        <span className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-800">
                          😔 نفذت الكمية
                        </span>
                      ) : isClaimed ? (
                        <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                          ✓ تم الاستفادة من العرض
                        </span>
                      ) : user ? (
                        <Button
                          onClick={() => handleClaim(deal.id)}
                          loading={claimingId === deal.id}
                          size="sm"
                        >
                          ⚡ احجزي الآن
                        </Button>
                      ) : (
                        <Link href={`/login?redirect=/flash-deals`}>
                          <Button size="sm">سجّلي دخول للاستفادة</Button>
                        </Link>
                      )}
                      <Link href={`/services/${deal.serviceId}`}>
                        <Button variant="ghost" size="sm">
                          تفاصيل الخدمة →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      {allDeals.length > 0 && (
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center text-white">
          <p className="text-2xl font-bold">⚡ لا تفوّتي العروض!</p>
          <p className="mt-1 text-white/80">العروض تتجدد يومياً — تابعي صفحة العروض أول بأول</p>
        </div>
      )}
    </div>
  );
}
