'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert } from '@galaxy/ui';
import Link from 'next/link';

export default function TechLeaderboardPage(): JSX.Element {
  const [category, setCategory] = useState('rating');
  const { data: cats } = api.techLeaderboard.categories.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const {
    data: list,
    isLoading,
    isError,
    refetch,
  } = api.techLeaderboard.leaderboard.useQuery({ category }) as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const categories = (cats ?? []) as Array<Record<string, unknown>>;
  const items = list ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl">🏆</span>
        <h1 className="mt-4 text-3xl font-bold">لوحة المتصدرين</h1>
        <p className="mt-2 text-text-secondary">أفضل الفنيات في منصتنا</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map((c: Record<string, unknown>) => (
          <button
            key={c.key as string}
            onClick={() => setCategory(c.key as string)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${category === c.key ? 'bg-brand-600 text-white' : 'bg-surface-muted dark:bg-gray-800'}`}
          >
            {c.emoji as string} {c.nameAr as string}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-3">
          {items.map((t: Record<string, unknown>, idx: number) => (
            <Link key={t.id as number} href={`/technicians/${t.id}`}>
              <Card padding="md" className="flex items-center gap-4 hover:shadow-md transition-all">
                <span className="text-2xl w-10 text-center font-bold">
                  {[, '🥇', '🥈', '🥉'][idx + 1] ?? `#${idx + 1}`}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-purple-500 text-white font-bold">
                  {((t.name as string) || '')[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{t.name as string}</p>
                  <p className="text-xs text-text-secondary">
                    ⭐ {t.rating as number} · {t.reviewCount as number} مراجعة
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-600">
                    {category === 'bookings'
                      ? `${t.bookingCount as number} حجز`
                      : category === 'speed'
                        ? `${t.responseTime as number} د`
                        : `⭐ ${t.rating as number}`}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
