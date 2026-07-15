'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/shared';

export default function ServiceDetailPage(): JSX.Element {
  const params = useParams();
  const id = Number(params.id);
  const query = api.services.getById.useQuery({ id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relatedQuery = (api.services as any).getRelated.useQuery({ serviceId: id, limit: 4 }, { enabled: !isNaN(id) });
  const data = query.data as unknown as Record<string, unknown> | undefined;
  const related = (relatedQuery.data as Array<Record<string, unknown>>) || [];

  if (query.isLoading) return <div className="mx-auto max-w-4xl px-4 py-8"><CardSkeleton /></div>;
  if (query.isError || !data) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorAlert message="فشل تحميل الخدمة" onRetry={() => query.refetch()} /></div>;

  const svc = data;
  const title = (svc.titleJson as Record<string, string>)?.ar ?? '';
  const desc = (svc.descriptionJson as Record<string, string>)?.ar ?? '';
  const variants = (svc.variants as Record<string, unknown>[]) ?? [];
  const techs = (svc.technicianServices as Record<string, unknown>[]) ?? [];
  const tags = (svc.tags as Array<{ tag: { nameJson: Record<string, string> } }>) ?? [];
  const cat = (svc.category as Record<string, unknown>) ?? {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero */}
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-200 to-accent-200 dark:from-brand-900 dark:to-accent-900">
        <span className="text-6xl">💄</span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={i} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {(t.tag.nameJson as Record<string, string>)?.ar || ''}
            </span>
          ))}
        </div>
      )}

      <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{cat.nameAr as string || ''}</p>
      {desc && <p className="mt-3 text-gray-600 dark:text-gray-400">{desc}</p>}

      <div className="mt-6 flex gap-8">
        <div><span className="text-sm text-gray-500">السعر</span><p className="text-2xl font-bold text-brand-600">{formatCurrency(Number(svc.basePrice))}</p></div>
        <div><span className="text-sm text-gray-500">المدة</span><p className="text-2xl font-bold">{svc.durationMin as number} دقيقة</p></div>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">الخيارات</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v: Record<string, unknown>) => (
              <span key={v.id as number} className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                {(v.nameJson as Record<string, string>)?.ar}
                {Number(v.priceDelta) > 0 ? ` (+${formatCurrency(Number(v.priceDelta))})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex gap-3">
        <Link href={`/customer/bookings/create?serviceId=${id}`}>
          <Button size="lg">احجزي الآن</Button>
        </Link>
        <Link href={`/compare?ids=${id}`}>
          <Button size="lg" variant="outline">مقارنة</Button>
        </Link>
      </div>

      {/* Technicians */}
      {techs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">الفنيات المتاحات</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {techs.map((ts: Record<string, unknown>) => {
              const tech = (ts.technician as Record<string, unknown>) ?? {};
              const user = (tech.user as Record<string, string>) ?? {};
              return (
                <Card key={ts.id as number} padding="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        {tech.city as string} · ⭐ {Number(tech.ratingAvg ?? 0).toFixed(1)}
                      </p>
                      {tech.bioJson ? (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                          {((tech.bioJson as Record<string, string>)?.ar) || ''}
                        </p>
                      ) : null}
                    </div>
                    <Link href={`/customer/bookings/create?serviceId=${id}`}>
                      <Button size="sm">احجز</Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {techs.length === 0 && (
        <div className="mt-8">
          <EmptyState title="لا توجد فنيات متاحة لهذه الخدمة حالياً" />
        </div>
      )}

      {/* Related Services */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">خدمات مشابهة</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.id as number} href={`/services/${r.id}`}>
                <Card hover padding="sm">
                  <div className="flex h-24 items-center justify-center rounded-lg bg-gray-100 text-3xl dark:bg-gray-800">💄</div>
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {((r.titleJson as Record<string, string>)?.ar) || ''}
                  </p>
                  <p className="text-xs font-bold text-brand-600 mt-1">{formatCurrency(Number(r.basePrice))}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
