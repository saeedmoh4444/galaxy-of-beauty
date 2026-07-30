'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, ErrorAlert, formatCurrency } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';
import Link from 'next/link';

export default function WomensServicesPage(): JSX.Element {
  const { user } = useAuth();
  const { data: cats } = api.womensServices.categories.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: category, isLoading, isError, refetch } = api.womensServices.byCategory.useQuery(
    { category: selectedCat ?? '' },
    { enabled: !!selectedCat },
  ) as { data: Record<string,unknown> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: tips } = api.womensServices.safetyTips.useQuery(
    { category: selectedCat ?? '' },
    { enabled: !!selectedCat },
  ) as { data: string[] | undefined };

  const bookMut = api.womensServices.book.useMutation();
  const [bookingResult, setBookingResult] = useState<Record<string,unknown> | null>(null);

  const categories = (cats ?? []) as Array<Record<string,unknown>>;
  const subServices = (category?.subServices ?? []) as Array<Record<string,unknown>>;
  const safetyTips = tips ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl">🌸</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">خدمات نسائية</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          خدمات متخصصة للمرأة — عناية، جمال، وصحة في كل مرحلة من حياتكِ
        </p>
      </div>

      {bookingResult ? (
        <Card padding="lg" className="text-center border-2 border-green-300 dark:border-green-700">
          <span className="text-6xl">✅</span>
          <h2 className="mt-4 text-xl font-bold">تم الحجز!</h2>
          <p className="font-bold mt-1">{bookingResult.service as string}</p>
          <p className="text-2xl font-extrabold text-brand-600 mt-2">{formatCurrency(bookingResult.price as number)} ر.س</p>
          <p className="text-sm text-gray-500">⏱️ {bookingResult.durationMin as number} دقيقة</p>
          {((bookingResult.specialRequirements as string[])?.length ?? 0) > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-1">{(bookingResult.specialRequirements as string[]).map((r: string, i: number) => <span key={i} className="rounded-full bg-purple-100 dark:bg-purple-900 px-2 py-0.5 text-xs">{r}</span>)}</div>
          ) : null}
          <p className="text-sm text-green-600 mt-2">{bookingResult.message as string}</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setBookingResult(null); setSelectedCat(null); }}>🔄 عودة</Button>
        </Card>
      ) : !selectedCat ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c: Record<string,unknown>) => (
            <button key={c.key as string} onClick={() => setSelectedCat(c.key as string)}>
              <Card padding="lg" className="text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all">
                <span className="text-5xl">{c.emoji as string}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">{c.nameAr as string}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{c.description as string}</p>
                <span className="mt-3 inline-block rounded-full bg-brand-100 dark:bg-brand-900 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">{c.serviceCount as number} خدمات</span>
              </Card>
            </button>
          ))}
        </div>
      ) : isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل تحميل الخدمات" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedCat(null)} className="text-brand-600 hover:text-brand-700 text-sm font-medium">← العودة للأقسام</button>

          <Card padding="lg" className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-none">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{category?.emoji as string}</span>
              <div>
                <h2 className="text-xl font-bold">{category?.nameAr as string}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category?.description as string}</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {subServices.map((s: Record<string,unknown>) => (
              <Card key={s.id as string} padding="lg" className="flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{s.emoji as string}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{s.nameAr as string}</h3>
                    <p className="text-xs text-gray-500">{s.nameEn as string}</p>
                    {(s.precautions as string) ? <p className="text-xs text-amber-600 mt-0.5">⚠️ {s.precautions as string}</p> : null}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-600">{formatCurrency(s.price as number)} ر.س</p>
                  <p className="text-xs text-gray-400">{s.durationMin as number} دقيقة</p>
                  {user && (
                    <Button size="sm" className="mt-2" onClick={() => bookMut.mutate(
                      { serviceId: s.id as string, category: selectedCat as string },
                      { onSuccess: (d) => setBookingResult(d as Record<string,unknown>) },
                    )}>احجزي</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {safetyTips.length > 0 && (
            <Card padding="lg" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-none">
              <h3 className="font-bold mb-3 text-gray-900 dark:text-gray-100">💡 نصائح مهمة</h3>
              <div className="space-y-2">{safetyTips.map((tip: string, i: number) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400">✅ {tip}</p>
              ))}</div>
            </Card>
          )}

          {!user && (
            <div className="text-center">
              <Link href="/login"><Button size="lg">سجّلي دخول للحجز</Button></Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
