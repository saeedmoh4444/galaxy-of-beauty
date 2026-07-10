'use client';

import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, formatCurrency } from '@galaxy/shared';

export default function ServiceDetailPage(): JSX.Element {
  const params = useParams();
  const id = Number(params.id);
  const query = api.services.getById.useQuery({ id });
  const data = query.data as unknown as Record<string, unknown> | undefined;

  if (query.isLoading) return <div className="mx-auto max-w-4xl px-4 py-8"><CardSkeleton /></div>;
  if (query.isError || !data) return <div className="mx-auto max-w-4xl px-4 py-8"><ErrorAlert message="فشل تحميل الخدمة" onRetry={() => query.refetch()} /></div>;

  const svc = data;
  const title = (svc.titleJson as Record<string, string>)?.ar ?? '';
  const desc = (svc.descriptionJson as Record<string, string>)?.ar ?? '';
  const variants = (svc.variants as Record<string, unknown>[]) ?? [];
  const techs = (svc.technicianServices as Record<string, unknown>[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="h-64 rounded-2xl bg-gradient-to-br from-brand-200 to-accent-200 dark:from-brand-900 dark:to-accent-900" />
      <h1 className="mt-6 text-3xl font-bold">{title}</h1>
      {desc && <p className="mt-2 text-gray-600 dark:text-gray-400">{desc}</p>}
      <div className="mt-4 flex gap-6">
        <div><span className="text-sm text-gray-500">السعر</span><p className="text-2xl font-bold text-brand-600">{formatCurrency(Number(svc.basePrice))}</p></div>
        <div><span className="text-sm text-gray-500">المدة</span><p className="text-2xl font-bold">{svc.durationMin as number} دقيقة</p></div>
      </div>

      {variants.length > 0 && <div className="mt-6"><h2 className="text-lg font-semibold">الخيارات</h2><div className="mt-2 flex flex-wrap gap-2">{variants.map((v: Record<string, unknown>) => <span key={v.id as number} className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">{(v.nameJson as Record<string, string>)?.ar} {Number(v.priceDelta) > 0 ? `(+${formatCurrency(Number(v.priceDelta))})` : ''}</span>)}</div></div>}

      {techs.length > 0 && <div className="mt-8"><h2 className="mb-4 text-lg font-semibold">الفنيات المتاحات</h2><div className="grid gap-4 md:grid-cols-2">{techs.map((ts: Record<string, unknown>) => {
        const tech = (ts.technician as Record<string, unknown>) ?? {};
        return <Card key={ts.id as number} padding="md"><div className="flex items-center justify-between"><div><p className="font-semibold">{(tech.user as Record<string, string>)?.name}</p><p className="text-sm text-gray-500">{tech.city as string} ⭐ {Number(tech.ratingAvg ?? 0).toFixed(1)}</p></div><Button size="sm" onClick={() => window.location.href = `/book?serviceId=${id}`}>احجز</Button></div></Card>;
      })}</div></div>}
      {techs.length === 0 && <div className="mt-8"><EmptyState title="لا توجد فنيات متاحة لهذه الخدمة حالياً" /></div>}
    </div>
  );
}
