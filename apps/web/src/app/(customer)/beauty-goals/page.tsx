'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  PageContainer,
  PageTitle,
  BeautyHabitTrackerCard,
  BeautyVisionBoardCard,
  BeautySkillTreeCard,
  BeautyChallengeCard,
  BeautyLearningPathCard,
  BeautyCertificationPathCard,
  HydrationTracker,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const GOAL_TEMPLATES: {
  key: string;
  emoji: string;
  name: TranslationKey;
  goals: TranslationKey[];
}[] = [
  {
    key: 'skincare',
    emoji: '',
    name: 'beautyGoals.cat.skincare',
    goals: [
      'beautyGoals.goal.skincare1',
      'beautyGoals.goal.skincare2',
      'beautyGoals.goal.skincare3',
      'beautyGoals.goal.skincare4',
    ],
  },
  {
    key: 'makeup',
    emoji: '',
    name: 'beautyGoals.cat.makeup',
    goals: [
      'beautyGoals.goal.makeup1',
      'beautyGoals.goal.makeup2',
      'beautyGoals.goal.makeup3',
      'beautyGoals.goal.makeup4',
    ],
  },
  {
    key: 'hair',
    emoji: '‍️',
    name: 'beautyGoals.cat.hair',
    goals: [
      'beautyGoals.goal.hair1',
      'beautyGoals.goal.hair2',
      'beautyGoals.goal.hair3',
      'beautyGoals.goal.hair4',
    ],
  },
  {
    key: 'health',
    emoji: '',
    name: 'beautyGoals.cat.health',
    goals: [
      'beautyGoals.goal.health1',
      'beautyGoals.goal.health2',
      'beautyGoals.goal.health3',
      'beautyGoals.goal.health4',
    ],
  },
  {
    key: 'nails',
    emoji: '',
    name: 'beautyGoals.cat.nails',
    goals: [
      'beautyGoals.goal.nails1',
      'beautyGoals.goal.nails2',
      'beautyGoals.goal.nails3',
      'beautyGoals.goal.nails4',
    ],
  },
  {
    key: 'spirit',
    emoji: '',
    name: 'beautyGoals.cat.spirit',
    goals: [
      'beautyGoals.goal.spirit1',
      'beautyGoals.goal.spirit2',
      'beautyGoals.goal.spirit3',
      'beautyGoals.goal.spirit4',
    ],
  },
];

export default function BeautyGoalsPage(): JSX.Element {
  const { t } = useLocale();
  const visionGoals = api.visionBoard.myGoals.useQuery({ limit: 6 });
  const [goals, setGoals] = useState<Record<string, boolean[]>>({});
  const toggle = (catKey: string, idx: number) => {
    setGoals((prev) => {
      const catGoals = [
        ...(prev[catKey] ?? GOAL_TEMPLATES.find((g) => g.key === catKey)!.goals.map(() => false)),
      ];
      catGoals[idx] = !catGoals[idx];
      return { ...prev, [catKey]: catGoals };
    });
  };

  const allGoals = GOAL_TEMPLATES.flatMap((c) =>
    c.goals.map((g, i) => ({ cat: c.key, goal: g, idx: i })),
  );
  const checked = allGoals.filter((g) => goals[g.cat]?.[g.idx]).length;
  const pct = Math.round((checked / allGoals.length) * 100);

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title={t('beautyGoals.title')} subtitle={t('beautyGoals.subtitle')} />

        <Card padding="lg" className="text-center">
          <div className="h-4 bg-surface-muted rounded-full">
            <div
              className="h-4 bg-green-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-text-secondary mt-2">
            {t('beautyGoals.progress', { done: checked, total: allGoals.length, pct })}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GOAL_TEMPLATES.map((cat) => {
            const catGoals = goals[cat.key] ?? cat.goals.map(() => false);
            const catChecked = catGoals.filter(Boolean).length;
            return (
              <Card key={cat.key} padding="lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-bold">{t(cat.name)}</h3>
                  <span className="text-xs text-text-tertiary mr-auto">
                    {catChecked}/{cat.goals.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cat.goals.map((g, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${catGoals[i] ? 'bg-green-50 line-through text-text-tertiary' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={catGoals[i] ?? false}
                        onChange={() => toggle(cat.key, i)}
                        className="w-4 h-4 accent-brand-600"
                      />
                      <span className="text-sm">{t(g)}</span>
                    </label>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional wired components */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BeautyVisionBoardCard
            goals={
              visionGoals?.data?.map((g) => ({
                emoji: g.emoji,
                text: g.text,
                year: g.year,
                achieved: g.achieved,
              })) ?? [
                { emoji: '', text: t('beautyGoals.visionWedding'), year: '2027', achieved: false },
              ]
            }
          />
          <BeautySkillTreeCard
            skills={[
              { name: t('beautyGoals.skill.basicMakeup'), emoji: '', level: 3, max: 5 },
              { name: t('beautyGoals.skill.skincare'), emoji: '', level: 2, max: 5 },
              { name: t('beautyGoals.skill.hairstyles'), emoji: '', level: 1, max: 5 },
            ]}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <BeautyHabitTrackerCard
            habits={[
              { name: t('beautyGoals.habit.sunscreen'), emoji: '️', done: true },
              { name: t('beautyGoals.habit.water'), emoji: '', done: false },
              { name: t('beautyGoals.habit.evening'), emoji: '', done: true },
            ]}
          />
          <HydrationTracker goal={8} current={5} />
          <BeautyChallengeCard completedDays={7} totalDays={30} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BeautyLearningPathCard
            path={{
              title: t('beautyGoals.path.title'),
              modules: 8,
              completed: 3,
              emoji: '',
              duration: t('beautyGoals.path.duration'),
            }}
          />
          <BeautyCertificationPathCard path="makeup" />
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
