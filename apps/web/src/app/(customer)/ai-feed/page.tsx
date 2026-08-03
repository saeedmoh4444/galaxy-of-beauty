'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AiFeedPage(): JSX.Element {
  const { data: feed, isLoading } = api.aiFeatures.personalizedFeed.useQuery() as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const wishlistItems = (feed?.wishlistItems as Array<Record<string,unknown>>) ?? [];
  const recommendations = (feed?.recommendations as Array<Record<string,unknown>>) ?? [];
  const skinProfile = feed?.skinProfile as Record<string,unknown> | null;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">🤖 لكِ خصيصاً</h1><p className="mt-1 text-sm text-text-secondary">توصيات ذكية مبنية على تفضيلاتكِ</p></div>

        {isLoading ? <CardSkeleton/> : (
          <>
            {skinProfile && <Card padding="lg" className="border-2 border-purple-200 bg-purple-50"><div className="flex items-center gap-3"><span className="text-3xl">🔬</span><div><p className="font-bold text-purple-700">ملف بشرتكِ</p><p className="text-sm text-purple-600">نوع البشرة: {skinProfile.skinType as string} · الاهتمامات: {(skinProfile.concerns as string[])?.join('، ')}</p></div></div></Card>}

            {wishlistItems.length > 0 && <Card padding="lg"><h3 className="font-bold mb-3">💝 قائمة أمنياتكِ</h3><div className="grid gap-3 sm:grid-cols-2">{wishlistItems.map((w: Record<string,unknown>) => (
              <div key={w.id as number} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-bold text-sm">{(w.titleJson as Record<string,string>)?.ar ?? String(w.id)}</p><p className="text-xs text-text-secondary">{w.imageUrl ? '📸 متوفر' : '📋 خدمة'}</p></div>
                <span className="font-bold text-brand-600">{formatCurrency(w.basePrice as number)}</span>
              </div>
            ))}</div></Card>}

            {recommendations.length > 0 && <div>
              <h3 className="font-bold mb-3 text-lg">✨ مقترحة لكِ</h3>
              <div className="grid gap-4 sm:grid-cols-3">{recommendations.map((r: Record<string,unknown>) => (
                <Card key={r.id as number} padding="md" className="text-center">
                  <span className="text-3xl">💅</span>
                  <h4 className="font-bold mt-2 text-sm">{(r.titleJson as Record<string,string>)?.ar ?? `خدمة #${r.id}`}</h4>
                  <p className="text-xs text-text-secondary mt-1">{(r.category as Record<string,unknown>)?.nameJson ? ((r.category as Record<string,unknown>)?.nameJson as Record<string,string>)?.ar : ''}</p>
                  <p className="font-bold text-brand-600 mt-2">{formatCurrency(r.basePrice as number)}</p>
                </Card>
              ))}</div>
            </div>}

            {wishlistItems.length === 0 && recommendations.length === 0 && <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">🤖</p><p className="text-text-secondary">احجزي خدمات أكثر علشان نقدر نقترح لكِ الأفضل</p></Card>}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
