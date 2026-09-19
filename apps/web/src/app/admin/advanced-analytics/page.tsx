'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, ErrorAlert } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Hand-rolled Tailwind bar (repo has no chart library — existing pattern). */
function Bar({ pct, className = '' }: { pct: number; className?: string }): JSX.Element {
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-surface-muted ${className}`}>
      <div
        className="h-full rounded-full bg-linear-to-r from-brand-400 to-brand-600"
        style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
      />
    </div>
  );
}

export default function AdvancedAnalyticsPage(): JSX.Element {
  const { t } = useLocale();
  const revenueQ = api.advancedAnalytics.revenue.useQuery();
  const cohortsQ = api.advancedAnalytics.cohorts.useQuery();
  const rfmQ = api.advancedAnalytics.rfm.useQuery();
  const funnelQ = api.advancedAnalytics.funnel.useQuery();
  const techQ = api.advancedAnalytics.technicians.useQuery();
  const marketingQ = api.advancedAnalytics.marketing.useQuery();

  const revenue = revenueQ.data as unknown as Record<string, unknown> | undefined;
  const cohorts =
    (cohortsQ.data as unknown as { cohorts: Array<Record<string, unknown>> } | undefined)
      ?.cohorts ?? [];
  const rfm = rfmQ.data as unknown as
    { buckets: Record<string, number>; topSpenders: Array<Record<string, unknown>> } | undefined;
  const funnel =
    (funnelQ.data as unknown as { stages: Array<Record<string, unknown>> } | undefined)?.stages ??
    [];
  const tech = techQ.data as unknown as
    | {
        utilization: Array<Record<string, unknown>>;
        satisfactionTrend: Array<Record<string, unknown>>;
        cancellations: Array<Record<string, unknown>>;
      }
    | undefined;
  const marketing = marketingQ.data as unknown as
    | {
        campaigns: Array<Record<string, unknown>>;
        referrals: Array<Record<string, unknown>>;
      }
    | undefined;

  const anyError =
    revenueQ.isError ||
    cohortsQ.isError ||
    rfmQ.isError ||
    funnelQ.isError ||
    techQ.isError ||
    marketingQ.isError;
  const anyLoading =
    revenueQ.isLoading ||
    cohortsQ.isLoading ||
    rfmQ.isLoading ||
    funnelQ.isLoading ||
    techQ.isLoading ||
    marketingQ.isLoading;

  // CSV export is a query — fire it on demand via an enabled-gated query
  // and download when the data lands.
  const [exportSection, setExportSection] = useState<string | null>(null);
  const exportQ = api.advancedAnalytics.export.useQuery(
    { section: exportSection as never },
    { enabled: exportSection !== null },
  );
  useEffect(() => {
    if (exportQ.data && exportSection) {
      downloadCSV((exportQ.data as { csv: string }).csv, `analytics-${exportSection}.csv`);
      setExportSection(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportQ.data]);

  const downloadBtn = (section: string) => (
    <button
      className="rounded-lg border border-edge px-3 py-1 text-xs font-semibold text-text-secondary hover:bg-surface-muted"
      onClick={() => setExportSection(section)}
    >
      ⬇ {t('adminAnalytics.download')}
    </button>
  );

  if (anyError) {
    return <ErrorAlert message={t('adminAnalytics.err')} onRetry={() => void revenueQ.refetch()} />;
  }
  if (anyLoading) return <CardListSkeleton count={4} />;

  const maxBucket = Math.max(1, ...Object.values(rfm?.buckets ?? {}));
  const maxRevenue = Math.max(
    1,
    ...((revenue?.monthlyRevenueSeries as Array<{ revenue: number }>) ?? []).map((m) => m.revenue),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('adminAnalytics.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('adminAnalytics.subtitle')}</p>
        </div>
        {downloadBtn('revenue')}
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: t('adminAnalytics.mrr'), value: `${Math.round((revenue?.mrr as number) ?? 0)}` },
          { label: t('adminAnalytics.arpu'), value: `${(revenue?.arpu as number) ?? 0}` },
          { label: t('adminAnalytics.ltv'), value: `${Math.round((revenue?.ltv as number) ?? 0)}` },
          {
            label: t('adminAnalytics.churn'),
            value: `${Math.round(((revenue?.churn as number) ?? 0) * 100)}%`,
          },
        ].map((kpi, i) => (
          <Card key={i} padding="lg" className="text-center">
            <p className="text-2xl font-extrabold text-brand-600">{kpi.value}</p>
            <p className="text-xs text-text-secondary">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue series */}
      <Card padding="lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-text-primary">{t('adminAnalytics.revenue12m')}</h3>
        </div>
        <div className="space-y-2">
          {((revenue?.monthlyRevenueSeries as Array<{ month: string; revenue: number }>) ?? []).map(
            (m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-16 text-xs text-text-secondary">{m.month}</span>
                <Bar pct={(m.revenue / maxRevenue) * 100} className="flex-1" />
                <span className="w-20 text-end text-xs font-semibold text-text-primary">
                  {Math.round(m.revenue)}
                </span>
              </div>
            ),
          )}
        </div>
      </Card>

      {/* Funnel + RFM */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text-primary">{t('adminAnalytics.funnel')}</h3>
            {downloadBtn('funnel')}
          </div>
          <div className="space-y-2">
            {funnel.map((s) => (
              <div key={s.stage as string} className="flex items-center gap-3">
                <span className="w-28 text-xs text-text-secondary">{s.stage as string}</span>
                <Bar
                  pct={((s.count as number) / Math.max(1, funnel[0]?.count as number)) * 100}
                  className="flex-1"
                />
                <span className="w-24 text-end text-xs text-text-primary">
                  {s.count as number} · {s.dropOffPct as number}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text-primary">{t('adminAnalytics.rfm')}</h3>
            {downloadBtn('rfm')}
          </div>
          <div className="space-y-2">
            {Object.entries(rfm?.buckets ?? {}).map(([bucket, count]) => (
              <div key={bucket} className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-secondary">{bucket}</span>
                <Bar pct={(count / maxBucket) * 100} className="flex-1" />
                <span className="w-10 text-end text-xs font-semibold text-text-primary">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cohorts */}
      <Card padding="lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-text-primary">{t('adminAnalytics.cohorts')}</h3>
          {downloadBtn('cohorts')}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-text-secondary">
                <th className="py-2 text-start">{t('adminAnalytics.cohortMonth')}</th>
                <th className="py-2 text-start">{t('adminAnalytics.cohortSize')}</th>
                {[0, 1, 2].map((m) => (
                  <th key={m} className="py-2 text-start">
                    M{m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.month as string} className="border-t border-edge-muted">
                  <td className="py-2 font-semibold">{c.month as string}</td>
                  <td className="py-2">{c.size as number}</td>
                  {[0, 1, 2].map((m) => (
                    <td key={m} className="py-2">
                      {(c.retentionByMonth as number[])[m] ?? 0}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Technicians + Marketing */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text-primary">{t('adminAnalytics.technicians')}</h3>
            {downloadBtn('technicians')}
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {(tech?.utilization ?? []).slice(0, 15).map((u) => (
              <div key={u.technicianId as number} className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-secondary">
                  #{u.technicianId as number}
                </span>
                <Bar pct={u.utilizationPct as number} className="flex-1" />
                <span className="w-14 text-end text-xs font-semibold text-text-primary">
                  {u.utilizationPct as number}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-text-primary">{t('adminAnalytics.marketing')}</h3>
            {downloadBtn('marketing')}
          </div>
          <div className="space-y-2">
            {(marketing?.campaigns ?? []).map((c) => (
              <div
                key={c.promoCodeId as number}
                className="rounded-lg bg-surface-muted p-3 text-sm"
              >
                <div className="flex justify-between font-semibold text-text-primary">
                  <span>#{c.promoCodeId as number}</span>
                  <span>
                    {c.redemptions as number} {t('adminAnalytics.redemptions')}
                  </span>
                </div>
                <div className="mt-1 text-xs text-text-secondary">
                  {t('adminAnalytics.discounts')}: {c.discountTotal as number} ·{' '}
                  {t('adminAnalytics.revenue')}: {Math.round(c.attributedRevenue as number)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
