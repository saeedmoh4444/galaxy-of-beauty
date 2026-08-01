'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechLeaderboardPage(): JSX.Element {
  const { data: categories } = api.techLeaderboard.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const [category, setCategory] = useState('rating');
  const { data: board, isLoading } = api.techLeaderboard.leaderboard.useQuery({ category, limit: 10 }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div><h1 className="text-2xl font-bold">🏆 لوحة المتصدرات</h1><p className="mt-1 text-sm text-gray-500">أفضل الفنيات في جالكسي بيوتي</p></div>

        <Card padding="lg">
          <div className="flex flex-wrap gap-2 mb-4">{(categories??[]).map((c: Record<string,unknown>) => (
            <button key={c.key as string} onClick={() => setCategory(c.key as string)} className={`rounded-full px-4 py-2 text-sm transition-all ${category===c.key?'bg-brand-600 text-white':'bg-gray-100'}`}>{c.emoji as string} {c.nameAr as string}</button>
          ))}</div>
        </Card>

        {isLoading ? <CardSkeleton/> : !(board??[]).length ? <Card padding="lg" className="text-center py-8"><p className="text-gray-500">لا توجد بيانات</p></Card> :
          <div className="space-y-2">{(board??[]).map((t: Record<string,unknown>, i: number) => {
            const medals = ['🥇','🥈','🥉'];
            return (
              <Card key={t.id as number} padding="md">
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{i < 3 ? medals[i] : `#${i+1}`}</span>
                  <span className="text-3xl">👩‍🎨</span>
                  <div className="flex-1"><p className="font-bold">{t.name as string}</p><p className="text-xs text-gray-500">⭐{t.rating as number} · {t.totalBookings as number} حجز</p></div>
                  {category === 'rating' && <span className="font-bold text-amber-600">⭐{t.rating as number}</span>}
                  {category === 'bookings' && <span className="font-bold text-blue-600">{t.totalBookings as number} حجز</span>}
                </div>
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
