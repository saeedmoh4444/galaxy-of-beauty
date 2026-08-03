'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TIP_CATEGORIES = ['skincare','makeup','hair','wellness','all'];

export default function SocialPage(): JSX.Element {
  const { data: trending, isLoading: trLoading } = api.social.trending.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: spotlight, isLoading: spLoading } = api.social.spotlight.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: tipsData, isLoading: tipsLoading } = api.social.tips.useQuery({ page: 1 }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: lookbook, isLoading: lbLoading } = api.social.lookbook.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: feedData, isLoading: feedLoading } = api.social.feed.useQuery({ page: 1, limit: 12 }) as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const [tipCat, setTipCat] = useState('all');
  const tips = (tipsData ?? []).filter((t: Record<string,unknown>) => tipCat==='all' || (t.category as string)===tipCat);
  const feedItems = (feedData?.items as Array<Record<string,unknown>>) ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">🌟 مجتمع الجمال</h1><p className="mt-1 text-sm text-text-secondary">اكتشفي أحدث الصيحات والفنيات المميزات</p></div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trending Services */}
          <Card padding="lg"><h3 className="font-bold mb-3">🔥 الأكثر طلباً</h3>
            {trLoading ? <CardSkeleton/> : !(trending??[]).length ? <p className="text-sm text-text-tertiary">لا توجد بيانات</p> :
              <div className="space-y-2">{(trending??[]).slice(0,6).map((s: Record<string,unknown>) => (
                <div key={s.serviceId as number} className="flex items-center justify-between text-sm">
                  <span>{(s.titleJson as Record<string,string>)?.ar ?? `خدمة #${s.serviceId}`}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{s.bookingCount as number} حجز</span>
                </div>
              ))}</div>
            }
          </Card>

          {/* Technician Spotlight */}
          <Card padding="lg"><h3 className="font-bold mb-3">⭐ فنيات مميزات</h3>
            {spLoading ? <CardSkeleton/> : !(spotlight??[]).length ? <p className="text-sm text-text-tertiary">لا توجد بيانات</p> :
              <div className="space-y-3">{(spotlight??[]).map((t: Record<string,unknown>) => (
                <div key={t.id as number} className="flex items-center gap-3">
                  <span className="text-3xl">👩‍🎨</span>
                  <div><p className="font-bold text-sm">{t.name as string}</p><p className="text-xs text-text-secondary">{t.city as string} · ⭐{t.ratingAvg as number}</p></div>
                </div>
              ))}</div>
            }
          </Card>
        </div>

        {/* Beauty Tips */}
        <Card padding="lg"><h3 className="font-bold mb-3">💡 نصائح تجميلية</h3>
          <div className="flex gap-2 mb-4 flex-wrap">{TIP_CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setTipCat(c)} className={`rounded-full px-3 py-1 text-xs ${tipCat===c?'bg-brand-600 text-white':'bg-surface-muted'}`}>{c==='all'?'الكل':c==='skincare'?'عناية':c==='makeup'?'مكياج':c==='hair'?'شعر':'صحة'}</button>
          ))}</div>
          {tipsLoading ? <CardSkeleton/> : tips.length===0 ? <p className="text-sm text-text-tertiary">لا توجد نصائح</p> :
            <div className="grid gap-3 sm:grid-cols-2">{tips.map((t: Record<string,unknown>) => (
              <div key={t.id as string} className="rounded-lg border p-3">
                <p className="font-bold text-sm">{(t.titleAr as string) ?? t.id}</p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{(t.bodyAr as string) ?? ''}</p>
              </div>
            ))}</div>
          }
        </Card>

        {/* Lookbook */}
        {!lbLoading && (lookbook??[]).length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">📸 لوك بوك الموسم</h3>
          <div className="grid gap-3 sm:grid-cols-4">{(lookbook??[]).map((l: Record<string,unknown>) => (
            <div key={l.id as string} className="rounded-lg border p-2 text-center">
              <span className="text-3xl">📸</span>
              <p className="text-xs font-bold mt-1">{(l.titleAr as string) ?? l.id}</p>
            </div>
          ))}</div>
        </Card>}

        {/* Before/After Feed */}
        <Card padding="lg"><h3 className="font-bold mb-3">📷 قبل وبعد</h3>
          {feedLoading ? <CardSkeleton/> : feedItems.length===0 ? <p className="text-sm text-text-tertiary">لا توجد صور</p> :
            <div className="grid gap-3 sm:grid-cols-3">{feedItems.map((f: Record<string,unknown>) => (
              <div key={f.id as number} className="rounded-lg border p-2 text-center">
                <span className="text-3xl">📷</span>
                <p className="text-xs mt-1">{(f.technician as Record<string,unknown>)?.city as string ?? ''}</p>
                <p className="text-xs text-text-tertiary">{((f.technician as Record<string,unknown>)?.user as Record<string,unknown>)?.name as string ?? ''}</p>
              </div>
            ))}</div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
}
