'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminToolsPage(): JSX.Element {
  const { data: flags, isLoading } = api.featureFlags.list.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-4xl space-y-6">
        <div><h1 className="text-2xl font-bold">🛠️ أدوات المشرف</h1><p className="mt-1 text-sm text-gray-500">إدارة إعدادات المنصة والميزات</p></div>

        <Card padding="lg"><h3 className="font-bold mb-3">🚩 إدارة الميزات (Feature Flags)</h3>
          {isLoading ? <CardSkeleton/> : !(flags??[]).length ? <p className="text-sm text-gray-400">لا توجد ميزات معرفة</p> :
            <div className="space-y-2">{(flags??[]).map((f: Record<string,unknown>) => (
              <div key={f.key as string} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-bold text-sm font-mono">{f.key as string}</p><p className="text-xs text-gray-500">{f.description as string ?? ''}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs ${f.enabled?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{f.enabled ? 'مفعل' : 'معطل'}</span>
              </div>
            ))}</div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
}
