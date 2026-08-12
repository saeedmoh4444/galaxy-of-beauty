/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, Modal } from '@galaxy/ui';
import { useState } from 'react';

export default function AdminPackagesPage(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, isError, refetch } = api.beautyPackages.listAll.useQuery() as any;
  const packages = (data ?? []) as Array<Record<string, any>>;
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', discountPercent: 15, serviceIds: '' });
  const createMut = api.beautyPackages.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowCreate(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💅 الباقات</h1>
        <Button onClick={() => setShowCreate(true)}>إضافة باقة</Button>
      </div>
      {isLoading ? (
        <CardSkeleton />
      ) : isError ? (
        <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} />
      ) : packages.length === 0 ? (
        <EmptyState title="لا توجد باقات" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p: Record<string, any>) => (
            <Card key={p.id} padding="md">
              <h3 className="font-bold">{(p.nameJson as Record<string, string>)?.ar}</h3>
              <p className="text-sm text-text-secondary">
                -{p.discountPercent}% · {p.services?.length || 0} خدمات
              </p>
              <span
                className={`rounded px-2 py-0.5 text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {p.isActive ? 'نشط' : 'غير نشط'}
              </span>
            </Card>
          ))}
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إضافة باقة جديدة">
        <div className="space-y-3">
          <Input
            label="الاسم (عربي)"
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
          />
          <Input
            label="الاسم (إنجليزي)"
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <Input
            label="نسبة الخصم"
            type="number"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
          />
          <Input
            label="معرفات الخدمات (مفصولة بفواصل)"
            value={form.serviceIds}
            onChange={(e) => setForm({ ...form, serviceIds: e.target.value })}
            placeholder="1,2,3"
          />
          <Button
            onClick={() =>
              createMut.mutate({
                ...form,
                serviceIds: form.serviceIds
                  .split(',')
                  .map(Number)
                  .filter((n) => n > 0),
              })
            }
            loading={createMut.isPending}
          >
            حفظ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
