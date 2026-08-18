'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const TREATMENTS: Record<
  string,
  {
    emoji: string;
    label: TranslationKey;
    aftercare: TranslationKey[];
    timeline: { day: TranslationKey; action: TranslationKey }[];
  }
> = {
  facial: {
    emoji: '',
    label: 'postTreatment.treat.facial',
    aftercare: [
      'postTreatment.care.facial1',
      'postTreatment.care.facial2',
      'postTreatment.care.facial3',
      'postTreatment.care.facial4',
    ],
    timeline: [
      { day: 'postTreatment.day1', action: 'postTreatment.step.facial1' },
      { day: 'postTreatment.day2_3', action: 'postTreatment.step.facial2' },
      { day: 'postTreatment.day4_7', action: 'postTreatment.step.facial3' },
    ],
  },
  waxing: {
    emoji: '️',
    label: 'postTreatment.treat.waxing',
    aftercare: [
      'postTreatment.care.waxing1',
      'postTreatment.care.waxing2',
      'postTreatment.care.waxing3',
      'postTreatment.care.waxing4',
    ],
    timeline: [
      { day: 'postTreatment.day1', action: 'postTreatment.step.waxing1' },
      { day: 'postTreatment.day2_3', action: 'postTreatment.step.waxing2' },
      { day: 'postTreatment.day4_plus', action: 'postTreatment.step.waxing3' },
    ],
  },
  hair_color: {
    emoji: '‍️',
    label: 'postTreatment.treat.hairColor',
    aftercare: [
      'postTreatment.care.hairColor1',
      'postTreatment.care.hairColor2',
      'postTreatment.care.hairColor3',
      'postTreatment.care.hairColor4',
    ],
    timeline: [
      { day: 'postTreatment.day1_2', action: 'postTreatment.step.hairColor1' },
      { day: 'postTreatment.day3_5', action: 'postTreatment.step.hairColor2' },
      { day: 'postTreatment.day6_plus', action: 'postTreatment.step.hairColor3' },
    ],
  },
  nails: {
    emoji: '',
    label: 'postTreatment.treat.nails',
    aftercare: [
      'postTreatment.care.nails1',
      'postTreatment.care.nails2',
      'postTreatment.care.nails3',
      'postTreatment.care.nails4',
    ],
    timeline: [
      { day: 'postTreatment.day1', action: 'postTreatment.step.nails1' },
      { day: 'postTreatment.day2_7', action: 'postTreatment.step.nails2' },
      { day: 'postTreatment.week2_plus', action: 'postTreatment.step.nails3' },
    ],
  },
};

export default function PostTreatmentPage(): JSX.Element {
  const { t } = useLocale();
  const [selected, setSelected] = useState('facial');
  const [completed, setCompleted] = useState<string[]>([]);
  const treat = TREATMENTS[selected]!;
  const progress = Math.round((completed.length / treat.timeline.length) * 100);
  const toggleDay = (day: string) => {
    if (completed.includes(day)) setCompleted(completed.filter((x) => x !== day));
    else setCompleted([...completed, day]);
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title={t('postTreatment.title')} subtitle={t('postTreatment.subtitle')} />

        <div className="mb-6 flex gap-2">
          {Object.entries(TREATMENTS).map(([key, val]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelected(key);
                setCompleted([]);
              }}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${selected === key ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <span className="text-2xl">{val.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-text-primary dark:text-gray-100">
                {t(val.label)}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
            {treat.emoji} {t(treat.label)}
          </h3>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary dark:text-gray-100">
                {t('postTreatment.progress')}
              </span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {progress}%
              </span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
            {t('postTreatment.important')}
          </h4>
          <div className="mt-2 space-y-1">
            {treat.aftercare.map((a, i) => (
              <p
                key={i}
                className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400"
              >
                <span>•</span> {t(a)}
              </p>
            ))}
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
            {t('postTreatment.timelineTitle')}
          </h4>
          <div className="mt-2 space-y-2">
            {treat.timeline.map((tl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(tl.day)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${completed.includes(tl.day) ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-50 dark:bg-gray-800'}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm ${completed.includes(tl.day) ? 'bg-emerald-500 text-white' : 'border-2 border-gray-300 dark:border-gray-600'}`}
                >
                  {completed.includes(tl.day) ? '' : ''}
                </span>
                <div>
                  <p
                    className={`text-sm font-bold ${completed.includes(tl.day) ? 'text-emerald-700 dark:text-emerald-300' : 'text-text-primary dark:text-gray-200'}`}
                  >
                    {t(tl.day)}
                  </p>
                  <p className="text-xs text-text-tertiary dark:text-gray-500">{t(tl.action)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
