'use client';

import { api } from '@/lib/trpc';
import { Card, DetailSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import Link from 'next/link';

export default function FeaturedTechPage(): JSX.Element {
  const {
    data: current,
    isLoading,
    isError,
    refetch,
  } = api.featuredTech.current.useQuery() as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: past } = api.featuredTech.past.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
  };

  const pastTechs = past ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-6xl"></span>
        <h1 className="mt-4 text-3xl font-bold">فنية الأسبوع</h1>
        <p className="mt-2 text-text-secondary">نسلط الضوء على أفضل الفنيات في منصتنا</p>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : current ? (
        <Card
          padding="lg"
          className="border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950"
        >
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-5xl shadow-xl">
              {current.emoji as string}
            </div>
            <p className="text-xs text-amber-600 font-bold mt-3">
              فنية الأسبوع —{' '}
              {new Date(current.weekOf as string).toLocaleDateString('ar-SA', {
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{current.name as string}</h2>
            <p className="text-text-secondary">{current.titleAr as string}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2"> الإنجازات</h3>
            <div className="flex flex-wrap gap-2">
              {(current.highlights as string[])?.map((h: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-white dark:bg-gray-800 px-3 py-1 text-xs font-medium shadow-sm"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-bold mb-2"> الخدمات</h3>
            <div className="flex flex-wrap gap-2">
              {(current.services as string[])?.map((s: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-brand-100 dark:bg-brand-900 px-3 py-1 text-xs text-brand-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white dark:bg-gray-800 p-4">
            <p className="text-sm font-bold text-brand-600"> مقابلة سريعة</p>
            <p className="text-xs text-text-secondary mt-1">
              س: {(current.interview as Record<string, string>)?.q}
            </p>
            <p className="text-sm mt-2">ج: {(current.interview as Record<string, string>)?.a}</p>
          </div>

          <div className="mt-6 text-center">
            <Link href={`/technicians/${current.id}`}>
              <Button>عرض الملف الكامل ←</Button>
            </Link>
          </div>
        </Card>
      ) : null}

      {pastTechs.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4"> فنيات سابقات</h3>
          <div className="flex flex-wrap gap-3">
            {pastTechs.map((t: Record<string, unknown>) => (
              <Link key={t.id as number} href={`/technicians/${t.id}`}>
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted dark:bg-gray-800 px-4 py-2 text-sm hover:bg-gray-200 transition-colors">
                  <span>{t.emoji as string}</span>
                  <span className="font-medium">{t.name as string}</span>
                  <span className="text-xs text-text-tertiary">
                    {new Date(t.weekOf as string).toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
