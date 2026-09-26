'use client';
import { useState } from 'react';
import type { JSX } from 'react';
import { api } from '@/lib/trpc';
import { Card, useAuth } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

// 7.3 — admin observability: SLO snapshot + incident management
// (create + resolve). Public view lives at /status.
export default function AdminObservabilityPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const utils = api.useUtils();

  const slo = api.observability.sloStatus.useQuery(undefined, { enabled: isAuthenticated });
  const incidents = api.observability.incidents.useQuery(undefined, { enabled: isAuthenticated });
  const createIncident = api.observability.createIncident.useMutation({
    onSuccess: () => {
      setForm({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        severity: 'minor',
      });
      void utils.observability.incidents.invalidate();
    },
  });
  const resolveIncident = api.observability.resolveIncident.useMutation({
    onSuccess: () => void utils.observability.incidents.invalidate(),
  });

  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    severity: 'minor',
  });

  const snap = slo.data as
    { availability?: number; p95Ms?: number; burnRate?: number; requests?: number } | undefined;
  const open = (incidents.data?.open ?? []) as Array<Record<string, unknown>>;

  const handleCreate = () => {
    if (!form.titleAr || !form.titleEn) return;
    createIncident.mutate({
      titleJson: { ar: form.titleAr, en: form.titleEn },
      descriptionJson: { ar: form.descriptionAr, en: form.descriptionEn },
      severity: form.severity as 'minor' | 'major' | 'critical',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('status.title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('status.subtitle')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card padding="md">
          <p className="text-xs text-text-tertiary">{t('status.availability')}</p>
          <p className="mt-1 text-xl font-extrabold text-text-primary">
            {((snap?.availability ?? 1) * 100).toFixed(2)}%
          </p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-text-tertiary">{t('status.p95')}</p>
          <p className="mt-1 text-xl font-extrabold text-text-primary">{snap?.p95Ms ?? 0} ms</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-text-tertiary">{t('status.burnRate')}</p>
          <p className="mt-1 text-xl font-extrabold text-text-primary">{snap?.burnRate ?? 0}×</p>
        </Card>
      </div>

      <Card padding="lg">
        <h3 className="font-bold mb-3">{t('status.openIncidents')}</h3>
        {open.length === 0 ? (
          <p className="text-sm text-text-tertiary">{t('status.none')}</p>
        ) : (
          <div className="space-y-2">
            {open.map((i) => (
              <div
                key={i.id as number}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-bold text-sm">{localize(i.titleJson, locale)}</p>
                  <p className="text-xs text-text-secondary">
                    {t(`status.severity.${String(i.severity)}` as never)} ·{' '}
                    {new Date(String(i.startedAt)).toLocaleString(
                      locale === 'ar' ? 'ar-SA' : 'en-GB',
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => resolveIncident.mutate({ id: i.id as number })}
                  className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
                >
                  {t('status.resolved')}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
          <input
            value={form.titleAr}
            onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
            placeholder="عنوان العطل (عربي)"
            className="rounded-lg border p-2 text-sm"
          />
          <input
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            placeholder="Incident title (English)"
            className="rounded-lg border p-2 text-sm"
          />
          <input
            value={form.descriptionAr}
            onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
            placeholder="الوصف (عربي)"
            className="rounded-lg border p-2 text-sm"
          />
          <input
            value={form.descriptionEn}
            onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
            placeholder="Description (English)"
            className="rounded-lg border p-2 text-sm"
          />
          <select
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
            className="rounded-lg border p-2 text-sm"
          >
            <option value="minor">{t('status.severity.minor')}</option>
            <option value="major">{t('status.severity.major')}</option>
            <option value="critical">{t('status.severity.critical')}</option>
          </select>
          <button
            type="button"
            onClick={handleCreate}
            disabled={createIncident.isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {t('status.openIncidents')} +
          </button>
        </div>
      </Card>
    </div>
  );
}
