import { getServerCaller } from '@/lib/server-trpc';
import { Card } from '@galaxy/shared';

export default async function EventsPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let events: any[] = [];
  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events = await caller.beautyEvents.upcoming() as any[];
  } catch { /* empty */ }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📅 الفعاليات والورش</h1>
        <p className="mt-2 text-gray-500">ورش عمل، ماستر كلاس، وفعاليات تجميل حصرية</p>
      </div>
      {events.length === 0 ? (
        <p className="mt-16 text-center text-gray-400">لا توجد فعاليات قادمة حالياً. تابعينا!</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e: Record<string, any>) => (
            <Card key={e.id} padding="lg">
              <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 text-5xl dark:from-purple-950 dark:to-pink-950">{e.imageUrl ? <img src={e.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" /> : <span>📅</span>}</div>
              <h3 className="mt-4 text-lg font-bold">{((e.nameJson as Record<string,string>)?.ar)}</h3>
              <p className="mt-1 text-sm text-gray-500">{new Date(e.startsAt).toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              {e.location && <p className="text-xs text-gray-400">{e.location}</p>}
              {e.price > 0 && <p className="mt-2 font-bold text-brand-600">{Number(e.price)} ر.س</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
