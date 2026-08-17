'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Button, Card, GridSkeleton, ErrorAlert, ar } from '@galaxy/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export interface SurpriseMePageData {
  initialService: AnyRecord | null;
}

export function SurpriseMeClient({ data }: { data: SurpriseMePageData }): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [service, setService] = useState<AnyRecord | null>(data.initialService);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickRandom = async () => {
    setLoading(true);
    setError('');
    try {
      api.services.list.useQuery({ sort: 'popular', page: 1, limit: 50 });
      // Wait briefly for the query — in production this would use api.services.list.fetch()
      const utils = api.useUtils();
      const result = await utils.services.list.fetch({
        sort: 'popular',
        page: 1,
        limit: 50,
      });
      const items = result?.items ?? [];
      if (items.length > 0) {
        setService(items[Math.floor(Math.random() * items.length)]);
      } else {
        setError('لم يتم العثور على خدمات');
      }
    } catch {
      setError('فشل تحميل المفاجأة');
    }
    setLoading(false);
  };

  const svc = service as AnyRecord | null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-8">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold text-text-primary dark:text-gray-100">فاجئيني</h1>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          لا تعرفين ماذا تختارين؟ دعينا نقترح عليكِ!
        </p>
      </div>

      {loading ? (
        <GridSkeleton count={1} />
      ) : error ? (
        <div className="space-y-4">
          <ErrorAlert message={error} onRetry={pickRandom} />
          {svc && <ServiceCard svc={svc} />}
        </div>
      ) : svc ? (
        <div className="space-y-6">
          <ServiceCard svc={svc} />
          <Button onClick={pickRandom} size="lg" className="mx-auto">
            اقتراح آخر
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-text-tertiary">لا توجد خدمات متاحة حالياً</p>
          <Link href="/services">
            <Button variant="outline">تصفحي الخدمات</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ svc }: { svc: AnyRecord }): JSX.Element {
  return (
    <Card padding="lg" className="mx-auto max-w-sm text-center">
      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900"></div>
      <h2 className="mt-4 text-xl font-bold text-text-primary dark:text-gray-100">
        {ar(svc.titleJson)}
      </h2>
      <p className="mt-2 text-sm text-text-secondary">{svc.durationMin} دقيقة</p>
      <p className="mt-2 text-2xl font-bold text-brand-600">
        {Number(svc.basePrice).toFixed(0)} ر.س
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <Link href={`/services/${svc.id}`}>
          <Button variant="outline">التفاصيل</Button>
        </Link>
        <Link href={`/bookings/create?serviceId=${svc.id}`}>
          <Button>احجزي الآن</Button>
        </Link>
      </div>
    </Card>
  );
}
