'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const COMPENSATION_TYPES = [
  { key: 'redo' as const, emoji: '🔄', label: 'إعادة الخدمة مجاناً', desc: 'سنقوم بإعادة الخدمة بدون تكلفة إضافية' },
  { key: 'refund' as const, emoji: '💰', label: 'استرداد المبلغ', desc: 'استرداد كامل لقيمة الخدمة' },
  { key: 'credit' as const, emoji: '🎫', label: 'رصيد تعويضي', desc: 'رصيد في المحفظة بنسبة ٣٠٪ من قيمة الخدمة' },
];

export default function ServiceWarrantyPage(): JSX.Element {
  const { data: policy, isLoading: pLoad } = api.serviceWarranty.policy.useQuery() as { data: Record<string, unknown> | undefined; isLoading: boolean };
  const { data: claims, isLoading: cLoad, isError, refetch } = api.serviceWarranty.myClaims.useQuery() as { data: Array<Record<string, unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const [eligibilityBookingId, setEligibilityBookingId] = useState(0);
  const { data: eligibility } = api.serviceWarranty.checkEligibility.useQuery(
    { bookingId: eligibilityBookingId },
    { enabled: eligibilityBookingId > 0 },
  ) as { data: Record<string, unknown> | undefined; refetch: () => void };
  const claimMut = api.serviceWarranty.claim.useMutation({ onSuccess: () => { setShowClaim(false); refetch(); } });

  const [bookingId, setBookingId] = useState('');
  const [showClaim, setShowClaim] = useState(false);
  const [reason, setReason] = useState('');
  const [compType, setCompType] = useState<'redo' | 'refund' | 'credit'>('redo');
  const [claimError, setClaimError] = useState('');

  const handleCheck = () => {
    if (!bookingId) return;
    setEligibilityBookingId(parseInt(bookingId, 10));
  };

  const handleClaim = () => {
    setClaimError('');
    if (reason.trim().length < 10) { setClaimError('الرجاء كتابة سبب مفصل (١٠ أحرف على الأقل)'); return; }
    claimMut.mutate({ bookingId: parseInt(bookingId, 10), reason: reason.trim(), compensationType: compType });
  };

  const coverage = (policy?.coverage as Array<Record<string, string>>) ?? [];
  const myClaims = claims ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">🛡️ ضمان الخدمة</h1>
          <p className="mt-1 text-sm text-text-secondary">رضاكِ مضمون — إذا لم تكوني راضية، نضمن لكِ حقكِ</p>
        </div>

        {/* Coverage */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">✨ ماذا يغطي الضمان؟</h3>
          {pLoad ? <CardSkeleton /> : (
            <div className="grid gap-4 sm:grid-cols-3">
              {coverage.map((c: Record<string, string>, i: number) => (
                <div key={i} className="text-center rounded-xl bg-surface-muted dark:bg-gray-800 p-4">
                  <span className="text-3xl">{c.emoji}</span>
                  <h4 className="mt-2 font-bold text-sm">{c.titleAr}</h4>
                  <p className="mt-1 text-xs text-text-secondary">{c.descAr}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Eligibility Check */}
        <Card padding="lg">
          <h3 className="font-bold text-lg mb-4">🔍 التحقق من الأهلية</h3>
          <div className="flex gap-2">
            <input type="number" value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="رقم الحجز" className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <Button onClick={handleCheck}>تحقق</Button>
          </div>
          {eligibility && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${(eligibility.eligible as boolean) ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
              {(eligibility.eligible as boolean) ? '✅ الحجز مؤهل للضمان' : `❌ ${eligibility.reason as string}`}
              {(eligibility.eligible as boolean) && (
                <div className="mt-2">
                  <Button size="sm" onClick={() => setShowClaim(true)}>تقديم مطالبة</Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* My Claims */}
        <h3 className="text-lg font-bold">📋 مطالباتي</h3>
        {cLoad ? <CardSkeleton /> :
         isError ? <ErrorAlert message="فشل التحميل" onRetry={() => refetch()} /> :
         myClaims.length === 0 ? <EmptyState title="لا توجد مطالبات" description="لم تقدّمي أي مطالبة ضمان حتى الآن" /> :
         <div className="space-y-3">
           {myClaims.map((c: Record<string, unknown>) => (
             <Card key={c.id as number} padding="md">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="font-bold text-sm">حجز #{c.bookingId as number}</p>
                   <p className="text-xs text-text-secondary mt-0.5">{c.reason as string}</p>
                 </div>
                 <div className="text-right">
                   <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                     c.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                     c.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                     c.status === 'COMPENSATED' ? 'bg-blue-100 text-blue-700' :
                     'bg-yellow-100 text-yellow-700'
                   }`}>
                     {c.status === 'PENDING' ? 'قيد المراجعة' : c.status === 'APPROVED' ? 'موافق' : c.status === 'REJECTED' ? 'مرفوض' : 'تم التعويض'}
                   </span>
                   {(c.compensation as number) > 0 && <p className="text-xs font-bold text-brand-600 mt-0.5">{formatCurrency(c.compensation as number)} ر.س</p>}
                 </div>
               </div>
             </Card>
           ))}
         </div>
        }

        <Modal open={showClaim} onClose={() => setShowClaim(false)} title="تقديم مطالبة ضمان">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">نوع التعويض</label>
              <div className="space-y-2">{COMPENSATION_TYPES.map((t) => (
                <button key={t.key} type="button" onClick={() => setCompType(t.key)} className={`w-full text-right rounded-xl border p-3 text-sm transition-all ${compType === t.key ? 'border-brand-400 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className="font-bold">{t.emoji} {t.label}</span>
                  <p className="text-xs text-text-secondary mt-0.5">{t.desc}</p>
                </button>
              ))}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">سبب المطالبة</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="اشرحي سبب عدم رضاكِ عن الخدمة بالتفصيل..." className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            </div>
            {claimError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{claimError}</div>}
            <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowClaim(false)}>إلغاء</Button><Button onClick={handleClaim} loading={claimMut.isPending}>🛡️ تقديم المطالبة</Button></div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
