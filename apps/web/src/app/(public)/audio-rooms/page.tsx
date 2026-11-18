import type { JSX } from 'react';
import type { Metadata } from 'next';
import { t } from '@galaxy/shared/i18n/web-server';
import { getServerLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { AudioRoomsClient } from './AudioRoomsClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.audio-rooms.title', 'ar'),
    titleEn: t('marketing.audio-rooms.title', 'en'),
    descriptionAr: t('marketing.audio-rooms.subtitle', 'ar'),
    descriptionEn: t('marketing.audio-rooms.subtitle', 'en'),
    path: 'C:/Program Files/Git/audio-rooms',
  });
}

export default function AudioRoomsPage(): JSX.Element {
  return <AudioRoomsClient />;
}
