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
  months: TranslationKey;
  color: string;
  bg: string;
  tips: TranslationKey;
  services: { emoji: string; name: TranslationKey; why: TranslationKey }[];
}[] = [
  {
    key: 'winter',
    emoji: '️',
    name: 'seasonal.season.winter',
    months: 'seasonal.months.winter',
    color: '#3b82f6',
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
    tips: 'seasonal.tips.winter',
    services: [
      {
        emoji: '',
        name: 'seasonal.svc.winter.deepHydration',
        why: 'seasonal.svc.winter.deepHydrationWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.winter.oilMassage',
        why: 'seasonal.svc.winter.oilMassageWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.winter.hairTreatment',
        why: 'seasonal.svc.winter.hairTreatmentWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.winter.winterNails',
        why: 'seasonal.svc.winter.winterNailsWhy',
      },
    ],
  },
  {
    key: 'spring',
    emoji: '',
    name: 'seasonal.season.spring',
    months: 'seasonal.months.spring',
    color: '#ec4899',
    bg: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950',
    tips: 'seasonal.tips.spring',
    services: [
      {
        emoji: '',
        name: 'seasonal.svc.spring.exfoliation',
        why: 'seasonal.svc.spring.exfoliationWhy',
      },
      { emoji: '', name: 'seasonal.svc.spring.hairTrim', why: 'seasonal.svc.spring.hairTrimWhy' },
      {
        emoji: '',
        name: 'seasonal.svc.spring.springMakeup',
        why: 'seasonal.svc.spring.springMakeupWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.spring.naturalTreatments',
        why: 'seasonal.svc.spring.naturalTreatmentsWhy',
      },
    ],
  },
  {
    key: 'summer',
    emoji: '️',
    name: 'seasonal.season.summer',
    months: 'seasonal.months.summer',
    color: '#f59e0b',
    bg: 'from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950',
    tips: 'seasonal.tips.summer',
    services: [
      {
        emoji: '',
        name: 'seasonal.svc.summer.medicalSunscreen',
        why: 'seasonal.svc.summer.medicalSunscreenWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.summer.summerPedicure',
        why: 'seasonal.svc.summer.summerPedicureWhy',
      },
      {
        emoji: '️',
        name: 'seasonal.svc.summer.hairRemoval',
        why: 'seasonal.svc.summer.hairRemovalWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.summer.summerHairstyles',
        why: 'seasonal.svc.summer.summerHairstylesWhy',
      },
    ],
  },
  {
    key: 'autumn',
    emoji: '',
    name: 'seasonal.season.autumn',
    months: 'seasonal.months.autumn',
    color: '#d97706',
    bg: 'from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950',
    tips: 'seasonal.tips.autumn',
    services: [
      {
        emoji: '',
        name: 'seasonal.svc.autumn.pigmentation',
        why: 'seasonal.svc.autumn.pigmentationWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.autumn.relaxingMassage',
        why: 'seasonal.svc.autumn.relaxingMassageWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.winter.hairTreatment',
        why: 'seasonal.svc.autumn.hairTreatmentWhy',
      },
      {
        emoji: '',
        name: 'seasonal.svc.autumn.nourishingMask',
        why: 'seasonal.svc.autumn.nourishingMaskWhy',
      },
    ],
  },
];

export default function SeasonalCalendarPage(): JSX.Element {
  const { t } = useLocale();
  const [season, setSeason] = useState('summer');
  const s = SEASONS.find((x) => x.key === season)!;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="default">
        <PageTitle title={t('seasonal.title')} subtitle={t('seasonal.subtitle')} />

        <div className="mb-6 flex gap-2">
          {SEASONS.map((sc) => (
            <button
              key={sc.key}
              type="button"
              onClick={() => setSeason(sc.key)}
              className={`flex-1 rounded-2xl border-2 p-3 text-center transition-all ${season === sc.key ? 'border-current bg-white dark:bg-gray-900' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
              style={season === sc.key ? { borderColor: sc.color } : {}}
            >
              <span className="text-2xl">{sc.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-text-primary dark:text-gray-100">
                {t(sc.name)}
              </p>
            </button>
          ))}
        </div>

        <div className={`rounded-2xl bg-gradient-to-br ${s.bg} p-6`}>
          <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
            {s.emoji} {t(s.name)}
          </h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">{t(s.months)}</p>
          <p className="mt-4 rounded-xl bg-white/60 p-3 text-sm text-text-primary dark:bg-gray-800/60 dark:text-gray-200">
            {t(s.tips)}
          </p>

          <h4 className="mt-6 text-sm font-bold text-text-primary dark:text-gray-100">
            {t('seasonal.recommendedServices')}
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {s.services.map((svc, i) => (
              <div key={i} className="flex gap-3 rounded-xl bg-white/60 p-3 dark:bg-gray-800/60">
                <span className="text-xl shrink-0">{svc.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-text-primary dark:text-gray-100">
                    {t(svc.name)}
                  </p>
                  <p className="text-xs text-text-tertiary dark:text-gray-500">{t(svc.why)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
