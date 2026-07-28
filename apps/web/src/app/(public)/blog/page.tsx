'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { CardSkeleton, ErrorAlert, EmptyState, Button, Pagination } from '@galaxy/shared';

interface BlogPost {
  id: number;
  titleJson: Record<string, string>;
  bodyJson: Record<string, string>;
  slug: string;
  imageUrl: string | null;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const POSTS_PER_PAGE = 9;
const ALL_TAGS = ['العناية بالبشرة', 'الشعر', 'المكياج', 'الأظافر', 'العناية الشخصية', 'نصائح', 'اتجاهات', 'صحة'];
const TAG_EMOJIS: Record<string, string> = {
  'العناية بالبشرة': '✨', 'الشعر': '💇‍♀️', 'المكياج': '💄', 'الأظافر': '💅', 'العناية الشخصية': '🧖‍♀️', 'نصائح': '💡', 'اتجاهات': '🔥', 'صحة': '💚',
};

function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} دقائق قراءة`;
}

export default function BlogPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = api.blog.list.useQuery(
    { page, limit: POSTS_PER_PAGE },
  ) as { data: { items: BlogPost[]; total: number } | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const posts: BlogPost[] = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / POSTS_PER_PAGE) : 1;

  // Collect unique tags from all posts
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
    // Also add known tags that might appear in other pages
    ALL_TAGS.forEach((t) => tagSet.add(t));
    return Array.from(tagSet);
  }, [posts]);

  const filteredPosts = activeTag ? posts.filter((p) => p.tags?.includes(activeTag)) : posts;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl">📝</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">مدونة الجمال</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          نصائح، اتجاهات، وأسرار العناية بالجمال — كل ما تحتاجين معرفته
        </p>
      </div>

      {/* Tag Filter */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => { setActiveTag(null); setPage(1); }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            !activeTag
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          الكل
        </button>
        {availableTags.slice(0, 8).map((tag) => {
          const emoji = TAG_EMOJIS[tag] ?? '🏷️';
          return (
            <button
              key={tag}
              onClick={() => { setActiveTag(tag === activeTag ? null : tag); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTag === tag
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {emoji} {tag}
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
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
                ? new Date(post.publishedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
                : '';
              const readTime = body ? readingTime(body) : '';

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900">
                    {/* Image */}
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
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              onClick={(e) => { e.preventDefault(); setActiveTag(t); }}
                              className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 hover:bg-brand-100 dark:bg-brand-950 dark:hover:bg-brand-900 cursor-pointer transition-colors"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 dark:text-gray-100 transition-colors line-clamp-2">
                        {title}
                      </h2>

                      {/* Meta */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                        {date && <span>📅 {date}</span>}
                        {readTime && <span>⏱️ {readTime}</span>}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
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
