'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  ageGroup: string;
  preferences: string[];
  notes: string;
  bookingCount?: number;
  createdAt: string;
}

interface MetaData {
  relationships: Array<{ key: string; nameAr: string; emoji: string }>;
  ageGroups: Array<{ key: string; nameAr: string; emoji: string }>;
  preferences: Array<{ key: string; nameAr: string; emoji: string }>;
}

const RELATIONSHIP_EMOJI: Record<string, string> = {
  child: '',
  spouse: '',
  parent: '',
  sibling: '',
  other: '',
};

const AGE_EMOJI: Record<string, string> = {
  infant: '',
  child: '',
  teen: '',
  adult: '',
  senior: '',
};

const _PREF_EMOJI: Record<string, string> = {
  gentle: '',
  hypoallergenic: '️',
  fragrance_free: '',
  natural: '',
  quick: '',
  quiet: '',
};

export default function FamilyAccountPage(): JSX.Element {
  const {
    data: members,
    isLoading,
    isError,
    refetch,
  } = api.familyAccount.list.useQuery() as {
    data: FamilyMember[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const { data: meta } = api.familyAccount.meta.useQuery() as { data: MetaData | undefined };
  const addMut = api.familyAccount.add.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      resetForm();
      refetch();
    },
  });
  const updateMut = api.familyAccount.update.useMutation({
    onSuccess: () => {
      setShowEdit(null);
      refetch();
    },
  });
  const removeMut = api.familyAccount.remove.useMutation({ onSuccess: () => refetch() });

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setShowEdit] = useState<FamilyMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('child');
  const [formAge, setFormAge] = useState('adult');
  const [formPrefs, setFormPrefs] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormRelation('child');
    setFormAge('adult');
    setFormPrefs([]);
    setFormNotes('');
    setFormError('');
  };

  const openEdit = (m: FamilyMember) => {
    setShowEdit(m);
    setFormName(m.name);
    setFormRelation(m.relationship);
    setFormAge(m.ageGroup);
    setFormPrefs(m.preferences);
    setFormNotes(m.notes);
  };

  const togglePref = (key: string) => {
    setFormPrefs((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
  };

  const handleAdd = () => {
    setFormError('');
    if (!formName.trim()) {
      setFormError('الرجاء إدخال الاسم');
      return;
    }
    addMut.mutate({
      name: formName.trim(),
      relationship: formRelation,
      ageGroup: formAge,
      preferences: formPrefs,
      notes: formNotes.trim() || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editTarget) return;
    setFormError('');
    updateMut.mutate({
      id: editTarget.id,
      name: formName.trim() || undefined,
      relationship: formRelation,
      ageGroup: formAge,
      preferences: formPrefs,
      notes: formNotes.trim() || undefined,
    });
  };

  const handleRemove = (id: number, name: string) => {
    if (!confirm(`هل أنتِ متأكدة من حذف "${name}" من حساب العائلة؟`)) return;
    removeMut.mutate({ id });
  };

  const allMembers = members ?? [];
  const relationships = meta?.relationships ?? [];
  const ageGroups = meta?.ageGroups ?? [];
  const prefsList = meta?.preferences ?? [];

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
              ‍‍ حساب العائلة
            </h1>
            <p className="mt-1 text-sm text-text-secondary dark:text-gray-400">
              أضيفي أفراد عائلتكِ واحجزي لهم خدمات التجميل بكل سهولة
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowAdd(true);
            }}
          >
            + إضافة فرد
          </Button>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { emoji: '', title: 'للأطفال', desc: 'قصات شعر وجلسات عناية للأطفال' },
            { emoji: '', title: 'للوالدين', desc: 'خدمات مريحة لكبار السن' },
            { emoji: '', title: 'للزوج', desc: 'حلاقة وعناية شخصية للرجال' },
          ].map((b) => (
            <Card key={b.title} padding="md" className="text-center">
              <span className="text-3xl">{b.emoji}</span>
              <h3 className="mt-2 font-semibold text-text-primary dark:text-gray-100">{b.title}</h3>
              <p className="text-xs text-text-secondary">{b.desc}</p>
            </Card>
          ))}
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorAlert message="فشل تحميل أفراد العائلة" onRetry={() => refetch()} />
        ) : allMembers.length === 0 ? (
          <EmptyState
            title="لا يوجد أفراد في حساب العائلة"
            description="أضيفي أطفالكِ، والديكِ، أو زوجكِ للحجز نيابة عنهم"
            action={{ label: 'إضافة أول فرد', onPress: () => setShowAdd(true) }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {allMembers.map((m) => (
              <Card key={m.id} padding="lg" className="relative">
                {/* Relationship badge */}
                <span className="absolute top-3 right-3 text-2xl">
                  {RELATIONSHIP_EMOJI[m.relationship] ?? ''}
                </span>

                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-purple-100 text-2xl dark:from-brand-900 dark:to-purple-900">
                    {AGE_EMOJI[m.ageGroup] ?? ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">
                      {m.name}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {relationships.find((r) => r.key === m.relationship)?.nameAr ??
                        m.relationship}
                      {' · '}
                      {ageGroups.find((a) => a.key === m.ageGroup)?.nameAr ?? m.ageGroup}
                    </p>
                    {/* Preferences */}
                    {m.preferences.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.preferences.map((p) => {
                          const pref = prefsList.find((pp) => pp.key === p);
                          return (
                            <span
                              key={p}
                              className="inline-flex items-center gap-0.5 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] text-text-secondary dark:bg-gray-800 dark:text-gray-400"
                            >
                              {pref?.emoji} {pref?.nameAr ?? p}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {m.notes && (
                      <p className="mt-1 text-xs text-text-tertiary italic"> {m.notes}</p>
                    )}
                    {(m.bookingCount ?? 0) > 0 && (
                      <p className="mt-1 text-xs text-brand-600 font-medium">
                         {m.bookingCount} حجز سابق
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <Link
                    href={`/bookings/create?for=${encodeURIComponent(m.name)}`}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full">
                       احجزي لـ{m.name}
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                    ️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(m.id, m.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          open={showAdd || !!editTarget}
          onClose={() => {
            setShowAdd(false);
            setShowEdit(null);
            resetForm();
          }}
          title={editTarget ? `تعديل — ${editTarget.name}` : 'إضافة فرد للعائلة'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                  العلاقة
                </label>
                <select
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                >
                  {relationships.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.emoji} {r.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                  الفئة العمرية
                </label>
                <select
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                >
                  {ageGroups.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.emoji} {a.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-2">
                التفضيلات
              </label>
              <div className="flex flex-wrap gap-2">
                {prefsList.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => togglePref(p.key)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      formPrefs.includes(p.key)
                        ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300 dark:bg-brand-900 dark:text-brand-300'
                        : 'bg-surface-muted text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {p.emoji} {p.nameAr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">
                ملاحظات
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="حساسية، تفضيلات خاصة..."
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAdd(false);
                  setShowEdit(null);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={editTarget ? handleUpdate : handleAdd}
                loading={addMut.isPending || updateMut.isPending}
              >
                {editTarget ? ' حفظ التعديلات' : '‍‍ إضافة'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
