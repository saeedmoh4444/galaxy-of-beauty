import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { LookbookClient } from './LookbookClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.lookbook.title', 'ar'),
    titleEn: t('marketing.lookbook.title', 'en'),
    descriptionAr: t('marketing.lookbook.subtitle', 'ar'),
    descriptionEn: t('marketing.lookbook.subtitle', 'en'),
    path: 'C:/Program Files/Git/lookbook',
  });
}

export default function LookbookPage(): JSX.Element {
  return <LookbookClient />;
}
