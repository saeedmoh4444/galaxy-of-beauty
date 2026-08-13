'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface CareTip {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  timeframe: string;
  emoji: string;
}

interface CarePlan {
  bookingId: number;
  serviceName: string;
  category: string;
  completedAt: string;
  tips: CareTip[];
}

interface TimeframeMeta {
  key: string;
  labelAr: string;
  labelEn: string;
  color: string;
}

interface LibraryCategory {
  key: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  tipsCount: number;
}

const TIMEFRAME_ICONS: Record<string, string> = {
  '24h': '',
  '48h': '',
  '1w': '',
  ongoing: '',
};

export default function PostCarePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'plan' | 'library'>('plan');

  // My Plan
  const {
    data: planData,
    isLoading: planLoading,
    isError: planError,
    refetch: refetchPlan,
  } = api.postCare.myPlan.useQuery() as {
    data: { plans: CarePlan[]; timeframes: TimeframeMeta[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Care Library
  const {
    data: libData,
    isLoading: libLoading,
    isError: libError,
    refetch: refetchLib,
  } = api.postCare.library.useQuery() as {
    data: { categories: LibraryCategory[]; timeframes: TimeframeMeta[] } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const [selectedLibCat, setSelectedLibCat] = useState<string | null>(null);
  const { data: catData } = api.postCare.byCategory.useQuery(
    { category: selectedLibCat ?? 'skincare' },
    { enabled: !!selectedLibCat },
  ) as { data: { tips: CareTip[] } | undefined };

  const plans: CarePlan[] = planData?.plans ?? [];
  const timeframes: TimeframeMeta[] = planData?.timeframes ?? [];
  const categories: LibraryCategory[] = libData?.categories ?? [];
  const libTips: CareTip[] = catData?.tips ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center sm:text-right">
          <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
            ‍️ العناية بعد الخدمة
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
            تعليمات مخصصة للعناية بنفسكِ بعد كل جلسة تجميل
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-xl bg-surface-muted p-1 dark:bg-gray-800">
          {[
            { key: 'plan' as const, label: ' خطتي الشخصية' },
            { key: 'library' as const, label: ' مكتبة العناية' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-white text-brand-700 shadow dark:bg-gray-700 dark:text-brand-300'
                  : 'text-text-secondary hover:text-text-primary dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* My Plan Tab */}
        {activeTab === 'plan' && (
          <>
            {planLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : planError ? (
              <ErrorAlert message="فشل تحميل خطة العناية" onRetry={() => refetchPlan()} />
            ) : plans.length === 0 ? (
              <EmptyState
                title="لا توجد خدمات مكتملة بعد"
                description="بعد إتمام أول حجز، ستظهر تعليمات العناية هنا تلقائياً "
                action={{
                  label: 'احجزي الآن',
                  onPress: () => window.location.assign('/bookings/create'),
                }}
              />
            ) : (
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div key={plan.bookingId} className="space-y-3">
                    {/* Plan Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-white text-lg">
                        ‍️
                      </div>
                      <div>
                        <h3 className="font-bold text-text-primary dark:text-gray-100">
                          {plan.serviceName}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {plan.completedAt
                            ? new Date(plan.completedAt).toLocaleDateString('ar-SA', {
                                month: 'long',
                                day: 'numeric',
                              })
                            : ''}{' '}
                          · {plan.category}
                        </p>
                      </div>
                    </div>

                    {/* Tips grouped by timeframe */}
                    {timeframes.map((tf) => {
                      const tfTips = plan.tips.filter((t) => t.timeframe === tf.key);
                      if (tfTips.length === 0) return null;
                      return (
                        <div
                          key={tf.key}
                          className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <div
                            className={`bg-gradient-to-r ${tf.color} px-4 py-2 text-white text-sm font-bold`}
                          >
                            {TIMEFRAME_ICONS[tf.key] ?? ''} {tf.labelAr}
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {tfTips.map((tip) => (
                              <div key={tip.id} className="flex gap-3 p-4">
                                <span className="text-2xl shrink-0">{tip.emoji}</span>
                                <div>
                                  <h4 className="text-sm font-bold text-text-primary dark:text-gray-100">
                                    {tip.titleAr}
                                  </h4>
                                  <p className="mt-1 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                                    {tip.bodyAr}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            {libLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : libError ? (
              <ErrorAlert message="فشل تحميل المكتبة" onRetry={() => refetchLib()} />
            ) : (
              <>
                {!selectedLibCat ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                      <button key={cat.key} onClick={() => setSelectedLibCat(cat.key)}>
                        <Card
                          padding="lg"
                          className="text-center transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        >
                          <span className="text-4xl">{cat.emoji}</span>
                          <h3 className="mt-2 text-lg font-bold text-text-primary dark:text-gray-100">
                            {cat.nameAr}
                          </h3>
                          <p className="text-xs text-text-secondary">
                            {cat.tipsCount} نصائح للعناية
                          </p>
                        </Card>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedLibCat(null)}
                      className="text-sm text-brand-600 hover:text-brand-700 font-medium mb-4 inline-block"
                    >
                      ← العودة للمكتبة
                    </button>
                    {libTips.map((tip) => (
                      <Card key={tip.id} padding="md" className="flex gap-4">
                        <span className="text-3xl shrink-0">{tip.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-text-primary dark:text-gray-100">
                              {tip.titleAr}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                tip.timeframe === '24h'
                                  ? 'bg-red-100 text-red-700'
                                  : tip.timeframe === '48h'
                                    ? 'bg-amber-100 text-amber-700'
                                    : tip.timeframe === '1w'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {timeframes.find((t) => t.key === tip.timeframe)?.labelAr ??
                                tip.timeframe}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
                            {tip.bodyAr}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Bottom tip */}
        <Card
          padding="lg"
          className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950 border-none text-center"
        >
          <p className="text-lg font-bold text-text-primary dark:text-gray-100"> تذكري</p>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
            العناية بعد الخدمة تطيل من نتائج الجلسة وتحافظ على جمالكِ لفترة أطول
          </p>
          <Link href="/bookings/create" className="mt-3 inline-block">
            <Button size="sm">احجزي جلستكِ القادمة </Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  );
}
