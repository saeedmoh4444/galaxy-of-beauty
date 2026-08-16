'use client';
import { api } from '@/lib/trpc';
import { Card, CardListSkeleton, GridSkeleton, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BeautyDiscoveryPage(): JSX.Element {
  const { data: featured, isLoading: fLoading } = api.beautyDiscovery.featured.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: forYou, isLoading: pLoading } = api.beautyDiscovery.forYou.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold"> اكتشفي</h1>
          <p className="mt-1 text-sm text-text-secondary">خدمات وعروض وفعاليات مخصصة لكِ</p>
        </div>

        {pLoading ? (
          <CardListSkeleton count={1} />
        ) : (
          (forYou?.profile as Record<string, unknown>) && (
            <Card padding="lg" className="border-2 border-purple-200 bg-purple-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl"></span>
                <div>
                  <p className="font-bold text-purple-700">ملفكِ الشخصي</p>
                  <p className="text-sm text-purple-600">
                    {(forYou!.profile as Record<string, unknown>).skinType as string} ·{' '}
                    {(forYou!.profile as Record<string, unknown>).hairType as string} ·{' '}
                    {((forYou!.profile as Record<string, unknown>).concerns as string[])?.join(
                      '، ',
                    )}
                  </p>
                </div>
              </div>
            </Card>
          )
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {fLoading ? (
            <CardListSkeleton count={4} />
          ) : (
            <Card padding="lg">
              <h3 className="font-bold mb-3"> الأكثر طلباً</h3>
              <div className="space-y-2">
                {(
                  (Array.isArray(featured?.popularServices)
                    ? featured?.popularServices
                    : []) as Array<Record<string, unknown>>
                ).map((s: Record<string, unknown>) => (
                  <div
                    key={s.id as number}
                    className="flex items-center justify-between rounded-lg border p-2 text-sm"
                  >
                    <span>
                      {s.emoji as string} {s.name as string}
                    </span>
                    <span className="font-bold">{formatCurrency(s.price as number)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pLoading ? (
            <CardListSkeleton count={4} />
          ) : (
            <Card padding="lg">
              <h3 className="font-bold mb-3"> لكِ خصيصاً</h3>
              {(forYou?.suggestions as Array<Record<string, unknown>>)?.length ? (
                <div className="space-y-2">
                  {(forYou?.suggestions as Array<Record<string, unknown>>).map(
                    (s: Record<string, unknown>) => (
                      <div
                        key={s.id as number}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <span>
                          {s.emoji as string} {s.name as string}
                        </span>
                        <span className="font-bold">{formatCurrency(s.price as number)}</span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">احجزي خدمات علشان نقدر نقترح لكِ</p>
              )}
            </Card>
          )}
        </div>

        {fLoading ? (
          <GridSkeleton count={4} />
        ) : (featured?.flashDeals as Array<Record<string, unknown>>)?.length ? (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> عروض فلاش</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(featured?.flashDeals as Array<Record<string, unknown>>)
                .slice(0, 4)
                .map((d: Record<string, unknown>) => (
                  <div key={d.id as number} className="rounded-lg border p-3">
                    <span className="font-bold">{(d.title as string) ?? `عرض #${d.id}`}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-text-tertiary line-through text-sm">
                        {formatCurrency(d.originalPrice as number)}
                      </span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(d.dealPrice as number)}
                      </span>
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        -{d.discount as number}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ) : null}

        {fLoading ? (
          <GridSkeleton count={4} />
        ) : (featured?.events as Array<Record<string, unknown>>)?.length ? (
          <Card padding="lg">
            <h3 className="font-bold mb-3"> فعاليات قادمة</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(featured?.events as Array<Record<string, unknown>>).map(
                (e: Record<string, unknown>) => (
                  <div key={e.id as number} className="rounded-lg border p-3">
                    <p className="font-bold text-sm">{e.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {e.type as string} · {e.location as string} ·{' '}
                      {new Date(e.date as string).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ),
              )}
            </div>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
