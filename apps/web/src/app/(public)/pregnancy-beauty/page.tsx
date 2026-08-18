'use client';
import { useState } from 'react';
import { Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const TRIMESTERS = [
  {
    key: 'first',
    nameAr: 'marketing.pregnancy-beauty.trimester-first',
    emoji: '',
    tips: [
      {
        title: 'marketing.pregnancy-beauty.tip-chem-title',
        desc: 'marketing.pregnancy-beauty.tip-chem-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-natural-title',
        desc: 'marketing.pregnancy-beauty.tip-natural-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-morning-title',
        desc: 'marketing.pregnancy-beauty.tip-morning-desc',
        icon: '‍️',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-hydration-title',
        desc: 'marketing.pregnancy-beauty.tip-hydration-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-hair-dye-title',
        desc: 'marketing.pregnancy-beauty.tip-hair-dye-desc',
        icon: '',
      },
    ],
  },
  {
    key: 'second',
    nameAr: 'marketing.pregnancy-beauty.trimester-second',
    emoji: '',
    tips: [
      {
        title: 'marketing.pregnancy-beauty.tip-pregnancy-massage-title',
        desc: 'marketing.pregnancy-beauty.tip-pregnancy-massage-desc',
        icon: '‍️',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-nails-title',
        desc: 'marketing.pregnancy-beauty.tip-nails-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-glow-title',
        desc: 'marketing.pregnancy-beauty.tip-glow-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-safe-dye-title',
        desc: 'marketing.pregnancy-beauty.tip-safe-dye-desc',
        icon: '‍️',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-warm-bath-title',
        desc: 'marketing.pregnancy-beauty.tip-warm-bath-desc',
        icon: '',
      },
    ],
  },
  {
    key: 'third',
    nameAr: 'marketing.pregnancy-beauty.trimester-third',
    emoji: '',
    tips: [
      {
        title: 'marketing.pregnancy-beauty.tip-relax-title',
        desc: 'marketing.pregnancy-beauty.tip-relax-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-feet-title',
        desc: 'marketing.pregnancy-beauty.tip-feet-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-face-title',
        desc: 'marketing.pregnancy-beauty.tip-face-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-back-title',
        desc: 'marketing.pregnancy-beauty.tip-back-desc',
        icon: '',
      },
      {
        title: 'marketing.pregnancy-beauty.tip-haircut-title',
        desc: 'marketing.pregnancy-beauty.tip-haircut-desc',
        icon: '️',
      },
    ],
  },
] as const;

const SAFE_INGREDIENTS = [
  'marketing.pregnancy-beauty.ing-safe-jojoba',
  'marketing.pregnancy-beauty.ing-safe-shea',
  'marketing.pregnancy-beauty.ing-safe-aloe',
  'marketing.pregnancy-beauty.ing-safe-coconut',
  'marketing.pregnancy-beauty.ing-safe-almond',
  'marketing.pregnancy-beauty.ing-safe-chamomile',
  'marketing.pregnancy-beauty.ing-safe-lavender',
  'marketing.pregnancy-beauty.ing-safe-rosewater',
] as const;
const AVOID_INGREDIENTS = [
  'marketing.pregnancy-beauty.ing-avoid-retinol',
  'marketing.pregnancy-beauty.ing-avoid-salicylic',
  'marketing.pregnancy-beauty.ing-avoid-hydroquinone',
  'marketing.pregnancy-beauty.ing-avoid-formaldehyde',
  'marketing.pregnancy-beauty.ing-avoid-essential-oils',
  'marketing.pregnancy-beauty.ing-avoid-ammonia',
] as const;

export default function PregnancyBeautyPage(): JSX.Element {
  const { t } = useLocale();
  const [trimester, setTrimester] = useState('first');
  const current = TRIMESTERS.find((tri) => tri.key === trimester) ?? TRIMESTERS[0]!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          {t('marketing.pregnancy-beauty.title')}
        </h1>
        <p className="mt-2 text-text-secondary">{t('marketing.pregnancy-beauty.subtitle')}</p>
      </div>

      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {TRIMESTERS.map((tri) => (
          <button
            key={tri.key}
            onClick={() => setTrimester(tri.key)}
            className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all ${trimester === tri.key ? 'bg-brand-600 text-white' : 'bg-surface-muted hover:bg-gray-200'}`}
          >
            {tri.emoji} {t(tri.nameAr)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">
            {t('marketing.pregnancy-beauty.safe-ingredients-label')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {SAFE_INGREDIENTS.map((i) => (
              <span key={i} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                {t(i)}
              </span>
            ))}
          </div>
        </Card>
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">
            {t('marketing.pregnancy-beauty.avoid-ingredients-label')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {AVOID_INGREDIENTS.map((i) => (
              <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                {t(i)}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-6 text-center">
        {current.emoji} {t('marketing.pregnancy-beauty.tips-heading', { name: t(current.nameAr) })}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {current.tips.map((tip, i) => (
          <Card key={i} padding="md">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <h4 className="font-bold text-sm">{t(tip.title)}</h4>
                <p className="text-xs text-text-secondary mt-1">{t(tip.desc)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
