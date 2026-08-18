'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { Card, ErrorAlert, EmptyState, Button } from '@galaxy/ui';

type PlanItem = RouterOutputs['subscriptionBoxes']['plans'][number];

export interface PlansPageData {
  plans: PlanItem[];
  fetchError?: string;
}

export function PlansClient({ data }: { data: PlansPageData }): JSX.Element {
  const { t, locale } = useLocale();
  const { plans: initialPlans, fetchError } = data;
  const planList = initialPlans;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.plans.title')}
        </h1>
        <p className="mt-3 text-text-secondary dark:text-gray-400">
          {t('marketing.plans.subtitle')}
        </p>
      </div>

      {fetchError ? (
        <ErrorAlert message={fetchError} onRetry={() => window.location.reload()} />
      ) : planList.length === 0 ? (
        <EmptyState
          title={t('marketing.plans.no-plans')}
          description={t('marketing.plans.no-plans-desc')}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {planList.map((plan) => (
            <Card key={plan.id} padding="lg" className="relative flex flex-col">
              {Number(plan.discountPercent) > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-900 dark:text-red-300">
                  {t('marketing.plans.discount-percent', {
                    percent: Number(plan.discountPercent),
                  })}
                </span>
              )}
              <div className="mb-4 text-center text-4xl">
                {((plan.nameJson as Record<string, string>)?.ar || '').includes('ذهبية')
                  ? ''
                  : ((plan.nameJson as Record<string, string>)?.ar || '').includes('فضية')
                    ? ''
                    : ((plan.nameJson as Record<string, string>)?.ar || '').includes('برونزية')
                      ? ''
                      : ''}
              </div>
              <h3 className="text-center text-lg font-bold text-text-primary dark:text-gray-100">
                {localize(plan.nameJson, locale)}
              </h3>
              <p className="mt-2 text-center text-sm text-text-secondary dark:text-gray-400">
                {localize(plan.descriptionJson, locale)}
              </p>

              <div className="mt-4 space-y-2 text-sm text-text-secondary dark:text-gray-400">
                <div className="flex justify-between">
                  <span>
                    {' '}
                    {t('marketing.plans.bookings-per-month', {
                      count: Number(plan.servicesPerMonth),
                    })}
                  </span>
                  <span>
                    {plan.interval === 'MONTHLY'
                      ? t('marketing.plans.interval-monthly')
                      : plan.interval === 'WEEKLY'
                        ? t('marketing.plans.interval-weekly')
                        : t('marketing.plans.interval-biweekly')}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 text-center">
                <p className="text-3xl font-bold text-brand-600">
                  {Number(plan.price).toFixed(0)}{' '}
                  <span className="text-sm font-normal text-text-tertiary">
                    {t('marketing.plans.price-sar')}
                  </span>
                </p>
                <p className="text-xs text-text-tertiary">
                  /{' '}
                  {plan.interval === 'MONTHLY'
                    ? t('marketing.plans.interval-monthly')
                    : plan.interval === 'WEEKLY'
                      ? t('marketing.plans.interval-weekly')
                      : t('marketing.plans.interval-biweekly')}
                </p>
                <div className="mt-4">
                  <SubscribeButton
                    planId={plan.id}
                    planName={(plan.nameJson as Record<string, string>)?.ar || ''}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 rounded-2xl bg-surface-muted p-8 dark:bg-gray-800">
        <h3 className="mb-6 text-center text-lg font-bold text-text-primary dark:text-gray-100">
          {t('marketing.plans.how-it-works')}
        </h3>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              emoji: '1️⃣',
              title: t('marketing.plans.step-1-title'),
              desc: t('marketing.plans.step-1-desc'),
            },
            {
              emoji: '2️⃣',
              title: t('marketing.plans.step-2-title'),
              desc: t('marketing.plans.step-2-desc'),
            },
            {
              emoji: '3️⃣',
              title: t('marketing.plans.step-3-title'),
              desc: t('marketing.plans.step-3-desc'),
            },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl">{step.emoji}</div>
              <h4 className="mt-2 font-semibold text-text-primary dark:text-gray-100">
                {step.title}
              </h4>
              <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Separate client component for the interactive subscribe button. */
function SubscribeButton({ planId, planName: _planName }: { planId: number; planName: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const subscribeMut = api.subscriptionBoxes.subscribe.useMutation({
    onSuccess: () => setSubscribed(true),
  });

  const { t } = useLocale();

  if (subscribed) {
    return (
      <p className="text-sm font-semibold text-green-600">{t('marketing.plans.subscribed')}</p>
    );
  }

  return (
    <Button onClick={() => subscribeMut.mutate({ planId })} loading={subscribeMut.isPending}>
      {t('marketing.plans.subscribe-now')}
    </Button>
  );
}
