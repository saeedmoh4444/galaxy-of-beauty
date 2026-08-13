'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import {
  Card,
  CardSkeleton,
  ErrorAlert,
  EmptyState,
  Button,
  Modal,
  formatCurrency,
} from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

const THEMES = [
  { value: 'bridal', label: ' عروس / توديع عزوبية', emoji: '' },
  { value: 'birthday', label: ' عيد ميلاد', emoji: '' },
  { value: 'girls_night', label: ' ليلة بنات', emoji: '' },
  { value: 'family', label: '‍‍‍ عائلية', emoji: '‍‍‍' },
  { value: 'other', label: ' أخرى', emoji: '' },
];

interface MemberInput {
  name: string;
  serviceId: string;
  technicianId: string;
}

interface Group {
  id: number;
  name: string;
  theme: string;
  discountPercent: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  members: Array<{
    id: number;
    name: string;
    serviceId: number;
    technicianId: number | null;
    status: string;
  }>;
}

const DEFAULT_STATUS = {
  label: 'غير معروف',
  color: 'bg-surface-muted text-text-primary dark:bg-gray-800 dark:text-gray-300',
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: 'قيد الانتظار',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  CONFIRMED: {
    label: 'مؤكد',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  IN_PROGRESS: {
    label: 'جاري',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'مكتمل',
    color: 'bg-surface-muted text-text-primary dark:bg-gray-800 dark:text-gray-300',
  },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const THEME_EMOJI: Record<string, string> = {
  bridal: '',
  birthday: '',
  girls_night: '',
  family: '‍‍‍',
  other: '',
};

export default function GroupBookingsPage(): JSX.Element {
  const {
    data: groups,
    isLoading,
    isError,
    refetch,
  } = api.groupBookings.myGroups.useQuery() as {
    data: Group[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTheme, setFormTheme] = useState('other');
  const [formDiscount, setFormDiscount] = useState(10);
  const [members, setMembers] = useState<MemberInput[]>([
    { name: '', serviceId: '', technicianId: '' },
    { name: '', serviceId: '', technicianId: '' },
  ]);
  const [createError, setCreateError] = useState('');

  const createMut = api.groupBookings.create.useMutation({
    onSuccess: () => {
      setShowCreate(false);
      resetForm();
      refetch();
    },
    onError: () => setCreateError('فشل إنشاء المجموعة — يرجى المحاولة مرة أخرى'),
  });

  const resetForm = () => {
    setFormName('');
    setFormTheme('other');
    setFormDiscount(10);
    setMembers([
      { name: '', serviceId: '', technicianId: '' },
      { name: '', serviceId: '', technicianId: '' },
    ]);
    setCreateError('');
  };

  const addMember = () => {
    if (members.length < 20) {
      setMembers([...members, { name: '', serviceId: '', technicianId: '' }]);
    }
  };

  const removeMember = (idx: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== idx));
    }
  };

  const updateMember = (idx: number, field: keyof MemberInput, value: string) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx]!, [field]: value };
    setMembers(updated);
  };

  const handleCreate = () => {
    setCreateError('');
    if (!formName.trim()) {
      setCreateError('يرجى إدخال اسم المجموعة');
      return;
    }
    const invalidMember = members.find((m) => !m.name.trim() || !m.serviceId);
    if (invalidMember) {
      setCreateError('يرجى إدخال اسم وخدمة لكل عضوة');
      return;
    }

    createMut.mutate({
      name: formName.trim(),
      theme: formTheme as 'bridal' | 'birthday' | 'girls_night' | 'family' | 'other',
      discountPercent: formDiscount,
      members: members.map((m) => ({
        name: m.name.trim(),
        serviceId: parseInt(m.serviceId, 10),
        technicianId: m.technicianId ? parseInt(m.technicianId, 10) : undefined,
      })),
    });
  };

  const allGroups = groups ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
              ‍️ حجوزات المجموعات
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
              احجزي لكِ ولصديقاتكِ معاً — خصم يصل إلى ٣٠٪
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>+ مجموعة جديدة</Button>
        </div>

        {/* Benefits Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '', title: 'خصم جماعي', desc: 'خصم يصل إلى ٣٠٪' },
            { emoji: '‍️', title: 'حتى ٢٠ شخص', desc: 'كلما زاد العدد زاد الخصم' },
            { emoji: '', title: 'أي مناسبة', desc: 'أعراس · أعياد · لقاءات' },
          ].map((b) => (
            <Card key={b.title} padding="md" className="text-center">
              <span className="text-3xl">{b.emoji}</span>
              <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">{b.title}</h3>
              <p className="text-xs text-text-secondary">{b.desc}</p>
            </Card>
          ))}
        </div>

        {/* My Groups */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل حجوزات المجموعات" onRetry={() => refetch()} />
        ) : allGroups.length === 0 ? (
          <EmptyState
            title="لا توجد حجوزات مجموعات"
            description="أنشئي أول مجموعة ودعي صديقاتكِ للاستمتاع!"
            action={{ label: 'إنشاء مجموعة', onPress: () => setShowCreate(true) }}
          />
        ) : (
          <div className="space-y-4">
            {allGroups.map((group) => {
              const statusInfo = STATUS_MAP[group.status] ?? DEFAULT_STATUS;
              return (
                <Link key={group.id} href={`/group-bookings/${group.id}`}>
                  <Card
                    padding="lg"
                    className="cursor-pointer transition-all hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{THEME_EMOJI[group.theme] ?? ''}</span>
                        <div>
                          <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
                            {group.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {group.members.length} عضوات · خصم {group.discountPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {Number(group.totalAmount) > 0 && (
                          <p className="text-lg font-bold text-brand-600">
                            {formatCurrency(Number(group.totalAmount))}
                          </p>
                        )}
                        <p className="text-xs text-text-tertiary mt-1">
                          {new Date(group.createdAt).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        <Modal
          open={showCreate}
          onClose={() => {
            setShowCreate(false);
            resetForm();
          }}
          title="إنشاء مجموعة جديدة"
        >
          <div className="space-y-4">
            {/* Group Name */}
            <div>
              <label htmlFor="gb-name" className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                اسم المجموعة
              </label>
              <input
                id="gb-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: حفلة توديع العزوبية"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            {/* Theme */}
            <div>
              <label htmlFor="gb-theme" className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                المناسبة
              </label>
              <select
                id="gb-theme"
                value={formTheme}
                onChange={(e) => setFormTheme(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                نسبة الخصم: <span className="text-brand-600">{formDiscount}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={30}
                value={formDiscount}
                onChange={(e) => setFormDiscount(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>0%</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-text-primary dark:text-gray-300">
                  العضوات ({members.length})
                </label>
                <button
                  type="button"
                  onClick={addMember}
                  disabled={members.length >= 20}
                  className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-50 font-medium"
                >
                  + إضافة عضوة
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {members.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-gray-100 p-2 dark:border-gray-700"
                  >
                    <span className="text-xs font-bold text-text-tertiary w-5">{idx + 1}</span>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMember(idx, 'name', e.target.value)}
                      placeholder="الاسم"
                      className="flex-1 min-w-0 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    />
                    <input
                      type="number"
                      value={m.serviceId}
                      onChange={(e) => updateMember(idx, 'serviceId', e.target.value)}
                      placeholder="رقم الخدمة"
                      className="w-24 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    />
                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMember(idx)}
                        className="text-text-tertiary hover:text-red-500 p-1"
                      >
                        
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {createError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {createError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button onClick={handleCreate} loading={createMut.isPending}>
                 إنشاء المجموعة
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
