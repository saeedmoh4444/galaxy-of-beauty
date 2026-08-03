'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Modal, formatCurrency } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ConciergeData {
  id: number;
  weddingDate: string | null;
  venue: string | null;
  guestCount: number | null;
  budget: number | null;
  notes: string | null;
  services: Array<{
    id: number;
    serviceId: number;
    trialDate: string | null;
    notes: string | null;
    isTrialDone: boolean;
  }>;
}

const STEPS = [
  { key: 'profile', label: 'إنشاء الملف', emoji: '📋' },
  { key: 'services', label: 'اختيار الخدمات', emoji: '💄' },
  { key: 'trials', label: 'التجارب', emoji: '✨' },
  { key: 'wedding', label: 'يوم الزفاف', emoji: '👰' },
];

const MARKETING_FEATURES = [
  { icon: '📋', title: 'خططي ليومكِ', desc: 'اختاري خدمات المكياج، الشعر، والعناية بالبشرة — وحددي مواعيد التجارب قبل الزفاف' },
  { icon: '💄', title: 'جربي إطلالتكِ', desc: 'جلسات تجربة مكياج وشعر مع أفضل الفنيات قبل اليوم الكبير' },
  { icon: '👰', title: 'تألقي يوم زفافكِ', desc: 'فريق متكامل من الفنيات المحترفات في يومكِ الخاص' },
  { icon: '💰', title: 'تحكمي بالميزانية', desc: 'حددي ميزانيتكِ وتابعي تكاليف كل خدمة — بدون مفاجآت' },
  { icon: '📅', title: 'عد تنازلي', desc: 'تابعي الأيام المتبقية ليوم زفافكِ مع تذكيرات للتجارب والمواعيد' },
  { icon: '✨', title: 'نصائح حصرية', desc: 'احصلي على نصائح مخصصة من خبراء التجميل للعناية قبل الزفاف' },
];

