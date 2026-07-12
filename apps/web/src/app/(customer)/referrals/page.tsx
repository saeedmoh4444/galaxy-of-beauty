'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReferralsPage(): JSX.Element {
  const [copyMsg, setCopyMsg] = useState('');
  const [applyCode, setApplyCode] = useState('');
  const [applyMsg, setApplyMsg] = useState('');

  const codeQ = api.referrals.getMyCode.useQuery({} as never);
  const statsQ = api.referrals.getStats.useQuery({} as never);
  const applyMut = api.referrals.applyCode.useMutation({
    onSuccess: (res) => {
      setApplyMsg(`تم تطبيق الكود! مكافأة: ${formatCurrency(Number((res as unknown as Record<string, unknown>).referrerBonus))}`);
      setApplyCode('');
    },
    onError: (err) => {
      setApplyMsg(err.message);
    },
  });

  const codeData = codeQ.data as unknown as Record<string, unknown> | undefined;
  const statsData = statsQ.data as unknown as Record<string, unknown> | undefined;
  const referrals = (statsData?.referrals as unknown as Record<string, unknown>[]) ?? [];

  const isLoading = codeQ.isLoading || statsQ.isLoading;
  const isError = codeQ.isError || statsQ.isError;

  const handleCopy = async () => {
    if (codeData?.code) {
      try {
        await navigator.clipboard.writeText(codeData.code as string);
        setCopyMsg('تم نسخ الكود!');
        setTimeout(() => setCopyMsg(''), 2000);
      } catch {
        setCopyMsg('فشل النسخ');
      }
    }
  };

  const handleShare = async () => {
    const text = `استخدم كود الدعوة الخاص بي: ${codeData?.code ?? ''} واحصل على خصم!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'دعوة', text }); } catch { /* ignore */ }
    } else {
      handleCopy();
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">دعوة الأصدقاء</h1>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل بيانات الدعوة" onRetry={() => { codeQ.refetch(); statsQ.refetch(); }} />
        ) : (
          <>
            {/* Referral Code */}
            <Card padding="lg" className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">كود الدعوة الخاص بك</p>
              <div className="my-4 flex items-center justify-center gap-3">
                <span className="rounded-lg bg-gray-100 px-6 py-3 text-2xl font-bold tracking-widest text-brand-600 dark:bg-gray-800">
                  {codeData?.code as string ?? '---'}
                </span>
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-brand-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                  {copyMsg || 'نسخ'}
                </button>
              </div>
              {copyMsg && <p className="text-sm text-green-600">{copyMsg}</p>}
              <Button className="mt-4" onClick={handleShare}>مشاركة الكود</Button>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card padding="md" className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المدعوين</p>
                <p className="mt-1 text-3xl font-bold text-brand-600">{statsData?.totalReferred as number ?? 0}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المكاسب</p>
                <p className="mt-1 text-3xl font-bold text-green-600">{formatCurrency(Number(statsData?.totalEarned ?? 0))}</p>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card padding="md" className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">مكتملة</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{statsData?.completedReferrals as number ?? 0}</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">قيد الانتظار</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{statsData?.pendingReferrals as number ?? 0}</p>
              </Card>
            </div>

            {/* Apply Code */}
            <Card padding="md">
              <h2 className="mb-3 font-semibold">هل لديك كود دعوة؟</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل كود الدعوة"
                  value={applyCode}
                  onChange={(e) => setApplyCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => applyMut.mutate({ code: applyCode })}
                  loading={applyMut.isPending}
                >
                  تطبيق
                </Button>
              </div>
              {applyMsg && <p className="mt-2 text-sm text-green-600">{applyMsg}</p>}
            </Card>

            {/* Referral History */}
            <h2 className="text-lg font-semibold">تاريخ الدعوات</h2>
            {referrals.length === 0 ? (
              <EmptyState title="لا توجد دعوات" description="لم تدع أي شخص بعد" />
            ) : (
              <div className="space-y-2">
                {referrals.map((r: Record<string, unknown>) => {
                  const referred = r.referred as unknown as Record<string, unknown>;
                  return (
                    <Card key={r.id as number} padding="sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{referred?.name as string}</p>
                          <p className="text-xs text-gray-500">{new Date(r.createdAt as string).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            r.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                          }`}>
                            {r.status === 'COMPLETED' ? 'مكتملة' : 'قيد الانتظار'}
                          </span>
                          <span className="text-sm font-semibold text-green-600">{formatCurrency(Number(r.referrerReward))}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
