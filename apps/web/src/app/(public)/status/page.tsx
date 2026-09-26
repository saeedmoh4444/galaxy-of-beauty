'use client';

import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface IncidentRow {
  id: number;
  titleJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string } | null;
  severity?: string;
  status?: string;
  startedAt?: string | Date;
  resolvedAt?: string | Date | null;
}

// 7.3 — public status page: SLO snapshot + open/recently-resolved
// incidents, no auth (observability.incidents + sloStatus are public).
export default function StatusPage(): JSX.Element {
  const { t, locale } = useLocale();
  const slo = api.observability.sloStatus.useQuery(undefined, {
    retry: false,
    refetchInterval: 30_000,
  });
  const incidents = api.observability.incidents.useQuery(undefined, { retry: false });

  const snap = slo.data as
    | {
        availability?: number;
        p95Ms?: number;
        burnRate?: number;
        requests?: number;
      }
    | undefined;
  const open = (incidents.data?.open ?? []) as IncidentRow[];
  const resolved = (incidents.data?.recentlyResolved ?? []) as IncidentRow[];

  const fmt = (d: string | Date | undefined) =>
    d ? new Date(d).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB') : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-text-primary">{t('status.title')}</h1>
      <p className="mt-1 text-sm text-text-secondary">{t('status.subtitle')}</p>

      {/* SLO snapshot */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-edge-muted bg-surface-elevated p-4">
          <p className="text-xs text-text-tertiary">{t('status.availability')}</p>
          <p className="mt-1 text-2xl font-extrabold text-green-600 dark:text-green-400">
            {((snap?.availability ?? 1) * 100).toFixed(2)}%
          </p>
        </div>
        <div className="rounded-2xl border border-edge-muted bg-surface-elevated p-4">
          <p className="text-xs text-text-tertiary">{t('status.p95')}</p>
          <p className="mt-1 text-2xl font-extrabold text-text-primary">
            {snap?.p95Ms ?? 0} <span className="text-sm font-normal">ms</span>
          </p>
        </div>
        <div className="rounded-2xl border border-edge-muted bg-surface-elevated p-4">
          <p className="text-xs text-text-tertiary">{t('status.burnRate')}</p>
          <p
            className={`mt-1 text-2xl font-extrabold ${(snap?.burnRate ?? 0) > 1 ? 'text-red-600 dark:text-red-400' : 'text-text-primary'}`}
          >
            {snap?.burnRate ?? 0}×
          </p>
        </div>
        <div className="rounded-2xl border border-edge-muted bg-surface-elevated p-4">
          <p className="text-xs text-text-tertiary">{t('status.requests')}</p>
          <p className="mt-1 text-2xl font-extrabold text-text-primary">
            {(snap?.requests ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Incidents */}
      <h2 className="mt-8 font-bold text-text-primary">{t('status.openIncidents')}</h2>
      {open.length === 0 ? (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">{t('status.none')}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {open.map((i) => (
            <div
              key={i.id}
              data-testid="status-incident"
              className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950"
            >
              <p className="font-bold text-sm text-red-800 dark:text-red-300">
                {localize(i.titleJson, locale)}
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                {t(`status.severity.${i.severity ?? 'minor'}` as never)} · {fmt(i.startedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-bold text-text-primary">{t('status.resolvedRecently')}</h2>
      {resolved.length === 0 ? (
        <p className="mt-2 text-sm text-text-tertiary">{t('status.none')}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {resolved.map((i) => (
            <div key={i.id} className="rounded-xl border border-edge-muted p-3">
              <p className="font-bold text-sm text-text-primary">{localize(i.titleJson, locale)}</p>
              <p className="mt-1 text-xs text-text-tertiary">
                {t('status.resolved')} · {fmt(i.resolvedAt ?? undefined)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
