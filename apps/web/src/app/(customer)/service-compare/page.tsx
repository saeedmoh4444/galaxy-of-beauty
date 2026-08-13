'use client';

import { api } from '@/lib/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageTitle } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServiceComparePage(): JSX.Element {
  const [services, setServices] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [, setLoading] = useState(true);
  const fetch = useCallback(() => {
    setLoading(true);
    (api as any).services.list
      .query({})
      .then((d: any) => {
        setServices(d?.items ?? []);
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
  const compareItems = services.filter((s: any) => selected.includes(s.id));

  return (
    <DashboardLayout userRole="CUSTOMER">
      <PageContainer width="wide">
        <PageTitle title="️ مقارنة الخدمات" subtitle="اختاري حتى 3 خدمات للمقارنة" />

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {services.slice(0, 12).map((s: any) => {
            const isSel = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${isSel ? 'border-cyan-400 bg-cyan-50 dark:border-cyan-600 dark:bg-cyan-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
              >
                <span className="text-3xl">{s.emoji ?? '‍️'}</span>
                <p className="mt-2 text-xs font-bold text-text-primary dark:text-gray-100">
                  {(s.titleJson as any)?.ar ?? s.nameAr}
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
              {compareItems.map((s: any) => (
                <div key={s.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <span className="text-2xl">{s.emoji}</span>
                  <h4 className="mt-2 text-sm font-bold text-text-primary dark:text-gray-100">
                    {(s.titleJson as any)?.ar}
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
