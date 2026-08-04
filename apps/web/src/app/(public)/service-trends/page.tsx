'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert } from '@galaxy/ui';

const CAT_COLORS: Record<string, string> = { makeup: '#C41E3A', skincare: '#059669', hair: '#8B5CF6', nails: '#F59E0B', massage: '#3B82F6' };

export default function ServiceTrendsPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = api.serviceTrends.trends.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const trends = (data?.monthly ?? []) as Array<Record<string,unknown>>;
  const top = (data?.top ?? []) as Array<Record<string,unknown>>;
  const cats = (data?.categories ?? []) as string[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center"><span className="text-6xl">📊</span><h1 className="mt-4 text-3xl font-bold">توجهات الخدمات</h1><p className="mt-2 text-text-secondary">اكتشفي أكثر الخدمات طلباً حسب الموسم</p></div>

      {isLoading ? <CardSkeleton /> : isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> : (
        <>
          <Card padding="lg" className="mb-6">
            <h3 className="font-bold mb-4">📈 الإقبال الشهري</h3>
            <div className="h-48 flex items-end gap-1">
              {trends.map((m: Record<string,unknown>) => (
                <div key={m.month as string} className="flex-1 flex flex-col items-center gap-1">
                  {cats.map((cat: string) => { const val = (m[cat] as number) || 0; return <div key={cat} style={{ height: `${val * 0.3}px`, backgroundColor: CAT_COLORS[cat] ?? '#999', width: `${80 / cats.length}%` }} className="rounded-t" />; })}
                  <span className="text-[9px] text-text-tertiary mt-1">{m.month as string}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">{cats.map((cat: string) => <div key={cat} className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded" style={{ backgroundColor: CAT_COLORS[cat] ?? '#999' }} /><span>{cat}</span></div>)}</div>
          </Card>

          <Card padding="lg"><h3 className="font-bold mb-4">🔥 الأكثر طلباً هذا الشهر</h3>
            <div className="space-y-2">{top.map((t: Record<string,unknown>, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-surface-muted dark:bg-gray-800 p-3">
                <span className="text-2xl w-10 text-center">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                <span className="text-2xl">{t.emoji as string}</span><span className="flex-1 font-bold">{t.nameAr as string}</span>
                <span className="rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-bold text-green-700">{t.growth as string}</span>
              </div>
            ))}</div>
          </Card>
        </>
      )}
    </div>
  );
}
