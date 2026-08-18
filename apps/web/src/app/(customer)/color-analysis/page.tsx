'use client';

import { useState } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const SEASONS: {
  key: string;
  emoji: string;
  name: TranslationKey;
  desc: TranslationKey;
  colors: string[];
  skin: TranslationKey;
  makeup: TranslationKey[];
  jewelry: TranslationKey;
}[] = [
  {
    key: 'winter',
    emoji: '️',
    name: 'color.season.winter',
    desc: 'color.desc.winter',
    colors: ['#1e1b4b', '#312e81', '#831843', '#ffffff', '#000000', '#dc2626', '#4c1d95'],
    skin: 'color.skin.winter',
    makeup: ['color.makeup.winter1', 'color.makeup.winter2', 'color.makeup.winter3'],
    jewelry: 'color.jewelry.silver',
  },
  {
    key: 'summer',
    emoji: '',
    name: 'color.season.summer',
    desc: 'color.desc.summer',
    colors: ['#fbcfe8', '#ddd6fe', '#bfdbfe', '#d1d5db', '#ec4899', '#8b5cf6', '#93c5fd'],
    skin: 'color.skin.summer',
    makeup: ['color.makeup.summer1', 'color.makeup.summer2', 'color.makeup.summer3'],
    jewelry: 'color.jewelry.silver',
  },
  {
    key: 'autumn',
    emoji: '',
    name: 'color.season.autumn',
    desc: 'color.desc.autumn',
    colors: ['#fef3c7', '#fed7aa', '#fde68a', '#d97706', '#b45309', '#92400e', '#78350f'],
    skin: 'color.skin.autumn',
    makeup: ['color.makeup.autumn1', 'color.makeup.autumn2', 'color.makeup.autumn3'],
    jewelry: 'color.jewelry.gold',
  },
  {
    key: 'spring',
    emoji: '',
    name: 'color.season.spring',
    desc: 'color.desc.spring',
    colors: ['#fef08a', '#fde047', '#86efac', '#fca5a5', '#fb923c', '#22c55e', '#fbbf24'],
    skin: 'color.skin.spring',
    makeup: ['color.makeup.spring1', 'color.makeup.spring2', 'color.makeup.spring3'],
    jewelry: 'color.jewelry.gold',
  },
];

export default function ColorAnalysisPage(): JSX.Element {
  const { t } = useLocale();
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title={t('color.title')} subtitle={t('color.subtitle')} />

        <div className="mb-6 flex gap-2">
          {SEASONS.map((sc) => (
            <button
              key={sc.key}
              type="button"
              onClick={() => setSeason(sc.key)}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${season === sc.key ? 'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <span className="text-2xl">{sc.emoji}</span>
              <p
                className={`mt-1 text-xs font-semibold ${season === sc.key ? 'text-rose-600 dark:text-rose-400' : 'text-text-tertiary dark:text-gray-500'}`}
              >
                {t(sc.name)}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
            {s.emoji} {t(s.name)} — {t(s.desc)}
          </h3>
          <p className="mt-2 text-sm text-text-secondary dark:text-gray-400"> {t(s.skin)}</p>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
            {t('color.palette')}
          </h4>
          <div className="mt-3 flex gap-2">
            {s.colors.map((c, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full border border-gray-200 shadow-sm dark:border-gray-700"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
            {t('color.suitableMakeup')}
          </h4>
          <div className="mt-2 space-y-2">
            {s.makeup.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
              >
                <span></span>
                <span className="text-sm text-text-secondary dark:text-gray-300">{t(m)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="text-sm text-text-tertiary dark:text-gray-500">
              {' '}
              {t('color.jewelry')}
            </span>
            <span className="text-lg font-bold text-amber-500">{t(s.jewelry)}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-rose-600 py-4 text-center text-base font-bold text-white hover:bg-rose-700 transition-colors"
        >
          {t('color.analyze')}
        </button>
      </PageContainer>
    </DashboardLayout>
  );
}
