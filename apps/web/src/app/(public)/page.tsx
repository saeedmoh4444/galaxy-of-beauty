'use client';

import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState } from '@galaxy/shared';

export default function HomePage(): JSX.Element {
  const cats = api.categories.list.useQuery({} as never);
  const services = api.services.list.useQuery({ sort: 'popular', limit: 6 });
  const categories = (cats.data ?? []) as unknown as Record<string, unknown>[];
  const svcItems = (services.data?.items ?? []) as unknown as Record<string, unknown>[];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-24 text-center text-white">
        <h1 className="text-3xl font-extrabold md:text-5xl">اكتشفي جمالك مع أفضل الفنيات</h1>
        <p className="mt-4 text-lg text-brand-100">احجزي خدمات التجميل المنزلية بكل سهولة — شعر، بشرة، مكياج، مساج والمزيد</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/customer/bookings/create"><Button size="lg" className="bg-white !text-brand-700 hover:bg-gray-100">احجزي الآن</Button></Link>
          <Link href="/services/surprise-me"><Button size="lg" variant="outline" className="border-white !text-white hover:bg-white/10">🎲 فاجئيني</Button></Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">الأقسام</h2>
        {cats.isLoading && <div className="grid grid-cols-3 gap-4 md:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>}
        {cats.isError && <ErrorAlert message="فشل تحميل الأقسام" onRetry={() => cats.refetch()} />}
        {categories.length === 0 && <EmptyState title="لا توجد أقسام" />}
        {categories.length > 0 && (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id as number} href={`/services?categoryId=${c.id}`}>
                <Card hover padding="lg" className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl text-brand-600 dark:bg-brand-900">
                    {((c.nameJson as Record<string, string>)?.ar ?? '✨').charAt(0)}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{(c.nameJson as Record<string, string>)?.ar ?? ''}</h3>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Popular Services */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-2xl font-bold">الخدمات الأكثر طلباً</h2>
          {services.isLoading && <div className="grid gap-6 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>}
          {services.isError && <ErrorAlert message="فشل تحميل الخدمات" onRetry={() => services.refetch()} />}
          {svcItems.length === 0 && <EmptyState title="لا توجد خدمات" />}
          {svcItems.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {svcItems.map((svc) => (
                <Link key={svc.id as number} href={`/services/${svc.id}`}>
                  <Card hover>
                    <div className="h-40 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900 dark:to-accent-900" />
                    <h3 className="mt-3 font-semibold">{(svc.titleJson as Record<string, string>)?.ar ?? ''}</h3>
                    <p className="mt-1 text-sm text-gray-500">{svc.durationMin as number} دقيقة</p>
                    <p className="mt-2 font-bold text-brand-600">{svc.basePrice as number} ر.س</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (() => { const d = (cats.data ?? []) as unknown as Record<string, unknown>[]; return { label: 'قسم تجميل', value: `+${d.length || 12}` }; })(),
            { label: 'خبيرة تجميل', value: '+500' },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (() => { const total = svcItems.length > 0 ? (services.data?.total as number) || 25 : 25; return { label: 'خدمة', value: `+${total}` }; })(),
            { label: 'مدينة سعودية', value: '+24' },
          ].map((s) => (
            <div key={s.label}><p className="text-3xl font-extrabold text-brand-600">{s.value}</p><p className="text-gray-500">{s.label}</p></div>
          ))}
        </div>
      </section>

    </div>
  );
}
