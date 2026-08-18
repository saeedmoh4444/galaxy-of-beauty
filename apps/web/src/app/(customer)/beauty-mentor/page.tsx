'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const LEVELS: {
  key: string;
  emoji: string;
  name: TranslationKey;
  desc: TranslationKey;
  plan: TranslationKey[];
}[] = [
  {
    key: 'beginner',
    emoji: '',
    name: 'mentor.level.beginner',
    desc: 'mentor.level.beginnerDesc',
    plan: [
      'mentor.plan.beginner1',
      'mentor.plan.beginner2',
      'mentor.plan.beginner3',
      'mentor.plan.beginner4',
      'mentor.plan.beginner5',
    ],
  },
  {
    key: 'intermediate',
    emoji: '',
    name: 'mentor.level.intermediate',
    desc: 'mentor.level.intermediateDesc',
    plan: [
      'mentor.plan.intermediate1',
      'mentor.plan.intermediate2',
      'mentor.plan.intermediate3',
      'mentor.plan.intermediate4',
      'mentor.plan.intermediate5',
    ],
  },
  {
    key: 'advanced',
    emoji: '',
    name: 'mentor.level.advanced',
    desc: 'mentor.level.advancedDesc',
    plan: [
      'mentor.plan.advanced1',
      'mentor.plan.advanced2',
      'mentor.plan.advanced3',
      'mentor.plan.advanced4',
      'mentor.plan.advanced5',
    ],
  },
];

const TOPICS: TranslationKey[] = [
  'mentor.topic.skincare',
  'mentor.topic.makeup',
  'mentor.topic.haircare',
  'mentor.topic.nails',
  'mentor.topic.perfume',
  'mentor.topic.nutrition',
];

const TOPIC_TIPS: Record<string, TranslationKey[]> = {
  'mentor.topic.skincare': [
    'mentor.tips.skincare1',
    'mentor.tips.skincare2',
    'mentor.tips.skincare3',
    'mentor.tips.skincare4',
    'mentor.tips.skincare5',
  ],
  'mentor.topic.makeup': [
    'mentor.tips.makeup1',
    'mentor.tips.makeup2',
    'mentor.tips.makeup3',
    'mentor.tips.makeup4',
    'mentor.tips.makeup5',
  ],
  'mentor.topic.haircare': [
    'mentor.tips.haircare1',
    'mentor.tips.haircare2',
    'mentor.tips.haircare3',
    'mentor.tips.haircare4',
    'mentor.tips.haircare5',
  ],
  'mentor.topic.nails': [
    'mentor.tips.nails1',
    'mentor.tips.nails2',
    'mentor.tips.nails3',
    'mentor.tips.nails4',
    'mentor.tips.nails5',
  ],
  'mentor.topic.perfume': [
    'mentor.tips.perfume1',
    'mentor.tips.perfume2',
    'mentor.tips.perfume3',
    'mentor.tips.perfume4',
    'mentor.tips.perfume5',
  ],
  'mentor.topic.nutrition': [
    'mentor.tips.nutrition1',
    'mentor.tips.nutrition2',
    'mentor.tips.nutrition3',
    'mentor.tips.nutrition4',
    'mentor.tips.nutrition5',
  ],
};

export default function BeautyMentorPage(): JSX.Element {
  const { t } = useLocale();
  const [level, setLevel] = useState('beginner');
  const [selectedTopic, setSelectedTopic] = useState<TranslationKey | null>(null);
  const currentLevel = LEVELS.find((l) => l.key === level)!;

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> {t('mentor.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('mentor.subtitle')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLevel(l.key)}
              className={`rounded-xl border-2 p-4 text-center transition-all ${level === l.key ? 'border-brand-400 bg-brand-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className="text-4xl block">{l.emoji}</span>
              <p className="font-bold mt-2">{t(l.name)}</p>
              <p className="text-xs text-text-secondary">{t(l.desc)}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg">
            <h3 className="font-bold mb-3">
              {' '}
              {t('mentor.learningPlan', { name: t(currentLevel.name) })}
            </h3>
            <div className="space-y-2">
              {currentLevel.plan.map((step, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="text-sm">{t(step)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-bold mb-3"> {t('mentor.topicsTitle')}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {TOPICS.map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedTopic(selectedTopic === tp ? null : tp)}
                  className={`rounded-full px-4 py-2 text-sm transition-all ${selectedTopic === tp ? 'bg-brand-600 text-white' : 'bg-surface-muted hover:bg-gray-200'}`}
                >
                  {t(tp)}
                </button>
              ))}
            </div>
            {selectedTopic && (
              <div className="rounded-lg border p-4">
                <h4 className="font-bold text-brand-600 mb-3">
                  {' '}
                  {t('mentor.tipsTitle', { topic: t(selectedTopic) })}
                </h4>
                <div className="space-y-2">
                  {(TOPIC_TIPS[selectedTopic] ?? []).map((tip, i) => (
                    <p key={i} className="text-sm text-text-primary">
                      • {t(tip)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
