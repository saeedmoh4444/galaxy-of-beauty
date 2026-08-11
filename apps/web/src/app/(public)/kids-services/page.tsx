'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, formatCurrency } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import Link from 'next/link';

export default function KidsServicesPage(): JSX.Element {
  const { user } = useAuth();
  const { data: cats } = api.kidsServices.categories.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const {
    data: category,
    isLoading,
    isError,
    refetch,
  } = api.kidsServices.byCategory.useQuery(
    { category: selectedCat ?? '' },
    { enabled: !!selectedCat },
  ) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: tips } = api.kidsServices.safetyTips.useQuery() as { data: string[] | undefined };
  const bookMut = api.kidsServices.book.useMutation();
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(5);

  const categories = (cats ?? []) as Array<Record<string, unknown>>;
  const subServices = (category?.subServices ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-6xl">🧒</span>
        <h1 className="mt-4 text-3xl font-bold">خدمات الأطفال</h1>
        <p className="mt-2 text-text-secondary">
          عناية لطيفة وآمنة للصغار — من الرضع حتى المراهقات
        </p>
      </div>

      {result ? (
        <Card padding="lg" className="text-center border-2 border-green-300">
          <span className="text-6xl">✅</span>
          <h2 className="mt-4 text-xl font-bold">{result.message as string}</h2>
          <p className="text-2xl font-extrabold text-brand-600 mt-2">
            {formatCurrency(result.price as number)} ر.س
          </p>
          <p className="text-sm text-text-secondary mt-1">
            👶 {result.childName as string} · ⏱️ {result.durationMin as number} دقيقة ·{' '}
            {result.tip as string}
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setResult(null);
              setSelectedCat(null);
            }}
          >
            🔄 عودة
          </Button>
        </Card>
      ) : !selectedCat ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c: Record<string, unknown>) => (
            <button key={c.key as string} onClick={() => setSelectedCat(c.key as string)}>
              <Card
                padding="lg"
                className="text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className="text-5xl">{c.emoji as string}</span>
                <h3 className="mt-3 text-lg font-bold">{c.nameAr as string}</h3>
                <p className="mt-1 text-xs text-text-secondary">{c.description as string}</p>
                <span className="mt-3 inline-block rounded-full bg-brand-100 dark:bg-brand-900 px-3 py-1 text-xs font-medium text-brand-700">
                  {c.serviceCount as number} خدمات
                </span>
              </Card>
            </button>
          ))}
        </div>
      ) : isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCat(null)}
            className="text-brand-600 text-sm font-medium"
          >
            ← العودة
          </button>
          <Card
            padding="lg"
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none"
          >
            <span className="text-5xl">{category?.emoji as string}</span>
            <h2 className="text-xl font-bold mt-2">{category?.nameAr as string}</h2>
            <p className="text-sm text-text-secondary">{category?.description as string}</p>
          </Card>
          <div className="flex gap-3 items-end bg-surface-muted dark:bg-gray-800 rounded-xl p-4">
            <div>
              <label className="text-xs font-semibold">اسم الطفل</label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="الاسم..."
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">العمر</label>
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(parseInt(e.target.value) || 0)}
                min={0}
                max={17}
                className="w-20 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 mt-1"
              />
            </div>
          </div>
          <div className="space-y-3">
            {subServices.map((s: Record<string, unknown>) => (
              <Card key={s.id as string} padding="lg" className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{s.emoji as string}</span>
                  <div>
                    <h3 className="font-bold">{s.nameAr as string}</h3>
                    <p className="text-xs text-text-secondary">
                      من عمر {(s.ageMin as number) || 0} سنوات
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-brand-600">
                    {formatCurrency(s.price as number)} ر.س
                  </p>
                  <p className="text-xs text-text-tertiary">{s.durationMin as number} دقيقة</p>
                  {user ? (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        if (childName.trim())
                          bookMut.mutate(
                            {
                              serviceId: s.id as string,
                              category: selectedCat,
                              childName: childName.trim(),
                              childAge,
                            },
                            { onSuccess: (d) => setResult(d as Record<string, unknown>) },
                          );
                      }}
                    >
                      احجزي
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
          {tips && tips.length > 0 && (
            <Card padding="lg" className="bg-green-50 dark:bg-green-950 border-none">
              <h3 className="font-bold mb-2">💡 نصائح</h3>
              <div className="space-y-1">
                {tips.map((t: string, i: number) => (
                  <p key={i} className="text-sm">
                    ✅ {t}
                  </p>
                ))}
              </div>
            </Card>
          )}
          {!user && (
            <div className="text-center">
              <Link href="/login">
                <Button size="lg">سجّلي دخول للحجز</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
