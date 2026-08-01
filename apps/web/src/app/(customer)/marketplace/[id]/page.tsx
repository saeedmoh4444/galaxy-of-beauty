'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const { data: product, isLoading } = api.marketplace.productDetail.useQuery({ id: pid }, { enabled: !isNaN(pid) }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: reviewsData } = api.marketplace.productReviews.useQuery({ productId: pid }, { enabled: !isNaN(pid) }) as { data: Record<string,unknown> | undefined };
  const addToCartMut = api.marketplace.addToCart.useMutation();
  const addReviewMut = api.marketplace.addReview.useMutation();
  const [rating, setRating] = useState(5); const [comment, setComment] = useState('');
  const reviews = (reviewsData?.items as Array<Record<string,unknown>>) ?? [];
  const p = product;

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        {isLoading ? <CardSkeleton/> : !p ? <Card padding="lg" className="text-center py-8"><p className="text-gray-500">المنتج غير موجود</p></Card> : (
          <>
            <Card padding="lg" className="text-center">
              <span className="text-6xl">🧴</span>
              <h1 className="text-2xl font-bold mt-4">{(p.nameJson as Record<string,string>)?.ar}</h1>
              <p className="text-sm text-gray-500 mt-1">{p.brand as string} · {p.price ? formatCurrency(Number(p.price)) : ''}</p>
              <p className="text-sm text-gray-600 mt-3">{p.description as string ?? ''}</p>
              <Button onClick={() => addToCartMut.mutate({ productId: pid })} loading={addToCartMut.isPending} className="mt-4">🛒 أضيفي للسلة — {formatCurrency(Number(p.price ?? 0))}</Button>
            </Card>

            <Card padding="lg"><h3 className="font-bold mb-3">⭐ تقييمات ({reviews.length})</h3>
              {reviews.length === 0 && <p className="text-sm text-gray-400">لا توجد تقييمات بعد</p>}
              <div className="space-y-3">{(reviews as Array<Record<string,unknown>>).map((r: Record<string,unknown>) => {
                const user = r.user as Record<string,unknown> | undefined;
                return <div key={r.id as number} className="border-b pb-3"><div className="flex items-center gap-2"><span className="text-yellow-500">{'⭐'.repeat(r.rating as number)}</span><span className="text-xs text-gray-500">{user?.name as string}</span></div><p className="text-sm mt-1">{r.comment as string}</p></div>;
              })}</div>

              <div className="mt-4 pt-4 border-t"><h4 className="font-bold text-sm mb-2">✍️ أضيفي تقييمكِ</h4>
                <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} className={`text-xl ${n <= rating ? 'opacity-100' : 'opacity-30'}`}>⭐</button>)}</div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="تعليقكِ..." rows={2} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                <Button size="sm" onClick={() => { if(comment.trim()) addReviewMut.mutate({ productId: pid, rating, comment: comment.trim() }, { onSuccess: () => setComment('') }); }} loading={addReviewMut.isPending} className="mt-2">📝 تقييم</Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
