'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, EmptyState, Button, Modal, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ServiceWishlistPage(): JSX.Element {
  const { data: items, refetch } = api.serviceWishlist.myWishlist.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addMut = api.serviceWishlist.add.useMutation({
    onSuccess: () => {
      setShow(false);
      refetch();
    },
  });
  const removeMut = api.serviceWishlist.remove.useMutation({ onSuccess: () => refetch() });

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const list = items ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📝 قائمة الخدمات</h1>
            <p className="mt-1 text-sm text-text-secondary">تابعي أسعار الخدمات اللي تبينها</p>
          </div>
          <Button onClick={() => setShow(true)}>+ خدمة</Button>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="لا توجد خدمات"
            description="أضيفي خدمات لمتابعة أسعارها"
            action={{ label: 'إضافة', onPress: () => setShow(true) }}
          />
        ) : (
          <div className="space-y-3">
            {list.map((i: Record<string, unknown>) => (
              <Card key={i.id as number} padding="md" className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{i.emoji as string}</span>
                  <div>
                    <p className="font-bold">{i.serviceName as string}</p>
                    <p className="text-xs text-text-secondary">
                      أقل سعر: {formatCurrency(i.lowestPrice as number)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-600">
                    {formatCurrency(i.currentPrice as number)}
                  </p>
                  {(i.droppedBy as number) > 0 && (
                    <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-bold text-green-700">
                      ▼ {formatCurrency(i.droppedBy as number)}
                    </span>
                  )}
                  <button
                    onClick={() => removeMut.mutate({ id: i.id as number })}
                    className="block mt-1 text-xs text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Modal open={show} onClose={() => setShow(false)} title="إضافة خدمة">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم الخدمة"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
              placeholder="السعر الحالي"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (name.trim() && price > 0)
                  addMut.mutate({ serviceName: name.trim(), currentPrice: price });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              📝 إضافة
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
