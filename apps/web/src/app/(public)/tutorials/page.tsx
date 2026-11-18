import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { TutorialsClient } from './TutorialsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.tutorials.title', 'ar'),
    titleEn: t('marketing.tutorials.title', 'en'),
    descriptionAr: t('marketing.tutorials.subtitle', 'ar'),
    descriptionEn: t('marketing.tutorials.subtitle', 'en'),
    path: 'C:/Program Files/Git/tutorials',
  });
}

export default function TutorialsPage(): JSX.Element {
  return <TutorialsClient />;
}
