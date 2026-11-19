import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { OnboardingClient } from './OnboardingClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.onboarding.title', 'ar'),
    titleEn: t('marketing.onboarding.title', 'en'),
    descriptionAr: t('marketing.onboarding.subtitle', 'ar'),
    descriptionEn: t('marketing.onboarding.subtitle', 'en'),
    path: '/onboarding',
  });
}

export default function OnboardingPage(): JSX.Element {
  return <OnboardingClient />;
}
