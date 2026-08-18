'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const SKIN_ROUTINES: Record<
  string,
  { morning: TranslationKey[]; evening: TranslationKey[]; weekly: TranslationKey[] }
> = {
  oily: {
    morning: [
      'routine.step.cleansingFoam',
      'routine.step.oilControlToner',
      'routine.step.lightOilFreeMoisturizer',
      'routine.step.sunscreen',
    ],
    evening: [
      'routine.step.makeupRemover',
      'routine.step.cleansingFoam',
      'routine.step.toner',
      'routine.step.niacinamideSerum',
      'routine.step.lightNightMoisturizer',
    ],
    weekly: ['routine.step.clayMask', 'routine.step.chemicalExfoliation'],
  },
  dry: {
    morning: [
      'routine.step.creamyCleanser',
      'routine.step.hydratingToner',
      'routine.step.hyaluronicSerum',
      'routine.step.richMoisturizer',
      'routine.step.sunscreen',
    ],
    evening: [
      'routine.step.cleansingOil',
      'routine.step.creamyCleanser',
      'routine.step.hydratingToner',
      'routine.step.vitaminESerum',
      'routine.step.richNightMoisturizer',
    ],
    weekly: ['routine.step.intenseHydrationMask', 'routine.step.nourishingFaceOil'],
  },
  combination: {
    morning: [
      'routine.step.balancedCleanser',
      'routine.step.combinationToner',
      'routine.step.lightMoisturizerTzone',
      'routine.step.richerMoisturizerCheeks',
      'routine.step.sunscreen',
    ],
    evening: [
      'routine.step.makeupRemover',
      'routine.step.balancedCleanser',
      'routine.step.toner',
      'routine.step.skinSerum',
      'routine.step.nightMoisturizer',
    ],
    weekly: ['routine.step.zoneMask', 'routine.step.gentleExfoliation'],
  },
  sensitive: {
    morning: [
      'routine.step.fragranceFreeCleanser',
      'routine.step.soothingToner',
      'routine.step.soothingMoisturizer',
      'routine.step.mineralSunscreen',
    ],
    evening: [
      'routine.step.gentleMakeupRemover',
      'routine.step.gentleCleanser',
      'routine.step.soothingSerum',
      'routine.step.soothingNightMoisturizer',
    ],
    weekly: ['routine.step.aloeMask', 'routine.step.avoidHarshExfoliation'],
  },
  normal: {
    morning: [
      'routine.step.gentleCleanser',
      'routine.step.toner',
      'routine.step.moisturizer',
      'routine.step.sunscreen',
    ],
    evening: [
      'routine.step.makeupRemover',
      'routine.step.gentleCleanser',
      'routine.step.antioxidantSerum',
      'routine.step.nightMoisturizer',
    ],
    weekly: ['routine.step.gentleExfoliation', 'routine.step.moisturizingMask'],
  },
};

const HAIR_ROUTINES: Record<string, TranslationKey[]> = {
  straight: [
    'routine.step.lightShampoo',
    'routine.step.hydratingConditioner',
    'routine.step.shineSerum',
    'routine.step.heatProtection',
  ],
  wavy: [
    'routine.step.wavyShampoo',
    'routine.step.conditioner',
    'routine.step.curlCream',
    'routine.step.arganOil',
  ],
  curly: [
    'routine.step.sulfateFreeShampoo',
    'routine.step.deepConditioner',
    'routine.step.curlDefiningCream',
    'routine.step.coconutOil',
    'routine.step.stylingGel',
  ],
  coily: [
    'routine.step.hydratingShampoo',
    'routine.step.deepConditioner',
    'routine.step.sheaButter',
    'routine.step.castorOil',
    'routine.step.heatProtectant',
  ],
};

export default function BeautyRoutinePage(): JSX.Element {
  const { t } = useLocale();
  const { data: profile, isLoading, isError, refetch } = api.beautyProfile.get.useQuery();

  const skinRoutine = profile?.skinType
    ? SKIN_ROUTINES[profile.skinType as string] || SKIN_ROUTINES['normal']
    : null;
  const hairRoutine = profile?.hairType
    ? HAIR_ROUTINES[profile.hairType as string] || HAIR_ROUTINES['straight']
    : null;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('routine.title')}
        </h1>
        <p className="text-sm text-text-secondary">{t('routine.subtitle')}</p>

        {isLoading ? (
          <DetailSkeleton />
        ) : isError ? (
          <ErrorAlert message={t('routine.loadError')} onRetry={() => refetch()} />
        ) : !profile ? (
          <Card padding="lg" className="text-center">
            <span className="text-5xl"></span>
            <p className="mt-4 text-text-secondary">{t('routine.noProfile')}</p>
            <a href="/beauty-profile" className="mt-4 inline-block">
              <Button>{t('routine.completeProfile')}</Button>
            </a>
          </Card>
        ) : (
          <>
            {/* Skin Routine */}
            <Card padding="lg">
              <h3 className="text-lg font-bold mb-4">
                {t('routine.skinRoutineTitle')} (
                {profile.skinType === 'oily'
                  ? t('routine.skinType.oily')
                  : profile.skinType === 'dry'
                    ? t('routine.skinType.dry')
                    : profile.skinType === 'combination'
                      ? t('routine.skinType.combination')
                      : profile.skinType === 'sensitive'
                        ? t('routine.skinType.sensitive')
                        : t('routine.skinType.normal')}
                )
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-amber-600">
                    {' '}
                    {t('routine.morning')}
                  </h4>
                  <ul className="space-y-1">
                    {skinRoutine?.morning.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {t(s)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-indigo-600">
                    {' '}
                    {t('routine.evening')}
                  </h4>
                  <ul className="space-y-1">
                    {skinRoutine?.evening.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {t(s)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-purple-600">
                    {' '}
                    {t('routine.weekly')}
                  </h4>
                  <ul className="space-y-1">
                    {skinRoutine?.weekly.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                      >
                        <span>•</span> {t(s)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Hair Routine */}
            {hairRoutine && (
              <Card padding="lg">
                <h3 className="text-lg font-bold mb-4">
                  {t('routine.hairRoutineTitle')} (
                  {profile.hairType === 'straight'
                    ? t('routine.hairType.straight')
                    : profile.hairType === 'wavy'
                      ? t('routine.hairType.wavy')
                      : profile.hairType === 'curly'
                        ? t('routine.hairType.curly')
                        : t('routine.hairType.coily')}
                  )
                </h3>
                <ul className="space-y-1">
                  {hairRoutine.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-text-secondary dark:text-gray-400 flex gap-2"
                    >
                      <span>•</span> {t(s)}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="text-center">
              <Link href="/services" className="inline-block">
                <Button variant="outline">{t('routine.bookCareServices')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
