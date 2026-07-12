'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function ReviewsPage(): JSX.Element {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const { data, isLoading, isError, refetch } = api.bookings.list.useQuery({ limit: 50 });
  const createMut = api.reviews.create.useMutation({
    onSuccess: () => {
      setSelectedBookingId(null);
      setRating(0);
      setComment('');
      refetch();
    },
  });

  const bookings = (data?.bookings as unknown as Record<string, unknown>[]) ?? [];
  const reviewed = bookings.filter((b) => b.reviewId);
  const unreviewed = bookings.filter((b) => b.status === 'COMPLETED' && !b.reviewId);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">تقييماتي</h1>

        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل التقييمات" onRetry={() => refetch()} />
        ) : reviewed.length === 0 && unreviewed.length === 0 ? (
          <div>
            <EmptyState title="لا توجد تقييمات" description="قم بإكمال حجز لتتمكن من تقييم الخدمة" />
            <div className="text-center">
              <Link href="/services"><Button>تصفح الخدمات</Button></Link>
            </div>
          </div>
        ) : (
          <>
            {unreviewed.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">حجوزات مكتملة بدون تقييم</h2>
                {unreviewed.map((b: Record<string, unknown>) => (
                  <Card key={b.id as number} padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{b.serviceName as string ?? 'خدمة'}</p>
                        <p className="text-sm text-gray-500">{b.technicianName as string ?? 'فني'}</p>
                        <p className="text-xs text-gray-400">{new Date(b.startAt as string).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <Button size="sm" onClick={() => { setSelectedBookingId(b.id as number); setRating(0); setComment(''); }}>
                        تقييم
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">تقييماتي السابقة</h2>
              {reviewed.length === 0 ? (
                <EmptyState title="لا توجد تقييمات سابقة" />
              ) : (
                reviewed.map((b: Record<string, unknown>) => (
                  <Card key={b.id as number} padding="md">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{b.serviceName as string ?? 'خدمة'}</p>
                        <p className="text-sm text-gray-500">{b.technicianName as string ?? 'فني'}</p>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-lg ${i < (b.reviewRating as number ?? 0) ? 'text-amber-400' : 'text-gray-300'}`}>
                              &#9733;
                            </span>
                          ))}
                        </div>
                        {b.reviewComment ? <p className="text-sm text-gray-600 dark:text-gray-400">&ldquo;{b.reviewComment as string}&rdquo;</p> : null}
                        <p className="text-xs text-gray-400">{new Date(b.reviewDate as string ?? b.startAt as string).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <Modal open={selectedBookingId !== null} onClose={() => setSelectedBookingId(null)} title="تقييم الخدمة" size="sm">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">التقييم</p>
            <div className="flex gap-1">
              {RATING_OPTIONS.map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl transition-colors ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  &#9733;
                </button>
              ))}
            </div>
          </div>
          <Input
            label="التعليق"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شارك تجربتك مع هذه الخدمة..."
          />
          <Button
            className="w-full"
            disabled={rating === 0}
            loading={createMut.isPending}
            onClick={() => {
              if (selectedBookingId && rating > 0) {
                createMut.mutate({ bookingId: selectedBookingId, rating, comment });
              }
            }}
          >
            إرسال التقييم
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
