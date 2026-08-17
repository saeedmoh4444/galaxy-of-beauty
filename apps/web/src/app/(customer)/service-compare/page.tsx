'use client';

import { api } from '@/lib/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServiceComparePage(): JSX.Element {
  const [services, setServices] = useState<Array<Record<string, unknown>>>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [, setLoading] = useState(true);
  const utils = api.useUtils();
  const fetch = useCallback(() => {
    setLoading(true);
    utils.services.list
      .fetch({})
      .then((d) => {
        setServices((d?.items ?? []) as Array<Record<string, unknown>>);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);
  const toggle = (id: number) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 3) setSelected([...selected, id]);
  };
  const compareItems = services.filter((s) => selected.includes(s.id as number));

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="️ مقارنة الخدمات" subtitle="اختاري حتى 3 خدمات للمقارنة" />

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {services.slice(0, 12).map((s) => {
            const isSel = selected.includes(s.id as number);
            return (
              <button
                key={s.id as number}
                type="button"
                onClick={() => toggle(s.id as number)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${isSel ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
              >
                <span className="text-3xl">{(s.emoji as string) ?? '‍️'}</span>
                <p className="mt-2 text-xs font-bold text-text-primary dark:text-gray-100">
                  {(s.titleJson as { ar?: string } | null)?.ar ?? (s.nameAr as string | undefined)}
                </p>
                <p className="mt-1 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {(s.basePrice as number)?.toLocaleString()} ر.س
                </p>
              </button>
            );
          })}
        </div>

        {compareItems.length >= 2 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-bold text-text-primary dark:text-gray-100"> المقارنة</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {compareItems.map((s) => (
                <div key={s.id as number} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <span className="text-2xl">{s.emoji as string}</span>
                  <h4 className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">
                    {(s.titleJson as { ar?: string } | null)?.ar}
                  </h4>
                  <div className="mt-3 space-y-2 text-sm text-text-secondary dark:text-gray-400">
                    <div className="flex justify-between">
                      <span> السعر</span>
                      <span className="font-bold text-text-primary dark:text-gray-100">
                        {(s.basePrice as number)?.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>️ المدة</span>
                      <span className="font-bold text-text-primary dark:text-gray-100">
                        {s.durationMin as number} دقيقة
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
