'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TechEarningsPage(): JSX.Element {
  const balanceQ = api.wallet.getBalance.useQuery({} as never);
  const payoutsQ = api.payouts.listMyPayouts.useQuery({ page: 1, limit: 20 });
  const earningsQ = api.analytics.technicianEarnings.useQuery({ days: 30 });

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  const withdrawMut = api.wallet.withdraw.useMutation({
    onSuccess: () => {
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawMsg('');
      balanceQ.refetch();
      payoutsQ.refetch();
    },
    onError: (e) => setWithdrawMsg(e.message),
  });

  const bal = balanceQ.data as unknown as Record<string, unknown> | undefined;
  const earnings = earningsQ.data as unknown as Record<string, unknown> | undefined;
  const dailyEarnings = (earnings?.dailyEarnings as unknown as Record<string, unknown>[]) ?? [];
  const payoutsData = payoutsQ.data as unknown as Record<string, unknown> | undefined;
  const payoutItems = (payoutsData?.payouts as unknown as Record<string, unknown>[]) ?? [];

  const statusColours: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-600',
    PROCESSING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    PENDING: 'قيد الانتظار',
    PROCESSING: 'قيد المعالجة',
    COMPLETED: 'مكتمل',
    FAILED: 'فشل',
  };

  return (
    <DashboardLayout role="TECHNICIAN">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">الأرباح</h1>

        {/* ── Balance Cards ── */}
        {balanceQ.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : balanceQ.isError ? (
          <ErrorAlert message="فشل تحميل الرصيد" onRetry={() => balanceQ.refetch()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <p className="text-sm text-gray-500">الرصيد الكلي</p>
              <p className="text-2xl font-bold text-brand-600">
                {formatCurrency(Number(bal?.totalBalance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">الرصيد القابل للسحب</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(bal?.balance ?? 0))}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500">الرصيد المعلق</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(Number(bal?.bonusBalance ?? 0))}
              </p>
            </Card>
          </div>
        )}

        {/* Withdraw button */}
        {!balanceQ.isLoading && !balanceQ.isError && (
          <div className="flex justify-end">
            <Button onClick={() => setShowWithdraw(true)}>طلب سحب</Button>
          </div>
        )}

        {/* ── Earnings Chart (daily) ── */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">الأرباح اليومية (آخر ٣٠ يوم)</h2>
          {earningsQ.isLoading ? (
            <CardSkeleton />
          ) : earningsQ.isError ? (
            <ErrorAlert message="فشل تحميل الأرباح" onRetry={() => earningsQ.refetch()} />
          ) : dailyEarnings.length === 0 ? (
            <EmptyState title="لا توجد أرباح في هذه الفترة" />
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm font-medium text-gray-500 dark:border-gray-700">
                <span>التاريخ</span>
                <span>الأرباح (ر.س)</span>
                <span>عدد الحجوزات</span>
              </div>
              {dailyEarnings.slice(0, 30).map((day: Record<string, unknown>) => (
                <div
                  key={day.date as string}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {day.date as string}
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(Number(day.earnings ?? 0))}
                  </span>
                  <span className="text-gray-500">{String(day.count ?? 0)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 font-semibold dark:border-gray-700">
                <span>الإجمالي</span>
                <span className="text-green-600">
                  {formatCurrency(Number(earnings?.totalEarnings ?? 0))}
                </span>
                <span>{String(earnings?.totalBookings ?? 0)}</span>
              </div>
            </div>
          )}
        </Card>

        {/* ── Payout History ── */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold">سجل المدفوعات</h2>
          {payoutsQ.isLoading ? (
            <CardSkeleton />
          ) : payoutsQ.isError ? (
            <ErrorAlert message="فشل تحميل المدفوعات" onRetry={() => payoutsQ.refetch()} />
          ) : payoutItems.length === 0 ? (
            <EmptyState title="لا توجد مدفوعات سابقة" />
          ) : (
            <div className="space-y-2">
              {payoutItems.map((p: Record<string, unknown>) => {
                const st = (p.status as string) ?? 'PENDING';
                return (
                  <Card key={p.id as number} padding="sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{formatCurrency(Number(p.amount ?? 0))}</p>
                        <p className="text-xs text-gray-500">
                          {p.createdAt
                            ? new Date(p.createdAt as string).toLocaleDateString('ar-SA')
                            : '-'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.reference ? (
                          <span className="text-xs text-gray-400">
                            مرجع: {p.reference as string}
                          </span>
                        ) : null}
                        {p.periodStart ? (
                          <span className="text-xs text-gray-400">
                            {new Date(p.periodStart as string).toLocaleDateString('ar-SA')}
                            {' - '}
                            {new Date(p.periodEnd as string).toLocaleDateString('ar-SA')}
                          </span>
                        ) : null}
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColours[st]}`}>
                          {statusLabels[st] ?? st}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Withdraw Modal ── */}
        <Modal open={showWithdraw} onClose={() => setShowWithdraw(false)} title="طلب سحب" size="sm">
          <div className="space-y-4">
            {withdrawMsg && (
              <p className={`text-sm ${withdrawMut.isError ? 'text-red-600' : 'text-green-600'}`}>
                {withdrawMsg}
              </p>
            )}
            <Input
              label="المبلغ (ر.س)"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              hint="الحد الأدنى ١٠٠ ر.س"
            />
            <Button
              className="w-full"
              onClick={() => {
                const a = Number(withdrawAmount);
                if (a < 100) {
                  setWithdrawMsg('الحد الأدنى ١٠٠ ر.س');
                  return;
                }
                setWithdrawMsg('');
                withdrawMut.mutate({ amount: a, idempotencyKey: crypto.randomUUID() });
              }}
              loading={withdrawMut.isPending}
            >
              تأكيد السحب
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
