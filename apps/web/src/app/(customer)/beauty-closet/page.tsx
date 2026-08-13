'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const CATS = ['skincare', 'makeup', 'hair', 'nails', 'natural'];

export default function BeautyClosetPage(): JSX.Element {
  const { data, isLoading } = api.beautyCloset.myProducts.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    isLoading: boolean;
  };
  const addMut = api.beautyCloset.addProduct.useMutation();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [cat, setCat] = useState('skincare');
  const products = data ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold"> خزانة الجمال</h1>
            <p className="mt-1 text-sm text-text-secondary">منتجاتكِ ومستحضراتكِ الشخصية</p>
          </div>
          <Button onClick={() => setShowAdd(true)}>+ منتج</Button>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {products.map((p: Record<string, unknown>) => (
              <Card key={p.id as number} padding="md" className="text-center">
                <span className="text-4xl">{p.emoji as string}</span>
                <h3 className="font-bold mt-2">{p.name as string}</h3>
                <div className="mt-2 h-2 bg-surface-muted rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full"
                    style={{ width: `${(p.usagePct as number) ?? 100}%` }}
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  متبقي {(p.usagePct as number) ?? 100}%
                </p>
              </Card>
            ))}
          </div>
        )}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="إضافة منتج">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المنتج"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                if (name.trim())
                  addMut.mutate(
                    { name: name.trim(), category: cat },
                    {
                      onSuccess: () => {
                        setShowAdd(false);
                        setName('');
                      },
                    },
                  );
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              إضافة
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
