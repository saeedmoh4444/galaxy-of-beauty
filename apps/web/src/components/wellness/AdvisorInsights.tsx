'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

type JsonRecord = Record<string, unknown>;

const TYPE_LABELS: Record<string, string> = {
  reminder: 'beautyDashboard.advisor.typeReminder',
  occasion: 'beautyDashboard.advisor.typeOccasion',
  budget: 'beautyDashboard.advisor.typeBudget',
  trend: 'beautyDashboard.advisor.typeTrend',
};

/**
 * 3.3 Proactive AI advisor — deterministic insights rendered on the beauty
 * dashboard. Same engine as the daily sweep; empty result renders nothing.
 */
export function AdvisorInsights(): JSX.Element | null {
  const { t, locale } = useLocale();
  const { data, isLoading } = api.beautyInsights.advisor.useQuery(undefined);
  const insights = (data as unknown as JsonRecord[]) ?? [];

  if (isLoading || insights.length === 0) return null;

  return (
    <Card padding="lg" className="border-s-4 border-brand-500">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">✨</span>
        <h3 className="font-bold">{t('beautyDashboard.advisor.title')}</h3>
      </div>
      <div className="space-y-2">
        {insights.slice(0, 3).map((insight, i) => {
          const type = insight.type as string;
          return (
            <Link
              key={`${type}-${i}`}
              href={insight.link as string}
              className="flex items-start gap-3 rounded-xl bg-surface-elevated p-3 transition-colors hover:bg-surface-muted"
            >
              <span className="text-lg leading-6">{insight.emoji as string}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-600">
                  {t((TYPE_LABELS[type] ?? 'beautyDashboard.advisor.title') as TranslationKey)}
                </p>
                <p className="truncate text-sm font-semibold text-text-primary">
                  {locale === 'ar' ? (insight.titleAr as string) : (insight.titleEn as string)}
                </p>
                <p className="line-clamp-2 text-xs text-text-secondary">
                  {locale === 'ar' ? (insight.bodyAr as string) : (insight.bodyEn as string)}
                </p>
              </div>
              <span className="text-text-tertiary">›</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
