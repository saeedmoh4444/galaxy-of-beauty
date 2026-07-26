import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserBookings, useTransitionBooking, useSlots } from '../hooks/useBooking';
import { useTechnicianServices, useAddTechnicianService, useRemoveTechnicianService } from '../hooks/useCatalog';
import { useServices } from '../hooks/useCatalog';
import { useAuthStore } from '../store/authStore';
import { useTechnicianPayouts } from '../hooks/useWallet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', PAID: 'مدفوع',
  IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
};

export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const { user } = useAuthStore();

  const tabs = [
    { key: 'requests', label: 'طلبات الحجز', icon: '📨' },
    { key: 'schedule', label: 'جدول المواعيد', icon: '📅' },
    { key: 'myServices', label: 'خدماتي', icon: '✨' },
    { key: 'earnings', label: 'أرباحي', icon: '💰' },
    { key: 'calendar', label: 'تقويم Google', icon: '📆' },
    { key: 'subscription', label: 'الاشتراك', icon: '⭐' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-6">لوحة تحكم مقدمة الخدمة</h1>

      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && <BookingRequests />}
      {activeTab === 'schedule' && <AvailabilitySchedule />}
      {activeTab === 'myServices' && <MyServices />}
      {activeTab === 'earnings' && <EarningsPanel />}
      {activeTab === 'calendar' && <GoogleCalendarPanel />}
      {activeTab === 'subscription' && <SubscriptionPanel />}
    </div>
  );
}

