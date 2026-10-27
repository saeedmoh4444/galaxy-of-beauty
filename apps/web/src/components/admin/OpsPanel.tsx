'use client';

import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, StatCard } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const STATUS_STYLES: Record<string, { chip: string; key: string }> = {
  ok: {
    chip: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    key: 'admin.dashboard.ops.ok',
  },
  warn: {
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    key: 'admin.dashboard.ops.warn',
  },
  critical: {
    chip: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    key: 'admin.dashboard.ops.critical',
  },
};

/** D2b — the vendor-ops admin view: queue lag/failures + fulfillment
 *  backlog, SLA breaches and open disputes (the brain_code P0 surface). */
export function OpsPanel(): JSX.Element {
  const { t } = useLocale();
  const q = api.adminTools.opsSnapshot.useQuery(undefined, {
    refetchInterval: 30_000, // ops data is live by nature
  });

  if (!q.data) return <Card padding="md">{t('admin.dashboard.load-error')}</Card>;
  const { rows, assessment, pendingFulfillment, slaBreached, openDisputes } = q.data;
  const status = (STATUS_STYLES[assessment.status] ?? {
    chip: STATUS_STYLES.ok?.chip ?? 'bg-green-100 text-green-700',
    key: 'admin.dashboard.ops.ok',
  }) as { chip: string; key: string };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{t('admin.dashboard.ops.title')}</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.chip}`}>
          {t(status.key as TranslationKey)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t('admin.dashboard.ops.pendingFulfillment')} value={pendingFulfillment} />
        <StatCard label={t('admin.dashboard.ops.slaBreached')} value={slaBreached} />
        <StatCard label={t('admin.dashboard.ops.openDisputes')} value={openDisputes} />
      </div>

      {assessment.reasons.length > 0 ? (
        <Card padding="sm">
          <ul className="list-inside list-disc text-xs text-text-secondary">
            {assessment.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card padding="sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-text-tertiary">
              <th className="pb-2">Queue</th>
              <th className="pb-2 text-right">{t('admin.dashboard.ops.waiting')}</th>
              <th className="pb-2 text-right">{t('admin.dashboard.ops.active')}</th>
              <th className="pb-2 text-right">{t('admin.dashboard.ops.delayed')}</th>
              <th className="pb-2 text-right">{t('admin.dashboard.ops.failed')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-border-muted">
                <td className="py-1.5 font-medium">{row.name}</td>
                {row.counts === null ? (
                  <td colSpan={4} className="py-1.5 text-right text-text-tertiary">
                    {t('admin.dashboard.ops.unavailable')}
                  </td>
                ) : (
                  <>
                    <td className="py-1.5 text-right">{row.counts.waiting}</td>
                    <td className="py-1.5 text-right">{row.counts.active}</td>
                    <td className="py-1.5 text-right">{row.counts.delayed}</td>
                    <td
                      className={`py-1.5 text-right font-bold ${
                        row.counts.failed > 0 ? 'text-red-600 dark:text-red-400' : ''
                      }`}
                      title={row.sampleFailed.map((f) => `${f.id}: ${f.failedReason}`).join('\n')}
                    >
                      {row.counts.failed}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
