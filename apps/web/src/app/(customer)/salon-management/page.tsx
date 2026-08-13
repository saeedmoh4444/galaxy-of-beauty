'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button, Modal, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function SalonManagementPage(): JSX.Element {
  const { data: dash } = api.salonManagement.dashboard.useQuery() as {
    data: Record<string, unknown> | undefined;
  };
  const { data: staff, refetch } = api.salonManagement.staff.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const addMut = api.salonManagement.addStaff.useMutation({
    onSuccess: () => {
      setShow(false);
      refetch();
    },
  });
  const removeMut = api.salonManagement.removeStaff.useMutation({ onSuccess: () => refetch() });

  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const s = staff ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold"> إدارة الصالون</h1>
            <p className="mt-1 text-sm text-text-secondary">أديري فريقكِ وتابعي أداء الصالون</p>
          </div>
          <Button onClick={() => setShow(true)}>+ موظفة</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{(dash?.todayBookings as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">حجز اليوم</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">
              {formatCurrency((dash?.todayRevenue as number) ?? 0)}
            </p>
            <p className="text-xs text-text-secondary">إيراد اليوم</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl">‍</p>
            <p className="text-2xl font-bold">{(dash?.activeStaff as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">موظفات</p>
          </Card>
          <Card padding="md" className="text-center">
            <p className="text-3xl"></p>
            <p className="text-2xl font-bold">{(dash?.avgRating as number) ?? 0}</p>
            <p className="text-xs text-text-secondary">التقييم</p>
          </Card>
        </div>

        <Card padding="lg">
          <h3 className="font-bold mb-4">‍ فريق العمل</h3>
          <div className="space-y-2">
            {s.map((m: Record<string, unknown>) => (
              <div
                key={m.id as number}
                className="flex items-center justify-between rounded-lg bg-surface-muted dark:bg-gray-800 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji as string}</span>
                  <div>
                    <p className="font-bold">{m.name as string}</p>
                    <p className="text-xs text-text-secondary">
                      {m.role as string} ·  {m.rating as number} · {m.bookingsToday as number}{' '}
                      حجوزات
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeMut.mutate({ id: m.id as number })}
                  className="text-red-400"
                >
                  ️
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Modal open={show} onClose={() => setShow(false)} title="إضافة موظفة">
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="الدور"
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => {
                if (name.trim() && role.trim())
                  addMut.mutate({ name: name.trim(), role: role.trim() });
              }}
              loading={addMut.isPending}
              className="w-full"
            >
              ‍ إضافة
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