// =============================================================================
// =============================================================================
// Earnings Tab
// =============================================================================
function EarningsPanel() {
  const { data: earnings } = useQuery({
    queryKey: ['technician-earnings'],
    queryFn: async () => { const { data } = await api.get('/technician/earnings-chart?days=30'); return data; },
  });
  const { data: payouts } = useTechnicianPayouts();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-green-50 text-center">
          <span className="text-sm text-gray-500">إجمالي الأرباح (٣٠ يوم)</span>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {earnings ? Math.round(earnings.totalEarnings).toLocaleString('ar-SA') : '—'} ر.س
          </p>
        </div>
        <div className="card bg-blue-50 text-center">
          <span className="text-sm text-gray-500">عدد المعاملات</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {earnings?.data?.reduce((s, e) => s + e.transactions, 0) || '—'}
          </p>
        </div>
        <div className="card bg-purple-50 text-center">
          <span className="text-sm text-gray-500">المدفوعات المعلقة</span>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {payouts ? payouts.totalEarnings?.toLocaleString('ar-SA') || '—' : '—'} ر.س
          </p>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">📊 الأرباح اليومية</h3>
        {earnings?.data?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={earnings.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v} ر.س`, 'الأرباح']} />
              <Bar dataKey="earnings" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">📊</span>
            <p>لا توجد أرباح بعد. ابدئي بقبول الحجوزات!</p>
          </div>
        )}
      </div>

      {/* Payouts List */}
      {payouts?.payouts?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">📋 سجل المدفوعات</h3>
          <div className="space-y-2">
            {payouts.payouts.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                <div>
                  <span className="text-sm font-medium">{Number(p.amount).toLocaleString('ar-SA')} ر.س</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                    p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    p.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{p.status}</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Booking Requests Tab
// =============================================================================
function BookingRequests() {
  const { data, isLoading } = useUserBookings({ status: 'REQUESTED' });
  const transitionBooking = useTransitionBooking();
  const bookings = data?.bookings || [];

  if (isLoading) return <p className="text-center py-8 text-gray-400">جاري تحميل الطلبات...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">طلبات الحجز الواردة ({bookings.length})</h2>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-3">📨</span>
          <p className="text-gray-500">لا توجد طلبات معلقة حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="card">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-mono">{b.bookingCode}</span>
                  <h3 className="font-semibold text-gray-900 mt-1">{b.service?.titleJson?.ar}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>👤 {b.customer?.name}</span>
                    <span>📅 {new Date(b.startAt).toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <span>⏰ {new Date(b.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>💰 {Number(b.totalAmount).toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">📍 {b.address?.street}، {b.address?.area}، {b.address?.city}</p>
                  {b.notes && <p className="text-xs text-gray-400 mt-1 italic">ملاحظات: {b.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => transitionBooking.mutate({ bookingId: b.id, action: 'accept' })}
                    disabled={transitionBooking.isPending}
                    className="btn-primary text-sm py-2 bg-green-600 hover:bg-green-700"
                  >
                    قبول ✅
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt('سبب الرفض (اختياري):');
                      transitionBooking.mutate({ bookingId: b.id, action: 'reject', reason: reason || undefined });
                    }}
                    disabled={transitionBooking.isPending}
                    className="btn-ghost text-sm py-2 text-red-600"
                  >
                    رفض ❌
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Availability Schedule Tab
// =============================================================================
function AvailabilitySchedule() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: slots, isLoading } = useSlots(user?.id, selectedDate);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const availableSlots = slots || [];

  const handleAddSlot = async (hour) => {
    const startAt = new Date(`${selectedDate}T${String(hour).padStart(2, '0')}:00:00.000+03:00`);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000); // 1 hour
    try {
      await api.post(`/technicians/${user.id}/slots`, {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });
      toast.success('تم إضافة الموعد');
      // Refetch
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل إضافة الموعد');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await api.delete(`/technicians/${user.id}/slots/${slotId}`);
      toast.success('تم حذف الموعد');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل حذف الموعد');
    }
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">إدارة المواعيد المتاحة</h2>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {dates.map((date) => {
          const d = new Date(date);
          const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          return (
            <button key={date} onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-20 py-3 rounded-xl text-center transition-all
                ${date === selectedDate ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <p className="text-xs">{dayNames[d.getDay()]}</p>
              <p className="text-lg font-bold">{d.getDate()}</p>
            </button>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="space-y-2">
        {hours.map((hour) => {
          const slot = availableSlots.find((s) => {
            const start = new Date(s.startAt);
            return start.getHours() === hour;
          });

          return (
            <div key={hour} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <span className="w-16 text-sm font-medium text-gray-600">
                {String(hour).padStart(2, '0')}:00
              </span>
              <div className="flex-1">
                {slot ? (
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${slot.isBooked ? 'text-red-500' : 'text-green-600'}`}>
                      {slot.isBooked ? '🔒 محجوز' : '✅ متاح'}
                    </span>
                    {!slot.isBooked && (
                      <button onClick={() => handleDeleteSlot(slot.id)} className="text-xs text-red-500 hover:text-red-700">
                        حذف
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => handleAddSlot(hour)} className="text-xs text-primary-600 hover:text-primary-700">
                    + إضافة موعد
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// My Services Tab
// =============================================================================
function MyServices() {
  const { user } = useAuthStore();
  const { data: myServices, isLoading } = useTechnicianServices(user?.id);
  const { data: servicesData } = useServices({ limit: 100 });
  const addService = useAddTechnicianService(user?.id);
  const removeService = useRemoveTechnicianService(user?.id);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const allServices = servicesData?.services || [];

  const handleAdd = () => {
    if (!selectedServiceId) return;
    addService.mutate({
      serviceId: Number(selectedServiceId),
      customPrice: customPrice ? Number(customPrice) : null,
    }, { onSuccess: () => { setShowAdd(false); setSelectedServiceId(''); setCustomPrice(''); } });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">خدماتي ({myServices?.length || 0})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm py-2">
          {showAdd ? 'إلغاء' : '+ إضافة خدمة'}
        </button>
      </div>

      {showAdd && (
        <div className="card mb-4 border-primary-200 bg-primary-50/30 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">اختيار الخدمة</label>
            <select className="input-field text-sm py-2" value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
              <option value="">اختر خدمة</option>
              {allServices.map((s) => (
                <option key={s.id} value={s.id}>{s.titleJson?.ar} ({Number(s.basePrice)} ر.س)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">سعر مخصص (اختياري، يترك فارغاً للسعر الأساسي)</label>
            <input type="number" className="input-field text-sm py-2" placeholder="سعر مخصص" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
          </div>
          <button onClick={handleAdd} disabled={!selectedServiceId || addService.isPending} className="btn-primary text-sm">إضافة</button>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
      ) : myServices?.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-5xl block mb-3">✨</span>
          <p className="text-gray-500">لم تضفي أي خدمات بعد</p>
          <p className="text-sm text-gray-400 mt-1">أضيفي الخدمات التي تقدمينها لتظهر للعميلات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myServices.map((ts) => (
            <div key={ts.id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">{ts.service?.titleJson?.ar}</h3>
                <p className="text-sm text-gray-400">{ts.service?.titleJson?.en}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary-600">
                  {ts.customPrice ? `${Number(ts.customPrice)} ر.س` : `${Number(ts.service?.basePrice)} ر.س`}
                </span>
                <button onClick={() => removeService.mutate(ts.id)} className="text-xs text-red-500 hover:text-red-700">إزالة</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Google Calendar Connect Panel
// =============================================================================
function GoogleCalendarPanel() {
  const [isConnecting, setIsConnecting] = useState(false);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: calStatus, isLoading } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: async () => { const { data } = await api.get('/calendar/status'); return data; },
  });

  const handleConnect = async () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id') {
      toast.error('يجب إعداد VITE_GOOGLE_CLIENT_ID في ملف .env');
      return;
    }
    const redirectUri = `${window.location.origin}/technician?calendar=callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  // Handle OAuth callback on mount
  const isCallback = new URLSearchParams(window.location.search).get('calendar') === 'callback';
  const code = new URLSearchParams(window.location.search).get('code');

  if (isCallback && code && !isConnecting) {
    setIsConnecting(true);
    const redirectUri = `${window.location.origin}/technician?calendar=callback`;
    api.post('/calendar/connect', { code, redirectUri })
      .then(() => {
        toast.success('✅ تم ربط تقويم Google بنجاح');
        qc.invalidateQueries({ queryKey: ['calendar-status'] });
        window.history.replaceState({}, '', '/technician');
      })
      .catch(() => toast.error('فشل ربط تقويم Google'))
      .finally(() => setIsConnecting(false));
  }

  const handleDisconnect = async () => {
    if (!window.confirm('هل أنت متأكد من إلغاء ربط تقويم Google؟')) return;
    try {
      await api.post('/calendar/disconnect');
      qc.invalidateQueries({ queryKey: ['calendar-status'] });
      toast.success('تم إلغاء ربط تقويم Google');
    } catch { toast.error('فشل إلغاء الربط'); }
  };

  if (isLoading) return <div className="card"><p className="text-center py-8 text-gray-400">جاري التحميل...</p></div>;

  const connected = calStatus?.connected || calStatus?.hasToken;

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <span className="text-6xl block mb-4">📆</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">ربط تقويم Google</h2>
        <p className="text-gray-500 mb-6">اربطي تقويم Google لمزامنة مواعيد الحجوزات تلقائياً</p>

        {isConnecting ? (
          <div className="text-center py-4">
            <div className="animate-spin text-3xl mb-2">⏳</div>
            <p className="text-gray-500">جاري الربط...</p>
          </div>
        ) : connected ? (
          <div className="space-y-3">
            <div className="bg-green-50 rounded-lg p-4 inline-block">
              <span className="text-2xl">✅</span>
              <p className="text-green-700 font-medium mt-1">مرتبط بتقويم Google</p>
              {calStatus?.email && <p className="text-green-600 text-sm">{calStatus.email}</p>}
            </div>
            <div>
              <button onClick={handleDisconnect} className="btn-secondary text-sm">إلغاء الربط</button>
            </div>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn-primary text-sm py-3 px-8">
            🔗 ربط تقويم Google
          </button>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">📋 كيفية الربط</h3>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>اضغطي على زر "ربط تقويم Google"</li>
          <li>سجلي الدخول بحساب Google الخاص بكِ</li>
          <li>اسمحي لتطبيق Galaxy of Beauty بالوصول إلى التقويم</li>
          <li>سيتم مزامنة حجوزاتكِ تلقائياً مع تقويم Google</li>
        </ol>
      </div>
    </div>
  );
}

// =============================================================================
// AI Subscription Panel
// =============================================================================
function SubscriptionPanel() {
  const qc = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => { const { data } = await api.get('/subscriptions/plans'); return data.plans; },
  });

  const { data: mySub } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: async () => { const { data } = await api.get('/subscriptions/my'); return data.subscription; },
  });

  const handlePurchase = async (planId) => {
    if (!window.confirm('هل أنت متأكد من شراء هذه الباقة؟')) return;
    try {
      const { data } = await api.post('/subscriptions/purchase', { planId });
      qc.invalidateQueries({ queryKey: ['my-subscription'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`✅ ${data.message?.ar || 'تم شراء الباقة بنجاح'}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل شراء الباقة');
    }
  };

  const handleCancelAutoRenew = async () => {
    if (!window.confirm('هل تريد إلغاء التجديد التلقائي؟')) return;
    try {
      await api.post('/subscriptions/cancel-auto-renew');
      qc.invalidateQueries({ queryKey: ['my-subscription'] });
      toast.success('تم إلغاء التجديد التلقائي');
    } catch { toast.error('فشل إلغاء التجديد'); }
  };

  const plans = plansData || [];
  const activeSub = mySub?.status === 'ACTIVE' ? mySub : null;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {activeSub ? (
        <div className="card bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">⭐ باقتكِ النشطة</h2>
              <p className="text-gray-600 mt-1">{activeSub.plan?.nameJson?.ar || 'باقة AI'}</p>
              <p className="text-sm text-gray-400 mt-1">
                تنتهي: {new Date(activeSub.expiresAt).toLocaleDateString('ar-SA')}
                {activeSub.autoRenew && ' (تجديد تلقائي)'}
              </p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
          {activeSub.autoRenew && (
            <button onClick={handleCancelAutoRenew} className="text-xs text-orange-600 hover:underline mt-3">
              إلغاء التجديد التلقائي
            </button>
          )}
        </div>
      ) : (
        <div className="card text-center">
          <span className="text-5xl block mb-3">🤖</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">باقات الذكاء الاصطناعي</h2>
          <p className="text-gray-500 text-sm mb-4">احصلي على ميزات AI متقدمة: توصيات ذكية، شات بوت، تحليل بيانات</p>
        </div>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = activeSub?.planId === plan.id;
          return (
            <div key={plan.id} className={`card text-center border-2 ${isCurrent ? 'border-primary-500' : 'border-transparent'}`}>
              <div className="text-4xl mb-3">
                {plan.feature === 'CHATBOT' ? '💬' : plan.feature === 'RECOMMENDATIONS' ? '🎯' : '📝'}
              </div>
              <h3 className="font-bold text-gray-900">{plan.nameJson?.ar}</h3>
              <p className="text-xs text-gray-500 mt-1">{plan.nameJson?.en}</p>
              <p className="text-2xl font-bold text-primary-600 mt-3">{Number(plan.priceMonthly).toLocaleString('ar-SA')} ر.س</p>
              <p className="text-xs text-gray-400">/ شهرياً</p>
              <p className="text-xs text-gray-500 mt-2">{plan.monthlyLimit} طلب / شهر</p>

              {isCurrent ? (
                <span className="inline-block mt-3 px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  ✅ باقتكِ الحالية
                </span>
              ) : (
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={activeSub}
                  className="btn-primary text-sm w-full mt-3"
                >
                  {activeSub ? 'لديكِ باقة نشطة' : 'شراء'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {plans.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">لا توجد باقات متاحة حالياً</p>
        </div>
      )}

      {/* Benefits */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">✨ مميزات الباقة</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { icon: '💬', ar: 'شات بوت Layla للإجابة عن استفسارات العميلات', en: 'Layla chatbot' },
            { icon: '🎯', ar: 'توصيات ذكية للعميلات بناءً على تفضيلاتهن', en: 'Smart recommendations' },
            { icon: '📊', ar: 'تحليلات متقدمة لأداء خدماتكِ', en: 'Advanced analytics' },
            { icon: '⭐', ar: 'أولوية الظهور في نتائج البحث', en: 'Priority search ranking' },
          ].map((b) => (
            <div key={b.en} className="flex items-start gap-2">
              <span className="text-lg">{b.icon}</span>
              <div>
                <p className="font-medium text-gray-700">{b.ar}</p>
                <p className="text-xs text-gray-400">{b.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