// ---------------------------------------------------------------------------
// Bridal Dashboard (authenticated view)
// ---------------------------------------------------------------------------
function BridalDashboard(): JSX.Element {
  const { data: concierge, isLoading, isError, refetch } = api.bridalConcierge.get.useQuery() as {
    data: ConciergeData | null | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const upsertMut = api.bridalConcierge.upsert.useMutation({ onSuccess: () => refetch() });
  const addServiceMut = api.bridalConcierge.addService.useMutation({ onSuccess: () => refetch() });
  const markTrialMut = api.bridalConcierge.markTrialDone.useMutation({ onSuccess: () => refetch() });

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newTrialDate, setNewTrialDate] = useState('');
  const [newServiceNotes, setNewServiceNotes] = useState('');
  const [serviceError, setServiceError] = useState('');

  const handleSaveProfile = () => {
    setFormError('');
    upsertMut.mutate(
      {
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
        venue: venue.trim() || undefined,
        guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
        budget: budget ? parseInt(budget, 10) : undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => { setShowProfileForm(false); setFormError(''); }, onError: () => setFormError('فشل حفظ البيانات') },
    );
  };

  const handleAddService = () => {
    setServiceError('');
    if (!newServiceId) { setServiceError('الرجاء إدخال معرف الخدمة'); return; }
    addServiceMut.mutate(
      { serviceId: parseInt(newServiceId, 10), trialDate: newTrialDate ? new Date(newTrialDate).toISOString() : undefined, notes: newServiceNotes.trim() || undefined },
      { onSuccess: () => { setShowAddService(false); setNewServiceId(''); setNewTrialDate(''); setNewServiceNotes(''); setServiceError(''); }, onError: () => setServiceError('فشل إضافة الخدمة') },
    );
  };

  const openProfileForm = () => {
    if (concierge) {
      setWeddingDate(concierge.weddingDate ? new Date(concierge.weddingDate).toISOString().slice(0, 16) : '');
      setVenue(concierge.venue ?? '');
      setGuestCount(concierge.guestCount?.toString() ?? '');
      setBudget(concierge.budget?.toString() ?? '');
      setNotes(concierge.notes ?? '');
    }
    setShowProfileForm(true);
  };

  const services = concierge?.services ?? [];
  const completedTrials = services.filter((s) => s.isTrialDone).length;
  const hasProfile = !!concierge?.weddingDate;
  const currentStep = !hasProfile ? 0 : services.length === 0 ? 1 : completedTrials < services.length ? 2 : 3;
  const daysUntil = concierge?.weddingDate ? Math.ceil((new Date(concierge.weddingDate).getTime() - Date.now()) / 86400000) : null;

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>;
  if (isError) return <ErrorAlert message="فشل تحميل بيانات التخطيط" onRetry={() => refetch()} />;

  return (
    <>
      {/* Dashboard Header */}
      <div className="text-center sm:text-right">
        <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">👰 لوحة تخطيط الزفاف</h1>
        <p className="mt-1 text-sm text-text-secondary">تابعي تقدمكِ نحو يوم زفافكِ ✨</p>
      </div>

      {/* Progress Steps */}
      <Card padding="lg">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all ${idx < currentStep ? 'bg-green-100 ring-2 ring-green-500 dark:bg-green-900' : idx === currentStep ? 'bg-brand-100 ring-2 ring-brand-500 animate-pulse dark:bg-brand-900' : 'bg-surface-muted dark:bg-gray-800 opacity-50'}`}>
                {idx < currentStep ? '✓' : step.emoji}
              </div>
              <p className="mt-1.5 text-xs font-semibold text-text-primary dark:text-gray-300 hidden sm:block">{step.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700" style={{ width: `${Math.min(100, (currentStep / 3) * 100)}%` }} />
        </div>
      </Card>

      {/* Wedding Details */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary dark:text-gray-100">📋 تفاصيل الزفاف</h2>
          <Button size="sm" variant="ghost" onClick={openProfileForm}>{hasProfile ? 'تعديل' : 'إضافة'}</Button>
        </div>
        {!hasProfile ? (
          <EmptyState title="لم تضفي تفاصيل الزفاف بعد" description="أضيفي تاريخ الزفاف، المكان، وعدد الضيوف للبدء" action={{ label: 'إضافة التفاصيل', onPress: openProfileForm }} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {concierge?.weddingDate && (
                <div className="rounded-xl bg-brand-50 p-3 text-center dark:bg-brand-950">
                  <p className="text-3xl">📅</p><p className="mt-1 text-xs text-text-secondary">تاريخ الزفاف</p>
                  <p className="text-sm font-bold">{new Date(concierge.weddingDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  {daysUntil !== null && daysUntil > 0 && <p className="mt-1 text-xs font-semibold text-brand-600">{daysUntil} يوم متبقي</p>}
                </div>
              )}
              {concierge?.venue && <div className="rounded-xl bg-purple-50 p-3 text-center dark:bg-purple-950"><p className="text-3xl">📍</p><p className="mt-1 text-xs text-text-secondary">المكان</p><p className="text-sm font-bold">{concierge.venue}</p></div>}
              {concierge?.guestCount && <div className="rounded-xl bg-pink-50 p-3 text-center dark:bg-pink-950"><p className="text-3xl">👥</p><p className="mt-1 text-xs text-text-secondary">الضيوف</p><p className="text-sm font-bold">{concierge.guestCount} ضيف</p></div>}
              {concierge?.budget && <div className="rounded-xl bg-green-50 p-3 text-center dark:bg-green-950"><p className="text-3xl">💰</p><p className="mt-1 text-xs text-text-secondary">الميزانية</p><p className="text-sm font-bold">{formatCurrency(concierge.budget)} ر.س</p></div>}
            </div>
            {concierge?.notes && <div className="mt-4 rounded-xl bg-surface-muted p-3 dark:bg-gray-800"><p className="text-xs text-text-tertiary mb-1">📝 ملاحظات</p><p className="text-sm text-text-primary dark:text-gray-300 whitespace-pre-wrap">{concierge.notes}</p></div>}
          </>
        )}
      </Card>

      {/* Service Trials */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-lg font-bold text-text-primary dark:text-gray-100">💄 خدمات التجميل</h2><p className="text-xs text-text-secondary">{completedTrials} / {services.length} تجربة مكتملة</p></div>
          <Button size="sm" onClick={() => setShowAddService(true)}>+ إضافة خدمة</Button>
        </div>
        {services.length === 0 ? (
          <EmptyState title="لم تضفي خدمات بعد" description="أضيفي خدمات المكياج، الشعر، والعناية بالبشرة ليوم زفافكِ" />
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${svc.isTrialDone ? 'bg-green-100 dark:bg-green-900' : 'bg-surface-muted dark:bg-gray-800'}`}>{svc.isTrialDone ? '✅' : '⏳'}</div>
                  <div>
                    <p className="text-sm font-semibold">خدمة #{svc.serviceId}</p>
                    {svc.trialDate && <p className="text-xs text-text-secondary">📅 تجربة: {new Date(svc.trialDate).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                    {svc.notes && <p className="text-xs text-text-tertiary mt-0.5">📝 {svc.notes}</p>}
                  </div>
                </div>
                {!svc.isTrialDone && <Button size="sm" variant="ghost" onClick={() => markTrialMut.mutate({ serviceId: svc.id })} loading={markTrialMut.isPending}>تمت التجربة ✓</Button>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card padding="lg" className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-none">
        <h3 className="font-bold text-text-primary dark:text-gray-100 mb-3">💡 نصائح للعروس</h3>
        <div className="grid gap-2 text-sm text-text-secondary dark:text-gray-400">
          <p>✨ ابدئي جلسات العناية بالبشرة قبل ٣-٦ أشهر من الزفاف</p>
          <p>💄 احجزي تجربة المكياج قبل شهرين على الأقل</p>
          <p>💇‍♀️ جربي تسريحة الشعر مع الطرحة قبل ٣ أسابيع</p>
          <p>💅 مانيكير وباديكير قبل يومين من الزفاف</p>
        </div>
      </Card>

      {/* Modals */}
      <Modal open={showProfileForm} onClose={() => setShowProfileForm(false)} title="تفاصيل الزفاف">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">تاريخ الزفاف</label><input type="datetime-local" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">المكان</label><input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="قاعة الأفراح، الرياض" className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div><div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">عدد الضيوف</label><input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="٢٠٠" className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div></div>
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">الميزانية (ر.س)</label><input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="٥٠٠٠" className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">ملاحظات</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات أو طلبات خاصة..." rows={3} className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{formError}</div>}
          <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={() => setShowProfileForm(false)}>إلغاء</Button><Button onClick={handleSaveProfile} loading={upsertMut.isPending}>💾 حفظ</Button></div>
        </div>
      </Modal>

      <Modal open={showAddService} onClose={() => setShowAddService(false)} title="إضافة خدمة">
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">معرف الخدمة</label><input type="number" value={newServiceId} onChange={(e) => setNewServiceId(e.target.value)} placeholder="مثال: ١ (مكياج)" className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">موعد التجربة (اختياري)</label><input type="datetime-local" value={newTrialDate} onChange={(e) => setNewTrialDate(e.target.value)} className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          <div><label className="block text-sm font-semibold text-text-primary dark:text-gray-300 mb-1">ملاحظات</label><textarea value={newServiceNotes} onChange={(e) => setNewServiceNotes(e.target.value)} placeholder="أي ملاحظات عن الخدمة..." rows={2} className="w-full rounded-lg border border-edge px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" /></div>
          {serviceError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{serviceError}</div>}
          <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={() => setShowAddService(false)}>إلغاء</Button><Button onClick={handleAddService} loading={addServiceMut.isPending}>+ إضافة</Button></div>
        </div>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Marketing Landing (unauthenticated)
// ---------------------------------------------------------------------------
function MarketingLanding(): JSX.Element {
  return (
    <>
      <div className="text-center">
        <span className="text-7xl">👰</span>
        <h1 className="mt-6 text-4xl font-extrabold text-text-primary dark:text-gray-100">خدمة تخطيط زفافكِ</h1>
        <p className="mt-4 text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          يوم زفافكِ يستحق الأفضل. صممنا لكِ خدمة شاملة لتخطيط إطلالتكِ من الألف إلى الياء — تجارب مكياج، عناية بالبشرة، تسريحة الشعر، والمزيد.
        </p>
        <div className="mt-6">
          <Link href="/login?redirect=/bridal-concierge"><Button size="lg">👰 سجّلي دخول للبدء</Button></Link>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_FEATURES.map((f, i) => (
          <Card key={i} padding="lg" className="text-center transition-all hover:shadow-lg">
            <div className="text-4xl">{f.icon}</div>
            <h3 className="mt-3 text-lg font-bold text-text-primary dark:text-gray-100">{f.title}</h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-white text-center">
        <p className="text-3xl font-bold">✨ رحلتكِ نحو يوم الزفاف</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {STEPS.map((s, idx) => (
            <div key={s.key} className="rounded-xl bg-white/20 p-4 backdrop-blur">
              <p className="text-4xl">{s.emoji}</p>
              <p className="mt-2 text-lg font-bold">الخطوة {idx + 1}</p>
              <p className="text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-text-secondary dark:text-gray-400">📞 تحتاجين مساعدة؟ تواصلي مع فريقنا على <span className="font-bold text-brand-600">٩٢٠٠١٣٣٣٣</span></p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function BridalConciergePage(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
      {authLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}</div>
      ) : user ? (
        <BridalDashboard />
      ) : (
        <MarketingLanding />
      )}
    </div>
  );
}
