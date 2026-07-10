'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input } from '@galaxy/shared';

export default function AdminUsersPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = api.admin.listCustomers.useQuery({ search: search || undefined, page: 1, limit: 20 });
  const suspendMut = api.admin.suspendUser.useMutation({ onSuccess: () => refetch() });
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const customers = (data as unknown as Record<string, unknown>[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
      <Input placeholder="بحث عن مستخدم..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل المستخدمين" onRetry={() => refetch()} />
      : customers.length === 0 ? <EmptyState title="لا يوجد مستخدمين" />
      : <div className="space-y-2">{customers.map((c: Record<string, unknown>) => (
          <Card key={c.id as number} padding="md">
            <div className="flex items-center justify-between">
              <div><p className="font-semibold">{c.name as string}</p><p className="text-sm text-gray-500">{c.email as string}</p></div>
              <div className="flex gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.isActive ? 'نشط' : 'معلق'}</span>
                <Button size="sm" variant={c.isActive ? 'danger' : 'primary'} onClick={() => { setSelected(c); suspendMut.mutate({ userId: c.id as number }); }}>{c.isActive ? 'تعليق' : 'تفعيل'}</Button>
              </div>
            </div>
          </Card>
        ))}</div>
      }
    </div>
  );
}
