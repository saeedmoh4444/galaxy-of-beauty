'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Button, Card, CardSkeleton, ErrorAlert, EmptyState, Modal } from '@galaxy/shared';

const KYC_TABS = ['ALL', 'PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const;

const kycBadge = (status: string): { label: string; className: string } => {
  switch (status) {
    case 'VERIFIED': return { label: 'موثق', className: 'bg-green-100 text-green-700' };
    case 'SUBMITTED': return { label: 'مقدم', className: 'bg-blue-100 text-blue-700' };
    case 'REJECTED': return { label: 'مرفوض', className: 'bg-red-100 text-red-700' };
    case 'PENDING': default: return { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700' };
  }
};

export default function AdminTechniciansPage(): JSX.Element {
  const [kycTab, setKycTab] = useState<string>('ALL');
  const [reviewTech, setReviewTech] = useState<Record<string, unknown> | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data, isLoading, isError, refetch } = api.admin.listTechnicians.useQuery({ page: 1, limit: 50 } as never);
  const verifyMut = api.technicians.verifyKyc.useMutation({ onSuccess: () => { refetch(); setReviewTech(null); setReviewNote(''); } });
  const suspendMut = api.admin.suspendUser.useMutation({ onSuccess: () => refetch() });

  const technicians = (data as unknown as Record<string, unknown>[]) ?? [];

  const filtered = kycTab === 'ALL'
    ? technicians
    : technicians.filter((t) => (t.kycStatus as string) === kycTab);

  const handleVerify = (approved: boolean) => {
    if (!reviewTech) return;
    verifyMut.mutate({
      technicianId: reviewTech.id as number,
      status: approved ? 'VERIFIED' : 'REJECTED',
      adminNote: reviewNote,
    } as never);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة الفنيات</h1>

      <div className="flex flex-wrap gap-2">
        {KYC_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setKycTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${kycTab === tab ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {tab === 'ALL' ? 'الكل' : tab === 'PENDING' ? 'قيد الانتظار' : tab === 'SUBMITTED' ? 'مقدم' : tab === 'VERIFIED' ? 'موثق' : 'مرفوض'}
          </button>
        ))}
      </div>

      {isLoading ? <CardSkeleton />
      : isError ? <ErrorAlert message="فشل تحميل الفنيات" onRetry={() => refetch()} />
      : filtered.length === 0 ? (
        <EmptyState title="لا توجد فنيات" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((tech: Record<string, unknown>) => {
            const badge = kycBadge(tech.kycStatus as string);
            return (
              <Card key={tech.id as number} padding="md">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{tech.name as string}</p>
                      <p className="text-sm text-gray-500">{tech.email as string}</p>
                      <p className="text-sm text-gray-500">{tech.city as string ?? '—'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⭐ {Number(tech.ratingAvg ?? 0).toFixed(1)}</span>
                    <span>{String(tech.completedBookings ?? 0)} حجوزات</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(tech.kycStatus as string) !== 'VERIFIED' && (
                      <Button size="sm" variant="primary" onClick={() => setReviewTech(tech)}>
                        مراجعة التوثيق
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={tech.isActive ? 'danger' : 'primary'}
                      onClick={() => suspendMut.mutate({ userId: tech.id as number } as never)}
                    >
                      {tech.isActive ? 'تعليق' : 'إلغاء التعليق'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* KYC Review Modal */}
      <Modal open={!!reviewTech} onClose={() => { setReviewTech(null); setReviewNote(''); }} title="مراجعة توثيق الفنية">
        {reviewTech && (
          <div className="space-y-4">
            <p className="text-sm"><strong>الاسم:</strong> {reviewTech.name as string}</p>
            <p className="text-sm"><strong>البريد:</strong> {reviewTech.email as string}</p>
            <p className="text-sm"><strong>حالة التوثيق:</strong> {reviewTech.kycStatus as string}</p>

            <div>
              <p className="mb-1 text-sm font-medium">الوثائق المقدمة:</p>
              {((reviewTech.kycDocuments as unknown as Record<string, unknown>[]) ?? []).length > 0 ? (
                (reviewTech.kycDocuments as unknown as Record<string, unknown>[]).map((doc: Record<string, unknown>, i: number) => (
                  <p key={i} className="text-sm text-blue-600 hover:underline cursor-pointer">
                    {doc.name as string ?? `مستند ${i + 1}`}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا توجد وثائق مرفوعة (مؤقت)</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="ملاحظات المشرف..."
              />
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={() => handleVerify(true)} loading={verifyMut.isPending}>اعتماد التوثيق</Button>
              <Button variant="danger" onClick={() => handleVerify(false)} loading={verifyMut.isPending}>رفض التوثيق</Button>
              <Button variant="secondary" onClick={() => { setReviewTech(null); setReviewNote(''); }}>إلغاء</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
