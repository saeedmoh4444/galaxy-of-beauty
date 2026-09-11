'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, DashboardSkeleton, Button, ErrorAlert, HeroSection, Tabs } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import {
  WELLNESS_TABS,
  WELLNESS_TAB_I18N,
  defaultTabFor,
  type WellnessTabKey,
} from '@galaxy/shared';
import {
  MentalWellnessSection,
  JournalPromptCard,
  NutritionSection,
} from '@/components/wellness/WellnessContentSections';
import {
  LifeStageCard,
  PamperCard,
  PostpartumSection,
  MenopauseCard,
} from '@/components/wellness/LifeStageSection';

// Stable prefix for the tabs/panels id wiring (role=tab ↔ role=tabpanel).
const HUB_ID_PREFIX = 'wellness-hub';
const SAVED_TAB_KEY = 'wellness-hub-tab';

export default function WellnessHubPage(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const paramTab = params.get('tab');

  const { data, isLoading, isError, refetch } = api.wellnessHub.dashboard.useQuery();
  const stageQ = api.lifeStage.get.useQuery();
  const pamperQ = api.lifeStage.pamperStatus.useQuery();
  const menoQ = api.menopause.status.useQuery();

  // Last-picked tab — per-viewer convenience (localStorage may be absent).
  const [savedTab, setSavedTab] = useState<string | null>(null);
  useEffect(() => {
    try {
      setSavedTab(localStorage.getItem(SAVED_TAB_KEY));
    } catch {
      setSavedTab(null);
    }
  }, []);

  // Tab state: null until the resolver inputs are ready (first visit only —
  // user clicks own the tab afterwards).
  const [tab, setTab] = useState<WellnessTabKey | null>(null);
  const ready = savedTab !== null && !stageQ.isLoading && !pamperQ.isLoading && !menoQ.isLoading;
  useEffect(() => {
    if (tab === null && ready) {
      setTab(
        defaultTabFor({
          stage: stageQ.data?.stage,
          pamperActive: pamperQ.data?.isPamperWindow,
          menopauseEnabled: Boolean(menoQ.data?.enabled),
          savedTab,
          param: paramTab,
        }),
      );
    }
  }, [tab, ready, stageQ.data, pamperQ.data, menoQ.data, savedTab, paramTab]);

  const current: WellnessTabKey = tab ?? 'cycle';

  const selectTab = (key: WellnessTabKey) => {
    setTab(key);
    try {
      localStorage.setItem(SAVED_TAB_KEY, key);
    } catch {
      // storage unavailable — session-only selection
    }
    if (paramTab) {
      router.replace('/wellness-hub', { scroll: false });
    }
  };

  if (isLoading)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-5xl space-y-6">
          <DashboardSkeleton />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout userRole="CUSTOMER">
        <div className="mx-auto max-w-5xl space-y-6">
          <ErrorAlert message={t('wellnessHub.err.load')} onRetry={() => refetch()} />
        </div>
      </DashboardLayout>
    );
  const d = data;

  const labels = WELLNESS_TABS.map((key) =>
    key === 'pamper' && pamperQ.data?.isPamperWindow
      ? `${t(WELLNESS_TAB_I18N[key])} ●`
      : t(WELLNESS_TAB_I18N[key]),
  );
  const currentIndex = WELLNESS_TABS.indexOf(current);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <HeroSection
          eyebrow="🌿"
          title={t('wellnessHub.title')}
          subtitle={t('wellnessHub.subtitle')}
          gradient="from-brand-50 via-surface to-accent-50"
          className="rounded-3xl"
        />

        {/* Stage-aware tabs (Phase 3 sprint 3) */}
        <Tabs
          tabs={labels}
          active={labels[currentIndex]}
          onChange={(label) => selectTab(WELLNESS_TABS[labels.indexOf(label)] ?? 'cycle')}
          tabListLabel={t('wellnessHub.title')}
          idPrefix={HUB_ID_PREFIX}
          className="justify-center"
        />

        {/* Cycle panel — tracker status + stats + stage switcher */}
        <div
          role="tabpanel"
          id={`${HUB_ID_PREFIX}-panel-0`}
          aria-labelledby={`${HUB_ID_PREFIX}-tab-0`}
          data-testid="hub-panel-cycle"
          hidden={current !== 'cycle'}
          className="space-y-6"
        >
          {d?.cycle && (
            <Card padding="lg" className="text-center border-2">
              <span className="text-4xl">{d!.cycle.phase?.emoji}</span>
              <h3 className="font-bold text-lg mt-2">{d!.cycle.phase?.name}</h3>
              <p className="text-sm text-text-secondary">
                {t('wellnessHub.cycleDay', {
                  day: d!.cycle.currentDay,
                  total: d!.cycle.cycleLength,
                })}
              </p>
              <p className="text-xs text-brand-600 mt-1">
                ️ {t('wellnessHub.nextPeriod', { days: d!.cycle.daysUntilNext ?? 0 })}
              </p>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card padding="md" className="text-center">
              <p className="text-2xl font-extrabold">
                {d?.todayMood ? d.todayMood.mood + '/5' : '—'}
              </p>
              <p className="text-xs text-text-secondary">{t('wellnessHub.stat.mood')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-2xl font-extrabold text-blue-600">
                {d?.todayMood ? String(d.todayMood.energy) + '/10' : '—'}
              </p>
              <p className="text-xs text-text-secondary">{t('wellnessHub.stat.energy')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-2xl font-extrabold text-brand-600">
                {d?.todayMood ? String(d.todayMood.sleepHours) + 'h' : '—'}
              </p>
              <p className="text-xs text-text-secondary">{t('wellnessHub.stat.sleep')}</p>
            </Card>
            <Card padding="md" className="text-center">
              <p className="text-2xl font-extrabold text-cyan-600">
                {d?.todayMood ? String(d.todayMood.waterGlasses) + '' : '—'}
              </p>
              <p className="text-xs text-text-secondary">{t('wellnessHub.stat.water')}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Skin Analysis */}
            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('wellnessHub.skinTitle')}</h3>
              {d?.skin ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-text-secondary">{t('wellnessHub.skinTypeLabel')}</span>{' '}
                    <span className="font-bold">{d.skin.skinType}</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {((d.skin.concerns as string[]) ?? []).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-text-tertiary">{t('wellnessHub.skinEmpty')}</p>
                  <Link href="/skin-analysis">
                    <Button size="sm" className="mt-2">
                      {t('wellnessHub.skinCta')}
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Weekly Summary */}
            <Card padding="lg">
              <h3 className="font-bold mb-3">{t('wellnessHub.weeklyTitle')}</h3>
              {d?.weekly && d.weekly.checkinCount > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-text-secondary mb-1">{t('wellnessHub.avgMood')}</p>
                    <div className="h-2 bg-surface-muted rounded-full">
                      <div
                        className="h-2 bg-amber-500 rounded-full"
                        style={{ width: `${((d.weekly.avgMood ?? 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary mb-1">{t('wellnessHub.avgEnergy')}</p>
                    <div className="h-2 bg-surface-muted rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${((d.weekly.avgEnergy ?? 0) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {t('wellnessHub.checkins', { count: d.weekly.checkinCount })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">{t('wellnessHub.weeklyEmpty')}</p>
              )}
            </Card>
          </div>

          {/* E6a — life-stage journeys (stage switcher lives on the cycle tab) */}
          <LifeStageCard />
        </div>

        {/* Pamper panel — E6a period pampering */}
        <div
          role="tabpanel"
          id={`${HUB_ID_PREFIX}-panel-1`}
          aria-labelledby={`${HUB_ID_PREFIX}-tab-1`}
          data-testid="hub-panel-pamper"
          hidden={current !== 'pamper'}
          className="space-y-6"
        >
          <PamperCard />
        </div>

        {/* Postpartum panel — E6b (new_mom stage only) */}
        <div
          role="tabpanel"
          id={`${HUB_ID_PREFIX}-panel-2`}
          aria-labelledby={`${HUB_ID_PREFIX}-tab-2`}
          data-testid="hub-panel-postpartum"
          hidden={current !== 'postpartum'}
          className="space-y-6"
        >
          <PostpartumSection />
        </div>

        {/* Menopause panel — E6c (enabled only) */}
        <div
          role="tabpanel"
          id={`${HUB_ID_PREFIX}-panel-3`}
          aria-labelledby={`${HUB_ID_PREFIX}-tab-3`}
          data-testid="hub-panel-menopause"
          hidden={current !== 'menopause'}
          className="space-y-6"
        >
          <MenopauseCard />
        </div>

        {/* Mind panel — E4b mental wellness + journaling + nutrition */}
        <div
          role="tabpanel"
          id={`${HUB_ID_PREFIX}-panel-4`}
          aria-labelledby={`${HUB_ID_PREFIX}-tab-4`}
          data-testid="hub-panel-mind"
          hidden={current !== 'mind'}
          className="space-y-6"
        >
          <MentalWellnessSection />
          <JournalPromptCard />
          <NutritionSection />

          {/* Journal */}
          <Card padding="lg">
            <h3 className="font-bold mb-3">
              {t('wellnessHub.journalTitle', { count: d?.journalCount ?? 0 })}
            </h3>
            {d?.recentJournals?.length ? (
              d.recentJournals.map((j) => (
                <div key={j.id} className="border-b py-2 last:border-0">
                  <p className="text-sm">{j.content}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(j.date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA')} ·{' '}
                    {t('wellnessHub.moodLabel')} {j.mood ?? '—'}/5
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-tertiary">{t('wellnessHub.journalEmpty')}</p>
            )}
            <Link href="/beauty-journal">
              <Button size="sm" variant="outline" className="w-full mt-3">
                {t('wellnessHub.allJournals')}
              </Button>
            </Link>
          </Card>
        </div>

        {/* Quick Actions — navigation, persistent across tabs */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/self-care">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">{t('wellnessHub.action.today')}</p>
            </Card>
          </Link>
          <Link href="/cycle-tracker">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">{t('wellnessHub.action.cycle')}</p>
            </Card>
          </Link>
          <Link href="/skin-analysis">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">{t('wellnessHub.action.skin')}</p>
            </Card>
          </Link>
          <Link href="/wellness-tracker">
            <Card hover padding="md" className="text-center">
              <span className="text-2xl"></span>
              <p className="text-xs font-medium mt-1">{t('wellnessHub.action.wellness')}</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
