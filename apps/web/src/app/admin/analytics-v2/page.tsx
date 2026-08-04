'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/ui';

export default function AdminAnalyticsV2Page(): JSX.Element {
  const { data, isLoading } = api.adminAnalyticsV2.dashboard.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const d = data ?? {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      <div><h1 className="text-2xl font-bold">📊 التحليلات المتقدمة</h1></div>
      {isLoading ? <div className="grid gap-4 sm:grid-cols-4">{Array.from({length:4},(_,i)=><CardSkeleton key={i}/>)}</div> :
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Card padding="lg" className="text-center"><p className="text-3xl">💰</p><p className="text-2xl font-bold text-brand-600">{formatCurrency((d.revenue as Record<string,number>)?.today ?? 0)}</p><p className="text-xs text-text-secondary">إيراد اليوم</p></Card>
            <Card padding="lg" className="text-center"><p className="text-3xl">📅</p><p className="text-2xl font-bold">{(d.bookings as Record<string,number>)?.today ?? 0}</p><p className="text-xs text-text-secondary">حجز اليوم</p></Card>
            <Card padding="lg" className="text-center"><p className="text-3xl">👥</p><p className="text-2xl font-bold">{(d.users as Record<string,number>)?.activeToday ?? 0}</p><p className="text-xs text-text-secondary">مستخدم نشط</p></Card>
            <Card padding="lg" className="text-center"><p className="text-3xl">👩‍🎨</p><p className="text-2xl font-bold">{(d.technicians as Record<string,number>)?.active ?? 0}</p><p className="text-xs text-text-secondary">فنية نشطة</p></Card>
          </div>
          <Card padding="lg"><h3 className="font-bold mb-4">📈 الإيرادات الأسبوعية</h3>
            <div className="flex items-end gap-2 h-32">{(d.revenue as Record<string,number[]>)?.chart?.map((v: number, i: number) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t bg-gradient-to-t from-brand-400 to-brand-600" style={{ height: `${Math.max(4, (v / 600) * 100)}%` }} /><span className="text-[9px] text-text-tertiary">{v}</span></div>)}</div>
          </Card>
          <Card padding="lg"><h3 className="font-bold mb-4">🔥 الخدمات الأعلى</h3>
            <div className="space-y-2">{(d.topServices as Array<Record<string,unknown>>)?.map((s: Record<string,unknown>, i: number) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-surface-muted dark:bg-gray-800 p-3">
                <span className="text-xl w-8">#{i+1}</span><span className="flex-1 font-bold">{s.name as string}</span><span>{s.bookings as number} حجز</span><span className="text-green-600 font-bold ml-4">{formatCurrency(s.revenue as number)}</span><span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs">+{s.growth as number}%</span>
              </div>
            ))}</div>
          </Card>
          <Card padding="lg" className="text-center"><p className="font-bold">📊 توقعات الشهر القادم</p><p className="text-2xl font-extrabold text-brand-600 mt-2">{formatCurrency((d.forecast as Record<string,number>)?.nextMonthRevenue ?? 0)}</p><p className="text-xs text-text-secondary">نسبة الثقة: {(d.forecast as Record<string,number>)?.confidence ?? 0}%</p></Card>
        </>
      }
    </div>
  );
}
