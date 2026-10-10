import type { JSX } from 'react';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BlogClient } from './BlogClient';
import { t } from '@galaxy/shared/i18n/web-server';
import { pageMeta } from '@/lib/seo';
import { getServerLocale } from '@/lib/i18n';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return pageMeta({
    locale,
    titleAr: t('marketing.blog.title', 'ar'),
    titleEn: t('marketing.blog.title', 'en'),
    descriptionAr: t('marketing.blog.subtitle', 'ar'),
    descriptionEn: t('marketing.blog.subtitle', 'en'),
    path: '/blog',
  });
}

export default async function BlogPage(): Promise<JSX.Element> {
  let initialPosts: unknown[] = [];
  let initialTotal = 0;

  try {
    const caller = await getServerCaller();
    const result = await caller.blog.list({ page: 1, limit: 9 });
    initialPosts = serializeForClient(result.items ?? []);
    initialTotal = serializeForClient(result.total ?? 0);
  } catch {
    /* client will retry */
  }

  return <BlogClient initialPosts={initialPosts} initialTotal={initialTotal} />;
}
