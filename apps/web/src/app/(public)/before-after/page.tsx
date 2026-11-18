import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { BeforeAfterClient } from './BeforeAfterClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.before-after.title', 'ar'),
    titleEn: t('marketing.before-after.title', 'en'),
    descriptionAr: t('marketing.before-after.subtitle', 'ar'),
    descriptionEn: t('marketing.before-after.subtitle', 'en'),
    path: 'C:/Program Files/Git/before-after',
  });
}

export default function BeforeAfterPage(): JSX.Element {
  return <BeforeAfterClient />;
}
