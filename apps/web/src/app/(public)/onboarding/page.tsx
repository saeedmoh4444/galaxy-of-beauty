'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

const STEPS = [
  {
    title: 'marketing.onboarding.step-1-title',
    desc: 'marketing.onboarding.step-1-desc',
    action: 'marketing.onboarding.step-1-action',
    link: undefined,
  },
  {
    title: 'marketing.onboarding.step-2-title',
    desc: 'marketing.onboarding.step-2-desc',
    action: 'marketing.onboarding.step-2-action',
    link: '/services',
  },
  {
    title: 'marketing.onboarding.step-3-title',
    desc: 'marketing.onboarding.step-3-desc',
    action: 'marketing.onboarding.step-3-action',
    link: '/beauty-quiz',
  },
  {
    title: 'marketing.onboarding.step-4-title',
    desc: 'marketing.onboarding.step-4-desc',
    action: 'marketing.onboarding.step-4-action',
    link: '/bridal-concierge',
  },
  {
    title: 'marketing.onboarding.step-5-title',
    desc: 'marketing.onboarding.step-5-desc',
    action: 'marketing.onboarding.step-5-action',
    link: '/gift-cards',
  },
  {
    title: 'marketing.onboarding.step-6-title',
    desc: 'marketing.onboarding.step-6-desc',
    action: 'marketing.onboarding.step-6-action',
    link: '/bookings/create',
  },
] as const;

export default function OnboardingPage(): JSX.Element {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const s = STEPS[step]!;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-accent-50 px-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${i <= step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">{t(s.title)}</h1>
        <p className="mt-4 text-text-secondary dark:text-gray-400">{t(s.desc)}</p>
        <div className="mt-8 flex gap-3 justify-center">
          {s.link ? (
            <Link href={s.link}>
              <Button size="lg">{t(s.action)}</Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => setStep(step + 1)}>
              {t(s.action)}
            </Button>
          )}
        </div>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-4 text-sm text-text-tertiary hover:text-brand-600"
          >
            {t('marketing.onboarding.back')}
          </button>
        )}
        {!s.link && step < STEPS.length - 1 && (
          <button
            onClick={() => setStep(STEPS.length - 1)}
            className="mt-4 block w-full text-sm text-text-tertiary hover:text-brand-600"
          >
            {t('marketing.onboarding.skip')}
          </button>
        )}
      </Card>
    </div>
  );
}
