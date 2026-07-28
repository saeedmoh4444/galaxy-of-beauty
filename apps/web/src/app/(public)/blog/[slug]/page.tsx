'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { ErrorAlert, Button } from '@galaxy/shared';
import { ShareButtons } from '@/components/ShareButtons';

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

export default function BlogPostPage(): JSX.Element {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: post, isLoading, isError, refetch } = api.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug },
  ) as { data: BlogPost | null | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  if (!slug) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl">📝</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">رابط غير صالح</h1>
        <Link href="/blog" className="mt-4 inline-block"><Button size="sm">العودة للمدونة</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-64 w-full rounded-2xl bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <ErrorAlert message="فشل تحميل المقال" onRetry={() => refetch()} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl">📝</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">المقال غير موجود</h1>
        <p className="mt-2 text-gray-500">ربما تم حذفه أو نقله</p>
        <Link href="/blog" className="mt-4 inline-block"><Button size="sm">العودة للمدونة</Button></Link>
      </div>
    );
  }

  const title = post.titleJson?.ar ?? post.titleJson?.en ?? '';
  const body = post.bodyJson?.ar ?? post.bodyJson?.en ?? '';
  const tags: string[] = post.tags ?? [];
  const readTime = readingTime(body);
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ar-SA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 transition-colors font-medium"
      >
        ← العودة للمدونة
      </Link>

      <article className="mt-6">
        {/* Hero Image */}
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={title}
            className="mb-8 h-64 w-full rounded-2xl object-cover shadow-lg sm:h-80"
          />
        ) : (
          <div className="mb-8 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 text-7xl dark:from-brand-900 dark:to-accent-900 sm:h-64">
            ✨
          </div>
        )}

        {/* Tags */}
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

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl leading-tight">
          {title}
        </h1>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {date && <span>📅 {date}</span>}
          <span>⏱️ {readTime} قراءة</span>
        </div>

        {/* Body */}
        <div
          className="prose prose-brand mt-8 max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-a:text-brand-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        {/* Share */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            📤 أعجبكِ المقال؟ شاركيه مع صديقاتكِ
          </p>
          <ShareButtons title={title} />
        </div>
      </article>

      {/* Back to Blog */}
      <div className="mt-10 text-center">
        <Link href="/blog">
          <Button variant="ghost" size="sm">← تصفحي المزيد من المقالات</Button>
        </Link>
      </div>
    </div>
  );
}
