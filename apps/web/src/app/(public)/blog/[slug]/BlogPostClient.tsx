'use client';

import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/trpc';
import type { RouterOutputs } from '@galaxy/api';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { ErrorAlert, Button } from '@galaxy/ui';
import { ShareButtons } from '@/components/ShareButtons';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface BlogPost {
  id: number;
  titleJson: Record<string, string>;
  bodyJson: Record<string, string>;
  slug: string;
  imageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
}

function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogPostClient({
  slug,
  initialPost,
  fetchError,
}: {
  slug: string;
  initialPost: Record<string, unknown> | null;
  fetchError?: string;
}): JSX.Element {
  const { t, locale } = useLocale();
  const {
    data: clientPost,
    isLoading,
    isError,
    refetch,
  } = api.blog.getBySlug.useQuery(
    { slug },
    {
      enabled: !!slug,
      initialData: initialPost as unknown as RouterOutputs['blog']['getBySlug'],
    },
  );

  const post = clientPost ?? (initialPost as BlogPost | null);

  if (fetchError && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <ErrorAlert message={fetchError} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-2xl font-bold">{t('marketing.blog-post.invalid-link')}</h1>
        <Link href="/blog" className="mt-4 inline-block">
          <Button size="sm">{t('marketing.blog-post.back-to-blog')}</Button>
        </Link>
      </div>
    );
  }

  if (isLoading && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (isError && !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <ErrorAlert message={t('marketing.blog-post.load-error')} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-2xl font-bold">{t('marketing.blog-post.not-found')}</h1>
        <p className="mt-2 text-gray-500">{t('marketing.blog-post.not-found-desc')}</p>
        <Link href="/blog" className="mt-4 inline-block">
          <Button size="sm">{t('marketing.blog-post.back-to-blog')}</Button>
        </Link>
      </div>
    );
  }

  const title = localize((post as BlogPost).titleJson, locale);
  const body = localize((post as BlogPost).bodyJson, locale);
  const tags: string[] = (post as BlogPost).tags ?? [];
  const readTime = readingMinutes(body);
  const date = (post as BlogPost).publishedAt
    ? new Date((post as BlogPost).publishedAt!).toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-GB',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      )
    : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: t('marketing.blog.title'), href: '/blog' },
          { label: title || t('marketing.blog-post.post') },
        ]}
      />

      <article className="mt-6">
        {(post as BlogPost).imageUrl ? (
          <Image
            src={(post as BlogPost).imageUrl!}
            alt={title}
            width={1200}
            height={640}
            className="mb-8 h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80"
          />
        ) : (
          <div className="mb-8 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 text-7xl dark:from-brand-900 dark:to-accent-900 sm:h-64"></div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100 transition-colors dark:bg-brand-950 dark:hover:bg-brand-900"
            >
              {t}
            </Link>
          ))}
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl leading-tight">
          {title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {date && <span> {date}</span>}
          <span>️ {t('marketing.blog-post.reading-time', { minutes: readTime })}</span>
        </div>

        <div
          className="prose prose-brand mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold">{t('marketing.blog-post.share-cta')}</p>
          <ShareButtons title={title} />
        </div>
      </article>

      <div className="mt-10 text-center">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            {t('marketing.blog-post.more-posts')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
