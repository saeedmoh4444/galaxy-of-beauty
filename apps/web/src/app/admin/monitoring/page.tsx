'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';

const STATUS_COLORS: Record<string, string> = { healthy: 'text-green-600 bg-green-100 dark:bg-green-900', warning: 'text-amber-600 bg-amber-100 dark:bg-amber-900', error: 'text-red-600 bg-red-100 dark:bg-red-900' };

export default function MonitoringPage(): JSX.Element {
  const { data: health, isLoading } = api.monitoring.health.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: errors } = api.monitoring.errorsFeed.useQuery() as { data: Record<string,unknown> | undefined };

  const h = health ?? {};
  const services = (h.services ?? {}) as Record<string, Record<string, unknown>>;
  const perf = (h.performance ?? {}) as Record<string, unknown>;
  const activity = (h.activity ?? {}) as Record<string, unknown>;
  const errData = (h.errors ?? {}) as Record<string, unknown>;
  const recentErrors = (errors?.recent ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
      <div><h1 className="text-2xl font-bold">📊 Monitoring Dashboard</h1><p className="mt-1 text-sm text-text-secondary">صحة المنصة في الوقت الحقيقي</p></div>

      {isLoading ? <div className="grid gap-4 sm:grid-cols-5">{Array.from({length:5},(_,i)=><CardSkeleton key={i}/>)}</div> : (
        <>
          {/* Service Status */}
          <div className="grid gap-4 sm:grid-cols-5">
            {Object.entries(services).map(([key, svc]) => (
              <Card key={key} padding="lg" className="text-center">
                <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full text-lg ${STATUS_COLORS[(svc.status as string) ?? 'healthy']}`}>
                  {svc.status === 'healthy' ? '✅' : '⚠️'}
                </span>
                <p className="font-bold text-sm mt-2">{key === 'database' ? '🗄️ قاعدة البيانات' : key === 'redis' ? '⚡ Redis' : key === 'api' ? '🔌 API' : key === 'socket' ? '📡 Socket.IO' : '💳 المدفوعات'}</p>
                <p className="text-xs text-text-secondary mt-1">{svc.latency as string}</p>
              </Card>
            ))}
          </div>

          {/* Performance */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card padding="lg" className="text-center"><p className="text-3xl">⚡</p><p className="text-2xl font-bold">{perf.avgResponseTime as string}</p><p className="text-xs text-text-secondary">متوسط الاستجابة</p></Card>
            <Card padding="lg" className="text-center"><p className="text-3xl">📊</p><p className="text-2xl font-bold">{perf.p95ResponseTime as string}</p><p className="text-xs text-text-secondary">p95</p></Card>
            <Card padding="lg" className="text-center"><p className="text-3xl">🐢</p><p className="text-2xl font-bold">{perf.p99ResponseTime as string}</p><p className="text-xs text-text-secondary">p99</p></Card>
          </div>

          {/* Errors */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="lg">
              <h3 className="font-bold mb-3">❌ الأخطاء (آخر ٢٤ ساعة: {errData.last24h as number})</h3>
              <div className="space-y-2">{(errData.byType as Array<Record<string,unknown>>)?.map((e: Record<string,unknown>, i: number) => (
                <div key={i} className="flex items-center gap-2"><span className="text-sm w-32">{e.type as string}</span><div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700"><div className="h-3 rounded-full bg-red-500" style={{ width: `${e.pct as number}%` }} /></div><span className="text-xs w-10">{e.count as number}</span></div>
              ))}</div>
            </Card>
            <Card padding="lg">
              <h3 className="font-bold mb-3">📋 الأخطاء الأخيرة</h3>
              <div className="space-y-2">{recentErrors.map((e: Record<string,unknown>, i: number) => (
                <div key={i} className={`rounded-lg p-2 text-xs ${(e.level as string) === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-700' : 'bg-amber-50 dark:bg-amber-950 text-amber-700'}`}>{e.message as string}<span className="block text-text-tertiary mt-0.5">{new Date(e.timestamp as string).toLocaleTimeString('ar-SA')}</span></div>
              ))}</div>
            </Card>
          </div>

          {/* Activity Chart */}
          <Card padding="lg">
            <h3 className="font-bold mb-4">📈 النشاط اليومي</h3>
            <div className="flex items-end gap-1 h-24">{(activity.chart as number[])?.map((v: number, i: number) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t bg-gradient-to-t from-brand-400 to-brand-600" style={{ height: `${Math.max(4, (v / 60) * 100)}%` }} /><span className="text-[8px] text-text-tertiary">{v}</span></div>)}</div>
          </Card>
        </>
      )}
    </div>
  );
}
