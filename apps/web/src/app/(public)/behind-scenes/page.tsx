import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BehindScenesClient } from './BehindScenesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.behind-scenes.title', 'ar'),
    titleEn: t('marketing.behind-scenes.title', 'en'),
    descriptionAr: t('marketing.behind-scenes.subtitle', 'ar'),
    descriptionEn: t('marketing.behind-scenes.subtitle', 'en'),
    path: '/behind-scenes',
  });
}

export default function BehindScenesPage(): JSX.Element {
  return <BehindScenesClient />;
}
