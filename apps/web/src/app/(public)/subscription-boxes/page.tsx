'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';

export default function SubscriptionBoxesPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: plans, isLoading, isError, refetch } = (api.subscriptionBoxes.plans as any).useQuery();
  const planList = (plans as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            📦 صناديق التجميل الشهرية
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">
            اشتركي في باقة شهرية واحصلي على خدمات تجميل منتظمة بأسعار مخفضة
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل الباقات" onRetry={() => refetch()} />
        ) : planList.length === 0 ? (
          <EmptyState title="لا توجد باقات متاحة" description="لم يتم إضافة باقات اشتراك بعد." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {planList.map((plan) => (
              <Card key={plan.id as number} padding="lg" className="relative flex flex-col">
                {(plan.discountPercent as number) > 0 && (
                  <span className="absolute top-3 left-3 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-900 dark:text-red-300">
                    {plan.discountPercent as number}% خصم
                  </span>
                )}
                <div className="mb-4 text-center text-4xl">
                  {((plan.nameJson as Record<string, string>)?.ar || '').includes('ذهبية') ? '🥇' :
                   ((plan.nameJson as Record<string, string>)?.ar || '').includes('فضية') ? '🥈' :
                   ((plan.nameJson as Record<string, string>)?.ar || '').includes('برونزية') ? '🥉' : '📦'}
                </div>
                <h3 className="text-center text-lg font-bold text-gray-900 dark:text-gray-100">
                  {((plan.nameJson as Record<string, string>)?.ar) || ''}
                </h3>
                <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  {((plan.descriptionJson as Record<string, string>)?.ar) || ''}
                </p>

                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>🗓 {plan.servicesPerMonth as number} حجز / شهر</span>
                    <span>{plan.interval === 'MONTHLY' ? 'شهرياً' : plan.interval === 'WEEKLY' ? 'أسبوعياً' : 'كل أسبوعين'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 text-center">
                  <p className="text-3xl font-bold text-brand-600">
                    {Number(plan.price).toFixed(0)} <span className="text-sm font-normal text-gray-400">ر.س</span>
                  </p>
                  <p className="text-xs text-gray-400">/ {plan.interval === 'MONTHLY' ? 'شهرياً' : plan.interval === 'WEEKLY' ? 'أسبوعياً' : 'كل أسبوعين'}</p>
                  <div className="mt-4">
                    <SubscribeButton planId={plan.id as number} planName={((plan.nameJson as Record<string, string>)?.ar) || ''} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-12 rounded-2xl bg-gray-50 p-8 dark:bg-gray-800">
          <h3 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
            كيف تعمل صناديق التجميل؟
          </h3>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { emoji: '1️⃣', title: 'اختاري باقتك', desc: 'اختاري الباقة المناسبة لميزانيتك واحتياجاتك' },
              { emoji: '2️⃣', title: 'احجزي خدماتك', desc: 'احجزي خدماتك الشهرية من قائمة الخدمات المتاحة' },
              { emoji: '3️⃣', title: 'استمتعي', desc: 'استمتعي بخدمات التجميل بأسعار مخفضة وعلى مدار الشهر' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl">{step.emoji}</div>
                <h4 className="mt-2 font-semibold text-gray-900 dark:text-gray-100">{step.title}</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}

function SubscribeButton({ planId, planName }: { planId: number; planName: string }) {
  const [subscribed, setSubscribed] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribeMut = (api.subscriptionBoxes.subscribe as any).useMutation({
    onSuccess: () => setSubscribed(true),
  });

  if (subscribed) {
    return <p className="text-sm font-semibold text-green-600">✅ تم الاشتراك!</p>;
  }

  return (
    <Button onClick={() => subscribeMut.mutate({ planId })} loading={subscribeMut.isPending}>
      اشتركي الآن
    </Button>
  );
}
