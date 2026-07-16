'use client';

import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, ErrorAlert, PageSpinner, EmptyState, Button } from '@galaxy/shared';

export default function ComparePage(): JSX.Element {
  const params = useSearchParams();
  const ids = (params.get('ids') || '')
    .split(',')
    .map(Number)
    .filter((n) => n > 0);

  const { data, isLoading, isError, refetch } = api.services.compare.useQuery(
    { ids },
    { enabled: ids.length >= 2 },
  );

  const services = ((data as Record<string, unknown>)?.services as Array<Record<string, unknown>>) || [];
  const rows = ((data as Record<string, unknown>)?.rows as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          مقارنة الخدمات
        </h1>

        {ids.length < 2 ? (
          <EmptyState
            title="اختر خدمتين أو أكثر للمقارنة"
            description="يمكنك اختيار خدمتين إلى ثلاث خدمات من صفحة الخدمات للمقارنة بينها."
          />
        ) : isLoading ? (
          <PageSpinner message="جاري تحميل المقارنة..." />
        ) : isError ? (
          <ErrorAlert message="فشل تحميل المقارنة" onRetry={() => refetch()} />
        ) : services.length === 0 ? (
          <EmptyState title="لا توجد خدمات للمقارنة" description="تأكد من اختيار خدمات صحيحة." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-xl border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="p-4 text-right text-sm font-semibold text-gray-500 dark:text-gray-400 min-w-[140px]">
                    الميزة
                  </th>
                  {services.map((s) => (
                    <th key={s.id as number} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-50 text-2xl dark:bg-brand-950">
                          💄
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {((s.titleJson as Record<string, string>)?.ar) || ''}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Price row */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">السعر</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center text-lg font-bold text-brand-600">
                      {Number(s.basePrice).toFixed(0)} ر.س
                    </td>
                  ))}
                </tr>
                {/* Duration */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">المدة</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {s.durationMin as number} دقيقة
                    </td>
                  ))}
                </tr>
                {/* Category */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">القسم</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {s.category as string}
                    </td>
                  ))}
                </tr>
                {/* Bookings */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">الحجوزات</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {s.bookingCount as number}
                    </td>
                  ))}
                </tr>
                {/* Tags */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">الوسوم</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {((s.tags as string[]) || []).map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* Variants */}
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">المتغيرات</td>
                  {services.map((s) => (
                    <td key={s.id as number} className="p-4 text-center">
                      <div className="space-y-1">
                        {((s.variants as Array<Record<string, unknown>>) || []).map((v, i) => (
                          <p key={i} className="text-xs text-gray-500 dark:text-gray-400">
                            {((v.nameJson as Record<string, string>)?.ar) || ''}
                            {Number(v.priceDelta) > 0 ? ` (+${Number(v.priceDelta).toFixed(0)} ر.س)` : ''}
                          </p>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Best value indicator */}
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-center dark:border-brand-800 dark:bg-brand-950">
              <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                💡 الأفضل قيمة:{' '}
                {(() => {
                  const best = [...services].sort(
                    (a, b) =>
                      (a.basePrice as number) / (a.durationMin as number || 1) -
                      (b.basePrice as number) / (b.durationMin as number || 1),
                  )[0];
                  return (best?.titleJson as Record<string, string>)?.ar || '';
                })()}
              </p>
              <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                الأقل سعراً للدقيقة
              </p>
            </div>
          </div>
        )}
      </div>
  );
}
