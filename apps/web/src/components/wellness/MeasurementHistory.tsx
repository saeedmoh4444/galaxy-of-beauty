'use client';
/**
 * E4b — body measurement history: log new measurements (which also syncs the
 * profile), browse the history, and see first-vs-latest progress deltas.
 */
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const FIELDS = [
  { key: 'weightKg', label: 'measurements.weight' },
  { key: 'waistCm', label: 'measurements.waist' },
  { key: 'hipCm', label: 'measurements.hip' },
  { key: 'bustCm', label: 'measurements.bust' },
  { key: 'thighCm', label: 'measurements.thigh' },
  { key: 'bodyFatPct', label: 'measurements.bodyFat' },
] as const;

export function MeasurementHistory(): JSX.Element {
  const { t, locale } = useLocale();
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  const historyQ = api.beautyProfile.measurementHistory.useQuery({});
  const progressQ = api.beautyProfile.measurementProgress.useQuery();
  const logMut = api.beautyProfile.logMeasurement.useMutation({
    onSuccess: () => {
      setValues({});
      setNotes('');
      historyQ.refetch();
      progressQ.refetch();
    },
  });

  const history = (historyQ.data ?? []) as Array<Record<string, any>>;
  const progress = (progressQ.data ?? {}) as Record<
    string,
    { first: number; latest: number; delta: number }
  >;

  const submit = () => {
    const payload: Record<string, number> = {};
    for (const f of FIELDS) {
      const v = parseFloat(values[f.key] ?? '');
      if (!Number.isNaN(v) && v > 0) payload[f.key] = v;
    }
    if (Object.keys(payload).length === 0) return;
    logMut.mutate({ ...payload, notes: notes.trim() || undefined });
  };

  return (
    <Card padding="md">
      <h3 className="mb-3 font-semibold text-text-primary dark:text-gray-100">
        {t('measurements.title')}
      </h3>

      {/* Log form */}
      <div className="grid gap-3 sm:grid-cols-3">
        {FIELDS.map((f) => (
          <input
            key={f.key}
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder={t(f.label)}
            value={values[f.key] ?? ''}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          />
        ))}
      </div>
      <input
        type="text"
        placeholder={t('measurements.notes')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm dark:border-gray-600 dark:bg-gray-800"
      />
      <Button size="sm" className="mt-3" onClick={submit} loading={logMut.isPending}>
        {t('measurements.add')}
      </Button>

      {/* Progress deltas */}
      {Object.keys(progress).filter((k) => k !== 'count').length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {FIELDS.filter((f) => progress[f.key]).map((f) => (
            <span key={f.key} className="rounded-full bg-surface-muted px-3 py-1 text-xs">
              {t(f.label)}: {progress[f.key]!.latest}
              <span
                className={
                  progress[f.key]!.delta === 0
                    ? ''
                    : progress[f.key]!.delta < 0
                      ? ' text-green-600'
                      : ' text-amber-600'
                }
              >
                {' '}
                {progress[f.key]!.delta > 0 ? '+' : ''}
                {progress[f.key]!.delta}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">{t('measurements.history')}</p>
          <div className="space-y-1">
            {history.slice(0, 10).map((h) => (
              <p key={h.id} className="text-xs text-text-secondary">
                {new Date(h.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')}
                {h.weightKg != null ? ` · ${t('measurements.weight')}: ${h.weightKg}` : ''}
                {h.waistCm != null ? ` · ${t('measurements.waist')}: ${h.waistCm}` : ''}
                {h.hipCm != null ? ` · ${t('measurements.hip')}: ${h.hipCm}` : ''}
                {h.notes ? ` — ${h.notes}` : ''}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
