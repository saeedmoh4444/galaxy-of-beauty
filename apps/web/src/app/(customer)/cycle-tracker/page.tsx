'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, KPIRowSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const SYMPTOMS_LIST: TranslationKey[] = [
  'cycleTracker.symptom.cramps',
  'cycleTracker.symptom.headache',
  'cycleTracker.symptom.fatigue',
  'cycleTracker.symptom.bloating',
  'cycleTracker.symptom.nausea',
  'cycleTracker.symptom.insomnia',
  'cycleTracker.symptom.increasedAppetite',
  'cycleTracker.symptom.backPain',
  'cycleTracker.symptom.breastTenderness',
  'cycleTracker.symptom.moodSwings',
];
const MOODS = ['', '', '', '', ''];

export default function CycleTrackerPage(): JSX.Element {
  const { t } = useLocale();
  const { data: today, isLoading: todayLoading } = api.cycleTracker.today.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: entriesData, isLoading: entriesLoading } =
    api.cycleTracker.myEntries.useQuery() as {
      data: Record<string, unknown> | undefined;
      isLoading: boolean;
      isError: boolean;
      refetch: () => void;
    };
  const { data: settings } = api.cycleTracker.settings.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const logMut = api.cycleTracker.logDay.useMutation();
  const settingsMut = api.cycleTracker.updateSettings.useMutation();

  const [showLog, setShowLog] = useState(false);
  const [mood, setMood] = useState('');
  const [flow, setFlow] = useState('');
  const [symptoms, setSymptoms] = useState<TranslationKey[]>([]);
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [lastStart, setLastStart] = useState('');

  const phase = today?.phase as Record<string, unknown> | undefined;
  const entries = (entriesData?.entries as Array<Record<string, unknown>>) ?? [];
  const cycleLength = (entriesData?.cycleLength as number) ?? 28;

  const handleLog = () => {
    logMut.mutate(
      {
        dayNumber: (today?.currentDay as number) ?? 1,
        mood,
        flowIntensity: (flow || undefined) as 'light' | undefined,
        symptoms: symptoms.length > 0 ? symptoms.map((s) => t(s)) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setShowLog(false);
          setNotes('');
        },
      },
    );
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('cycleTracker.title')}</h1>
            <p className="mt-1 text-sm text-text-secondary">{t('cycleTracker.subtitle')}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowSettings(!showSettings);
              if (settings) {
                setCycleLen((settings.cycleLength as number) ?? 28);
                setPeriodLen((settings.periodLength as number) ?? 5);
                setLastStart(
                  settings.lastPeriodStart
                    ? new Date(settings.lastPeriodStart as string).toISOString().slice(0, 10)
                    : '',
                );
              }
            }}
          >
            ️
          </Button>
        </div>

        {showSettings && (
          <Card padding="lg">
            <h3 className="font-bold mb-3">️ {t('cycleTracker.settingsTitle')}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="ct-cycleLen" className="text-xs text-text-secondary">
                  {t('cycleTracker.label.cycleLen')}
                </label>
                <input
                  id="ct-cycleLen"
                  type="number"
                  value={cycleLen}
                  onChange={(e) => setCycleLen(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="ct-periodLen" className="text-xs text-text-secondary">
                  {t('cycleTracker.label.periodLen')}
                </label>
                <input
                  id="ct-periodLen"
                  type="number"
                  value={periodLen}
                  onChange={(e) => setPeriodLen(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor="ct-lastStart" className="text-xs text-text-secondary">
                  {t('cycleTracker.label.lastStart')}
                </label>
                <input
                  id="ct-lastStart"
                  type="date"
                  value={lastStart}
                  onChange={(e) => setLastStart(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
            <Button
              onClick={() =>
                settingsMut.mutate(
                  {
                    cycleLength: cycleLen,
                    periodLength: periodLen,
                    lastPeriodStart: lastStart || undefined,
                  },
                  { onSuccess: () => setShowSettings(false) },
                )
              }
              loading={settingsMut.isPending}
              className="w-full mt-3"
            >
              {t('cycleTracker.save')}
            </Button>
          </Card>
        )}

        {todayLoading ? (
          <KPIRowSkeleton count={1} />
        ) : (
          <Card padding="lg" className={`text-center border-2`}>
            <span className="text-5xl">{(phase?.emoji as string) ?? ''}</span>
            <h2 className="text-xl font-bold mt-2">{phase?.name as string}</h2>
            <p className="text-sm text-text-secondary">
              {t('cycleTracker.dayOf', { day: today?.currentDay as number, total: cycleLength })}
            </p>
            {(today?.hasSettings as boolean) && (today?.daysUntilNext as number) != null && (
              <p className="text-xs text-brand-600 mt-1">
                ️ {t('cycleTracker.daysUntilNext', { days: today?.daysUntilNext as number })}
              </p>
            )}
            {!today?.hasSettings && (
              <p className="text-xs text-amber-600 mt-2">{t('cycleTracker.noSettings')}</p>
            )}
          </Card>
        )}

        <div className="flex gap-2">
          <Button onClick={() => setShowLog(!showLog)} className="flex-1">
            {showLog ? '' : t('cycleTracker.logToday')}
          </Button>
        </div>

        {showLog && (
          <Card padding="lg">
            <div className="space-y-3">
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- label precedes emoji picker buttons */}
                <label className="text-xs text-text-secondary mb-1 block">
                  {t('cycleTracker.label.mood')}
                </label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`text-2xl p-2 rounded-lg ${mood === m ? 'bg-brand-100 ring-2 ring-brand-400' : ''}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- label precedes flow selector buttons */}
                <label className="text-xs text-text-secondary mb-1 block">
                  {t('cycleTracker.label.flow')}
                </label>
                <div className="flex gap-2">
                  {['light', 'medium', 'heavy', 'spotting'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFlow(f === flow ? '' : f)}
                      className={`rounded-full px-4 py-1.5 text-xs ${flow === f ? 'bg-red-100 text-red-700 ring-1 ring-red-400' : 'bg-surface-muted'}`}
                    >
                      {f === 'light'
                        ? t('cycleTracker.flow.light')
                        : f === 'medium'
                          ? t('cycleTracker.flow.medium')
                          : f === 'heavy'
                            ? t('cycleTracker.flow.heavy')
                            : t('cycleTracker.flow.spotting')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- label precedes symptom toggle buttons */}
                <label className="text-xs text-text-secondary mb-1 block">
                  {t('cycleTracker.label.symptoms')}
                </label>
                <div className="flex flex-wrap gap-1">
                  {SYMPTOMS_LIST.map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setSymptoms((prev) =>
                          prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs ${symptoms.includes(s) ? 'bg-purple-100 text-purple-700' : 'bg-surface-muted'}`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('cycleTracker.placeholder.notes')}
                rows={2}
                className="w-full rounded-lg border px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
              />
              <Button onClick={handleLog} loading={logMut.isPending} className="w-full">
                {t('cycleTracker.saveDay')}
              </Button>
            </div>
          </Card>
        )}

        <Card padding="lg">
          <h3 className="font-bold mb-3">
            {t('cycleTracker.tipsTitle', { phase: phase?.name as string })}
          </h3>
          <div className="space-y-2">
            {((phase?.tips as string[]) ?? []).map((tip: string, i: number) => (
              <p key={i} className="text-sm text-text-secondary">
                • {tip}
              </p>
            ))}
          </div>
        </Card>

        {entriesLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} className="h-8 bg-surface-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <h3 className="font-bold mb-3">️ {t('cycleTracker.daysTitle')}</h3>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: cycleLength }, (_, i) => i + 1).map((d) => {
                const p = (() => {
                  const adj = ((d - 1) % cycleLength) + 1;
                  if (adj <= 5) return PHASES_LIST[0];
                  if (adj <= 13) return PHASES_LIST[1];
                  if (adj <= 16) return PHASES_LIST[2];
                  return PHASES_LIST[3];
                })();
                const entry = entries.find((e: Record<string, unknown>) => e.dayNumber === d);
                return (
                  <div
                    key={d}
                    className={`w-8 h-8 rounded-full text-xs flex items-center justify-center relative ${entry ? 'ring-2 ring-offset-1' : 'bg-surface-muted'}`}
                    style={{ backgroundColor: entry ? p!.color + '30' : '', borderColor: p!.color }}
                    title={t('cycleTracker.dayTooltip', { day: d, phase: t(p!.name) })}
                  >
                    <span className="text-[10px]">{d}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

const PHASES_LIST: { key: string; name: TranslationKey; color: string }[] = [
  { key: 'menstrual', name: 'cycleTracker.phase.menstrual', color: '#ec4899' },
  { key: 'follicular', name: 'cycleTracker.phase.follicular', color: '#f59e0b' },
  { key: 'ovulation', name: 'cycleTracker.phase.ovulation', color: '#8b5cf6' },
  { key: 'luteal', name: 'cycleTracker.phase.luteal', color: '#059669' },
];
