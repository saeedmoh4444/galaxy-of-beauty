'use client';

import { useParams } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, formatCurrency } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const DEFAULT_STATUS = {
  label: 'غير معروف',
  color: 'text-gray-700 dark:text-gray-300',
  bg: 'bg-gray-100 dark:bg-gray-800',
};
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: {
    label: 'قيد الانتظار',
    color: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-100 dark:bg-yellow-900',
  },
  CONFIRMED: {
    label: 'مؤكد',
    color: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-100 dark:bg-green-900',
  },
  IN_PROGRESS: {
    label: 'جاري',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900',
  },
  COMPLETED: {
    label: 'مكتمل',
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  CANCELLED: {
    label: 'ملغي',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-100 dark:bg-red-900',
  },
};

const THEME_EMOJI: Record<string, string> = {
  bridal: '',
  birthday: '',
  girls_night: '',
  family: '‍‍‍',
  other: '',
};

const THEME_LABELS: Record<string, string> = {
  bridal: 'عروس / توديع عزوبية',
  birthday: 'عيد ميلاد',
  girls_night: 'ليلة بنات',
  family: 'عائلية',
  other: 'أخرى',
};

export default function GroupBookingDetailPage(): JSX.Element {
  const params = useParams();
  const groupId = parseInt(params?.id as string, 10);

  const {
    data: group,
    isLoading,
    isError,
    refetch,
  } = api.groupBookings.getById.useQuery({ id: groupId }, { enabled: !isNaN(groupId) }) as {
    data: Record<string, unknown> | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  if (isNaN(groupId)) {
    return (
      <DashboardLayout role="CUSTOMER">
        <ErrorAlert message="معرف المجموعة غير صالح" />
      </DashboardLayout>
    );
  }

  const status = (group?.status as string) ?? 'PENDING';
  const statusInfo = STATUS_MAP[status] ?? DEFAULT_STATUS;
  const members = (group?.members as Array<Record<string, unknown>>) ?? [];
  const theme = (group?.theme as string) ?? 'other';

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumbs
          items={[
            { label: 'حجوزات المجموعات', href: '/group-bookings' },
            { label: (group?.name as string) || 'تفاصيل' },
          ]}
        />

        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError || !group ? (
          <ErrorAlert message="فشل تحميل تفاصيل المجموعة" onRetry={() => refetch()} />
        ) : (
          <>
            {/* Group Header */}
            <Card padding="lg" className="relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${status === 'COMPLETED' ? 'from-gray-400 to-gray-500' : status === 'CANCELLED' ? 'from-red-400 to-red-500' : 'from-brand-400 to-brand-600'}`}
              />
              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{THEME_EMOJI[theme] ?? ''}</span>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {group?.name as string}
                      </h1>
                      <p className="text-sm text-gray-500">
                        {THEME_LABELS[theme] ?? 'أخرى'} · خصم{' '}
                        {(group?.discountPercent as number) ?? 0}%
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-bold ${statusInfo.bg} ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card padding="md" className="text-center">
                <p className="text-3xl">‍️</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {members.length}
                </p>
                <p className="text-xs text-gray-500">عضوة</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-3xl">️</p>
                <p className="mt-1 text-2xl font-bold text-brand-600">
                  {(group?.discountPercent as number) ?? 0}%
                </p>
                <p className="text-xs text-gray-500">خصم المجموعة</p>
              </Card>
              <Card padding="md" className="text-center">
                <p className="text-3xl"></p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Number(group?.totalAmount) > 0
                    ? formatCurrency(Number(group?.totalAmount))
                    : '—'}
                </p>
                <p className="text-xs text-gray-500">المبلغ الإجمالي</p>
              </Card>
            </div>

            {/* Members List */}
            <Card padding="lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                 العضوات ({members.length})
              </h2>
              {members.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">لا توجد عضوات بعد</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {members.map((member: Record<string, unknown>, idx: number) => {
                    const memberStatus = (member?.status as string) ?? 'PENDING';
                    const mStatusInfo = STATUS_MAP[memberStatus] ?? DEFAULT_STATUS;
                    return (
                      <div
                        key={(member?.id as number) ?? idx}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {member?.name as string}
                            </p>
                            <p className="text-xs text-gray-500">
                              الخدمة #{member?.serviceId as number}
                              {member?.technicianId ? ` · الفنية #${member.technicianId}` : ''}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${mStatusInfo.bg} ${mStatusInfo.color}`}
                        >
                          {mStatusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Created Date */}
            <p className="text-center text-xs text-gray-400">
              تاريخ الإنشاء:{' '}
              {group?.createdAt
                ? new Date(group.createdAt as string).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
