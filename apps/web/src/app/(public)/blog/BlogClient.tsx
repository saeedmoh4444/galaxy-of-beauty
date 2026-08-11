'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { CardSkeleton, ErrorAlert, EmptyState, Pagination } from '@galaxy/ui';

interface BlogPost {
  id: number;
  titleJson: Record<string, string>;
  bodyJson: Record<string, string>;
  slug: string;
  imageUrl: string | null;
  tags: string[];
  publishedAt: string | null;
}

const POSTS_PER_PAGE = 9;
const ALL_TAGS = [
  'العناية بالبشرة',
  'الشعر',
  'المكياج',
  'الأظافر',
  'العناية الشخصية',
  'نصائح',
  'اتجاهات',
  'صحة',
];

function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} دقائق قراءة`;
}

export function BlogClient({
  initialPosts,
  initialTotal,
}: {
  initialPosts: unknown[];
  initialTotal: number;
}): JSX.Element {
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = api.blog.list.useQuery({
    page,
    limit: POSTS_PER_PAGE,
    search: search || undefined,
  }) as {
    data: { items: BlogPost[]; total: number } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const posts: BlogPost[] = useMemo(
    () => data?.items ?? (isLoading ? (initialPosts as BlogPost[]) : []),
    [data?.items, isLoading],
  );
  const totalPages = data
    ? Math.ceil(data.total / POSTS_PER_PAGE)
    : Math.ceil(initialTotal / POSTS_PER_PAGE) || 1;

  const filteredPosts = activeTag ? posts.filter((p) => p.tags?.includes(activeTag)) : posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl">📝</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">
          مدونة الجمال
        </h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          نصائح، اتجاهات، وأسرار العناية بالجمال
        </p>
      </div>

      <div className="mb-4 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="🔍 ابحثي في المقالات..."
          className="w-full max-w-md rounded-xl border border-edge bg-surface-muted px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-text-secondary"
        />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            setActiveTag(null);
            setPage(1);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${!activeTag ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          الكل
        </button>
        {ALL_TAGS.slice(0, 8).map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setActiveTag(tag === activeTag ? null : tag);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${activeTag === tag ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading && !initialPosts.length ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل تحميل المقالات" onRetry={() => refetch()} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="لا توجد مقالات بعد"
          description="لم ننشر مقالات بعد. تابعي المدونة قريباً! 📝"
        />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title={`لا توجد مقالات في "${activeTag}"`}
          description="جربي تصفية بوسم آخر"
          action={{ label: 'عرض الكل', onPress: () => setActiveTag(null) }}
        />
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const title = post.titleJson?.ar ?? post.titleJson?.en ?? '';
              const body = post.bodyJson?.ar ?? post.bodyJson?.en ?? '';
              const date = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '';
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="overflow-hidden rounded-2xl border border-edge bg-white transition-all hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
                    <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <span>✨</span>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-bold text-text-primary group-hover:text-brand-600 dark:text-gray-100 line-clamp-2">
                        {title}
                      </h2>
                      <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
                        {date && <span>📅 {date}</span>}
                        {body && <span>⏱️ {readingTime(body)}</span>}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
