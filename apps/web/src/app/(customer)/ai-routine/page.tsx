'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, GridSkeleton, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const SKIN_TYPES: {
  key: 'dry' | 'oily' | 'combination' | 'normal';
  emoji: string;
  label: TranslationKey;
  desc: TranslationKey;
}[] = [
  {
    key: 'dry',
    emoji: '️',
    label: 'aiRoutine.skinType.dry.label',
    desc: 'aiRoutine.skinType.dry.desc',
  },
  {
    key: 'oily',
    emoji: '',
    label: 'aiRoutine.skinType.oily.label',
    desc: 'aiRoutine.skinType.oily.desc',
  },
  {
    key: 'combination',
    emoji: '',
    label: 'aiRoutine.skinType.combination.label',
    desc: 'aiRoutine.skinType.combination.desc',
  },
  {
    key: 'normal',
    emoji: '',
    label: 'aiRoutine.skinType.normal.label',
    desc: 'aiRoutine.skinType.normal.desc',
  },
];

export default function AIRoutinePage(): JSX.Element {
  const { t } = useLocale();
  const [skinType, setSkinType] = useState<'dry' | 'oily' | 'combination' | 'normal'>(
    'combination',
  );
  const [generated, setGenerated] = useState(false);

  const { data, isLoading } = api.aiRoutine.generate.useQuery(
    { skinType },
    { enabled: generated },
  ) as { data: Record<string, unknown> | undefined; isLoading: boolean; refetch: () => void };

  const routine = data;
  const morning =
    ((routine?.morning as Record<string, unknown>)?.steps as Array<Record<string, unknown>>) ?? [];
  const evening =
    ((routine?.evening as Record<string, unknown>)?.steps as Array<Record<string, unknown>>) ?? [];
  const tips = (routine?.tips as string[]) ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('aiRoutine.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('aiRoutine.subtitle')}</p>
        </div>

        {!generated ? (
          <Card padding="lg">
            <h3 className="font-bold text-lg mb-4">{t('aiRoutine.pickSkinType')}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {SKIN_TYPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSkinType(s.key)}
                  className={`rounded-xl border-2 p-4 text-right transition-all ${skinType === s.key ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <span className="text-3xl">{s.emoji}</span>
                  <p className="font-bold mt-1">{t(s.label)}</p>
                  <p className="text-xs text-text-secondary">{t(s.desc)}</p>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => setGenerated(true)} className="w-full" size="lg">
                {t('aiRoutine.generate')}
              </Button>
            </div>
          </Card>
        ) : isLoading ? (
          <GridSkeleton count={2} />
        ) : !routine ? (
          <GridSkeleton count={2} />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg">
                <h3 className="font-bold text-lg mb-3">
                  {t('aiRoutine.morningTitle', {
                    time: routine?.morning
                      ? ((routine.morning as Record<string, unknown>).totalTime as string)
                      : '',
                  })}
                </h3>
                <div className="space-y-3">
                  {morning.map((s: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-2xl">{s.emoji as string}</span>
                      <div>
                        <p className="font-semibold text-sm">{s.stepAr as string}</p>
                        <p className="text-xs text-text-secondary">{s.duration as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card padding="lg">
                <h3 className="font-bold text-lg mb-3">
                  {t('aiRoutine.eveningTitle', {
                    time: routine?.evening
                      ? ((routine.evening as Record<string, unknown>).totalTime as string)
                      : '',
                  })}
                </h3>
                <div className="space-y-3">
                  {evening.map((s: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-2xl">{s.emoji as string}</span>
                      <div>
                        <p className="font-semibold text-sm">{s.stepAr as string}</p>
                        <p className="text-xs text-text-secondary">{s.duration as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            {tips.length > 0 && (
              <Card
                padding="lg"
                className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950 border-none"
              >
                <h3 className="font-bold mb-3">{t('aiRoutine.tipsTitle')}</h3>
                <div className="space-y-2">
                  {tips.map((tip, i) => (
                    <p key={i} className="text-sm">
                      {tip}
                    </p>
                  ))}
                </div>
              </Card>
            )}
            <div className="text-center">
              <Button variant="ghost" onClick={() => setGenerated(false)}>
                {t('aiRoutine.changeSkinType')}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
