'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Pagination } from '@galaxy/ui';

interface Tutorial {
  id: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  videoUrl: string;
  duration: string;
  category: string;
  difficulty: string;
  thumbnailUrl: string | null;
  tags: string[];
  authorName: string;
  authorTitleAr: string;
  views: number;
  likes: number;
}

interface FilterMeta {
  key: string;
  nameAr: string;
  nameEn: string;
  emoji?: string;
  color?: string;
}

const TUTORIALS_PER_PAGE = 9;

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function TutorialsPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const { data: filtersData } = api.tutorials.filters.useQuery() as {
    data: { categories: FilterMeta[]; difficulties: FilterMeta[] } | undefined;
  };
  const { data, isLoading, isError, refetch } = api.tutorials.list.useQuery(
    { page, limit: TUTORIALS_PER_PAGE, category, difficulty, search: search || undefined },
  ) as { data: { items: Tutorial[]; total: number } | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const tutorials: Tutorial[] = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.total / TUTORIALS_PER_PAGE) : 1;
  const categories: FilterMeta[] = filtersData?.categories ?? [];
  const difficulties: FilterMeta[] = filtersData?.difficulties ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-6xl">📹</span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">دروس الجمال</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          تعلمي أسرار الجمال من خبراء معتمدين — دروس بالفيديو خطوة بخطوة
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 ابحثي في الدروس..."
          className="w-full max-w-md rounded-xl border border-edge bg-surface-muted px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-text-secondary"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { setCategory(undefined); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              !category ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button key={c.key}
              onClick={() => { setCategory(c.key === category ? undefined : c.key); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                category === c.key ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {c.emoji} {c.nameAr}
            </button>
          ))}
        </div>
        {/* Difficulty filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {difficulties.map((d) => (
            <button key={d.key}
              onClick={() => { setDifficulty(d.key === difficulty ? undefined : d.key); setPage(1); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                difficulty === d.key
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
                  : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {d.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الدروس" onRetry={() => refetch()} />
      ) : tutorials.length === 0 ? (
        <EmptyState
          title={category || difficulty ? 'لا توجد دروس تطابق الفلتر' : 'لا توجد دروس بعد'}
          description={category || difficulty ? 'جربي تغيير معايير التصفية' : 'لم ننشر أي دروس بعد. تابعي الصفحة قريباً!'}
          action={category || difficulty ? { label: 'عرض الكل', onPress: () => { setCategory(undefined); setDifficulty(undefined); } } : undefined}
        />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((t) => (
              <Link key={t.id} href={`/tutorials/${t.id}`} className="group">
                <Card padding="none" className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    {t.thumbnailUrl ? (
                      <img src={t.thumbnailUrl} alt={t.titleAr} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="text-center text-white/60">
                        <span className="text-5xl block">📹</span>
                        <span className="text-xs mt-1 block">{t.category}</span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-text-primary shadow-lg transition-transform group-hover:scale-110">
                        <svg className="h-5 w-5 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                      {t.duration}
                    </span>
                  </div>

                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-base font-bold text-text-primary dark:text-gray-100 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {t.titleAr}
                    </h3>

                    {/* Author */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600 dark:bg-brand-900">
                        {t.authorName[0]}
                      </div>
                      <span className="text-xs text-text-secondary">{t.authorName}</span>
                    </div>

                    {/* Meta row */}
                    <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                      <span>{formatViews(t.views)} مشاهدة</span>
                      <span>❤️ {t.likes}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
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
