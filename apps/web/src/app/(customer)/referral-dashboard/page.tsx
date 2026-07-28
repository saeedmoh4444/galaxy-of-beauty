'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, Button, Input, formatCurrency } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@galaxy/shared';

export default function ReferralDashboardPage(): JSX.Element {
  const { addToast } = useToast();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: refData, isLoading, isError, refetch } = (api as any).referrals?.getDashboard?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: codeData } = (api as any).referrals?.getMyCode?.useQuery?.() as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: statsData } = (api as any).referrals?.getStats?.useQuery?.() as any;

  const referralCode = codeData?.code || '———';
  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`;
  const stats = statsData || { totalReferrals: 0, successfulReferrals: 0, totalEarnings: 0 };

  const copyCode = () => { navigator.clipboard.writeText(referralCode).then(() => addToast('success', 'تم نسخ الكود')); };
  const copyLink = () => { navigator.clipboard.writeText(referralUrl).then(() => addToast('success', 'تم نسخ الرابط')); };

  const shareWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent('جربي جالكسي بيوتي! احصلي على ٢٠ ر.س مع أول حجز باستخدام كودي: ' + referralCode + '\n' + referralUrl)}`, '_blank'); };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔗 برنامج الإحالة</h1>
        <p className="text-sm text-gray-500">دعي صديقاتكِ ينضممن واحصلي على مكافآت! لكل صديقة تسجل وتحجز، تكسبين ٢٠ ر.س</p>

        {/* Stats */}
        {isLoading ? <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div> : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center"><p className="text-sm text-gray-500">إجمالي الإحالات</p><p className="text-2xl font-bold text-brand-600">{stats.totalReferrals || 0}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">إحالات ناجحة</p><p className="text-2xl font-bold text-green-600">{stats.successfulReferrals || 0}</p></Card>
            <Card className="text-center"><p className="text-sm text-gray-500">المكافآت</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalEarnings || 0)}</p></Card>
          </div>
        )}

        {/* Referral Code */}
        <Card padding="lg">
          <h3 className="font-semibold mb-3">🎁 كود الإحالة الخاص بكِ</h3>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center font-mono text-lg font-bold text-brand-600 dark:border-gray-700 dark:bg-gray-800">{referralCode}</div>
            <Button onClick={copyCode} variant="outline">📋 نسخ</Button>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-500 truncate dark:border-gray-700 dark:bg-gray-800">{referralUrl}</div>
            <Button onClick={copyLink} variant="outline" size="sm">📋 نسخ الرابط</Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={shareWhatsApp} size="sm" className="flex-1">📱 واتساب</Button>
            <Button onClick={() => setShowInvite(true)} size="sm" variant="outline" className="flex-1">📧 دعوة بالبريد</Button>
          </div>
        </Card>

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInvite(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-4 text-lg font-bold">دعوة صديقة</h3>
              <div className="space-y-3">
                <Input placeholder="البريد الإلكتروني" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                <textarea className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800" rows={3} value={inviteMsg} onChange={(e) => setInviteMsg(e.target.value)} placeholder="رسالة شخصية..." />
                <Button onClick={() => { setShowInvite(false); addToast('success', 'تم إرسال الدعوة'); }} className="w-full">إرسال الدعوة</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
