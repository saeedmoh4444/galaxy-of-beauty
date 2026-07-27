import Link from 'next/link';
import { getServerCaller } from '@/lib/server-trpc';

export default async function CampaignsPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let active: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let upcoming: any[] = [];
  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [a, u] = await Promise.all([caller.campaigns.active() as any, caller.campaigns.upcoming() as any]);
    active = a; upcoming = u;
  } catch { /* empty */ }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">العروض والحملات</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">عروض الموسم وخصومات حصرية — لفترة محدودة!</p>
      </div>

      {/* Active campaigns */}
      {active.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">🔥 عروض نشطة الآن</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((c: Record<string, any>) => {
              const name = (c.nameJson as Record<string, string>)?.ar || '';
              const desc = (c.descriptionJson as Record<string, string>)?.ar || '';
              const endsAt = c.endsAt ? new Date(c.endsAt).toLocaleDateString('ar-SA') : '';
              return (
                <div key={c.id} className="relative overflow-hidden rounded-2xl border-2 border-red-200 bg-white dark:border-red-800 dark:bg-gray-900">
                  <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">نشط</div>
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-red-100 to-amber-100 text-5xl dark:from-red-950 dark:to-amber-950">
                    {c.imageUrl ? <img src={c.imageUrl} alt={name} className="h-full w-full object-cover" /> : <span>🎉</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{name}</h3>
                    {desc && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{desc}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">
                        {c.discountType === 'percent' ? `-${Number(c.discountValue)}%` : `-${Number(c.discountValue)} ر.س`}
                      </span>
                      <span className="text-xs text-gray-400">حتى {endsAt}</span>
                    </div>
                    {c.promoCode && <p className="mt-2 rounded bg-gray-100 px-3 py-1 text-center font-mono text-sm dark:bg-gray-800">كود: {c.promoCode}</p>}
                    <Link href="/services" className="mt-3 block w-full rounded-lg bg-brand-600 py-2 text-center text-sm font-medium text-white hover:bg-brand-700">
                      استفيدي من العرض
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">📅 قريباً</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c: Record<string, any>) => {
              const name = (c.nameJson as Record<string, string>)?.ar || '';
              const startsAt = c.startsAt ? new Date(c.startsAt).toLocaleDateString('ar-SA') : '';
              return (
                <div key={c.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white opacity-70 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-5xl dark:from-blue-950 dark:to-purple-950">
                    <span>📅</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{name}</h3>
                    <p className="mt-2 text-sm text-brand-600">يبدأ {startsAt}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active.length === 0 && upcoming.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          <span className="text-5xl">🎉</span>
          <p className="mt-4">لا توجد حملات نشطة حالياً. تابعينا للموسم القادم!</p>
          <Link href="/services" className="mt-4 inline-block text-brand-600 hover:underline">تصفحي الخدمات</Link>
        </div>
      )}
    </div>
  );
}
