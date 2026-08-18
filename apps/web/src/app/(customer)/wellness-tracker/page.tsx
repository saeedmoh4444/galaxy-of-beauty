'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const MOODS: { value: number; emoji: string; label: TranslationKey }[] = [
  { value: 1, emoji: '', label: 'wellnessTracker.mood.bad' },
  { value: 2, emoji: '', label: 'wellnessTracker.mood.okay' },
  { value: 3, emoji: '', label: 'wellnessTracker.mood.normal' },
  { value: 4, emoji: '', label: 'wellnessTracker.mood.good' },
  { value: 5, emoji: '', label: 'wellnessTracker.mood.excellent' },
];

const DAYS: TranslationKey[] = [
  'wellnessTracker.day.sun',
  'wellnessTracker.day.mon',
  'wellnessTracker.day.tue',
  'wellnessTracker.day.wed',
  'wellnessTracker.day.thu',
  'wellnessTracker.day.fri',
  'wellnessTracker.day.sat',
];

export default function WellnessTrackerPage(): JSX.Element {
  const { t } = useLocale();
  const { refetch } = api.wellnessTracker.today.useQuery() as {
    data: Record<string, unknown> | null;
    isLoading: boolean;
    refetch: () => void;
  };
  const { data: weekly } = api.wellnessTracker.weekly.useQuery() as {
    data:
      | {
          week: Array<Record<string, unknown>>;
          avgWater: number;
          avgSleep: number;
          avgMood: number;
          totalSteps: number;
          skincareDays: number;
          streak: number;
        }
      | undefined;
  };
  const checkinMut = api.wellnessTracker.checkin.useMutation({ onSuccess: () => refetch() });

  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [mood, setMood] = useState(3);
  const [steps, setSteps] = useState(0);
  const [skincare, setSkincare] = useState(false);

  const w = weekly;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('wellnessTracker.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('wellnessTracker.subtitle')}</p>
        </div>

        {/* Check-in Card */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">{t('wellnessTracker.checkinTitle')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="wt-water" className="text-sm font-semibold">
                {' '}
                {t('wellnessTracker.waterLabel')}
              </label>
              <input
                id="wt-water"
                type="number"
                min={0}
                max={20}
                value={water}
                onChange={(e) => setWater(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label htmlFor="wt-sleep" className="text-sm font-semibold">
                {' '}
                {t('wellnessTracker.sleepLabel')}
              </label>
              <input
                id="wt-sleep"
                type="number"
                min={0}
                max={24}
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label htmlFor="wt-steps" className="text-sm font-semibold">
                {t('wellnessTracker.stepsLabel')}
              </label>
              <input
                id="wt-steps"
                type="number"
                min={0}
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- toggle button is not a labelable control */}
              <label className="text-sm font-semibold">{t('wellnessTracker.skincareLabel')}</label>
              <button
                onClick={() => setSkincare(!skincare)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${skincare ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-surface-muted border-gray-200 text-text-secondary dark:bg-gray-800 dark:border-gray-700'}`}
              >
                {skincare ? t('wellnessTracker.done') : t('wellnessTracker.notDone')}
              </button>
            </div>
            <div className="sm:col-span-2">
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- mood buttons are not labelable controls */}
              <label className="text-sm font-semibold">{t('wellnessTracker.moodLabel')}</label>
              <div className="mt-1 flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex-1 rounded-lg border py-2 text-center text-sm transition-all ${mood === m.value ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 scale-105' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className="text-2xl block">{m.emoji}</span>
                    <span className="text-[10px]">{t(m.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => checkinMut.mutate({ water, sleep, mood, steps, skincare })}
              loading={checkinMut.isPending}
              className="w-full"
            >
              {t('wellnessTracker.save')}
            </Button>
          </div>
        </Card>

        {/* Weekly Stats */}
        {w && (
          <div className="grid gap-4 sm:grid-cols-5">
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-blue-600">{w.avgWater}</p>
              <p className="text-xs text-text-secondary">{t('wellnessTracker.avgWater')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-purple-600">{w.avgSleep}</p>
              <p className="text-xs text-text-secondary">{t('wellnessTracker.avgSleep')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-amber-600">{w.avgMood}</p>
              <p className="text-xs text-text-secondary">{t('wellnessHub.avgMood')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl">‍️</p>
              <p className="text-2xl font-bold text-green-600">
                {(w.totalSteps / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-text-secondary">{t('wellnessTracker.totalSteps')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-3xl"></p>
              <p className="text-2xl font-bold text-pink-600">{w.skincareDays}/7</p>
              <p className="text-xs text-text-secondary">{t('wellnessTracker.skincareDays')}</p>
            </Card>
          </div>
        )}

        {/* Weekly Chart */}
        {w && (
          <Card padding="lg">
            <h3 className="font-bold mb-4">{t('wellnessTracker.weekTitle')}</h3>
            <div className="flex items-end gap-1 h-24">
              {w.week.map((d: Record<string, unknown>) => {
                const h = Math.max(4, ((d.mood as number) || 0) * 20);
                const dayIdx = new Date(d.date as string).getDay();
                return (
                  <div key={d.date as string} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-brand-400 to-purple-400"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[10px] text-text-tertiary">{t(DAYS[dayIdx])}</span>
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
