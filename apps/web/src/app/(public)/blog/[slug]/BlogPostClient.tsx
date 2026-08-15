'use client';

import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/trpc';
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

function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} دقائق`;
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
  const {
    data: clientPost,
    isLoading,
    isError,
    refetch,
  } = (api as any).blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug, initialData: initialPost as BlogPost | null | undefined },
  ) as {
    data: BlogPost | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

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
        <h1 className="mt-4 text-2xl font-bold">رابط غير صالح</h1>
        <Link href="/blog" className="mt-4 inline-block">
          <Button size="sm">العودة للمدونة</Button>
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
        <ErrorAlert message="فشل تحميل المقال" onRetry={() => refetch()} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-2xl font-bold">المقال غير موجود</h1>
        <p className="mt-2 text-gray-500">ربما تم حذفه أو نقله</p>
        <Link href="/blog" className="mt-4 inline-block">
          <Button size="sm">العودة للمدونة</Button>
        </Link>
      </div>
    );
  }

  const title = (post as BlogPost).titleJson?.ar ?? (post as BlogPost).titleJson?.en ?? '';
  const body = (post as BlogPost).bodyJson?.ar ?? (post as BlogPost).bodyJson?.en ?? '';
  const tags: string[] = (post as BlogPost).tags ?? [];
  const readTime = readingTime(body);
  const date = (post as BlogPost).publishedAt
    ? new Date((post as BlogPost).publishedAt!).toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: 'المدونة', href: '/blog' }, { label: title || 'المقال' }]} />

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
          <span>️ {readTime} قراءة</span>
        </div>

        <div
          className="prose prose-brand mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold"> أعجبكِ المقال؟ شاركيه مع صديقاتكِ</p>
          <ShareButtons title={title} />
        </div>
      </article>

      <div className="mt-10 text-center">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            ← تصفحي المزيد من المقالات
          </Button>
        </Link>
      </div>
    </div>
  );
}
